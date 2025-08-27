import { Controller, Get, Post, Body, UseInterceptors, UploadedFiles, UseGuards, Request } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('options')
  @ApiOperation({ summary: 'OPTIONS para CORS preflight' })
  async contactOptions() {
    return { message: 'OPTIONS handled' };
  }

  @Post()
  @ApiOperation({ summary: 'Enviar mensaje de contacto general' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async sendContactMessage(@Body() contactData: any) {
    return this.contactService.sendContactMessage(contactData);
  }

  @Get('test')
  @ApiOperation({ summary: 'Probar endpoint de contacto' })
  @ApiResponse({ status: 200, description: 'Endpoint funcionando correctamente' })
  async testContact() {
    return {
      message: 'Endpoint de contacto funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD)
    };
  }

  @Get('test-email')
  @ApiOperation({ summary: 'Probar conexión SMTP' })
  @ApiResponse({ status: 200, description: 'Prueba de conexión SMTP' })
  async testEmailConnection() {
    try {
      // Verificar conexión SMTP
      const connectionOk = await this.contactService.testEmailConnection();
      
      return {
        message: 'Prueba de conexión SMTP completada',
        timestamp: new Date().toISOString(),
        smtpConnection: connectionOk ? '✅ CONECTADO' : '❌ FALLO',
        emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
        variables: {
          hasEmailUser: !!process.env.EMAIL_USER,
          hasEmailPassword: !!process.env.EMAIL_PASSWORD,
          hasAdminEmail: !!process.env.ADMIN_EMAIL
        }
      };
    } catch (error) {
      return {
        message: 'Error en prueba de conexión SMTP',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('lawyer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10)) // Máximo 10 archivos
  @ApiOperation({ summary: 'Enviar mensaje al abogado con archivos adjuntos' })
  @ApiResponse({ status: 201, description: 'Mensaje enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiConsumes('multipart/form-data')
  async sendLawyerMessage(
    @Body() messageData: any,
    @UploadedFiles() files: MulterFile[],
    @Request() req: any
  ) {
    return this.contactService.sendLawyerMessage(messageData, files, req.user);
  }
} 