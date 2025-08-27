import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private useSendGrid: boolean = false;
  private fromEmail: string = 'noreply@despachoabogados.com';

    constructor() {
    // Configuración para SendGrid (recomendado para Railway)
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@despachoabogados.com';
    
    if (!sendgridApiKey) {
      console.warn('[EMAIL] ⚠️ Variable SENDGRID_API_KEY no configurada. El servicio de email no funcionará.');
      console.warn('[EMAIL] Configura SENDGRID_API_KEY en Railway para habilitar emails con SendGrid.');
      
      // Fallback a Gmail si no hay SendGrid
      const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
      const emailPassword = process.env.EMAIL_PASSWORD || process.env.SMTP_PASS;
      
      if (!emailUser || !emailPassword) {
        console.warn('[EMAIL] ⚠️ También faltan variables de Gmail. Email completamente deshabilitado.');
      } else {
        console.log('[EMAIL] 🔄 Fallback a Gmail configurado:', emailUser);
        this.setupGmailFallback(emailUser, emailPassword);
      }
    } else {
      console.log('[EMAIL] ✅ Configuración de SendGrid detectada');
      console.log('[EMAIL] 📧 Email de origen configurado:', fromEmail);
      
      // Configurar SendGrid
      sgMail.setApiKey(sendgridApiKey);
      this.useSendGrid = true;
      this.fromEmail = fromEmail;
    }
  }

  private setupGmailFallback(emailUser: string, emailPassword: string) {
    console.log('[EMAIL] 🔧 Configurando Gmail con timeouts extendidos para Railway...');
    
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
      // Configuración para Railway - aumentar timeouts
      connectionTimeout: 60000, // 60 segundos
      greetingTimeout: 30000,   // 30 segundos
      socketTimeout: 60000,     // 60 segundos
      // Configuración adicional para Gmail
      secure: false,            // Usar STARTTLS
      tls: {
        rejectUnauthorized: false // Para Railway
      }
    });
  }

  // Método para verificar la conexión SMTP
  async verifyConnection() {
    try {
      if (this.useSendGrid) {
        console.log('[EMAIL] 🔍 Verificando conexión SendGrid...');
        // Para SendGrid, verificamos que la API key esté configurada
        if (process.env.SENDGRID_API_KEY) {
          console.log('[EMAIL] ✅ API Key de SendGrid configurada correctamente');
          return true;
        } else {
          throw new Error('SENDGRID_API_KEY no configurada');
        }
      } else {
        console.log('[EMAIL] 🔍 Verificando conexión SMTP (Gmail)...');
        await this.transporter.verify();
        console.log('[EMAIL] ✅ Conexión SMTP verificada correctamente');
        return true;
      }
    } catch (error) {
      console.error('[EMAIL] ❌ Error verificando conexión:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: email,
      subject: 'Recuperación de Contraseña - Sistema Legal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Recuperación de Contraseña</h2>
          <p>Hola ${userName},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          <p>Este enlace expirará en 1 hora por seguridad.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Sistema Legal - Soporte técnico
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendContactNotification(contactData: {
    nombre: string;
    email: string;
    telefono?: string;
    asunto: string;
    mensaje: string;
  }) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@despachoabogados.com';
    
    if (this.useSendGrid) {
      // Usar SendGrid
      try {
        console.log('[EMAIL] 📧 Enviando email con SendGrid...');
        
        const msg = {
          to: adminEmail,
          from: this.fromEmail,
          subject: `Nueva Consulta: ${contactData.asunto}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">Nueva Consulta Recibida</h2>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #34495e; margin-top: 0;">Información del Cliente</h3>
                <p><strong>Nombre:</strong> ${contactData.nombre}</p>
                <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                ${contactData.telefono ? `<p><strong>Teléfono:</strong> <a href="tel:${contactData.telefono}">${contactData.telefono}</a></p>` : ''}
                <p><strong>Asunto:</strong> ${contactData.asunto}</p>
              </div>
              
              <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #34495e; margin-top: 0;">Mensaje</h3>
                <p style="white-space: pre-wrap; line-height: 1.6;">${contactData.mensaje}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${contactData.email}?subject=Re: ${contactData.asunto}" 
                   style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Responder al Cliente
                </a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #7f8c8d; font-size: 12px;">
                Sistema Legal - Notificación automática
              </p>
            </div>
          `,
        };
        
        await sgMail.send(msg);
        console.log('[EMAIL] ✅ Email enviado exitosamente con SendGrid');
        return true;
      } catch (error) {
        console.error('[EMAIL] ❌ Error enviando email con SendGrid:', error);
        return false;
      }
    } else {
      // Usar Gmail (fallback)
      try {
        console.log('[EMAIL] 📧 Enviando email con Gmail (fallback)...');
        
        const mailOptions = {
          from: process.env.EMAIL_USER || 'tu-email@gmail.com',
          to: adminEmail,
          subject: `Nueva Consulta: ${contactData.asunto}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">Nueva Consulta Recibida</h2>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #34495e; margin-top: 0;">Información del Cliente</h3>
                <p><strong>Nombre:</strong> ${contactData.nombre}</p>
                <p><strong>Email:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                ${contactData.telefono ? `<p><strong>Teléfono:</strong> <a href="tel:${contactData.telefono}">${contactData.telefono}</a></p>` : ''}
                <p><strong>Asunto:</strong> ${contactData.asunto}</p>
              </div>
              
              <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #34495e; margin-top: 0;">Mensaje</h3>
                <p style="white-space: pre-wrap; line-height: 1.6;">${contactData.mensaje}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="mailto:${contactData.email}?subject=Re: ${contactData.asunto}" 
                   style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Responder al Cliente
                </a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #7f8c8d; font-size: 12px;">
                Sistema Legal - Notificación automática
              </p>
            </div>
          `,
        };
        
        await this.transporter.sendMail(mailOptions);
        console.log('[EMAIL] ✅ Email enviado exitosamente con Gmail');
        return true;
      } catch (error) {
        console.error('[EMAIL] ❌ Error enviando email con Gmail:', error);
        return false;
      }
    }
  }

  async sendContactConfirmation(contactData: {
    nombre: string;
    email: string;
  }) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: contactData.email,
      subject: 'Confirmación de Consulta - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">¡Gracias por tu Consulta!</h2>
          <p>Hola ${contactData.nombre},</p>
          <p>Hemos recibido tu consulta correctamente. Nuestro equipo de abogados especialistas la revisará y se pondrá en contacto contigo en las próximas 24 horas.</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">¿Qué puedes esperar?</h3>
            <ul style="color: #2c3e50;">
              <li>Respuesta personalizada de un abogado especialista</li>
              <li>Evaluación inicial de tu caso</li>
              <li>Orientación sobre los próximos pasos</li>
              <li>Información sobre honorarios si aplica</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending contact confirmation email:', error);
      return false;
    }
  }

  async sendAppointmentRescheduledEmail(data: {
    clientName: string;
    clientEmail: string;
    lawyerName: string;
    originalDate: Date;
    originalLocation?: string;
    newDate: Date;
    newLocation?: string;
    notes?: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.clientEmail,
      subject: 'Cita Reprogramada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Cita Reprogramada</h2>
          <p>Hola ${data.clientName},</p>
          <p>Tu abogado <strong>${data.lawyerName}</strong> ha reprogramado tu cita. Te informamos de los cambios:</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Cambios Realizados</h3>
            <div style="margin-bottom: 15px;">
              <p><strong>Fecha y hora anterior:</strong></p>
              <p style="color: #856404; margin: 5px 0;">${formatDate(data.originalDate)}</p>
            </div>
            <div style="margin-bottom: 15px;">
              <p><strong>Nueva fecha y hora:</strong></p>
              <p style="color: #155724; font-weight: bold; margin: 5px 0;">${formatDate(data.newDate)}</p>
            </div>
            ${data.originalLocation && data.newLocation && data.originalLocation !== data.newLocation ? `
            <div style="margin-bottom: 15px;">
              <p><strong>Ubicación anterior:</strong> ${data.originalLocation}</p>
              <p><strong>Nueva ubicación:</strong> ${data.newLocation}</p>
            </div>
            ` : ''}
            ${data.notes ? `
            <div style="margin-bottom: 15px;">
              <p><strong>Notas del abogado:</strong></p>
              <p style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin: 5px 0;">${data.notes}</p>
            </div>
            ` : ''}
          </div>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">¿Qué debes hacer?</h3>
            <ul style="color: #155724;">
              <li>Actualiza tu agenda con la nueva fecha y hora</li>
              <li>Confirma tu asistencia a la nueva cita</li>
              <li>Si no puedes asistir, contacta con tu abogado lo antes posible</li>
              <li>Llega 10 minutos antes de la hora programada</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/appointments" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Ver Mis Citas
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Abogado:</strong> ${data.lawyerName}</p>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending appointment rescheduled email:', error);
      return false;
    }
  }

  async sendVisitorAppointmentConfirmationEmail(data: {
    visitorName: string;
    visitorEmail: string;
    consultationReason: string;
    preferredDate: Date;
    consultationType: string;
    appointmentId: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.visitorEmail,
      subject: 'Confirmación de Cita - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">¡Cita Programada Exitosamente!</h2>
          <p>Hola ${data.visitorName},</p>
          <p>Hemos recibido tu solicitud de cita correctamente. Te hemos enviado un email de confirmación con todos los detalles.</p>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">Detalles de tu Cita</h3>
            <p><strong>Número de Cita:</strong> ${data.appointmentId}</p>
            <p><strong>Motivo de Consulta:</strong> ${data.consultationReason}</p>
            <p><strong>Tipo de Consulta:</strong> ${data.consultationType}</p>
            <p><strong>Fecha Preferida:</strong> ${formatDate(data.preferredDate)}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Próximos Pasos</h3>
            <ul style="color: #856404;">
              <li>Nuestro equipo revisará tu solicitud en las próximas 24 horas</li>
              <li>Te contactaremos para confirmar la fecha y hora exacta</li>
              <li>Recibirás un email con la confirmación final</li>
              <li>Si necesitas cambiar algo, contacta con nosotros</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">¿Qué debes traer?</h3>
            <ul style="color: #0c5460;">
              <li>Documento de identidad</li>
              <li>Documentos relacionados con tu caso (si los tienes)</li>
              <li>Lista de preguntas o dudas que tengas</li>
              <li>Llega 10 minutos antes de la hora programada</li>
            </ul>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales<br>
            Número de Cita: ${data.appointmentId}
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending visitor appointment confirmation email:', error);
      return false;
    }
  }

  async sendVisitorAppointmentNotificationEmail(data: {
    visitorName: string;
    visitorEmail: string;
    visitorPhone: string;
    visitorAge: number;
    consultationReason: string;
    preferredDate: Date;
    alternativeDate?: Date;
    consultationType: string;
    notes?: string;
    appointmentId: string;
  }) {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@despachoabogados.com';
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: adminEmail,
      subject: `Nueva Cita de Visitante: ${data.visitorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Nueva Cita de Visitante</h2>
          <p>Se ha registrado una nueva solicitud de cita desde el chatbot.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información del Visitante</h3>
            <p><strong>Nombre:</strong> ${data.visitorName}</p>
            <p><strong>Email:</strong> <a href="mailto:${data.visitorEmail}">${data.visitorEmail}</a></p>
            <p><strong>Teléfono:</strong> <a href="tel:${data.visitorPhone}">${data.visitorPhone}</a></p>
            <p><strong>Edad:</strong> ${data.visitorAge} años</p>
            <p><strong>Número de Cita:</strong> ${data.appointmentId}</p>
          </div>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Detalles de la Consulta</h3>
            <p><strong>Motivo:</strong> ${data.consultationReason}</p>
            <p><strong>Tipo de Consulta:</strong> ${data.consultationType}</p>
            <p><strong>Fecha Preferida:</strong> ${formatDate(data.preferredDate)}</p>
            ${data.alternativeDate ? `<p><strong>Fecha Alternativa:</strong> ${formatDate(data.alternativeDate)}</p>` : ''}
            ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${data.visitorEmail}?subject=Confirmación de Cita - ${data.visitorName}" 
               style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contactar al Visitante
            </a>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Acciones Requeridas</h3>
            <ul style="color: #856404;">
              <li>Revisar la solicitud y asignar un abogado</li>
              <li>Confirmar fecha y hora de la cita</li>
              <li>Enviar email de confirmación al visitante</li>
              <li>Actualizar el estado de la cita en el sistema</li>
            </ul>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Sistema Legal - Notificación automática<br>
            Cita ID: ${data.appointmentId}
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending visitor appointment notification email:', error);
      return false;
    }
  }

  async sendVisitorAppointmentConfirmedEmail(data: {
    visitorName: string;
    visitorEmail: string;
    confirmedDate: Date;
    consultationReason: string;
    appointmentId: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.visitorEmail,
      subject: 'Cita Confirmada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">¡Tu Cita Ha Sido Confirmada!</h2>
          <p>Hola ${data.visitorName},</p>
          <p>Nos complace informarte que tu cita ha sido confirmada. Aquí tienes todos los detalles:</p>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">Detalles de la Cita Confirmada</h3>
            <p><strong>Fecha y Hora:</strong> ${formatDate(data.confirmedDate)}</p>
            <p><strong>Motivo:</strong> ${data.consultationReason}</p>
            <p><strong>Número de Cita:</strong> ${data.appointmentId}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Instrucciones Importantes</h3>
            <ul style="color: #856404;">
              <li>Llega 10 minutos antes de la hora programada</li>
              <li>Trae tu documento de identidad</li>
              <li>Si tienes documentos relacionados, tráelos</li>
              <li>Si necesitas cancelar, avísanos con al menos 24 horas de anticipación</li>
            </ul>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:info@despachoabogados.com?subject=Consulta sobre cita ${data.appointmentId}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contactar con Nosotros
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales<br>
            Número de Cita: ${data.appointmentId}
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending visitor appointment confirmed email:', error);
      return false;
    }
  }

  async sendVisitorAppointmentCancelledEmail(data: {
    visitorName: string;
    visitorEmail: string;
    reason: string;
    appointmentId: string;
  }) {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.visitorEmail,
      subject: 'Cita Cancelada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Cita Cancelada</h2>
          <p>Hola ${data.visitorName},</p>
          <p>Lamentamos informarte que tu cita ha sido cancelada.</p>
          
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">Información de la Cancelación</h3>
            <p><strong>Número de Cita:</strong> ${data.appointmentId}</p>
            <p><strong>Motivo:</strong> ${data.reason}</p>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">¿Qué puedes hacer?</h3>
            <ul style="color: #0c5460;">
              <li>Programar una nueva cita en nuestro sistema</li>
              <li>Contactar con nosotros para más información</li>
              <li>Consultar sobre otros servicios que ofrecemos</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:info@despachoabogados.com?subject=Nueva cita después de cancelación ${data.appointmentId}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Programar Nueva Cita
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales<br>
            Número de Cita: ${data.appointmentId}
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending visitor appointment cancelled email:', error);
      return false;
    }
  }

  async sendAppointmentConfirmationEmail(data: {
    clientName: string;
    clientEmail: string;
    lawyerName: string;
    appointmentDate: Date;
    location?: string;
    notes?: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.clientEmail,
      subject: 'Cita Confirmada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">Cita Confirmada</h2>
          <p>Hola ${data.clientName},</p>
          <p>Tu cita ha sido confirmada exitosamente.</p>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">Detalles de la Cita</h3>
            <p><strong>Abogado:</strong> ${data.lawyerName}</p>
            <p><strong>Fecha y Hora:</strong> ${formatDate(data.appointmentDate)}</p>
            ${data.location ? `<p><strong>Ubicación:</strong> ${data.location}</p>` : ''}
            ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">Recordatorios Importantes</h3>
            <ul style="color: #0c5460;">
              <li>Llega 10 minutos antes de la hora programada</li>
              <li>Trae todos los documentos relevantes</li>
              <li>Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${data.lawyerName.toLowerCase().replace(' ', '.')}@despachoabogados.com?subject=Consulta sobre cita del ${formatDate(data.appointmentDate)}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contactar con el Abogado
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending appointment confirmation email:', error);
      return false;
    }
  }

  async sendAppointmentScheduledByLawyerEmail(data: {
    clientName: string;
    clientEmail: string;
    lawyerName: string;
    appointmentDate: Date;
    location?: string;
    notes?: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.clientEmail,
      subject: 'Nueva Cita Programada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3498db;">Nueva Cita Programada</h2>
          <p>Hola ${data.clientName},</p>
          <p>Se ha programado una nueva cita para ti.</p>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">Detalles de la Cita</h3>
            <p><strong>Abogado:</strong> ${data.lawyerName}</p>
            <p><strong>Fecha y Hora:</strong> ${formatDate(data.appointmentDate)}</p>
            ${data.location ? `<p><strong>Ubicación:</strong> ${data.location}</p>` : ''}
            ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Acción Requerida</h3>
            <p>Por favor, confirma si puedes asistir a esta cita respondiendo a este email o contactando con nosotros.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${data.lawyerName.toLowerCase().replace(' ', '.')}@despachoabogados.com?subject=Confirmación de cita del ${formatDate(data.appointmentDate)}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirmar Cita
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending appointment scheduled by lawyer email:', error);
      return false;
    }
  }

  async sendAppointmentUpdatedEmail(data: {
    clientName: string;
    clientEmail: string;
    lawyerName: string;
    appointmentDate: Date;
    location?: string;
    notes?: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.clientEmail,
      subject: 'Cita Actualizada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f39c12;">Cita Actualizada</h2>
          <p>Hola ${data.clientName},</p>
          <p>Tu cita ha sido actualizada.</p>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Detalles Actualizados</h3>
            <p><strong>Abogado:</strong> ${data.lawyerName}</p>
            <p><strong>Fecha y Hora:</strong> ${formatDate(data.appointmentDate)}</p>
            ${data.location ? `<p><strong>Ubicación:</strong> ${data.location}</p>` : ''}
            ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${data.lawyerName.toLowerCase().replace(' ', '.')}@despachoabogados.com?subject=Consulta sobre cita actualizada del ${formatDate(data.appointmentDate)}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contactar con el Abogado
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending appointment updated email:', error);
      return false;
    }
  }

  async sendAppointmentCancelledEmail(data: {
    clientName: string;
    clientEmail: string;
    lawyerName: string;
    appointmentDate: Date;
    location?: string;
    cancelledBy: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.clientEmail,
      subject: 'Cita Cancelada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e74c3c;">Cita Cancelada</h2>
          <p>Hola ${data.clientName},</p>
          <p>Tu cita ha sido cancelada.</p>
          
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">Información de la Cancelación</h3>
            <p><strong>Abogado:</strong> ${data.lawyerName}</p>
            <p><strong>Fecha Cancelada:</strong> ${formatDate(data.appointmentDate)}</p>
            ${data.location ? `<p><strong>Ubicación:</strong> ${data.location}</p>` : ''}
            <p><strong>Cancelada por:</strong> ${data.cancelledBy}</p>
          </div>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">¿Qué puedes hacer?</h3>
            <ul style="color: #0c5460;">
              <li>Programar una nueva cita en nuestro sistema</li>
              <li>Contactar con nosotros para más información</li>
              <li>Consultar sobre otros servicios que ofrecemos</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:info@despachoabogados.com?subject=Nueva cita después de cancelación" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Programar Nueva Cita
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending appointment cancelled email:', error);
      return false;
    }
  }

  async sendAppointmentConfirmedEmail(data: {
    clientName: string;
    clientEmail: string;
    lawyerName: string;
    appointmentDate: Date;
    location?: string;
    notes?: string;
  }) {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: data.clientEmail,
      subject: 'Cita Confirmada - Despacho de Abogados',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">Cita Confirmada</h2>
          <p>Hola ${data.clientName},</p>
          <p>Tu cita ha sido confirmada por el abogado.</p>
          
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #155724; margin-top: 0;">Detalles de la Cita</h3>
            <p><strong>Abogado:</strong> ${data.lawyerName}</p>
            <p><strong>Fecha y Hora:</strong> ${formatDate(data.appointmentDate)}</p>
            ${data.location ? `<p><strong>Ubicación:</strong> ${data.location}</p>` : ''}
            ${data.notes ? `<p><strong>Notas:</strong> ${data.notes}</p>` : ''}
          </div>
          
          <div style="background-color: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">Recordatorios Importantes</h3>
            <ul style="color: #0c5460;">
              <li>Llega 10 minutos antes de la hora programada</li>
              <li>Trae todos los documentos relevantes</li>
              <li>Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${data.lawyerName.toLowerCase().replace(' ', '.')}@despachoabogados.com?subject=Consulta sobre cita confirmada del ${formatDate(data.appointmentDate)}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Contactar con el Abogado
            </a>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #34495e; margin-top: 0;">Información de Contacto</h3>
            <p><strong>Teléfono:</strong> +34 612 345 678</p>
            <p><strong>Email:</strong> info@despachoabogados.com</p>
            <p><strong>Dirección:</strong> Calle Principal 123, Madrid, 28001</p>
            <p><strong>Horario:</strong> Lunes - Viernes: 9:00 - 18:00</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Despacho de Abogados García & Asociados<br>
            Más de 15 años de experiencia en servicios legales
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending appointment confirmed email:', error);
      return false;
    }
  }
} 