import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { STORAGE_CONFIG, getUploadPath, generateFilePath, sanitizeFilename, ensureDirectoryExists } from '../config/storage.config';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService
  ) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Subir documento',
    description: 'Sube un documento al sistema (PDF, TXT, CSV, DOC, DOCX, JPG, JPEG, PNG, GIF, WEBP - máximo 10MB)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (máximo 10MB)'
        },
        title: {
          type: 'string',
          description: 'Título del documento'
        },
        description: {
          type: 'string',
          description: 'Descripción del documento'
        },
        expedienteId: {
          type: 'string',
          description: 'ID del expediente asociado (opcional)'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Documento subido exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        filename: { type: 'string' },
        originalName: { type: 'string' },
        mimeType: { type: 'string' },
        size: { type: 'number' },
        uploadedBy: { type: 'string' },
        expedienteId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o datos incorrectos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 413, description: 'Archivo demasiado grande' })
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: STORAGE_CONFIG.maxFileSize }),
          new FileTypeValidator({ fileType: '.(pdf|txt|csv|doc|docx|jpg|jpeg|png|gif|webp)' }),
        ],
      }),
    )
    file: any,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @Request() req,
  ) {
    try {
      console.log(`📤 Iniciando upload de archivo: ${file.originalname}`);
      console.log(`👤 Usuario: ${req.user.id}, Rol: ${req.user.role}`);

      // Validar tipo de archivo
      if (!STORAGE_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Tipo de archivo no permitido: ${file.mimetype}`);
      }

      // Validar tamaño de archivo
      if (file.size > STORAGE_CONFIG.maxFileSize) {
        throw new BadRequestException(`Archivo demasiado grande: ${file.size} bytes (máximo: ${STORAGE_CONFIG.maxFileSize} bytes)`);
      }

      // Sanitizar nombre de archivo
      const sanitizedFilename = sanitizeFilename(file.originalname);
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${timestamp}_${sanitizedFilename}`;

      // Generar ruta del archivo
      const expedienteId = uploadDocumentDto.expedienteId || 'general';
      const relativePath = generateFilePath(expedienteId, uniqueFilename);
      const fullPath = getUploadPath(relativePath);

      // Crear directorios si no existen
      await ensureDirectoryExists(path.dirname(fullPath));

      // Guardar archivo localmente
      fs.writeFileSync(fullPath, file.buffer);
      console.log(`✅ Archivo guardado localmente: ${fullPath}`);

      // Crear registro en la base de datos
      const documentData = {
        filename: uniqueFilename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        fileUrl: `/uploads/${relativePath}`,
        description: uploadDocumentDto.description,
        expedienteId: expedienteId,
        uploadedBy: req.user.id,
        metadata: {
          localPath: fullPath,
          uploadTimestamp: new Date().toISOString(),
          sanitizedFilename: sanitizedFilename
        }
      };

      const savedDocument = await this.documentsService.create(documentData);
      console.log(`✅ Documento guardado en BD: ${savedDocument.id}`);

      return {
        id: savedDocument.id,
        filename: savedDocument.filename,
        originalName: savedDocument.originalName,
        mimeType: savedDocument.mimeType,
        size: savedDocument.size,
        fileUrl: savedDocument.fileUrl,
        description: savedDocument.description,
        expedienteId: savedDocument.expedienteId,
        uploadedBy: savedDocument.uploadedBy,
        createdAt: savedDocument.uploadedAt
      };

    } catch (error) {
      console.error(`❌ Error en uploadDocument:`, error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todos los documentos',
    description: 'Devuelve todos los documentos accesibles para el usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de documentos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          fileUrl: { type: 'string' },
          fileSize: { type: 'number' },
          mimeType: { type: 'string' },
          description: { type: 'string' },
          expedienteId: { type: 'string' },
          uploadedBy: { type: 'string' },
          uploadedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Request() req) {
    return this.documentsService.findAll(req.user.id, req.user.role);
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener mis documentos',
    description: 'Devuelve los documentos del usuario autenticado (CLIENTE ve documentos de sus expedientes, ABOGADO ve documentos de sus casos)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de documentos del usuario',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          fileUrl: { type: 'string' },
          fileSize: { type: 'number' },
          mimeType: { type: 'string' },
          description: { type: 'string' },
          expedienteId: { type: 'string' },
          uploadedBy: { type: 'string' },
          uploadedAt: { type: 'string', format: 'date-time' },
          expediente: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findMyDocuments(@Request() req) {
    return this.documentsService.findMyDocuments(req.user.id, req.user.role);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Estadísticas de documentos',
    description: 'Devuelve estadísticas de documentos para el usuario autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de documentos',
    schema: {
      type: 'object',
      properties: {
        totalDocuments: { type: 'number' },
        totalSize: { type: 'number' },
        documentsByType: {
          type: 'object',
          properties: {
            pdf: { type: 'number' },
            doc: { type: 'number' },
            image: { type: 'number' },
            other: { type: 'number' }
          }
        },
        recentUploads: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getStats(@Request() req) {
    return this.documentsService.getDocumentsStats(req.user.id, req.user.role);
  }

  @Get('expediente/:expedienteId')
  @ApiOperation({ 
    summary: 'Obtener documentos por expediente',
    description: 'Devuelve todos los documentos asociados a un expediente específico'
  })
  @ApiParam({ name: 'expedienteId', description: 'ID del expediente', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documentos del expediente',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          fileUrl: { type: 'string' },
          fileSize: { type: 'number' },
          mimeType: { type: 'string' },
          description: { type: 'string' },
          expedienteId: { type: 'string' },
          uploadedBy: { type: 'string' },
          uploadedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Expediente no encontrado' })
  findByExpediente(
    @Param('expedienteId') expedienteId: string,
    @Request() req,
  ) {
    return this.documentsService.findByExpediente(
      expedienteId,
      req.user.id,
      req.user.role,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener documento por ID',
    description: 'Devuelve un documento específico por su ID. Los clientes solo pueden ver documentos de sus expedientes.'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documento encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        filename: { type: 'string' },
        originalName: { type: 'string' },
        fileUrl: { type: 'string' },
        fileSize: { type: 'number' },
        mimeType: { type: 'string' },
        description: { type: 'string' },
        expedienteId: { type: 'string' },
        uploadedBy: { type: 'string' },
        uploadedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(id, req.user.id, req.user.role);
  }

  @Get('test-simple')
  @ApiOperation({ 
    summary: 'Endpoint de prueba simple',
    description: 'Endpoint básico para verificar que el controlador esté funcionando'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Controlador funcionando',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        status: { type: 'string' }
      }
    }
  })
  async testSimple() {
    return {
      message: 'Documents controller funcionando correctamente',
      timestamp: new Date().toISOString(),
      status: 'ok'
    };
  }

  @Get('file/:id')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Ver documento',
    description: 'Sirve un documento específico para visualización. Los clientes solo pueden ver documentos de sus expedientes.'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo servido',
    schema: {
      type: 'string',
      format: 'binary'
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async serveFile(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    try {
      console.log(`📁 Intentando servir archivo ID: ${id}`);
      console.log(`👤 Usuario: ${req.user.id}, Rol: ${req.user.role}`);

      // Buscar el documento por ID
      const document = await this.documentsService.findOne(
        id,
        req.user.id,
        req.user.role,
      );

      if (!document) {
        console.log(`❌ Documento no encontrado: ${id}`);
        return res.status(404).json({
          message: 'Documento no encontrado',
          error: 'Not Found',
          statusCode: 404,
          documentId: id
        });
      }

      console.log(`📄 Documento encontrado: ${document.filename}, Original: ${document.originalName}`);
      console.log(`🔗 URL del archivo: ${document.fileUrl}`);

      // Construir ruta completa del archivo local
      const localPath = path.join(STORAGE_CONFIG.uploadPath, document.fileUrl.replace('/uploads/', ''));
      
      console.log(`📂 Ruta local del archivo: ${localPath}`);

      // Verificar si el archivo existe localmente
      if (!fs.existsSync(localPath)) {
        console.log(`❌ Archivo no encontrado localmente: ${localPath}`);
        return res.status(404).json({
          message: 'Archivo no encontrado en el servidor',
          error: 'File Not Found',
          statusCode: 404,
          documentId: id,
          localPath: localPath
        });
      }

      // Obtener información del archivo
      const fileStats = fs.statSync(localPath);
      const fileSize = fileStats.size;

      // Configurar headers de respuesta
      let contentType = document.mimeType || 'application/octet-stream';
      
      // Mejorar detección de MIME types para archivos comunes
      if (!document.mimeType) {
        const fileExtension = document.originalName.toLowerCase().split('.').pop();
        contentType = this.getContentTypeFromExtension(fileExtension);
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fileSize);
      
      // Para imágenes y PDFs, permitir visualización inline
      if (contentType.startsWith('image/') || contentType === 'application/pdf') {
        res.setHeader('Content-Disposition', 'inline');
      } else {
        // Para otros tipos de archivo, forzar descarga con extensión correcta
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      }

      // Headers para cache y CORS
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      console.log(`🚀 Sirviendo archivo: ${document.originalName} (${contentType}) - Tamaño: ${fileSize} bytes`);

      // Crear stream de lectura del archivo
      const fileStream = fs.createReadStream(localPath);

      // Enviar el archivo como stream
      fileStream.pipe(res);

      // Manejar errores del stream
      fileStream.on('error', (error) => {
        console.error(`❌ Error en el stream del archivo:`, error);
        if (!res.headersSent) {
          res.status(500).json({
            message: 'Error al leer el archivo',
            error: 'Stream Error',
            statusCode: 500,
            errorDetails: error instanceof Error ? error.message : String(error)
          });
        }
      });

      fileStream.on('end', () => {
        console.log(`✅ Archivo servido exitosamente: ${document.originalName}`);
        // Asegurar que la respuesta se complete
        if (!res.headersSent) {
          res.end();
        }
      });

      // Manejar cierre de la conexión
      req.on('close', () => {
        console.log(`🔌 Conexión cerrada por el cliente para documento: ${document.originalName}`);
        if (fileStream && !fileStream.destroyed) {
          fileStream.destroy();
        }
      });

    } catch (error) {
      console.error(`❌ Error en serveFile:`, error);
      
      if (!res.headersSent) {
        if (error instanceof NotFoundException) {
          return res.status(404).json({
            message: error.message,
            error: 'Not Found',
            statusCode: 404,
            documentId: id
          });
        } else if (error instanceof ForbiddenException) {
          return res.status(403).json({
            message: error.message,
            error: 'Forbidden',
            statusCode: 403,
            documentId: id
          });
        } else {
          return res.status(500).json({
            message: 'Error interno del servidor',
            error: 'Internal Server Error',
            statusCode: 500,
            documentId: id,
            errorDetails: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }

  // Método auxiliar para determinar Content-Type basado en extensión
  private getContentTypeFromExtension(extension?: string): string {
    if (!extension) return 'application/octet-stream';
    
    switch (extension.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'ppt':
        return 'application/vnd.ms-powerpoint';
      case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
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

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Eliminar documento',
    description: 'Elimina un documento específico. Solo ADMIN y ABOGADO pueden eliminar documentos.'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documento eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        documentId: { type: 'string' },
        deletedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async remove(
    @Param('id') id: string,
    @Request() req,
  ) {
    try {
      console.log(`🗑️  Intentando eliminar documento ID: ${id}`);
      console.log(`👤 Usuario: ${req.user.id}, Rol: ${req.user.role}`);

      // Buscar el documento por ID
      const document = await this.documentsService.findOne(
        id,
        req.user.id,
        req.user.role,
      );

      if (!document) {
        throw new NotFoundException(`Documento no encontrado: ${id}`);
      }

      console.log(`📄 Documento encontrado: ${document.filename}`);

      // Eliminar archivo local si existe
      if (document.fileUrl) {
        const localPath = path.join(STORAGE_CONFIG.uploadPath, document.fileUrl.replace('/uploads/', ''));
        
        if (fs.existsSync(localPath)) {
          try {
            fs.unlinkSync(localPath);
            console.log(`✅ Archivo local eliminado: ${localPath}`);
          } catch (fileError) {
            console.warn(`⚠️  No se pudo eliminar archivo local: ${fileError.message}`);
          }
        } else {
          console.log(`ℹ️  Archivo local no encontrado: ${localPath}`);
        }
      }

      // Eliminar registro de la base de datos
      const deletedDocument = await this.documentsService.remove(id, req.user.id, req.user.role);
      
      console.log(`✅ Documento eliminado de BD: ${id}`);

      return {
        message: 'Documento eliminado exitosamente',
        documentId: id,
        deletedAt: new Date().toISOString(),
        filename: document.filename
      };

    } catch (error) {
      console.error(`❌ Error en remove:`, error);
      throw error;
    }
  }

  @Get('health/storage')
  @ApiOperation({ 
    summary: 'Estado del almacenamiento',
    description: 'Verifica el estado del sistema de almacenamiento local'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del almacenamiento',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        storageType: { type: 'string' },
        uploadPath: { type: 'string' },
        maxFileSize: { type: 'number' },
        allowedMimeTypes: { type: 'array', items: { type: 'string' } },
        directories: { type: 'object' }
      }
    }
  })
  async getStorageHealth() {
    try {
      const uploadPath = STORAGE_CONFIG.uploadPath;
      const uploadPathExists = fs.existsSync(uploadPath);
      
      return {
        status: uploadPathExists ? 'healthy' : 'unhealthy',
        storageType: STORAGE_CONFIG.type,
        uploadPath: uploadPath,
        uploadPathExists: uploadPathExists,
        maxFileSize: STORAGE_CONFIG.maxFileSize,
        allowedMimeTypes: STORAGE_CONFIG.allowedMimeTypes,
        directories: STORAGE_CONFIG.directories,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }
} 