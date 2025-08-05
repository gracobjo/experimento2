import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProvisionFondosService } from './provision-fondos.service';
import { CreateProvisionFondosDto } from './dto/create-provision-fondos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
// Si tienes el DTO, descomenta la siguiente línea:
// import { LinkToInvoiceDto } from './dto/link-to-invoice.dto';

@ApiTags('provision-fondos')
@Controller('provision-fondos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProvisionFondosController {
  constructor(private readonly service: ProvisionFondosService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener provisiones de fondos',
    description: 'Devuelve las provisiones de fondos con filtros opcionales'
  })
  @ApiQuery({ name: 'clientId', description: 'ID del cliente', required: false, type: String })
  @ApiQuery({ name: 'expedienteId', description: 'ID del expediente', required: false, type: String })
  @ApiQuery({ name: 'invoiceId', description: 'ID de la factura', required: false, type: String })
  @ApiQuery({ name: 'soloPendientes', description: 'Solo provisiones pendientes', required: false, type: Boolean })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de provisiones de fondos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          monto: { type: 'number' },
          descripcion: { type: 'string' },
          fechaProvision: { type: 'string', format: 'date' },
          estado: { type: 'string' },
          clientId: { type: 'string' },
          expedienteId: { type: 'string' },
          invoiceId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findAll(
    @Query('clientId') clientId?: string,
    @Query('expedienteId') expedienteId?: string,
    @Query('invoiceId') invoiceId?: string,
    @Query('soloPendientes') soloPendientes?: string
  ) {
    return this.service.findAll({
      clientId,
      expedienteId,
      invoiceId,
      soloPendientes: soloPendientes === 'true',
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  @ApiOperation({ 
    summary: 'Obtener una provisión de fondos por ID',
    description: 'Devuelve una provisión de fondos específica'
  })
  @ApiParam({ name: 'id', description: 'ID de la provisión', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Provisión de fondos encontrada',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        monto: { type: 'number' },
        descripcion: { type: 'string' },
        fechaProvision: { type: 'string', format: 'date' },
        estado: { type: 'string' },
        clientId: { type: 'string' },
        expedienteId: { type: 'string' },
        invoiceId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Provisión no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Crear provisión de fondos',
    description: 'Crea una nueva provisión de fondos (ADMIN y ABOGADO)'
  })
  @ApiBody({ type: CreateProvisionFondosDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Provisión de fondos creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        monto: { type: 'number' },
        descripcion: { type: 'string' },
        fechaProvision: { type: 'string', format: 'date' },
        estado: { type: 'string' },
        clientId: { type: 'string' },
        expedienteId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  create(@Body() dto: CreateProvisionFondosDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Actualizar provisión de fondos',
    description: 'Actualiza una provisión de fondos existente (ADMIN y ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la provisión', type: String })
  @ApiBody({ type: CreateProvisionFondosDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Provisión de fondos actualizada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        monto: { type: 'number' },
        descripcion: { type: 'string' },
        fechaProvision: { type: 'string', format: 'date' },
        estado: { type: 'string' },
        clientId: { type: 'string' },
        expedienteId: { type: 'string' },
        invoiceId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Provisión no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  update(@Param('id') id: string, @Body() dto: CreateProvisionFondosDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Eliminar provisión de fondos',
    description: 'Elimina una provisión de fondos (ADMIN y ABOGADO)'
  })
  @ApiParam({ name: 'id', description: 'ID de la provisión', type: String })
  @ApiResponse({ 
    status: 200, 
    description: 'Provisión de fondos eliminada exitosamente'
  })
  @ApiResponse({ status: 404, description: 'Provisión no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch('link-to-invoice')
  @Roles(Role.ADMIN, Role.ABOGADO)
  @ApiOperation({ 
    summary: 'Vincular provisión a factura',
    description: 'Vincula una provisión de fondos a una factura específica'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        provisionId: { type: 'string', description: 'ID de la provisión' },
        invoiceId: { type: 'string', description: 'ID de la factura' }
      },
      required: ['provisionId', 'invoiceId']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Provisión vinculada exitosamente a la factura',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        monto: { type: 'number' },
        descripcion: { type: 'string' },
        fechaProvision: { type: 'string', format: 'date' },
        estado: { type: 'string' },
        clientId: { type: 'string' },
        expedienteId: { type: 'string' },
        invoiceId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Provisión o factura no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  linkToInvoice(@Body() body: { provisionId: string; invoiceId: string }) {
    return this.service.linkToInvoice(body.provisionId, body.invoiceId);
  }
} 