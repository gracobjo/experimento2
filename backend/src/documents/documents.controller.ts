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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { CloudinaryDocumentsService } from './cloudinary-documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  constructor(private readonly documentsService: CloudinaryDocumentsService) {}

  @Post('upload')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Subir documento',
    description: 'Sube un documento al sistema (PDF, TXT, CSV, DOC, DOCX, JPG, JPEG, PNG, GIF, WEBP - máximo 5MB)'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (máximo 5MB)'
        },
        title: {
          type: 'string',
          description: 'Título del documento'
        },
        description: {
          type: 'string',
          description: 'Descripción del documento'
        },
        caseId: {
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
        caseId: { type: 'string' },
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
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(pdf|txt|csv|doc|docx|jpg|jpeg|png|gif|webp)' }),
        ],
      }),
    )
    file: any,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @Request() req,
  ) {
    return this.documentsService.uploadDocument(
      file,
      uploadDocumentDto,
      req.user.id,
      req.user.role,
    );
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
          title: { type: 'string' },
          description: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'number' },
          uploadedBy: { type: 'string' },
          caseId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
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

  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Request() req) {
    return this.documentsService.findAll(req.user.id, req.user.role);
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
          title: { type: 'string' },
          description: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'number' },
          uploadedBy: { type: 'string' },
          caseId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
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
        title: { type: 'string' },
        description: { type: 'string' },
        filename: { type: 'string' },
        originalName: { type: 'string' },
        mimeType: { type: 'string' },
        size: { type: 'number' },
        uploadedBy: { type: 'string' },
        caseId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(id, req.user.id, req.user.role);
  }

  @Get('debug/cloudinary-status/:id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Diagnóstico de Cloudinary',
    description: 'Endpoint para diagnosticar problemas con archivos en Cloudinary (solo ADMIN y ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del archivo en Cloudinary',
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        filename: { type: 'string' },
        cloudinaryStatus: { type: 'string' },
        cloudinaryError: { type: 'string' },
        metadata: { type: 'object' }
      }
    }
  })
  async debugCloudinaryStatus(
    @Param('id') id: string,
    @Request() req,
  ) {
    try {
      console.log(`🔍 Diagnóstico Cloudinary para documento ID: ${id}`);
      
      // Buscar el documento
      const document = await this.documentsService.findOne(
        id,
        req.user.id,
        req.user.role,
      );

      if (!document) {
        return {
          documentId: id,
          error: 'Documento no encontrado en la base de datos',
          status: 'not_found'
        };
      }

      console.log(`📄 Documento encontrado: ${document.filename}`);

      // Intentar acceder a Cloudinary
      let cloudinaryStatus = 'unknown';
      let cloudinaryError = null;
      let metadata = null;

      try {
        const downloadResult = await this.documentsService.getFileStream(document.filename);
        cloudinaryStatus = 'available';
        metadata = {
          hasStream: !!downloadResult.stream,
          hasMetadata: !!downloadResult.metadata,
          streamType: typeof downloadResult.stream
        };
      } catch (cloudinaryErr) {
        cloudinaryStatus = 'error';
        cloudinaryError = cloudinaryErr instanceof Error ? cloudinaryErr.message : String(cloudinaryErr);
        console.error(`❌ Error de Cloudinary:`, cloudinaryErr);
      }

      return {
        documentId: id,
        filename: document.filename,
        originalName: document.originalName,
        cloudinaryStatus,
        cloudinaryError,
        metadata,
        documentMetadata: document.metadata,
        fileUrl: document.fileUrl
      };

    } catch (error) {
      console.error(`❌ Error en debugCloudinaryStatus:`, error);
      return {
        documentId: id,
        error: error instanceof Error ? error.message : String(error),
        status: 'error'
      };
    }
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
    summary: 'Servir archivo estático',
    description: 'Sirve un archivo estático desde Cloudinary. Los clientes solo pueden acceder a archivos de sus expedientes.'
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

      // Obtener el stream del archivo usando el servicio de Cloudinary
      let fileStream;
      let fileMetadata;
      
      try {
        const downloadResult = await this.documentsService.getFileStream(document.filename);
        fileStream = downloadResult.stream;
        fileMetadata = downloadResult.metadata;
        console.log(`✅ Stream del archivo creado exitosamente desde Cloudinary`);
      } catch (streamError) {
        console.error(`❌ Error al crear stream del archivo:`, streamError);
        return res.status(404).json({
          message: 'Archivo no encontrado en el almacenamiento',
          error: 'File Not Found',
          statusCode: 404,
          documentId: id,
          filename: document.filename,
          errorDetails: streamError instanceof Error ? streamError.message : String(streamError)
        });
      }

      // Configurar headers de respuesta para visualización (no descarga)
      const contentType = fileMetadata?.contentType || document.mimeType || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      
      // Para imágenes y PDFs, permitir visualización inline
      if (contentType.startsWith('image/') || contentType === 'application/pdf') {
        res.setHeader('Content-Disposition', 'inline');
      } else {
        // Para otros tipos de archivo, forzar descarga
        res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      }

      // Agregar headers adicionales si están disponibles
      if (fileMetadata?.contentLength) {
        res.setHeader('Content-Length', fileMetadata.contentLength);
      }
      if (fileMetadata?.lastModified) {
        res.setHeader('Last-Modified', fileMetadata.lastModified.toUTCString());
      }

      // Headers para cache y CORS
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      console.log(`🚀 Sirviendo archivo: ${document.originalName} (${contentType})`);

      // Enviar el archivo
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
            message: 'Error interno del servidor al servir el archivo',
            error: 'Internal Server Error',
            statusCode: 500,
            documentId: id,
            errorDetails: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }

  @Get(':id/download')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Descargar documento',
    description: 'Descarga un documento específico. Los clientes solo pueden descargar documentos de sus expedientes.'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo descargado',
    schema: {
      type: 'string',
      format: 'binary'
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async downloadDocument(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    try {
      console.log(`📥 Intentando descargar documento ID: ${id}`);
      console.log(`👤 Usuario: ${req.user.id}, Rol: ${req.user.role}`);

      // Buscar el documento
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

      // Obtener el stream del archivo usando el servicio de Cloudinary
      let fileStream;
      let fileMetadata;
      
      try {
        const downloadResult = await this.documentsService.getFileStream(document.filename);
        fileStream = downloadResult.stream;
        fileMetadata = downloadResult.metadata;
        console.log(`✅ Stream del archivo creado exitosamente desde Cloudinary`);
      } catch (streamError) {
        console.error(`❌ Error al crear stream del archivo:`, streamError);
        return res.status(404).json({
          message: 'Archivo no encontrado en el almacenamiento',
          error: 'File Not Found',
          statusCode: 404,
          documentId: id,
          filename: document.filename,
          errorDetails: streamError instanceof Error ? streamError.message : String(streamError)
        });
      }

      // Configurar headers de respuesta
      const contentType = fileMetadata?.contentType || document.mimeType || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${document.originalName}"`,
      );

      // Agregar headers adicionales si están disponibles
      if (fileMetadata?.contentLength) {
        res.setHeader('Content-Length', fileMetadata.contentLength);
      }
      if (fileMetadata?.lastModified) {
        res.setHeader('Last-Modified', fileMetadata.lastModified.toUTCString());
      }

      console.log(`🚀 Iniciando descarga del archivo: ${document.originalName} (${contentType})`);

      // Enviar el archivo
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
        console.log(`✅ Descarga completada: ${document.originalName}`);
      });

    } catch (error) {
      console.error(`❌ Error en downloadDocument:`, error);
      
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
            message: 'Error interno del servidor al descargar el documento',
            error: 'Internal Server Error',
            statusCode: 500,
            documentId: id,
            errorDetails: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }

  @Get('test-endpoint')
  @ApiOperation({ 
    summary: 'Endpoint de prueba',
    description: 'Endpoint simple para verificar que el controlador esté funcionando'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Endpoint funcionando',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        controller: { type: 'string' }
      }
    }
  })
  async testEndpoint() {
    return {
      message: 'Documents controller funcionando correctamente',
      timestamp: new Date().toISOString(),
      controller: 'DocumentsController'
    };
  }



  @Get('debug/upload-status')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Estado del directorio de uploads',
    description: 'Endpoint de diagnóstico para verificar el estado del directorio de uploads (solo ADMIN)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del directorio de uploads',
    schema: {
      type: 'object',
      properties: {
        uploadDir: { type: 'string' },
        exists: { type: 'boolean' },
        files: { type: 'array', items: { type: 'string' } },
        totalFiles: { type: 'number' },
        totalSize: { type: 'number' }
      }
    }
  })
  async getUploadStatus() {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      const exists = fs.existsSync(uploadDir);
      
      let files = [];
      let totalSize = 0;
      
      if (exists) {
        try {
          files = fs.readdirSync(uploadDir);
          for (const file of files) {
            const filePath = path.join(uploadDir, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              totalSize += stats.size;
            }
          }
        } catch (error) {
          console.error('Error reading upload directory:', error);
        }
      }
      
      return {
        uploadDir,
        exists,
        files,
        totalFiles: files.length,
        totalSize,
        currentWorkingDir: process.cwd(),
        nodeEnv: process.env.NODE_ENV
      };
    } catch (error) {
      console.error('Error getting upload status:', error);
      return {
        error: error instanceof Error ? error.message : String(error),
        uploadDir: path.join(process.cwd(), 'uploads'),
        exists: false
      };
    }
  }

  @Post('debug/ensure-upload-dir')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Crear directorio de uploads',
    description: 'Crea el directorio de uploads si no existe (solo ADMIN)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Directorio de uploads creado o verificado',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        uploadDir: { type: 'string' },
        created: { type: 'boolean' },
        exists: { type: 'boolean' }
      }
    }
  })
  async ensureUploadDirectory() {
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      const exists = fs.existsSync(uploadDir);
      
      if (!exists) {
        console.log(`📁 Creando directorio de uploads: ${uploadDir}`);
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`✅ Directorio de uploads creado exitosamente`);
        
        return {
          message: 'Directorio de uploads creado exitosamente',
          uploadDir,
          created: true,
          exists: true
        };
      } else {
        console.log(`✅ Directorio de uploads ya existe: ${uploadDir}`);
        
        return {
          message: 'Directorio de uploads ya existe',
          uploadDir,
          created: false,
          exists: true
        };
      }
    } catch (error) {
      console.error('Error creating upload directory:', error);
      return {
        message: 'Error al crear el directorio de uploads',
        error: error instanceof Error ? error.message : String(error),
        uploadDir: path.join(process.cwd(), 'uploads'),
        created: false,
        exists: false
      };
    }
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Eliminar documento',
    description: 'Elimina un documento del sistema (ADMIN, ABOGADO y CLIENTE pueden eliminar sus propios documentos)'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Documento eliminado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Documento eliminado exitosamente' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.documentsService.remove(id, req.user.id, req.user.role);
  }
} 