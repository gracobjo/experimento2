import { Controller, Get, Post, Body, UseGuards, Request, Delete, Param, ForbiddenException, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateLawyerAppointmentDto } from './dto/create-lawyer-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@ApiTags('appointments')
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener todas las citas',
    description: 'Devuelve la lista de citas según el rol del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de citas',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          location: { type: 'string' },
          notes: { type: 'string' },
          clientId: { type: 'string' },
          lawyerId: { type: 'string' },
          client: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          },
          lawyer: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(@Request() req) {
    return this.appointmentsService.findAll(req.user);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener una cita específica',
    description: 'Devuelve los detalles de una cita específica según los permisos del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalles de la cita',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        notes: { type: 'string' },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        client: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string' }
              }
            }
          }
        },
        lawyer: {
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
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para ver esta cita' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.findOne(id, req.user);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear nueva cita',
    description: 'Crea una nueva cita entre abogado y cliente'
  })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Cita creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        notes: { type: 'string' },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user);
  }

  @Post('lawyer')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear nueva cita como abogado',
    description: 'Permite a un abogado crear una cita para un cliente'
  })
  @ApiBody({ type: CreateLawyerAppointmentDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Cita creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        notes: { type: 'string' },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Solo abogados y administradores pueden crear citas para clientes' })
  async createAsLawyer(@Body() createLawyerAppointmentDto: CreateLawyerAppointmentDto, @Request() req) {
    return this.appointmentsService.createAsLawyer(createLawyerAppointmentDto, req.user);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar cita',
    description: 'Permite actualizar los detalles de una cita existente'
  })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        notes: { type: 'string' },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para editar esta cita' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async update(
    @Param('id') id: string, 
    @Body() updateAppointmentDto: UpdateAppointmentDto, 
    @Request() req
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, req.user);
  }

  @Put(':id/confirm')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Confirmar cita',
    description: 'Permite a un abogado confirmar una cita existente'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita confirmada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        date: { type: 'string', format: 'date-time' },
        location: { type: 'string' },
        notes: { type: 'string' },
        status: { type: 'string' },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Solo los abogados pueden confirmar citas' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async confirm(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.confirm(id, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Cancelar cita',
    description: 'Permite a un cliente cancelar su propia cita'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita cancelada exitosamente'
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para cancelar esta cita' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.delete(id, req.user);
  }

  @Put(':id/reschedule')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Reprogramar cita',
    description: 'Permite a un abogado reprogramar una cita existente'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        date: { 
          type: 'string', 
          format: 'date-time',
          description: 'Nueva fecha y hora de la cita'
        },
        location: { 
          type: 'string',
          description: 'Nueva ubicación de la cita (opcional)'
        },
        notes: { 
          type: 'string',
          description: 'Notas adicionales sobre el cambio (opcional)'
        }
      },
      required: ['date']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Cita reprogramada exitosamente'
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para reprogramar esta cita' })
  @ApiResponse({ status: 404, description: 'Cita no encontrada' })
  async reschedule(
    @Param('id') id: string, 
    @Body() rescheduleData: { date: string; location?: string; notes?: string },
    @Request() req
  ) {
    return this.appointmentsService.reschedule(id, rescheduleData, req.user);
  }
} 