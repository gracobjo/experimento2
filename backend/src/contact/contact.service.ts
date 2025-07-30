import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async submitContactForm(createContactDto: CreateContactDto) {
    try {
      // Guardar en la base de datos
      const contact = await this.prisma.contact.create({
        data: {
          nombre: createContactDto.nombre,
          email: createContactDto.email,
          telefono: createContactDto.telefono,
          asunto: createContactDto.asunto,
          mensaje: createContactDto.mensaje,
          ip: createContactDto.ip || 'unknown',
          userAgent: createContactDto.userAgent || 'unknown'
        }
      });

      // Enviar email de notificación al administrador (no bloquear si falla)
      try {
        await this.emailService.sendContactNotification({
          nombre: createContactDto.nombre,
          email: createContactDto.email,
          telefono: createContactDto.telefono,
          asunto: createContactDto.asunto,
          mensaje: createContactDto.mensaje
        });
      } catch (emailError) {
        console.error('Error sending contact notification email:', emailError);
        // No lanzar error si falla el email
      }

      // Enviar email de confirmación al usuario (no bloquear si falla)
      try {
        await this.emailService.sendContactConfirmation({
          nombre: createContactDto.nombre,
          email: createContactDto.email
        });
      } catch (emailError) {
        console.error('Error sending contact confirmation email:', emailError);
        // No lanzar error si falla el email
      }

      return contact;
    } catch (error) {
      console.error('Error en submitContactForm:', error);
      throw error;
    }
  }

  async getContactStats() {
    const total = await this.prisma.contact.count();
    const today = await this.prisma.contact.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    const thisWeek = await this.prisma.contact.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }
    });

    return {
      total,
      today,
      thisWeek
    };
  }

  async sendContactMessage(contactData: any) {
    try {
      // Guardar en la base de datos
      const contact = await this.prisma.contact.create({
        data: {
          nombre: contactData.nombre,
          email: contactData.email,
          telefono: contactData.telefono,
          asunto: contactData.asunto,
          mensaje: contactData.mensaje,
          ip: contactData.ip || 'unknown',
          userAgent: contactData.userAgent || 'unknown'
        }
      });

      // Enviar email de notificación al administrador
      try {
        await this.emailService.sendContactNotification({
          nombre: contactData.nombre,
          email: contactData.email,
          telefono: contactData.telefono,
          asunto: contactData.asunto,
          mensaje: contactData.mensaje
        });
      } catch (emailError) {
        console.error('Error sending contact notification email:', emailError);
      }

      // Enviar email de confirmación al usuario
      try {
        await this.emailService.sendContactConfirmation({
          nombre: contactData.nombre,
          email: contactData.email
        });
      } catch (emailError) {
        console.error('Error sending contact confirmation email:', emailError);
      }

      return {
        success: true,
        message: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.',
        data: contact
      };
    } catch (error) {
      console.error('Error en sendContactMessage:', error);
      throw error;
    }
  }

  async sendLawyerMessage(messageData: any, files: any[], user: any) {
    try {
      // Crear directorio para archivos si no existe
      const uploadsDir = path.join(process.cwd(), 'uploads', 'lawyer-messages');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Guardar archivos
      const savedFiles = [];
      for (const file of files) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        savedFiles.push({
          originalName: file.originalname,
          fileName: fileName,
          filePath: filePath,
          size: file.size,
          mimeType: file.mimetype
        });
      }

      // Obtener información del cliente
      const client = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: { client: true }
      });

      // Obtener información del abogado
      const lawyer = await this.prisma.user.findUnique({
        where: { id: messageData.lawyerId },
        include: { lawyer: true }
      });

      // Guardar mensaje en la base de datos
      const message = await this.prisma.contact.create({
        data: {
          nombre: client?.name || 'Cliente',
          email: client?.email || '',
          telefono: '',
          asunto: `Mensaje al Abogado - ${messageData.asunto}`,
          mensaje: `Expediente: ${messageData.expedienteTitle} (${messageData.expedienteId})\n\nMensaje: ${messageData.mensaje}\n\nArchivos adjuntos: ${savedFiles.map(f => f.originalName).join(', ')}`,
          ip: 'unknown',
          userAgent: 'unknown'
        }
      });

      // Enviar email al abogado (simulado por ahora)
      try {
        console.log('Enviando email al abogado:', {
          lawyerEmail: lawyer?.email || '',
          lawyerName: lawyer?.name || 'Abogado',
          clientName: client?.name || 'Cliente',
          clientEmail: client?.email || '',
          expedienteTitle: messageData.expedienteTitle,
          expedienteId: messageData.expedienteId,
          asunto: messageData.asunto,
          mensaje: messageData.mensaje,
          files: savedFiles
        });
      } catch (emailError) {
        console.error('Error sending lawyer message email:', emailError);
      }

      // Enviar email de confirmación al cliente (simulado por ahora)
      try {
        console.log('Enviando confirmación al cliente:', {
          clientName: client?.name || 'Cliente',
          clientEmail: client?.email || '',
          lawyerName: lawyer?.name || 'Abogado',
          expedienteTitle: messageData.expedienteTitle,
          asunto: messageData.asunto
        });
      } catch (emailError) {
        console.error('Error sending lawyer message confirmation email:', emailError);
      }

      return {
        success: true,
        message: 'Mensaje enviado correctamente. Su abogado se pondrá en contacto con usted pronto.',
        data: {
          message,
          files: savedFiles
        }
      };
    } catch (error) {
      console.error('Error en sendLawyerMessage:', error);
      throw error;
    }
  }
} 