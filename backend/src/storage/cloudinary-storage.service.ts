import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryStorageService {
  private readonly logger = new Logger(CloudinaryStorageService.name);
  private isConfigured: boolean = false;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.isConfigured = true;
      this.logger.log('Cloudinary Storage inicializado correctamente');
    } else {
      this.logger.warn('Credenciales de Cloudinary no configuradas, Cloudinary Storage deshabilitado');
    }
  }

  /**
   * Subir archivo a Cloudinary
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'experimento2',
    metadata?: Record<string, string>
  ): Promise<{ url: string; publicId: string; storageType: string }> {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary Storage no está configurado');
      }

      // Crear stream desde el buffer
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      // Configurar opciones de upload
      const uploadOptions: any = {
        folder,
        resource_type: 'auto', // Detecta automáticamente el tipo
        public_id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        overwrite: false,
        unique_filename: true,
      };

      // Agregar metadatos si existen
      if (metadata) {
        uploadOptions.context = metadata;
      }

      // Subir archivo
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        stream.pipe(uploadStream);
      });

            this.logger.log(`Archivo subido exitosamente a Cloudinary: ${(result as any).public_id}`);

      return {
        url: (result as any).secure_url,
        publicId: (result as any).public_id,
        storageType: 'cloudinary'
      };
    } catch (error) {
      this.logger.error(`Error subiendo archivo a Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Descargar archivo de Cloudinary
   */
  async downloadFile(publicId: string): Promise<{ stream: Readable; metadata: any; storageType: string }> {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary Storage no está configurado');
      }

      this.logger.log(`Intentando descargar archivo de Cloudinary: ${publicId}`);

      // SOLUCIÓN: Usar el mismo enfoque de fallback que getFileMetadata
      let info;
      try {
        // Primero intentar con el método directo
        info = await cloudinary.api.resource(publicId);
      } catch (directError) {
        this.logger.log(`Método directo falló, usando búsqueda por prefix: ${publicId}`);
        
        // Si falla, usar búsqueda por prefix que funciona
        const resourcesResult = await cloudinary.api.resources({
          prefix: publicId,
          max_results: 1,
          type: 'upload'
        });
        
        if (resourcesResult.resources && resourcesResult.resources.length > 0) {
          info = resourcesResult.resources[0];
          this.logger.log(`Archivo encontrado por prefix: ${info.public_id}`);
        } else {
          throw new Error('No se pudo encontrar el archivo en Cloudinary');
        }
      }
      
      if (!info) {
        throw new Error('No se pudo obtener información del archivo desde Cloudinary');
      }

      this.logger.log(`Información del archivo obtenida: ${info.public_id}, formato: ${info.format}, tipo: ${info.resource_type}`);
      
      // Generar URL de descarga
      const downloadUrl = cloudinary.url(publicId, {
        secure: true,
        resource_type: info.resource_type
      });

      this.logger.log(`URL de descarga generada: ${downloadUrl}`);

      // Crear stream de descarga con mejor manejo de errores
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Error descargando archivo: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      this.logger.log(`Archivo descargado, tamaño: ${buffer.length} bytes`);
      
      // Crear stream desde buffer
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      this.logger.log(`Archivo descargado exitosamente de Cloudinary: ${publicId}`);
      
      return {
        stream,
        metadata: {
          contentType: this.getMimeTypeFromPublicId(publicId, info.format),
          contentLength: buffer.length,
          lastModified: new Date(info.created_at),
          publicId: info.public_id,
          resourceType: info.resource_type,
          format: info.format,
          width: info.width,
          height: info.height,
        },
        storageType: 'cloudinary'
      };
    } catch (error) {
      this.logger.error(`Error descargando archivo de Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
      
      // Si es un error de red o de Cloudinary, intentar con URL directa
      if (error instanceof Error && (
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('404') ||
        error.message.includes('not found')
      )) {
        this.logger.warn(`Error de red o archivo no encontrado detectado, sugiriendo uso de URL directa`);
        throw new Error(`Error al descargar archivo desde Cloudinary. El archivo puede no existir o haber problemas de conectividad.`);
      }
      
      throw error;
    }
  }

  /**
   * Generar URL para descarga directa
   */
  async generateDownloadUrl(publicId: string, options: any = {}): Promise<string> {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary Storage no está configurado');
      }

      const url = cloudinary.url(publicId, {
        secure: true,
        ...options
      });

      this.logger.log(`URL de descarga generada para: ${publicId}`);
      return url;
    } catch (error) {
      this.logger.error(`Error generando URL de descarga: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Verificar si un archivo existe en Cloudinary
   */
  async fileExists(publicId: string): Promise<boolean> {
    try {
      if (!this.isConfigured) {
        return false;
      }

      // SOLUCIÓN: Usar el mismo enfoque de fallback que getFileMetadata
      try {
        await cloudinary.api.resource(publicId);
        return true;
      } catch (directError) {
        // Si falla, usar búsqueda por prefix que funciona
        const resourcesResult = await cloudinary.api.resources({
          prefix: publicId,
          max_results: 1,
          type: 'upload'
        });
        
        return resourcesResult.resources && resourcesResult.resources.length > 0;
      }
    } catch (error) {
      this.logger.error(`Error verificando existencia del archivo: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Obtener metadatos de un archivo en Cloudinary
   */
  async getFileMetadata(publicId: string): Promise<{
    publicId: string;
    resourceType: string;
    format: string;
    size: number;
    createdAt: Date;
    url: string;
  }> {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary Storage no está configurado');
      }

      this.logger.log(`Obteniendo metadatos del archivo: ${publicId}`);

      // SOLUCIÓN: Usar api.resources() con prefix en lugar de api.resource() que falla
      let info;
      try {
        // Primero intentar con el método directo
        info = await cloudinary.api.resource(publicId);
      } catch (directError) {
        this.logger.log(`Método directo falló, usando búsqueda por prefix: ${publicId}`);
        
        // Si falla, usar búsqueda por prefix que funciona
        const resourcesResult = await cloudinary.api.resources({
          prefix: publicId,
          max_results: 1,
          type: 'upload'
        });
        
        if (resourcesResult.resources && resourcesResult.resources.length > 0) {
          info = resourcesResult.resources[0];
          this.logger.log(`Archivo encontrado por prefix: ${info.public_id}`);
        } else {
          throw new Error('No se pudo encontrar el archivo en Cloudinary');
        }
      }
      
      if (!info) {
        throw new Error('No se pudo obtener información del archivo desde Cloudinary');
      }

      this.logger.log(`Metadatos obtenidos exitosamente: ${info.public_id}`);

      return {
        publicId: info.public_id,
        resourceType: info.resource_type,
        format: info.format,
        size: info.bytes || 0,
        createdAt: new Date(info.created_at),
        url: info.secure_url
      };
    } catch (error) {
      this.logger.error(`Error obteniendo metadatos del archivo: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Eliminar archivo de Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary Storage no está configurado');
      }

      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        this.logger.log(`Archivo eliminado exitosamente de Cloudinary: ${publicId}`);
      } else {
        throw new Error(`Error eliminando archivo: ${result.result}`);
      }
    } catch (error) {
      this.logger.error(`Error eliminando archivo de Cloudinary: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Transformar archivo (redimensionar, comprimir, etc.)
   */
  async transformFile(publicId: string, transformations: any = {}): Promise<string> {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary Storage no está configurado');
      }

      const url = cloudinary.url(publicId, {
        secure: true,
        ...transformations
      });

      this.logger.log(`URL transformada generada para: ${publicId}`);
      return url;
    } catch (error) {
      this.logger.error(`Error transformando archivo: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso
   */
  async getUsageStats(): Promise<any> {
    try {
      if (!this.isConfigured) {
        throw new Error('Cloudinary Storage no está configurado');
      }

      const usage = await cloudinary.api.usage();
      
      return {
        storageType: 'cloudinary',
        plan: usage.plan,
        credits: usage.credits,
        objects: usage.objects,
        bandwidth: usage.bandwidth,
        storage: usage.storage,
        requests: usage.requests,
        resources: usage.resources,
        derived_resources: usage.derived_resources,
        transformations: usage.transformations,
        videos: usage.videos,
        images: usage.images,
        raw: usage.raw,
      };
    } catch (error) {
      this.logger.error(`Error obteniendo estadísticas de uso: ${error instanceof Error ? error.message : String(error)}`);
      return {
        storageType: 'cloudinary',
        error: 'No se pudieron obtener estadísticas'
      };
    }
  }

  /**
   * Verificar si Cloudinary está disponible
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Obtener información del plan gratuito
   */
  getFreePlanInfo(): any {
    return {
      storage: '25GB',
      transfer: '25GB/mes',
      transformations: '25,000/mes',
      features: [
        'CDN global',
        'Transformaciones automáticas',
        'Optimización de imágenes',
        'Soporte para PDFs y documentos',
        'URLs seguras HTTPS',
        'API REST completa'
      ],
      limitations: [
        'Máximo 10MB por archivo',
        'Sin soporte premium',
        'Sin backup automático'
      ]
    };
  }

  /**
   * Obtener MIME type basado en la extensión del publicId
   */
  private getMimeTypeFromPublicId(publicId: string, cloudinaryFormat?: string): string {
    // Si Cloudinary detectó el formato, usarlo
    if (cloudinaryFormat) {
      switch (cloudinaryFormat.toLowerCase()) {
        case 'docx':
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'doc':
          return 'application/msword';
        case 'pdf':
          return 'application/pdf';
        case 'txt':
          return 'text/plain';
        case 'csv':
          return 'text/csv';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'gif':
          return 'image/gif';
        case 'webp':
          return 'image/webp';
        default:
          return `application/${cloudinaryFormat}`;
      }
    }

    // Si no hay formato de Cloudinary, intentar detectar por extensión en publicId
    const extension = publicId.includes('.') ? publicId.split('.').pop()?.toLowerCase() : '';
    
    switch (extension) {
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'doc':
        return 'application/msword';
      case 'pdf':
        return 'application/pdf';
      case 'txt':
        return 'text/plain';
      case 'csv':
        return 'text/csv';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}
