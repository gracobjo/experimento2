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
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { PostgresStorageService } from '../storage/postgres-storage.service';
import { DocumentsService } from './documents.service';
import { FileStorageService } from './file-storage.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { STORAGE_CONFIG } from '../config/storage.config';

@ApiTags('documents')
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(
    private readonly documentsService: DocumentsService,
    private readonly postgresStorageService: PostgresStorageService,
    private readonly fileStorageService: FileStorageService
  ) {}

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
    return this.postgresStorageService.storeFile(
      file.buffer,
      file.filename,
      file.originalname,
      file.mimetype,
      uploadDocumentDto.expedienteId,
      req.user.id,
      uploadDocumentDto.description,
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

  @Get('debug/document/:id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Diagnóstico de documento específico',
    description: 'Endpoint para diagnosticar problemas con un documento específico por ID (solo ADMIN y ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Información completa del documento',
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        exists: { type: 'boolean' },
        documentInfo: { type: 'object' },
        cloudinaryStatus: { type: 'string' },
        cloudinaryError: { type: 'string' },
        endpointTest: { type: 'object' }
      }
    }
  })
  async debugDocument(
    @Param('id') id: string,
    @Request() req,
  ) {
    try {
      console.log(`🔍 Diagnóstico completo para documento ID: ${id}`);
      
      const result: any = {
        documentId: id,
        exists: false,
        documentInfo: null,
        cloudinaryStatus: 'unknown',
        cloudinaryError: null,
        endpointTest: {}
      };

      // 1. Verificar si existe en la base de datos
      try {
        const document = await this.documentsService.findOne(
          id,
          req.user.id,
          req.user.role,
        );

        if (document) {
          result.exists = true;
          result.documentInfo = {
            id: document.id,
            filename: document.filename,
            originalName: document.originalName,
            mimeType: document.mimeType,
            fileUrl: document.fileUrl,
            metadata: document.metadata,
            expedienteId: document.expedienteId,
            uploadedBy: document.uploadedBy
          };

          console.log(`📄 Documento encontrado en BD: ${document.filename}`);

          // 2. Verificar estado del archivo (local o externo)
          try {
            const fileInfo = await this.documentsService.getFileInfo(document);
            result.fileStatus = fileInfo.isExternal ? 'external' : 'local';
            result.endpointTest = {
              isExternal: fileInfo.isExternal,
              contentType: fileInfo.contentType,
              contentLength: fileInfo.contentLength
            };
            console.log(`✅ Archivo accesible: ${fileInfo.isExternal ? 'EXTERNO' : 'LOCAL'}`);
          } catch (fileErr) {
            result.fileStatus = 'error';
            result.fileError = fileErr instanceof Error ? fileErr.message : String(fileErr);
            console.error(`❌ Error accediendo al archivo:`, fileErr);
          }

        } else {
          console.log(`❌ Documento no encontrado en BD: ${id}`);
        }

      } catch (dbError) {
        console.error(`❌ Error consultando BD:`, dbError);
        result.cloudinaryError = `Error BD: ${dbError instanceof Error ? dbError.message : String(dbError)}`;
      }

      // 3. Probar endpoint file/:id
      try {
        const testUrl = `/api/documents/file/${id}`;
        console.log(`🧪 Probando endpoint: ${testUrl}`);
        result.endpointTest.fileEndpoint = testUrl;
      } catch (endpointError) {
        console.error(`❌ Error probando endpoint:`, endpointError);
      }

      console.log(`🔍 Diagnóstico completado para documento ${id}`);
      return result;

    } catch (error) {
      console.error(`❌ Error en debugDocument:`, error);
      return {
        documentId: id,
        error: error instanceof Error ? error.message : String(error),
        status: 'error'
      };
    }
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
        const fileInfo = await this.documentsService.getFileInfo(document);
        cloudinaryStatus = fileInfo.isExternal ? 'external' : 'local';
        metadata = {
          isExternal: fileInfo.isExternal,
          contentType: fileInfo.contentType,
          contentLength: fileInfo.contentLength
        };
      } catch (fileErr) {
        cloudinaryStatus = 'error';
        cloudinaryError = fileErr instanceof Error ? fileErr.message : String(fileErr);
        console.error(`❌ Error accediendo al archivo:`, fileErr);
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

      // Obtener información del archivo (local o externo)
      const fileInfo = await this.documentsService.getFileInfo(document);
      
      console.log(`📂 Tipo de archivo: ${fileInfo.isExternal ? 'EXTERNO' : 'LOCAL'}`);
      
      let contentType = fileInfo.contentType;
      let contentLength = fileInfo.contentLength;

      // Configurar headers de respuesta
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', contentLength);
      
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

      if (fileInfo.isExternal) {
        // Archivo externo - descargar y servir
        console.log(`🌐 Descargando archivo externo desde: ${fileInfo.externalUrl}`);
        
        try {
          const externalFile = await this.documentsService.downloadExternalFile(document.fileUrl);
          
          console.log(`✅ Archivo externo descargado: ${document.originalName} (${contentType}) - Tamaño: ${externalFile.contentLength} bytes`);
          
          // Enviar el archivo como buffer
          res.send(externalFile.buffer);
          
        } catch (downloadError) {
          console.error(`❌ Error descargando archivo externo:`, downloadError);
          return res.status(500).json({
            message: 'Error al descargar archivo externo',
            error: 'Download Error',
            statusCode: 500,
            documentId: id,
            errorDetails: downloadError instanceof Error ? downloadError.message : String(downloadError)
          });
        }
        
      } else {
        // Archivo local - servir desde el sistema de archivos
        const localPath = path.join(STORAGE_CONFIG.uploadPath, fileInfo.localPath);
        
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

        console.log(`🚀 Sirviendo archivo local: ${document.originalName} (${contentType}) - Tamaño: ${contentLength} bytes`);

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
          console.log(`✅ Archivo local servido exitosamente: ${document.originalName}`);
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
      }

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

      // Obtener información del archivo (local o externo)
      const fileInfo = await this.documentsService.getFileInfo(document);
      
      console.log(`📂 Tipo de archivo: ${fileInfo.isExternal ? 'EXTERNO' : 'LOCAL'}`);
      
      let contentType = fileInfo.contentType;
      let contentLength = fileInfo.contentLength;

      // Configurar headers de respuesta
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', contentLength);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${document.originalName}"`,
      );

      console.log(`🚀 Iniciando descarga del archivo: ${document.originalName} (${contentType})`);

      if (fileInfo.isExternal) {
        // Archivo externo - descargar y servir
        try {
          const externalFile = await this.documentsService.downloadExternalFile(document.fileUrl);
          
          console.log(`✅ Archivo externo descargado: ${document.originalName} (${contentType}) - Tamaño: ${externalFile.contentLength} bytes`);
          
          // Enviar el archivo como buffer
          res.send(externalFile.buffer);
          
        } catch (downloadError) {
          console.error(`❌ Error descargando archivo externo:`, downloadError);
          return res.status(500).json({
            message: 'Error al descargar archivo externo',
            error: 'Download Error',
            statusCode: 500,
            documentId: id,
            errorDetails: downloadError instanceof Error ? downloadError.message : String(downloadError)
          });
        }
      } else {
        // Archivo local - servir desde el sistema de archivos
        const localPath = path.join(STORAGE_CONFIG.uploadPath, fileInfo.localPath);
        
        if (!fs.existsSync(localPath)) {
          return res.status(404).json({
            message: 'Archivo no encontrado en el servidor',
            error: 'File Not Found',
            statusCode: 404,
            documentId: id,
            localPath: localPath
          });
        }

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
          console.log(`✅ Descarga completada: ${document.originalName}`);
        });
      }

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

  @Get('debug/file-access/:id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Diagnóstico de acceso a archivos',
    description: 'Endpoint para diagnosticar problemas de acceso a archivos (solo ADMIN y ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID del documento', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Diagnóstico del archivo',
    schema: {
      type: 'object',
      properties: {
        documentId: { type: 'string' },
        filename: { type: 'string' },
        originalName: { type: 'string' },
        fileUrl: { type: 'string' },
        mimeType: { type: 'string' },
        fileSize: { type: 'number' },
        cloudinaryStatus: { type: 'string' },
        cloudinaryError: { type: 'string' },
        accessTest: { type: 'object' },
        recommendations: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @Post('admin/migrate-documents')
  @Roles(Role.ADMIN)
  @ApiOperation({ 
    summary: 'Migrar documentos a almacenamiento local',
    description: 'Migra documentos de URLs ficticias a archivos locales en el servidor'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Migración completada exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        totalDocuments: { type: 'number' },
        results: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              newFileUrl: { type: 'string' },
              fileSize: { type: 'number' },
              error: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async migrateDocuments() {
    try {
      this.logger.log('🚀 Iniciando migración de documentos a almacenamiento local...');
      
      // 1. Crear archivos de ejemplo
      const sampleDocuments = [
        {
          id: 'doc-001',
          expedienteId: 'exp-001',
          filename: 'contrato_compraventa.pdf',
          content: 'Contrato de compraventa de inmueble - Documento legal válido'
        },
        {
          id: 'doc-002',
          expedienteId: 'exp-002',
          filename: 'demanda_laboral.pdf',
          content: 'Demanda laboral por despido injustificado - Caso laboral'
        },
        {
          id: 'doc-c1-001',
          expedienteId: 'exp-c1-001',
          filename: 'documentoA.pdf',
          content: 'Documento legal tipo A - Expediente C1-001'
        }
      ];

      const results = [];
      
      for (const doc of sampleDocuments) {
        try {
          // Crear contenido del PDF (simulado como HTML)
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>${doc.filename}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .content { margin-top: 30px; line-height: 1.6; }
                .footer { margin-top: 50px; text-align: center; color: #666; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${doc.filename.replace('.pdf', '')}</h1>
                <p>ID: ${doc.id} | Expediente: ${doc.expedienteId}</p>
              </div>
              <div>content">
                <h2>Contenido del Documento</h2>
                <p>${doc.content}</p>
                <p>Este es un documento de ejemplo generado automáticamente para la migración a almacenamiento local.</p>
                <p>Fecha de generación: ${new Date().toLocaleString('es-ES')}</p>
              </div>
              <div class="footer">
                <p>Sistema de Gestión Legal - Documento Migrado</p>
              </div>
            </body>
            </html>
          `;

          const buffer = Buffer.from(htmlContent, 'utf8');
          
          // Almacenar archivo localmente
          const fileInfo = await this.fileStorageService.storeFile(
            buffer,
            doc.filename,
            doc.expedienteId
          );

          // Actualizar la base de datos usando Prisma directamente
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              fileUrl: fileInfo.fileUrl,
              filename: fileInfo.filename,
              fileSize: fileInfo.fileSize,
              mimeType: fileInfo.mimeType,
              metadata: {
                migrated: true,
                migratedAt: new Date().toISOString(),
                originalUrl: `https://example.com/documents/${doc.filename}`
              }
            }
          });
          
          await prisma.$disconnect();

          results.push({
            id: doc.id,
            status: 'success',
            newFileUrl: fileInfo.fileUrl,
            fileSize: fileInfo.fileSize
          });

          this.logger.log(`✅ Documento ${doc.id} migrado exitosamente`);
        } catch (error) {
          results.push({
            id: doc.id,
            status: 'error',
            error: error instanceof Error ? error.message : String(error)
          });
          this.logger.error(`❌ Error migrando documento ${doc.id}:`, error);
        }
      }

      return {
        message: 'Migración de documentos completada',
        timestamp: new Date().toISOString(),
        totalDocuments: sampleDocuments.length,
        results: results
      };

    } catch (error) {
      this.logger.error('❌ Error en migración de documentos:', error);
      throw new Error(`Error en migración: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async debugFileAccess(
    @Param('id') id: string,
    @Request() req,
  ) {
    try {
      console.log(`🔍 Diagnóstico de acceso a archivo ID: ${id}`);
      console.log(`👤 Usuario: ${req.user.id}, Rol: ${req.user.role}`);

      // Buscar el documento
      const document = await this.documentsService.findOne(
        id,
        req.user.id,
        req.user.role,
      );

      if (!document) {
        throw new NotFoundException('Documento no encontrado');
      }

      console.log(`📄 Documento encontrado: ${document.filename}`);

      // Información básica del documento
      const result = {
        documentId: document.id,
        filename: document.filename,
        originalName: document.originalName,
        fileUrl: document.fileUrl,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        cloudinaryStatus: 'unknown',
        cloudinaryError: null,
        accessTest: {} as any,
        recommendations: [] as string[]
      };

      // Verificar si es una URL de Cloudinary
      if (document.fileUrl && document.fileUrl.includes('cloudinary.com')) {
        result.cloudinaryStatus = 'cloudinary_url';
        result.recommendations.push('Archivo detectado en Cloudinary');
        
        // Verificar si la URL es accesible
        try {
          const urlResponse = await fetch(document.fileUrl, { method: 'HEAD' });
          result.accessTest.urlAccess = {
            status: urlResponse.status,
            statusText: urlResponse.statusText,
            accessible: urlResponse.ok
          };
          
          if (urlResponse.ok) {
            result.recommendations.push('URL de Cloudinary accesible directamente');
          } else {
            result.recommendations.push('URL de Cloudinary no accesible - verificar permisos');
          }
        } catch (urlError) {
          result.accessTest.urlAccess = {
            error: urlError instanceof Error ? urlError.message : String(urlError),
            accessible: false
          };
          result.recommendations.push('Error al verificar URL de Cloudinary');
        }
      } else {
        result.cloudinaryStatus = 'local_or_other';
        result.recommendations.push('Archivo no detectado en Cloudinary');
      }

      // Intentar acceder al archivo a través del servicio
      try {
        const fileInfo = await this.documentsService.getFileInfo(document);
        result.cloudinaryStatus = fileInfo.isExternal ? 'external' : 'local';
        result.accessTest.serviceAccess = {
          status: 'success',
          isExternal: fileInfo.isExternal,
          contentType: fileInfo.contentType,
          contentLength: fileInfo.contentLength
        };
        result.recommendations.push(`Archivo accesible a través del servicio (${fileInfo.isExternal ? 'EXTERNO' : 'LOCAL'})`);
      } catch (serviceError) {
        result.cloudinaryStatus = 'error';
        result.cloudinaryError = serviceError instanceof Error ? serviceError.message : String(serviceError);
        result.accessTest.serviceAccess = {
          status: 'error',
          error: result.cloudinaryError
        };
        result.recommendations.push('Error al acceder al archivo a través del servicio');
      }

      // Recomendaciones adicionales
      if (result.mimeType === 'application/pdf') {
        result.recommendations.push('Archivo PDF detectado - verificar visor del navegador');
      }
      
      if (result.fileSize > 5 * 1024 * 1024) {
        result.recommendations.push('Archivo grande (>5MB) - puede causar problemas de timeout');
      }

      console.log(`✅ Diagnóstico completado para documento ${id}`);
      return result;

    } catch (error) {
      console.error(`❌ Error en debugFileAccess:`, error);
      
      if (error instanceof NotFoundException) {
        throw error;
      } else if (error instanceof ForbiddenException) {
        throw error;
      } else {
        throw new Error(`Error interno: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
} 