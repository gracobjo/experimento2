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
  NotFoundException,
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
        expedienteId: {
          type: 'string',
          description: 'ID del expediente asociado (opcional)'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Documento subido exitosamente'
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o datos incorrectos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 413, description: 'Archivo demasiado grande' })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: UploadDocumentDto,
    @Request() req
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No se ha proporcionado ningún archivo');
      }

      // Validar tamaño del archivo (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        throw new BadRequestException('El archivo es demasiado grande. Máximo 5MB');
      }

      // Crear directorio de uploads si no existe
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Crear directorio del expediente si se especifica
      const expedienteDir = uploadData.expedienteId ? path.join(uploadsDir, uploadData.expedienteId) : uploadsDir;
      if (!fs.existsSync(expedienteDir)) {
        fs.mkdirSync(expedienteDir, { recursive: true });
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${timestamp}_${file.originalname}`;
      const filePath = path.join(expedienteDir, uniqueFilename);

      // Guardar archivo en el sistema de archivos
      fs.writeFileSync(filePath, file.buffer);

      // Crear documento en la base de datos
      const document = await this.documentsService.create({
        filename: uniqueFilename,
        fileSize: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname,
        uploadedBy: req.user.id,
        expedienteId: uploadData.expedienteId || 'general',
        description: uploadData.description,
        title: uploadData.title,
        fileUrl: `/uploads/${uploadData.expedienteId || 'general'}/${uniqueFilename}`
      });

      return {
        message: 'Documento subido exitosamente',
        document: document
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al subir documento: ${errorMessage}`);
    }
  }

  @Get('file/:id')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener documento',
    description: 'Obtiene un documento por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiResponse({ status: 200, description: 'Documento obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async getDocument(@Param('id') id: string, @Request() req, @Res() res: Response) {
    try {
      const document = await this.documentsService.findOne(id, req.user.id, req.user.role);
      
      if (!document) {
        throw new NotFoundException('Documento no encontrado');
      }

      // Construir ruta completa del archivo
      const filePath = path.join(process.cwd(), document.fileUrl);
      
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Archivo no encontrado en el servidor');
      }

      // Leer archivo
      const fileBuffer = fs.readFileSync(filePath);
      
      // Configurar headers de respuesta
      res.set({
        'Content-Type': document.mimeType,
        'Content-Length': document.fileSize,
        'Content-Disposition': `inline; filename="${document.originalName}"`
      });

      // Enviar archivo
      res.send(fileBuffer);

    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ message: `Error interno del servidor: ${errorMessage}` });
      }
    }
  }

  @Get()
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Listar documentos',
    description: 'Obtiene la lista de documentos del usuario'
  })
  @ApiResponse({ status: 200, description: 'Lista de documentos obtenida exitosamente' })
  async getDocuments(@Request() req) {
    return this.documentsService.findMyDocuments(req.user.id, req.user.role);
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de documentos',
    description: 'Devuelve estadísticas de documentos según el rol del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de documentos',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byType: { 
          type: 'array',
          items: {
            type: 'object',
            properties: {
              mimeType: { type: 'string' },
              _count: {
                type: 'object',
                properties: {
                  mimeType: { type: 'number' }
                }
              }
            }
          }
        },
        userRole: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getStats(@Request() req) {
    return this.documentsService.getDocumentsStats(req.user.id, req.user.role);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener documento por ID',
    description: 'Obtiene un documento específico por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiResponse({ status: 200, description: 'Documento obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async getDocumentById(@Param('id') id: string, @Request() req) {
    return this.documentsService.findOne(id, req.user.id, req.user.role);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Eliminar documento',
    description: 'Elimina un documento por su ID'
  })
  @ApiParam({ name: 'id', description: 'ID del documento' })
  @ApiResponse({ status: 200, description: 'Documento eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  async deleteDocument(@Param('id') id: string, @Request() req) {
    try {
      const document = await this.documentsService.findOne(id, req.user.id, req.user.role);
      
      if (!document) {
        throw new NotFoundException('Documento no encontrado');
      }

      // Eliminar archivo del sistema de archivos
      const filePath = path.join(process.cwd(), document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Eliminar documento de la base de datos
      await this.documentsService.remove(id, req.user.id);

      return { message: 'Documento eliminado exitosamente' };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al eliminar documento: ${errorMessage}`);
    }
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'documents-controller'
    };
  }
} 