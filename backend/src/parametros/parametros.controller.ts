import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ParametrosService } from './parametros.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('parametros')
@Controller('parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  // Endpoints públicos para el frontend - DEBEN IR PRIMERO
  @Get('services')
  @ApiOperation({ 
    summary: 'Obtener servicios parametrizables',
    description: 'Devuelve la lista de servicios configurados para mostrar en el frontend'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de servicios',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string' },
          orden: { type: 'number' }
        }
      }
    }
  })
  getServices() {
    return this.parametrosService.findServices();
  }

  @Get('contact')
  @ApiOperation({ 
    summary: 'Obtener parámetros de contacto',
    description: 'Devuelve los parámetros de contacto para mostrar en el frontend'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Parámetros de contacto',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clave: { type: 'string' },
          valor: { type: 'string' },
          etiqueta: { type: 'string' },
          tipo: { type: 'string' }
        }
      }
    }
  })
  getContactParams() {
    return this.parametrosService.findContactParams();
  }

  @Get('legal')
  @ApiOperation({ 
    summary: 'Obtener contenido legal',
    description: 'Devuelve el contenido legal (privacidad, términos, cookies, copyright)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contenido legal',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clave: { type: 'string' },
          valor: { type: 'string' },
          etiqueta: { type: 'string' },
          tipo: { type: 'string' }
        }
      }
    }
  })
  getLegalContent() {
    return this.parametrosService.findLegalContent();
  }

  @Get('legal/:clave')
  @ApiOperation({ 
    summary: 'Obtener contenido legal específico',
    description: 'Devuelve un contenido legal específico por clave'
  })
  @ApiParam({ name: 'clave', description: 'Clave del contenido legal', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contenido legal encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clave: { type: 'string' },
        valor: { type: 'string' },
        etiqueta: { type: 'string' },
        tipo: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Contenido no encontrado' })
  getLegalContentByKey(@Param('clave') clave: string) {
    console.log('[PARAMETROS_CONTROLLER] Solicitud para clave:', clave);
    return this.parametrosService.findByClave(clave);
  }

  @Get('debug/all')
  @ApiOperation({ 
    summary: 'Debug todos los parámetros',
    description: 'Endpoint de debug para verificar todos los parámetros en la base de datos'
  })
  @ApiResponse({ status: 200, description: 'Lista de todos los parámetros' })
  async debugAllParams() {
    console.log('[PARAMETROS_DEBUG] Obteniendo todos los parámetros...');
    
    try {
      const allParams = await this.parametrosService.findAll();
      
      console.log('[PARAMETROS_DEBUG] Total de parámetros en BD:', allParams.length);
      console.log('[PARAMETROS_DEBUG] Parámetros:', allParams.map(p => ({
        id: p.id,
        clave: p.clave,
        valor: p.valor.substring(0, 50) + '...',
        tipo: p.tipo
      })));
      
      return {
        totalParams: allParams.length,
        params: allParams.map(p => ({
          id: p.id,
          clave: p.clave,
          valor: p.valor.substring(0, 100) + '...',
          tipo: p.tipo
        }))
      };
    } catch (error) {
      console.error('[PARAMETROS_DEBUG] Error:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Endpoints protegidos para administradores
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener todos los parámetros',
    description: 'Devuelve la lista de todos los parámetros del sistema'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de parámetros',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clave: { type: 'string' },
          valor: { type: 'string' },
          etiqueta: { type: 'string' },
          tipo: { type: 'string' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  findAll() {
    return this.parametrosService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener parámetro por ID',
    description: 'Devuelve un parámetro específico del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del parámetro', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Parámetro encontrado',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clave: { type: 'string' },
        valor: { type: 'string' },
        etiqueta: { type: 'string' },
        tipo: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Parámetro no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  findOne(@Param('id') id: string) {
    return this.parametrosService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear nuevo parámetro',
    description: 'Crea un nuevo parámetro de configuración del sistema'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        clave: { 
          type: 'string', 
          description: 'Clave única del parámetro',
          example: 'EMAIL_SMTP_HOST'
        },
        valor: { 
          type: 'string', 
          description: 'Valor del parámetro',
          example: 'smtp.gmail.com'
        },
        etiqueta: { 
          type: 'string', 
          description: 'Etiqueta descriptiva',
          example: 'Servidor SMTP'
        },
        tipo: { 
          type: 'string', 
          description: 'Tipo de dato',
          example: 'string',
          enum: ['string', 'number', 'email', 'image', 'boolean', 'text', 'html', 'url']
        }
      },
      required: ['clave', 'valor', 'etiqueta', 'tipo']
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Parámetro creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clave: { type: 'string' },
        valor: { type: 'string' },
        etiqueta: { type: 'string' },
        tipo: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Clave ya existe' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  create(@Body() data: { clave: string; valor: string; etiqueta: string; tipo: string }) {
    return this.parametrosService.create(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar parámetro',
    description: 'Actualiza un parámetro existente del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del parámetro', type: 'string' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        valor: { 
          type: 'string', 
          description: 'Nuevo valor del parámetro',
          example: 'smtp.outlook.com'
        },
        etiqueta: { 
          type: 'string', 
          description: 'Nueva etiqueta descriptiva',
          example: 'Servidor SMTP (Actualizado)'
        },
        tipo: { 
          type: 'string', 
          description: 'Nuevo tipo de dato',
          example: 'string',
          enum: ['string', 'number', 'email', 'image', 'boolean', 'text', 'html', 'url']
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Parámetro actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clave: { type: 'string' },
        valor: { type: 'string' },
        etiqueta: { type: 'string' },
        tipo: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Parámetro no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  update(@Param('id') id: string, @Body() data: { valor?: string; etiqueta?: string; tipo?: string }) {
    return this.parametrosService.update(id, data);
  }

  @Put('clave/:clave')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar parámetro por clave',
    description: 'Actualiza un parámetro existente por su clave'
  })
  @ApiParam({ name: 'clave', description: 'Clave del parámetro', type: 'string' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        valor: { 
          type: 'string', 
          description: 'Nuevo valor del parámetro',
          example: 'nuevo@email.com'
        }
      },
      required: ['valor']
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Parámetro actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        clave: { type: 'string' },
        valor: { type: 'string' },
        etiqueta: { type: 'string' },
        tipo: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Parámetro no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  updateByClave(@Param('clave') clave: string, @Body() data: { valor: string }) {
    return this.parametrosService.updateByClave(clave, data.valor);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar parámetro',
    description: 'Elimina un parámetro del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del parámetro', type: 'string' })
  @ApiResponse({ status: 200, description: 'Parámetro eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Parámetro no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  remove(@Param('id') id: string) {
    return this.parametrosService.remove(id);
  }

  @Post('initialize')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Inicializar parámetros por defecto',
    description: 'Crea o actualiza los parámetros por defecto del sistema'
  })
  @ApiResponse({ status: 200, description: 'Parámetros inicializados exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  initializeDefaultParams() {
    return this.parametrosService.initializeDefaultParams();
  }



  @Post('services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Agregar nuevo servicio',
    description: 'Agrega un nuevo servicio parametrizable'
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título del servicio' },
        description: { type: 'string', description: 'Descripción del servicio' },
        icon: { type: 'string', description: 'Icono del servicio' },
        orden: { type: 'number', description: 'Orden de visualización' }
      },
      required: ['title', 'description', 'icon']
    }
  })
  @ApiResponse({ status: 201, description: 'Servicio agregado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  addService(@Body() serviceData: { title: string; description: string; icon: string; orden?: number }) {
    return this.parametrosService.addService(serviceData);
  }

  @Put('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar servicio',
    description: 'Actualiza un servicio existente'
  })
  @ApiParam({ name: 'id', description: 'ID del servicio', type: 'string' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título del servicio' },
        description: { type: 'string', description: 'Descripción del servicio' },
        icon: { type: 'string', description: 'Icono del servicio' },
        orden: { type: 'number', description: 'Orden de visualización' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Servicio actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  updateService(@Param('id') id: string, @Body() serviceData: { title: string; description: string; icon: string; orden?: number }) {
    return this.parametrosService.updateService(id, serviceData);
  }

  @Delete('services/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar servicio',
    description: 'Elimina un servicio existente'
  })
  @ApiParam({ name: 'id', description: 'ID del servicio', type: 'string' })
  @ApiResponse({ status: 200, description: 'Servicio eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso prohibido' })
  deleteService(@Param('id') id: string) {
    return this.parametrosService.deleteService(id);
  }
} 