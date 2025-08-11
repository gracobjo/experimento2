import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { VisitorAppointmentsService } from './visitor-appointments.service';
import { CreateVisitorAppointmentDto } from './dto/create-visitor-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('visitor-appointments')
@Controller('appointments/visitor')
export class VisitorAppointmentsController {
  constructor(private readonly visitorAppointmentsService: VisitorAppointmentsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear cita de visitante',
    description: 'Crea una cita para un visitante no logueado'
  })
  @ApiBody({ type: CreateVisitorAppointmentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Cita de visitante creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        age: { type: 'number' },
        phone: { type: 'string' },
        email: { type: 'string' },
        consultationReason: { type: 'string' },
        preferredDate: { type: 'string', format: 'date-time' },
        consultationType: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  // ENDPOINT PÚBLICO: No requiere autenticación para crear citas
  create(@Body() createVisitorAppointmentDto: CreateVisitorAppointmentDto) {
    return this.visitorAppointmentsService.create(createVisitorAppointmentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ABOGADO')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener citas de visitantes',
    description: 'Devuelve las citas de visitantes según el rol del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de citas de visitantes',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          fullName: { type: 'string' },
          age: { type: 'number' },
          phone: { type: 'string' },
          email: { type: 'string' },
          consultationReason: { type: 'string' },
          preferredDate: { type: 'string', format: 'date-time' },
          consultationType: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  findAll() {
    return this.visitorAppointmentsService.findAll({ role: 'ADMIN' }); // Se ajustará según el usuario real
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ABOGADO')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener cita de visitante por ID',
    description: 'Devuelve una cita específica de visitante'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita de visitante encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        fullName: { type: 'string' },
        age: { type: 'number' },
        phone: { type: 'string' },
        email: { type: 'string' },
        consultationReason: { type: 'string' },
        preferredDate: { type: 'string', format: 'date-time' },
        consultationType: { type: 'string' },
        status: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  findOne(@Param('id') id: string) {
    return this.visitorAppointmentsService.findOne(id, { role: 'ADMIN' }); // Se ajustará según el usuario real
  }

  @Put(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Asignar abogado a cita de visitante',
    description: 'Asigna un abogado específico a una cita de visitante'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        lawyerId: { type: 'string', description: 'ID del abogado' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Abogado asignado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        assignedLawyerId: { type: 'string' },
        assignedLawyer: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cita o abogado no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  assignLawyer(@Param('id') id: string, @Body() data: { lawyerId: string }) {
    return this.visitorAppointmentsService.assignLawyer(id, data.lawyerId, { role: 'ADMIN' });
  }

  @Put(':id/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ABOGADO')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Confirmar cita de visitante',
    description: 'Confirma una cita de visitante con fecha y hora específicas'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        confirmedDate: { type: 'string', format: 'date-time', description: 'Fecha y hora confirmada' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita confirmada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        confirmedDate: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  confirmAppointment(@Param('id') id: string, @Body() data: { confirmedDate: string }) {
    return this.visitorAppointmentsService.confirmAppointment(id, data.confirmedDate, { role: 'ADMIN' });
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cancelar cita de visitante',
    description: 'Cancela una cita de visitante con motivo'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Motivo de la cancelación' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita cancelada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        notes: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  cancelAppointment(@Param('id') id: string, @Body() data: { reason: string }) {
    return this.visitorAppointmentsService.cancelAppointment(id, data.reason, { role: 'ADMIN' });
  }

  @Put(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'ABOGADO')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Marcar cita como completada',
    description: 'Marca una cita de visitante como completada'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita marcada como completada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  completeAppointment(@Param('id') id: string) {
    return this.visitorAppointmentsService.completeAppointment(id, { role: 'ADMIN' });
  }
} 