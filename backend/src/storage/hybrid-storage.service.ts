import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3StorageService } from './s3-storage.service';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class HybridStorageService {
  private readonly logger = new Logger(HybridStorageService.name);
  private storageType: string;
  private localUploadDir: string;

  constructor(
    private configService: ConfigService,
    private s3StorageService: S3StorageService
  ) {
    this.storageType = this.configService.get('storage.type') || 'local';
    this.localUploadDir = this.configService.get('storage.local.uploadDir') || 'uploads';
    
    // Crear directorio local si no existe
    this.ensureLocalDirectory();
  }

  /**
   * Asegurar que el directorio local existe
   */
  private ensureLocalDirectory(): void {
    const uploadPath = path.join(process.cwd(), this.localUploadDir);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      this.logger.log(`Directorio local creado: ${uploadPath}`);
    }
  }

  /**
   * Subir archivo usando el método de almacenamiento configurado
   */
  async uploadFile(
    file: Express.Multer.File,
    key: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; storageType: string; key: string }> {
    try {
      // Intentar usar S3 si está disponible y configurado
      if (this.storageType === 's3' && this.s3StorageService.isAvailable()) {
        const url = await this.s3StorageService.uploadFile(file, key, metadata);
        this.logger.log(`Archivo subido a S3: ${key}`);
        
        return {
          url,
          storageType: 's3',
          key
        };
      }

      // Fallback a almacenamiento local
      return await this.uploadToLocal(file, key, metadata);
    } catch (error) {
      this.logger.error(`Error en upload híbrido, fallback a local: ${error instanceof Error ? error.message : String(error)}`);
      return await this.uploadToLocal(file, key, metadata);
    }
  }

  /**
   * Subir archivo a almacenamiento local
   */
  private async uploadToLocal(
    file: Express.Multer.File,
    key: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; storageType: string; key: string }> {
    const uploadPath = path.join(process.cwd(), this.localUploadDir);
    const filePath = path.join(uploadPath, key);

    // Guardar archivo localmente
    fs.writeFileSync(filePath, file.buffer);
    
    this.logger.log(`Archivo subido localmente: ${key}`);
    
    return {
      url: `/uploads/${key}`,
      storageType: 'local',
      key
    };
  }

  /**
   * Descargar archivo usando el método de almacenamiento configurado
   */
  async downloadFile(key: string, storageType?: string): Promise<{ stream: Readable; metadata: any; storageType: string }> {
    try {
      // Si se especifica S3 o está configurado como predeterminado
      if ((storageType === 's3' || this.storageType === 's3') && this.s3StorageService.isAvailable()) {
        const result = await this.s3StorageService.downloadFile(key);
        return {
          ...result,
          storageType: 's3'
        };
      }

      // Fallback a almacenamiento local
      return await this.downloadFromLocal(key);
    } catch (error) {
      this.logger.error(`Error en descarga híbrida, fallback a local: ${error instanceof Error ? error.message : String(error)}`);
      return await this.downloadFromLocal(key);
    }
  }

  /**
   * Descargar archivo desde almacenamiento local
   */
  private async downloadFromLocal(key: string): Promise<{ stream: Readable; metadata: any; storageType: string }> {
    const filePath = path.join(process.cwd(), this.localUploadDir, key);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo local no encontrado: ${key}`);
    }

    const stats = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);
    
    this.logger.log(`Archivo descargado localmente: ${key}`);
    
    return {
      stream,
      metadata: {
        contentType: this.getMimeType(key),
        contentLength: stats.size,
        lastModified: stats.mtime,
      },
      storageType: 'local'
    };
  }

  /**
   * Verificar si un archivo existe
   */
  async fileExists(key: string, storageType?: string): Promise<boolean> {
    try {
      // Intentar S3 primero
      if ((storageType === 's3' || this.storageType === 's3') && this.s3StorageService.isAvailable()) {
        return await this.s3StorageService.fileExists(key);
      }

      // Fallback a local
      const filePath = path.join(process.cwd(), this.localUploadDir, key);
      return fs.existsSync(filePath);
    } catch (error) {
      // Si falla S3, verificar local
      const filePath = path.join(process.cwd(), this.localUploadDir, key);
      return fs.existsSync(filePath);
    }
  }

  /**
   * Eliminar archivo
   */
  async deleteFile(key: string, storageType?: string): Promise<void> {
    try {
      // Intentar eliminar de S3
      if ((storageType === 's3' || this.storageType === 's3') && this.s3StorageService.isAvailable()) {
        await this.s3StorageService.deleteFile(key);
        this.logger.log(`Archivo eliminado de S3: ${key}`);
        return;
      }
    } catch (error) {
      this.logger.warn(`No se pudo eliminar de S3, continuando con local: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Eliminar de local
    const filePath = path.join(process.cwd(), this.localUploadDir, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`Archivo eliminado localmente: ${key}`);
    }
  }

  /**
   * Generar URL para descarga
   */
  async generateDownloadUrl(key: string, storageType?: string): Promise<string> {
    try {
      // Si es S3, generar URL firmada
      if ((storageType === 's3' || this.storageType === 's3') && this.s3StorageService.isAvailable()) {
        return await this.s3StorageService.generatePresignedUrl(key);
      }
    } catch (error) {
      this.logger.warn(`No se pudo generar URL de S3, usando local: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Fallback a URL local
    return `/api/documents/file/${key}`;
  }

  /**
   * Obtener información del archivo
   */
  async getFileInfo(key: string, storageType?: string): Promise<any> {
    try {
      // Intentar obtener info de S3
      if ((storageType === 's3' || this.storageType === 's3') && this.s3StorageService.isAvailable()) {
        return await this.s3StorageService.getFileMetadata(key);
      }
    } catch (error) {
      this.logger.warn(`No se pudo obtener info de S3, usando local: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Fallback a info local
    const filePath = path.join(process.cwd(), this.localUploadDir, key);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        contentType: this.getMimeType(key),
        contentLength: stats.size,
        lastModified: stats.mtime,
        storageType: 'local'
      };
    }

    throw new Error(`Archivo no encontrado: ${key}`);
  }

  /**
   * Obtener tipo MIME basado en extensión
   */
  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStats(): Promise<any> {
    const stats = {
      storageType: this.storageType,
      s3Available: this.s3StorageService.isAvailable(),
      localFiles: 0,
      localSize: 0,
      s3Files: 0,
      s3Size: 0
    };

    // Estadísticas locales
    try {
      const uploadPath = path.join(process.cwd(), this.localUploadDir);
      if (fs.existsSync(uploadPath)) {
        const files = fs.readdirSync(uploadPath);
        stats.localFiles = files.length;
        
        for (const file of files) {
          const filePath = path.join(uploadPath, file);
          const fileStats = fs.statSync(filePath);
          if (fileStats.isFile()) {
            stats.localSize += fileStats.size;
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas locales: ${error instanceof Error ? error.message : String(error)}`);
    }

    return stats;
  }
}
