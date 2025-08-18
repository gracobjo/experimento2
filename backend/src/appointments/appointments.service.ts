import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../auth/email.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateLawyerAppointmentDto } from './dto/create-lawyer-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async findMyAppointments(user: any) {
    try {
      if (user.role === 'ADMIN') {
        // Admin ve todas las citas
        return await this.prisma.appointment.findMany({
          include: {
            lawyer: { select: { id: true, name: true, email: true } },
            client: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          orderBy: { date: 'desc' }
        });
      } else if (user.role === 'ABOGADO') {
        // Abogado ve expedientes asignados a ellos
        return await this.prisma.appointment.findMany({
          where: { lawyerId: user.id },
          include: {
            lawyer: { select: { id: true, name: true, email: true } },
            client: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          orderBy: { date: 'desc' }
        });
      } else {
        // Cliente ve solo sus citas
        const client = await this.prisma.client.findUnique({
          where: { userId: user.id }
        });
        if (!client) throw new ForbiddenException('No eres cliente');
        return await this.prisma.appointment.findMany({
          where: { clientId: client.id },
          include: {
            lawyer: { select: { id: true, name: true, email: true } },
            client: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          orderBy: { date: 'desc' }
        });
      }
    } catch (error) {
      console.error('Error en findMyAppointments:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener citas: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findAll(user: any) {
    try {
      if (user.role === 'ADMIN') {
        // Admin ve todas las citas
        return await this.prisma.appointment.findMany({
          include: {
            lawyer: { select: { id: true, name: true, email: true } },
            client: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          orderBy: { date: 'desc' }
        });
      } else if (user.role === 'ABOGADO') {
        // Abogado ve expedientes asignados a ellos
        return await this.prisma.appointment.findMany({
          where: { lawyerId: user.id },
          include: {
            lawyer: { select: { id: true, name: true, email: true } },
            client: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          orderBy: { date: 'desc' }
        });
      } else {
        // Cliente ve solo sus citas
        const client = await this.prisma.client.findUnique({
          where: { userId: user.id }
        });
        if (!client) throw new ForbiddenException('No eres cliente');
        return await this.prisma.appointment.findMany({
          where: { clientId: client.id },
          include: {
            lawyer: { select: { id: true, name: true, email: true } },
            client: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          },
          orderBy: { date: 'desc' }
        });
      }
    } catch (error) {
      console.error('Error en findAll:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener citas: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async findOne(id: string, user: any) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        lawyer: { select: { id: true, name: true, email: true } },
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar permisos
    if (user.role === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: user.id }
      });
      if (!client || appointment.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para ver esta cita');
      }
    } else if (user.role === 'ABOGADO') {
      if (appointment.lawyerId !== user.id) {
        throw new ForbiddenException('No tienes permisos para ver esta cita');
      }
    }
    // Los admins pueden ver cualquier cita

    return appointment;
  }

  async create(dto: CreateAppointmentDto, user: any) {
    // Solo clientes pueden crear citas
    if (user.role !== 'CLIENTE') throw new ForbiddenException('Solo los clientes pueden agendar citas');
    const client = await this.prisma.client.findUnique({ 
      where: { userId: user.id },
      include: { user: true }
    });
    if (!client) throw new ForbiddenException('No eres cliente');
    
    // Verificar que el abogado existe
    const lawyer = await this.prisma.user.findUnique({ where: { id: dto.lawyerId, role: 'ABOGADO' } });
    if (!lawyer) throw new NotFoundException('Abogado no encontrado');

    // Validar fecha futura
    const appointmentDate = new Date(dto.date);
    if (appointmentDate <= new Date()) {
      throw new BadRequestException('La fecha de la cita debe ser futura');
    }

    // Verificar disponibilidad del abogado
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        lawyerId: dto.lawyerId,
        date: {
          gte: new Date(appointmentDate.getTime() - 60 * 60 * 1000), // 1 hora antes
          lte: new Date(appointmentDate.getTime() + 60 * 60 * 1000), // 1 hora después
        }
      }
    });

    if (conflictingAppointment) {
      throw new BadRequestException('El abogado no está disponible en ese horario');
    }

    // Crear cita
    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: client.id,
        lawyerId: dto.lawyerId,
        date: appointmentDate,
        location: dto.location || null,
        notes: dto.notes || null,
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true } },
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // Enviar email de confirmación
    try {
      await this.emailService.sendAppointmentConfirmationEmail({
        clientName: client.user.name,
        clientEmail: client.user.email,
        lawyerName: lawyer.name,
        appointmentDate: appointmentDate,
        location: dto.location,
        notes: dto.notes
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }

    return appointment;
  }

  async createAsLawyer(dto: CreateLawyerAppointmentDto, user: any) {
    // Solo abogados y administradores pueden crear citas para clientes
    if (user.role !== 'ABOGADO' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Solo los abogados y administradores pueden crear citas para clientes');
    }

    // Verificar que el cliente existe
    const client = await this.prisma.client.findUnique({ 
      where: { id: dto.clientId },
      include: { user: true }
    });
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Verificar que el abogado existe
    const lawyer = await this.prisma.user.findUnique({ 
      where: { id: user.id, role: 'ABOGADO' } 
    });
    if (!lawyer) {
      throw new ForbiddenException('No eres abogado');
    }

    // Validar fecha futura
    const appointmentDate = new Date(dto.date);
    if (appointmentDate <= new Date()) {
      throw new BadRequestException('La fecha de la cita debe ser futura');
    }

    // Verificar disponibilidad del abogado
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        lawyerId: user.id,
        date: {
          gte: new Date(appointmentDate.getTime() - 60 * 60 * 1000), // 1 hora antes
          lte: new Date(appointmentDate.getTime() + 60 * 60 * 1000), // 1 hora después
        }
      }
    });

    if (conflictingAppointment) {
      throw new BadRequestException('No estás disponible en ese horario');
    }

    // Crear cita
    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: dto.clientId,
        lawyerId: user.id,
        date: appointmentDate,
        location: dto.location || null,
        notes: dto.notes || null,
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true } },
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // Enviar email de notificación al cliente
    try {
      await this.emailService.sendAppointmentScheduledByLawyerEmail({
        clientName: client.user.name,
        clientEmail: client.user.email,
        lawyerName: lawyer.name,
        appointmentDate: appointmentDate,
        location: dto.location,
        notes: dto.notes
      });
    } catch (error) {
      console.error('Error sending notification email:', error);
    }

    return appointment;
  }

  async update(id: string, updateDto: UpdateAppointmentDto, user: any) {
    // Buscar la cita
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { 
          include: { 
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true 
              } 
            } 
          } 
        },
        lawyer: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar permisos
    if (user.role === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: user.id }
      });
      if (!client || appointment.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para editar esta cita');
      }
    } else if (user.role === 'ABOGADO') {
      if (appointment.lawyerId !== user.id) {
        throw new ForbiddenException('No tienes permisos para editar esta cita');
      }
    } else if (user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permisos para editar citas');
    }

    // Validar fecha futura si se está cambiando
    if (updateDto.date) {
      const newDate = new Date(updateDto.date);
      if (newDate <= new Date()) {
        throw new BadRequestException('La fecha de la cita debe ser futura');
      }

      // Verificar disponibilidad del abogado (excluyendo la cita actual)
      const conflictingAppointment = await this.prisma.appointment.findFirst({
        where: {
          lawyerId: appointment.lawyerId,
          id: { not: id },
          date: {
            gte: new Date(newDate.getTime() - 60 * 60 * 1000), // 1 hora antes
            lte: new Date(newDate.getTime() + 60 * 60 * 1000), // 1 hora después
          }
        }
      });

      if (conflictingAppointment) {
        throw new BadRequestException('El abogado no está disponible en ese horario');
      }
    }

    // Actualizar la cita
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        date: updateDto.date ? new Date(updateDto.date) : undefined,
        location: updateDto.location !== undefined ? updateDto.location : undefined,
        notes: updateDto.notes !== undefined ? updateDto.notes : undefined,
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true } },
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // Enviar email de notificación si se cambió la fecha
    if (updateDto.date && appointment.date.getTime() !== new Date(updateDto.date).getTime()) {
      try {
        await this.emailService.sendAppointmentUpdatedEmail({
          clientName: appointment.client.user.name,
          clientEmail: appointment.client.user.email,
          lawyerName: appointment.lawyer.name,
          appointmentDate: new Date(updateDto.date),
          location: updateDto.location || appointment.location,
          notes: updateDto.notes
        });
      } catch (error) {
        console.error('Error sending update notification email:', error);
      }
    }

    return updatedAppointment;
  }

  async delete(id: string, user: any) {
    // Buscar la cita
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { 
          include: { 
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true 
              } 
            } 
          } 
        },
        lawyer: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar permisos
    if (user.role === 'CLIENTE') {
      const client = await this.prisma.client.findUnique({
        where: { userId: user.id }
      });
      if (!client || appointment.clientId !== client.id) {
        throw new ForbiddenException('No tienes permisos para cancelar esta cita');
      }
    } else if (user.role === 'ABOGADO') {
      // Abogado solo puede cancelar sus propias citas
      if (appointment.lawyerId !== user.id) {
        throw new ForbiddenException('No tienes permisos para cancelar esta cita');
      }
    } else if (user.role !== 'ADMIN') {
      // Solo admin puede cancelar cualquier cita
      throw new ForbiddenException('No tienes permisos para cancelar citas');
    }

    // Enviar email de cancelación
    try {
      await this.emailService.sendAppointmentCancelledEmail({
        clientName: appointment.client.user.name,
        clientEmail: appointment.client.user.email,
        lawyerName: appointment.lawyer.name,
        appointmentDate: appointment.date,
        location: appointment.location,
        cancelledBy: user.role === 'CLIENTE' ? 'cliente' : 'abogado'
      });
    } catch (error) {
      console.error('Error sending cancellation email:', error);
    }

    // Eliminar la cita
    await this.prisma.appointment.delete({
      where: { id }
    });

    return { message: 'Cita cancelada exitosamente' };
  }

  async reschedule(id: string, rescheduleData: { date: string; location?: string; notes?: string }, user: any) {
    // Buscar la cita
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { 
          include: { 
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true 
              } 
            } 
          } 
        },
        lawyer: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar permisos - solo abogados pueden reprogramar citas
    if (user.role !== 'ABOGADO') {
      throw new ForbiddenException('Solo los abogados pueden reprogramar citas');
    }

    // Verificar que el abogado es el asignado a la cita
    if (appointment.lawyerId !== user.id) {
      throw new ForbiddenException('No tienes permisos para reprogramar esta cita');
    }

    // Validar fecha futura
    const newDate = new Date(rescheduleData.date);
    if (newDate <= new Date()) {
      throw new BadRequestException('La fecha de la cita debe ser futura');
    }

    // Verificar disponibilidad del abogado (excluyendo la cita actual)
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        lawyerId: appointment.lawyerId,
        id: { not: id },
        date: {
          gte: new Date(newDate.getTime() - 60 * 60 * 1000), // 1 hora antes
          lte: new Date(newDate.getTime() + 60 * 60 * 1000), // 1 hora después
        }
      }
    });

    if (conflictingAppointment) {
      throw new BadRequestException('No estás disponible en ese horario');
    }

    // Guardar la fecha y hora originales para el email
    const originalDate = appointment.date;
    const originalLocation = appointment.location;

    // Actualizar la cita
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        date: newDate,
        location: rescheduleData.location || appointment.location,
        notes: rescheduleData.notes || appointment.notes,
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true } },
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // Enviar email de notificación al cliente
    try {
      await this.emailService.sendAppointmentRescheduledEmail({
        clientName: appointment.client.user.name,
        clientEmail: appointment.client.user.email,
        lawyerName: appointment.lawyer.name,
        originalDate: originalDate,
        originalLocation: originalLocation,
        newDate: newDate,
        newLocation: rescheduleData.location || appointment.location,
        notes: rescheduleData.notes
      });
    } catch (error) {
      console.error('Error sending reschedule notification email:', error);
      // No lanzar error si falla el email, solo log
    }

    return updatedAppointment;
  }

  async confirm(id: string, user: any) {
    // Buscar la cita
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        client: { 
          include: { 
            user: { 
              select: { 
                id: true, 
                name: true, 
                email: true 
              } 
            } 
          } 
        },
        lawyer: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        }
      }
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Verificar permisos - solo abogados pueden confirmar citas
    if (user.role !== 'ABOGADO') {
      throw new ForbiddenException('Solo los abogados pueden confirmar citas');
    }

    // Verificar que el abogado es el asignado a la cita
    if (appointment.lawyerId !== user.id) {
      throw new ForbiddenException('No tienes permisos para confirmar esta cita');
    }

    // Actualizar la cita como confirmada
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'CONFIRMADA',
      },
      include: {
        lawyer: { select: { id: true, name: true, email: true } },
        client: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    // Enviar email de confirmación al cliente
    try {
      await this.emailService.sendAppointmentConfirmedEmail({
        clientName: appointment.client.user.name,
        clientEmail: appointment.client.user.email,
        lawyerName: appointment.lawyer.name,
        appointmentDate: appointment.date,
        location: appointment.location,
        notes: appointment.notes
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }

    return updatedAppointment;
  }
} 