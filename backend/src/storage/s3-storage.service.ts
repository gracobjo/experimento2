import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const awsConfig = this.configService.get('storage.aws');
    
    if (awsConfig.accessKeyId && awsConfig.secretAccessKey) {
      this.s3Client = new S3Client({
        region: awsConfig.region,
        credentials: {
          accessKeyId: awsConfig.accessKeyId,
          secretAccessKey: awsConfig.secretAccessKey,
        },
      });
      this.bucketName = awsConfig.bucketName;
      this.logger.log(`S3 Storage inicializado para bucket: ${this.bucketName}`);
    } else {
      this.logger.warn('Credenciales de AWS no configuradas, S3 Storage deshabilitado');
    }
  }

  /**
   * Subir archivo a S3
   */
  async uploadFile(
    file: Express.Multer.File,
    key: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      if (!this.s3Client) {
        throw new Error('S3 Storage no está configurado');
      }

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
        Metadata: {
          originalName: file.originalname,
          uploadedBy: metadata?.uploadedBy || 'unknown',
          expedienteId: metadata?.expedienteId || 'unknown',
          ...metadata,
        },
      });

      await this.s3Client.send(command);
      this.logger.log(`Archivo subido exitosamente a S3: ${key}`);
      
      return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error(`Error subiendo archivo a S3: ${error.message}`);
      throw error;
    }
  }

  /**
   * Descargar archivo de S3
   */
  async downloadFile(key: string): Promise<{ stream: Readable; metadata: any }> {
    try {
      if (!this.s3Client) {
        throw new Error('S3 Storage no está configurado');
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Archivo no encontrado en S3');
      }

      this.logger.log(`Archivo descargado exitosamente de S3: ${key}`);
      
      return {
        stream: response.Body as Readable,
        metadata: {
          contentType: response.ContentType,
          contentLength: response.ContentLength,
          lastModified: response.LastModified,
          metadata: response.Metadata,
        },
      };
    } catch (error) {
      this.logger.error(`Error descargando archivo de S3: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generar URL firmada para descarga directa
   */
  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      if (!this.s3Client) {
        throw new Error('S3 Storage no está configurado');
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`URL firmada generada para: ${key}`);
      
      return url;
    } catch (error) {
      this.logger.error(`Error generando URL firmada: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar si un archivo existe en S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      if (!this.s3Client) {
        return false;
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Eliminar archivo de S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      if (!this.s3Client) {
        throw new Error('S3 Storage no está configurado');
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Archivo eliminado exitosamente de S3: ${key}`);
    } catch (error) {
      this.logger.error(`Error eliminando archivo de S3: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener metadatos del archivo
   */
  async getFileMetadata(key: string): Promise<any> {
    try {
      if (!this.s3Client) {
        throw new Error('S3 Storage no está configurado');
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);
      
      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata,
        etag: response.ETag,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo metadatos del archivo: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verificar si S3 está disponible
   */
  isAvailable(): boolean {
    return !!this.s3Client;
  }
}
