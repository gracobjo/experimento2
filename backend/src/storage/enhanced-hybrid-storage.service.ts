import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryStorageService } from './cloudinary-storage.service';
import { S3StorageService } from './s3-storage.service';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';

@Injectable()
export class EnhancedHybridStorageService {
  private readonly logger = new Logger(EnhancedHybridStorageService.name);
  private storagePriority: string[];
  private localUploadDir: string;

  constructor(
    private configService: ConfigService,
    private cloudinaryStorage: CloudinaryStorageService,
    private s3StorageService: S3StorageService
  ) {
    // Prioridad de almacenamiento: Cloudinary > S3 > Local
    this.storagePriority = ['cloudinary', 's3', 'local'];
    this.localUploadDir = this.configService.get('UPLOAD_DIR') || 'uploads';
    
    // Crear directorio local si no existe
    this.ensureLocalDirectory();
    
    this.logStorageStatus();
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
   * Mostrar estado de los servicios de almacenamiento
   */
  private logStorageStatus(): void {
    this.logger.log('=== Estado de Servicios de Almacenamiento ===');
    this.logger.log(`Cloudinary: ${this.cloudinaryStorage.isAvailable() ? '✅ Disponible' : '❌ No configurado'}`);
    this.logger.log(`AWS S3: ${this.s3StorageService.isAvailable() ? '✅ Disponible' : '❌ No configurado'}`);
    this.logger.log(`Local: ✅ Siempre disponible`);
    this.logger.log(`Prioridad: ${this.storagePriority.join(' > ')}`);
  }

  /**
   * Subir archivo usando el método de almacenamiento disponible con mayor prioridad
   */
  async uploadFile(
    file: Express.Multer.File,
    key: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; storageType: string; key: string; publicId?: string }> {
    // Intentar cada servicio en orden de prioridad
    for (const storageType of this.storagePriority) {
      try {
        switch (storageType) {
          case 'cloudinary':
            if (this.cloudinaryStorage.isAvailable()) {
              const result = await this.cloudinaryStorage.uploadFile(file, 'experimento2', metadata);
              this.logger.log(`Archivo subido exitosamente a Cloudinary: ${key}`);
              return {
                url: result.url,
                storageType: 'cloudinary',
                key: result.publicId,
                publicId: result.publicId
              };
            }
            break;

          case 's3':
            if (this.s3StorageService.isAvailable()) {
              const url = await this.s3StorageService.uploadFile(file, key, metadata);
              this.logger.log(`Archivo subido exitosamente a S3: ${key}`);
              return {
                url,
                storageType: 's3',
                key
              };
            }
            break;

          case 'local':
            return await this.uploadToLocal(file, key, metadata);
        }
      } catch (error) {
        this.logger.warn(`Error con ${storageType}, intentando siguiente: ${error.message}`);
        continue;
      }
    }

    // Si todos fallan, usar local como último recurso
    this.logger.error('Todos los servicios de almacenamiento fallaron, usando local como último recurso');
    return await this.uploadToLocal(file, key, metadata);
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
    // Si se especifica un tipo de almacenamiento, usarlo directamente
    if (storageType) {
      return await this.downloadFromSpecificStorage(key, storageType);
    }

    // Intentar detectar automáticamente el tipo de almacenamiento
    const detectedStorage = await this.detectStorageType(key);
    if (detectedStorage) {
      return await this.downloadFromSpecificStorage(key, detectedStorage);
    }

    // Si no se puede detectar, intentar todos los servicios en orden
    for (const storageType of this.storagePriority) {
      try {
        const result = await this.downloadFromSpecificStorage(key, storageType);
        if (result) {
          return result;
        }
      } catch (error) {
        this.logger.warn(`Error descargando desde ${storageType}: ${error.message}`);
        continue;
      }
    }

    throw new Error(`Archivo no encontrado en ningún servicio de almacenamiento: ${key}`);
  }

  /**
   * Descargar desde un servicio específico
   */
  private async downloadFromSpecificStorage(key: string, storageType: string): Promise<{ stream: Readable; metadata: any; storageType: string }> {
    try {
      switch (storageType) {
        case 'cloudinary':
          if (this.cloudinaryStorage.isAvailable()) {
            return await this.cloudinaryStorage.downloadFile(key);
          }
          break;

        case 's3':
          if (this.s3StorageService.isAvailable()) {
            const result = await this.s3StorageService.downloadFile(key);
            return {
              ...result,
              storageType: 's3'
            };
          }
          break;

        case 'local':
          return await this.downloadFromLocal(key);
      }
    } catch (error) {
      this.logger.error(`Error descargando desde ${storageType}: ${error.message}`);
      throw error;
    }

    throw new Error(`Servicio ${storageType} no disponible`);
  }

  /**
   * Detectar automáticamente el tipo de almacenamiento basado en la clave
   */
  private async detectStorageType(key: string): Promise<string | null> {
    // Verificar Cloudinary (claves suelen ser alfanuméricas)
    if (this.cloudinaryStorage.isAvailable() && /^[a-zA-Z0-9_-]+$/.test(key)) {
      try {
        if (await this.cloudinaryStorage.fileExists(key)) {
          return 'cloudinary';
        }
      } catch (error) {
        // Continuar con otros servicios
      }
    }

    // Verificar S3 (claves suelen tener formato específico)
    if (this.s3StorageService.isAvailable()) {
      try {
        if (await this.s3StorageService.fileExists(key)) {
          return 's3';
        }
      } catch (error) {
        // Continuar con otros servicios
      }
    }

    // Verificar local
    const filePath = path.join(process.cwd(), this.localUploadDir, key);
    if (fs.existsSync(filePath)) {
      return 'local';
    }

    return null;
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
    if (storageType) {
      return await this.checkFileExistsInStorage(key, storageType);
    }

    // Verificar en todos los servicios
    for (const storageType of this.storagePriority) {
      try {
        if (await this.checkFileExistsInStorage(key, storageType)) {
          return true;
        }
      } catch (error) {
        continue;
      }
    }

    return false;
  }

  /**
   * Verificar si un archivo existe en un servicio específico
   */
  private async checkFileExistsInStorage(key: string, storageType: string): Promise<boolean> {
    try {
      switch (storageType) {
        case 'cloudinary':
          return this.cloudinaryStorage.isAvailable() && await this.cloudinaryStorage.fileExists(key);
        case 's3':
          return this.s3StorageService.isAvailable() && await this.s3StorageService.fileExists(key);
        case 'local':
          const filePath = path.join(process.cwd(), this.localUploadDir, key);
          return fs.existsSync(filePath);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Eliminar archivo de todos los servicios donde exista
   */
  async deleteFile(key: string, storageType?: string): Promise<void> {
    if (storageType) {
      await this.deleteFromSpecificStorage(key, storageType);
      return;
    }

    // Eliminar de todos los servicios donde exista
    const deletedFrom: string[] = [];

    for (const storageType of this.storagePriority) {
      try {
        if (await this.checkFileExistsInStorage(key, storageType)) {
          await this.deleteFromSpecificStorage(key, storageType);
          deletedFrom.push(storageType);
        }
      } catch (error) {
        this.logger.warn(`Error eliminando de ${storageType}: ${error.message}`);
      }
    }

    if (deletedFrom.length > 0) {
      this.logger.log(`Archivo eliminado de: ${deletedFrom.join(', ')}`);
    } else {
      this.logger.warn(`Archivo no encontrado en ningún servicio: ${key}`);
    }
  }

  /**
   * Eliminar archivo de un servicio específico
   */
  private async deleteFromSpecificStorage(key: string, storageType: string): Promise<void> {
    try {
      switch (storageType) {
        case 'cloudinary':
          if (this.cloudinaryStorage.isAvailable()) {
            await this.cloudinaryStorage.deleteFile(key);
            this.logger.log(`Archivo eliminado de Cloudinary: ${key}`);
          }
          break;
        case 's3':
          if (this.s3StorageService.isAvailable()) {
            await this.s3StorageService.deleteFile(key);
            this.logger.log(`Archivo eliminado de S3: ${key}`);
          }
          break;
        case 'local':
          const filePath = path.join(process.cwd(), this.localUploadDir, key);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            this.logger.log(`Archivo eliminado localmente: ${key}`);
          }
          break;
      }
    } catch (error) {
      this.logger.error(`Error eliminando archivo de ${storageType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generar URL para descarga
   */
  async generateDownloadUrl(key: string, storageType?: string): Promise<string> {
    if (storageType) {
      return await this.generateUrlFromSpecificStorage(key, storageType);
    }

    // Intentar detectar automáticamente
    const detectedStorage = await this.detectStorageType(key);
    if (detectedStorage) {
      return await this.generateUrlFromSpecificStorage(key, detectedStorage);
    }

    // Fallback a URL local
    return `/api/documents/file/${key}`;
  }

  /**
   * Generar URL desde un servicio específico
   */
  private async generateUrlFromSpecificStorage(key: string, storageType: string): Promise<string> {
    try {
      switch (storageType) {
        case 'cloudinary':
          if (this.cloudinaryStorage.isAvailable()) {
            return await this.cloudinaryStorage.generateDownloadUrl(key);
          }
          break;
        case 's3':
          if (this.s3StorageService.isAvailable()) {
            return await this.s3StorageService.generatePresignedUrl(key);
          }
          break;
        case 'local':
          return `/api/documents/file/${key}`;
      }
    } catch (error) {
      this.logger.warn(`Error generando URL de ${storageType}: ${error.message}`);
    }

    // Fallback a URL local
    return `/api/documents/file/${key}`;
  }

  /**
   * Obtener información del archivo
   */
  async getFileInfo(key: string, storageType?: string): Promise<any> {
    if (storageType) {
      return await this.getInfoFromSpecificStorage(key, storageType);
    }

    // Intentar detectar automáticamente
    const detectedStorage = await this.detectStorageType(key);
    if (detectedStorage) {
      return await this.getInfoFromSpecificStorage(key, detectedStorage);
    }

    throw new Error(`Archivo no encontrado: ${key}`);
  }

  /**
   * Obtener información desde un servicio específico
   */
  private async getInfoFromSpecificStorage(key: string, storageType: string): Promise<any> {
    try {
      switch (storageType) {
        case 'cloudinary':
          if (this.cloudinaryStorage.isAvailable()) {
            return await this.cloudinaryStorage.getFileMetadata(key);
          }
          break;
        case 's3':
          if (this.s3StorageService.isAvailable()) {
            return await this.s3StorageService.getFileMetadata(key);
          }
          break;
        case 'local':
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
          break;
      }
    } catch (error) {
      this.logger.error(`Error obteniendo info de ${storageType}: ${error.message}`);
      throw error;
    }

    throw new Error(`Servicio ${storageType} no disponible`);
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
   * Obtener estadísticas completas de almacenamiento
   */
  async getStorageStats(): Promise<any> {
    const stats = {
      services: {
        cloudinary: {
          available: this.cloudinaryStorage.isAvailable(),
          plan: this.cloudinaryStorage.isAvailable() ? 'Gratuito' : 'No configurado'
        },
        s3: {
          available: this.s3StorageService.isAvailable(),
          plan: this.s3StorageService.isAvailable() ? 'Configurado' : 'No configurado'
        },
        local: {
          available: true,
          plan: 'Siempre disponible'
        }
      },
      priority: this.storagePriority,
      localFiles: 0,
      localSize: 0
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
      this.logger.error(`Error obteniendo estadísticas locales: ${error.message}`);
    }

    // Estadísticas de Cloudinary si está disponible
    if (this.cloudinaryStorage.isAvailable()) {
      try {
        const cloudinaryStats = await this.cloudinaryStorage.getUsageStats();
        stats.cloudinaryStats = cloudinaryStats;
      } catch (error) {
        this.logger.warn(`No se pudieron obtener estadísticas de Cloudinary: ${error.message}`);
      }
    }

    return stats;
  }

  /**
   * Migrar archivo de un servicio a otro
   */
  async migrateFile(key: string, fromStorage: string, toStorage: string): Promise<boolean> {
    try {
      // Descargar archivo del servicio origen
      const downloadResult = await this.downloadFile(key, fromStorage);
      
      // Crear archivo temporal para upload
      const tempFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: key,
        encoding: '7bit',
        mimetype: downloadResult.metadata.contentType || 'application/octet-stream',
        size: downloadResult.metadata.contentLength || 0,
        buffer: Buffer.concat([]), // Convertir stream a buffer
        stream: downloadResult.stream,
        destination: '',
        filename: key,
        path: ''
      };

      // Subir al servicio destino
      const uploadResult = await this.uploadFile(tempFile, key, {
        migratedFrom: fromStorage,
        migratedAt: new Date().toISOString()
      });

      this.logger.log(`Archivo migrado exitosamente de ${fromStorage} a ${toStorage}: ${key}`);
      return true;
    } catch (error) {
      this.logger.error(`Error migrando archivo de ${fromStorage} a ${toStorage}: ${error.message}`);
      return false;
    }
  }
}
