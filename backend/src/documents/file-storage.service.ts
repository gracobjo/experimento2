import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { STORAGE_CONFIG } from '../config/storage.config';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  /**
   * Almacena un archivo en el sistema de archivos local
   */
  async storeFile(
    fileBuffer: Buffer,
    originalName: string,
    expedienteId: string,
    metadata?: any
  ): Promise<{
    filename: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }> {
    try {
      // Crear nombre único para el archivo
      const timestamp = Date.now();
      const fileExtension = path.extname(originalName);
      const sanitizedOriginalName = this.sanitizeFilename(originalName);
      const uniqueFilename = `${timestamp}_${sanitizedOriginalName}`;

      // Crear ruta del archivo
      const expedientePath = expedienteId || 'general';
      const relativePath = path.join('uploads', expedientePath, uniqueFilename);
      const fullPath = path.join(STORAGE_CONFIG.uploadPath, expedientePath, uniqueFilename);

      // Crear directorios si no existen
      await this.ensureDirectoryExists(path.dirname(fullPath));

      // Escribir archivo
      fs.writeFileSync(fullPath, fileBuffer);
      
      // Obtener información del archivo
      const fileStats = fs.statSync(fullPath);
      const mimeType = this.getMimeTypeFromExtension(fileExtension);

      this.logger.log(`✅ Archivo almacenado: ${fullPath} (${fileStats.size} bytes)`);

      return {
        filename: uniqueFilename,
        filePath: fullPath,
        fileUrl: `/uploads/${relativePath}`,
        fileSize: fileStats.size,
        mimeType: mimeType
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error almacenando archivo: ${errorMessage}`);
      throw new Error(`Error al almacenar archivo: ${errorMessage}`);
    }
  }

  /**
   * Lee un archivo del sistema de archivos
   */
  async readFile(fileUrl: string): Promise<{
    buffer: Buffer;
    mimeType: string;
    fileSize: number;
    originalName: string;
  }> {
    try {
      // Convertir URL a ruta del sistema de archivos
      const relativePath = fileUrl.replace('/uploads/', '');
      const fullPath = path.join(STORAGE_CONFIG.uploadPath, relativePath);

      // Verificar que el archivo existe
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Archivo no encontrado: ${fullPath}`);
      }

      // Leer archivo
      const buffer = fs.readFileSync(fullPath);
      const fileStats = fs.statSync(fullPath);
      
      // Determinar MIME type
      const fileExtension = path.extname(fullPath);
      const mimeType = this.getMimeTypeFromExtension(fileExtension);

      this.logger.log(`✅ Archivo leído: ${fullPath} (${fileStats.size} bytes)`);

      return {
        buffer,
        mimeType,
        fileSize: fileStats.size,
        originalName: path.basename(fullPath)
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error leyendo archivo: ${errorMessage}`);
      throw new Error(`Error al leer archivo: ${errorMessage}`);
    }
  }

  /**
   * Elimina un archivo del sistema de archivos
   */
  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const relativePath = fileUrl.replace('/uploads/', '');
      const fullPath = path.join(STORAGE_CONFIG.uploadPath, relativePath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`✅ Archivo eliminado: ${fullPath}`);
        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error eliminando archivo: ${errorMessage}`);
      throw new Error(`Error al eliminar archivo: ${errorMessage}`);
    }
  }

  /**
   * Verifica si un archivo existe
   */
  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const relativePath = fileUrl.replace('/uploads/', '');
      const fullPath = path.join(STORAGE_CONFIG.uploadPath, relativePath);
      return fs.existsSync(fullPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene información de un archivo
   */
  async getFileInfo(fileUrl: string): Promise<{
    exists: boolean;
    fileSize?: number;
    mimeType?: string;
    lastModified?: Date;
  }> {
    try {
      const relativePath = fileUrl.replace('/uploads/', '');
      const fullPath = path.join(STORAGE_CONFIG.uploadPath, relativePath);

      if (!fs.existsSync(fullPath)) {
        return { exists: false };
      }

      const fileStats = fs.statSync(fullPath);
      const fileExtension = path.extname(fullPath);
      const mimeType = this.getMimeTypeFromExtension(fileExtension);

      return {
        exists: true,
        fileSize: fileStats.size,
        mimeType: mimeType,
        lastModified: fileStats.mtime
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error obteniendo información del archivo: ${errorMessage}`);
      return { exists: false };
    }
  }

  /**
   * Lista archivos en un directorio
   */
  async listFiles(expedienteId?: string): Promise<string[]> {
    try {
      const expedientePath = expedienteId || 'general';
      const fullPath = path.join(STORAGE_CONFIG.uploadPath, expedientePath);

      if (!fs.existsSync(fullPath)) {
        return [];
      }

      const files = fs.readdirSync(fullPath);
      return files.filter(file => {
        const filePath = path.join(fullPath, file);
        return fs.statSync(filePath).isFile();
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error listando archivos: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Crea directorios si no existen
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      this.logger.log(`📁 Directorio creado: ${dirPath}`);
    }
  }

  /**
   * Sanitiza el nombre del archivo
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 100);
  }

  /**
   * Determina el MIME type basado en la extensión
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}
