import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitorAppointmentDto } from './dto/create-visitor-appointment.dto';
import { EmailService } from '../auth/email.service';

@Injectable()
export class VisitorAppointmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async create(dto: CreateVisitorAppointmentDto) {
    // Crear cita de visitante
    const visitorAppointment = await this.prisma.visitorAppointment.create({
      data: {
        fullName: dto.fullName,
        age: dto.age,
        phone: dto.phone,
        email: dto.email,
        consultationReason: dto.consultationReason,
        preferredDate: new Date(dto.preferredDate),
        alternativeDate: dto.alternativeDate ? new Date(dto.alternativeDate) : null,
        consultationType: dto.consultationType,
        notes: dto.notes,
        location: dto.location,
        status: 'PENDIENTE'
      }
    });

    // Enviar email de confirmación al visitante
    try {
      await this.emailService.sendVisitorAppointmentConfirmationEmail({
        visitorName: dto.fullName,
        visitorEmail: dto.email,
        consultationReason: dto.consultationReason,
        preferredDate: new Date(dto.preferredDate),
        consultationType: dto.consultationType,
        appointmentId: visitorAppointment.id
      });
    } catch (error) {
      console.error('Error sending visitor appointment confirmation email:', error);
      // No lanzar error si falla el email, solo log
    }

    // Enviar notificación a administradores
    try {
      await this.emailService.sendVisitorAppointmentNotificationEmail({
        visitorName: dto.fullName,
        visitorEmail: dto.email,
        visitorPhone: dto.phone,
        visitorAge: dto.age,
        consultationReason: dto.consultationReason,
        preferredDate: new Date(dto.preferredDate),
        alternativeDate: dto.alternativeDate ? new Date(dto.alternativeDate) : undefined,
        consultationType: dto.consultationType,
        notes: dto.notes,
        appointmentId: visitorAppointment.id
      });
    } catch (error) {
      console.error('Error sending admin notification email:', error);
    }

    return visitorAppointment;
  }

  async findAll(user: any) {
    if (user.role === 'ADMIN') {
      // Admin ve todas las citas de visitantes
      return this.prisma.visitorAppointment.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } else if (user.role === 'ABOGADO') {
      // Abogado ve las citas asignadas a él
      return this.prisma.visitorAppointment.findMany({
        where: { assignedLawyerId: user.id },
        orderBy: { createdAt: 'desc' }
      });
    } else if (user.role === 'CLIENTE') {
      // Cliente ve solo las citas creadas con su email
      return this.prisma.visitorAppointment.findMany({
        where: { email: user.email },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Otros roles no pueden ver citas de visitantes
      return [];
    }
  }

  async findOne(id: string, user: any) {
    const appointment = await this.prisma.visitorAppointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Cita de visitante no encontrada');
    }

    // Verificar permisos
    if (user.role === 'ADMIN') {
      return appointment;
    } else if (user.role === 'ABOGADO' && appointment.assignedLawyerId === user.id) {
      return appointment;
    } else if (user.role === 'CLIENTE' && appointment.email === user.email) {
      // Cliente solo puede ver sus propias citas (por email)
      return appointment;
    } else {
      throw new NotFoundException('No tienes permisos para ver esta cita');
    }
  }

  async assignLawyer(id: string, lawyerId: string, user: any) {
    // Solo admin puede asignar abogados
    if (user.role !== 'ADMIN') {
      throw new NotFoundException('Solo los administradores pueden asignar abogados');
    }

    // Verificar que el abogado existe
    const lawyer = await this.prisma.user.findUnique({
      where: { id: lawyerId, role: 'ABOGADO' }
    });

    if (!lawyer) {
      throw new NotFoundException('Abogado no encontrado');
    }

    const appointment = await this.prisma.visitorAppointment.update({
      where: { id },
      data: { assignedLawyerId: lawyerId },
      include: { assignedLawyer: true }
    });

    return appointment;
  }

  async confirmAppointment(id: string, confirmedDate: string, user: any) {
    // Solo admin o abogado asignado puede confirmar
    const appointment = await this.prisma.visitorAppointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Cita de visitante no encontrada');
    }

    if (user.role !== 'ADMIN' && appointment.assignedLawyerId !== user.id) {
      throw new NotFoundException('No tienes permisos para confirmar esta cita');
    }

    const updatedAppointment = await this.prisma.visitorAppointment.update({
      where: { id },
      data: {
        status: 'CONFIRMADA',
        confirmedDate: new Date(confirmedDate)
      }
    });

    // Enviar email de confirmación al visitante
    try {
      await this.emailService.sendVisitorAppointmentConfirmedEmail({
        visitorName: appointment.fullName,
        visitorEmail: appointment.email,
        confirmedDate: new Date(confirmedDate),
        consultationReason: appointment.consultationReason,
        appointmentId: appointment.id
      });
    } catch (error) {
      console.error('Error sending appointment confirmation email:', error);
    }

    return updatedAppointment;
  }

  async cancelAppointment(id: string, reason: string, user: any) {
    // Solo admin puede cancelar
    if (user.role !== 'ADMIN') {
      throw new NotFoundException('Solo los administradores pueden cancelar citas');
    }

    // Primero obtener la cita actual
    const currentAppointment = await this.prisma.visitorAppointment.findUnique({
      where: { id }
    });

    if (!currentAppointment) {
      throw new NotFoundException('Cita de visitante no encontrada');
    }

    // Actualizar la cita con el nuevo estado y notas
    const appointment = await this.prisma.visitorAppointment.update({
      where: { id },
      data: {
        status: 'CANCELADA',
        notes: currentAppointment.notes ? `${currentAppointment.notes}\n\nCancelada: ${reason}` : `Cancelada: ${reason}`
      }
    });

    // Enviar email de cancelación al visitante
    try {
      await this.emailService.sendVisitorAppointmentCancelledEmail({
        visitorName: appointment.fullName,
        visitorEmail: appointment.email,
        reason: reason,
        appointmentId: appointment.id
      });
    } catch (error) {
      console.error('Error sending appointment cancellation email:', error);
    }

    return appointment;
  }

  async completeAppointment(id: string, user: any) {
    // Solo admin o abogado asignado puede marcar como completada
    const appointment = await this.prisma.visitorAppointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      throw new NotFoundException('Cita de visitante no encontrada');
    }

    if (user.role !== 'ADMIN' && appointment.assignedLawyerId !== user.id) {
      throw new NotFoundException('No tienes permisos para completar esta cita');
    }

    return this.prisma.visitorAppointment.update({
      where: { id },
      data: { status: 'COMPLETADA' }
    });
  }
} 