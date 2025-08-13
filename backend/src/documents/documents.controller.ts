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
import { DocumentsService } from './documents.service';
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
  constructor(private readonly documentsService: DocumentsService) {}

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

      // Verificar que el archivo físico existe
      const filePath = this.documentsService.getFilePath(document.filename);
      console.log(`📁 Ruta del archivo: ${filePath}`);

      // Intentar obtener el stream del archivo
      let fileStream;
      try {
        fileStream = this.documentsService.getFileStream(document.filename);
        console.log(`✅ Stream del archivo creado exitosamente`);
      } catch (streamError) {
        console.error(`❌ Error al crear stream del archivo:`, streamError);
        return res.status(404).json({
          message: 'Archivo físico no encontrado en el servidor',
          error: 'File Not Found',
          statusCode: 404,
          documentId: id,
          filename: document.filename,
          filePath: filePath
        });
      }

      // Configurar headers de respuesta
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${document.originalName}"`,
      );

      console.log(`🚀 Iniciando descarga del archivo: ${document.originalName}`);

      // Enviar el archivo
      fileStream.pipe(res);

      // Manejar errores del stream
      fileStream.on('error', (error) => {
        console.error(`❌ Error en el stream del archivo:`, error);
        if (!res.headersSent) {
          res.status(500).json({
            message: 'Error al leer el archivo',
            error: 'Stream Error',
            statusCode: 500
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
            message: 'Error interno del servidor',
            error: 'Internal Server Error',
            statusCode: 500,
            documentId: id
          });
        }
      }
    }
  }

  @Get('file/:filename')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Servir archivo estático',
    description: 'Sirve un archivo estático desde la carpeta uploads. Los clientes solo pueden acceder a archivos de sus expedientes.'
  })
  @ApiParam({ name: 'filename', description: 'Nombre del archivo', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Archivo servido correctamente',
    schema: {
      type: 'string',
      format: 'binary'
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  async serveFile(
    @Param('filename') filename: string,
    @Request() req,
    @Res() res: Response,
  ) {
    try {
      // Verificar que el archivo existe
      const filePath = this.documentsService.getFilePath(filename);
      
      // Verificar permisos del usuario para este archivo
      const hasAccess = await this.documentsService.checkFileAccess(filename, req.user.id, req.user.role);
      
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'No tienes permisos para acceder a este archivo',
          error: 'Forbidden',
          statusCode: 403
        });
      }

      // Servir el archivo
      const fileStream = this.documentsService.getFileStream(filename);
      
      // Detectar el tipo MIME basado en la extensión
      const ext = filename.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === 'pdf') contentType = 'application/pdf';
      else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
      else if (ext === 'png') contentType = 'image/png';
      else if (ext === 'gif') contentType = 'image/gif';
      else if (ext === 'webp') contentType = 'image/webp';
      else if (ext === 'txt') contentType = 'text/plain';
      else if (ext === 'csv') contentType = 'text/csv';
      else if (ext === 'doc') contentType = 'application/msword';
      else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
      
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving file:', error);
      res.status(404).json({
        message: 'Archivo no encontrado',
        error: 'Not Found',
        statusCode: 404
      });
    }
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