import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostgresStorageService {
  private readonly logger = new Logger(PostgresStorageService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Almacena un archivo directamente en PostgreSQL como BYTEA
   */
  async storeFile(
    fileBuffer: Buffer,
    filename: string,
    originalName: string,
    mimeType: string,
    expedienteId: string,
    uploadedBy: string,
    description?: string,
  ): Promise<{
    id: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    originalName: string;
  }> {
    try {
      this.logger.log(`Almacenando archivo: ${originalName} (${fileBuffer.length} bytes)`);

      const document = await this.prisma.document.create({
        data: {
          filename,
          originalName,
          mimeType,
          fileSize: fileBuffer.length,
          expedienteId,
          uploadedBy,
          description,
          fileData: fileBuffer, // Almacenar directamente en PostgreSQL
          fileUrl: null, // No necesitamos URL externa
        },
      });

      this.logger.log(`Archivo almacenado exitosamente con ID: ${document.id}`);
      
      return {
        id: document.id,
        filename: document.filename,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        originalName: document.originalName,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error almacenando archivo: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Obtiene un archivo desde PostgreSQL
   */
  async getFile(documentId: string): Promise<{
    fileData: Buffer;
    mimeType: string;
    originalName: string;
    fileSize: number;
  } | null> {
    try {
      this.logger.log(`Obteniendo archivo con ID: ${documentId}`);

      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        select: {
          fileData: true,
          mimeType: true,
          originalName: true,
          fileSize: true,
        },
      });

      if (!document || !document.fileData) {
        this.logger.warn(`Archivo no encontrado o sin datos: ${documentId}`);
        return null;
      }

      this.logger.log(`Archivo obtenido exitosamente: ${document.originalName}`);
      
      // Convertir Uint8Array a Buffer si es necesario
      const fileData = Buffer.isBuffer(document.fileData) 
        ? document.fileData 
        : Buffer.from(document.fileData);
      
      return {
        fileData,
        mimeType: document.mimeType,
        originalName: document.originalName,
        fileSize: document.fileSize,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error obteniendo archivo: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Verifica si un archivo existe
   */
  async fileExists(documentId: string): Promise<boolean> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        select: { id: true, fileData: true },
      });

      return !!(document && document.fileData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error verificando existencia del archivo: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Elimina un archivo de PostgreSQL
   */
  async deleteFile(documentId: string): Promise<boolean> {
    try {
      this.logger.log(`Eliminando archivo con ID: ${documentId}`);

      const result = await this.prisma.document.delete({
        where: { id: documentId },
      });

      this.logger.log(`Archivo eliminado exitosamente: ${result.filename}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error eliminando archivo: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Obtiene metadatos de un archivo
   */
  async getFileMetadata(documentId: string): Promise<{
    filename: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: Date;
    description?: string;
  } | null> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        select: {
          filename: true,
          originalName: true,
          mimeType: true,
          fileSize: true,
          uploadedAt: true,
          description: true,
        },
      });

      return document;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error obteniendo metadatos: ${errorMessage}`);
      return null;
    }
  }
}
