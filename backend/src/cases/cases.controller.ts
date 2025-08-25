import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseEnumPipe,
  Put
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, Status } from '@prisma/client';

@ApiTags('cases')
@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) { }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear nuevo caso',
    description: 'Crea un nuevo expediente/caso en el sistema'
  })
  @ApiBody({ type: CreateCaseDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Caso creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['ABIERTO', 'EN_PROCESO', 'CERRADO'] },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  @Roles(Role.ADMIN, Role.ABOGADO)
  create(@Body() createCaseDto: CreateCaseDto, @Request() req) {
    return this.casesService.create(createCaseDto, req.user.id);
  }

  @Get('my')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener mis casos',
    description: 'Devuelve los casos del usuario autenticado (CLIENTE ve sus expedientes, ABOGADO ve sus casos asignados)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de casos del usuario',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['ABIERTO', 'EN_PROCESO', 'CERRADO'] },
          clientId: { type: 'string' },
          lawyerId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
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
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findMyCases(@Request() req) {
    return this.casesService.findMyCases(req.user.id, req.user.role);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener todos los casos',
    description: 'Devuelve la lista de casos según el rol del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de casos',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          status: { type: 'string', enum: ['ABIERTO', 'EN_PROCESO', 'CERRADO'] },
          clientId: { type: 'string' },
          lawyerId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
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
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  findAll(@Request() req) {
    console.log(`🎯 CasesController.findAll - User ID: ${req.user.id}, Role: ${req.user.role}`);
    console.log(`🎯 Headers:`, req.headers);
    return this.casesService.findAll(req.user.id, req.user.role);
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de casos',
    description: 'Devuelve estadísticas de casos según el rol del usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estadísticas de casos',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: {
          type: 'object',
          properties: {
            ABIERTO: { type: 'number' },
            EN_PROCESO: { type: 'number' },
            CERRADO: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getStats(@Request() req) {
    return this.casesService.getCasesStats(req.user.id, req.user.role);
  }

  @Get('debug/all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Debug todos los casos',
    description: 'Endpoint de debug para verificar todos los casos en la base de datos'
  })
  @ApiResponse({ status: 200, description: 'Lista de todos los casos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async debugAllCases(@Request() req) {
    console.log('[DEBUG_CASES] Usuario:', req.user.id, req.user.role);
    
    try {
      // Usar el servicio para obtener todos los casos
      const allCases = await this.casesService.debugAllCases();
      
      console.log('[DEBUG_CASES] Total de casos en BD:', allCases.length);
      console.log('[DEBUG_CASES] Casos:', allCases.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        lawyerId: c.lawyerId,
        lawyerName: c.lawyer?.name,
        clientId: c.clientId,
        clientName: c.client?.user?.name
      })));
      
      return {
        totalCases: allCases.length,
        cases: allCases.map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          lawyerId: c.lawyerId,
          lawyerName: c.lawyer?.name,
          clientId: c.clientId,
          clientName: c.client?.user?.name
        }))
      };
    } catch (error) {
      console.error('[DEBUG_CASES] Error:', error);
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  @Get('recent')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener casos recientes',
    description: 'Devuelve los casos más recientes para la actividad reciente del dashboard'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Casos recientes',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          numeroExpediente: { type: 'string' },
          titulo: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
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
  @Roles(Role.ADMIN, Role.ABOGADO, Role.CLIENTE)
  getRecentCases(@Request() req) {
    return this.casesService.getRecentCases(req.user.id, req.user.role);
  }

  @Get('recent-activities')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener actividad reciente completa',
    description: 'Devuelve todas las actividades recientes del abogado (expedientes, tareas, citas, provisiones)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Actividad reciente completa',
    schema: {
      type: 'object',
      properties: {
        cases: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
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
              }
            }
          }
        },
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              status: { type: 'string' },
              priority: { type: 'string' },
              dueDate: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
              expediente: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' }
                }
              },
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
              }
            }
          }
        },
        appointments: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              location: { type: 'string' },
              notes: { type: 'string' },
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
              }
            }
          }
        },
        provisions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              amount: { type: 'number' },
              description: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              createdAt: { type: 'string', format: 'date-time' },
              expediente: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' }
                }
              },
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
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Roles(Role.ABOGADO)
  getRecentActivities(@Request() req) {
    return this.casesService.getRecentActivities(req.user.id);
  }

  @Get('status/:status')
  getCasesByStatus(
    @Param('status', new ParseEnumPipe(Status)) status: Status,
    @Request() req
  ) {
    return this.casesService.getCasesByStatus(status, req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Obtener caso por ID',
    description: 'Devuelve los detalles de un caso específico'
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalles del caso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['ABIERTO', 'EN_PROCESO', 'CERRADO'] },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
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
        },
        documents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              filename: { type: 'string' },
              description: { type: 'string' },
              uploadedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.casesService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar caso',
    description: 'Actualiza los datos de un caso existente'
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiBody({ type: UpdateCaseDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Caso actualizado exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: ['ABIERTO', 'EN_PROCESO', 'CERRADO'] },
        clientId: { type: 'string' },
        lawyerId: { type: 'string' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto, @Request() req) {
    return this.casesService.update(id, updateCaseDto, req.user.id, req.user.role);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN, Role.ABOGADO)
  updateStatus(
    @Param('id') id: string,
    @Body('status', new ParseEnumPipe(Status)) status: Status,
    @Request() req
  ) {
    return this.casesService.updateStatus(id, status, req.user.id, req.user.role);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar caso',
    description: 'Elimina un caso del sistema'
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({ status: 200, description: 'Caso eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  @ApiResponse({ status: 403, description: 'No autorizado' })
  remove(@Param('id') id: string, @Request() req) {
    return this.casesService.remove(id, req.user.id, req.user.role);
  }

  @Get('by-client/:clientId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener casos por cliente', description: 'Lista todos los casos de un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Lista de casos del cliente' })
  @Roles(Role.ADMIN, Role.ABOGADO)
  getCasesByClient(@Param('clientId') clientId: string) {
    return this.casesService.findByClientId(clientId);
  }

  @Post('by-client/:clientId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear caso para cliente', description: 'Crea un nuevo caso para un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiBody({ type: CreateCaseDto })
  @ApiResponse({ status: 201, description: 'Caso creado para el cliente' })
  @Roles(Role.ADMIN, Role.ABOGADO)
  createCaseForClient(@Param('clientId') clientId: string, @Body() createCaseDto: CreateCaseDto, @Request() req) {
    return this.casesService.createForClient(clientId, createCaseDto, req.user.id);
  }

  @Put('by-client/:clientId/:caseId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar caso de cliente', description: 'Actualiza un caso de un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiBody({ type: UpdateCaseDto })
  @ApiResponse({ status: 200, description: 'Caso actualizado' })
  @Roles(Role.ADMIN, Role.ABOGADO)
  updateCaseForClient(@Param('clientId') clientId: string, @Param('caseId') caseId: string, @Body() updateCaseDto: UpdateCaseDto, @Request() req) {
    return this.casesService.updateForClient(clientId, caseId, updateCaseDto, req.user.id);
  }

  @Patch('by-client/:clientId/:caseId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar parcialmente caso de cliente', description: 'Actualiza parcialmente un caso de un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiBody({ type: UpdateCaseDto })
  @ApiResponse({ status: 200, description: 'Caso actualizado parcialmente' })
  @Roles(Role.ADMIN, Role.ABOGADO)
  patchCaseForClient(@Param('clientId') clientId: string, @Param('caseId') caseId: string, @Body() updateCaseDto: UpdateCaseDto, @Request() req) {
    return this.casesService.patchForClient(clientId, caseId, updateCaseDto, req.user.id);
  }

  @Delete('by-client/:clientId/:caseId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar caso de cliente', description: 'Elimina un caso de un cliente específico (ADMIN y ABOGADO)' })
  @ApiParam({ name: 'clientId', description: 'ID del cliente' })
  @ApiParam({ name: 'caseId', description: 'ID del caso' })
  @ApiResponse({ status: 200, description: 'Caso eliminado' })
  @Roles(Role.ADMIN, Role.ABOGADO)
  deleteCaseForClient(@Param('clientId') clientId: string, @Param('caseId') caseId: string, @Request() req) {
    return this.casesService.deleteForClient(clientId, caseId, req.user.id);
  }

  @Get('test-public')
  @ApiOperation({ 
    summary: 'Test público de casos',
    description: 'Endpoint completamente público para diagnosticar problemas'
  })
  @ApiResponse({ status: 200, description: 'Test público exitoso' })
  async testPublic() {
    try {
      console.log('🧪 Test público de casos ejecutándose...');
      
      return {
        success: true,
        message: 'Test público exitoso',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        railway: 'Endpoint público funcionando'
      };
    } catch (error) {
      console.error('❌ Error en test público:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      return {
        success: false,
        message: 'Test público falló',
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('test-simple')
  @ApiOperation({ 
    summary: 'Test simple de casos',
    description: 'Endpoint de prueba sin autenticación para diagnosticar problemas'
  })
  @ApiResponse({ status: 200, description: 'Test exitoso' })
  async testSimple() {
    try {
      console.log('🧪 Test simple de casos ejecutándose...');
      
      // Verificar conexión básica a la base de datos
      const expedientesCount = await this.casesService.testDatabaseConnection();
      
      return {
        success: true,
        message: 'Test simple exitoso',
        expedientesCount,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };
    } catch (error) {
      console.error('❌ Error en test simple:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const errorStack = error instanceof Error ? error.stack : 'Stack no disponible';
      
      return {
        success: false,
        message: 'Test simple falló',
        error: errorMessage,
        stack: errorStack,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('test-with-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Test de casos con autenticación',
    description: 'Endpoint de prueba CON autenticación para diagnosticar problemas'
  })
  @ApiResponse({ status: 200, description: 'Test con auth exitoso' })
  async testWithAuth(@Request() req) {
    try {
      console.log('🧪 Test con auth ejecutándose...');
      console.log('👤 Usuario:', req.user);
      
      // Probar la consulta que falla
      const expedientes = await this.casesService.findAll(req.user.id, req.user.role);
      
      return {
        success: true,
        message: 'Test con auth exitoso',
        expedientesCount: expedientes.length,
        user: {
          id: req.user.id,
          role: req.user.role
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error en test con auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const errorStack = error instanceof Error ? error.stack : 'Stack no disponible';
      
      return {
        success: false,
        message: 'Test con auth falló',
        error: errorMessage,
        stack: errorStack,
        user: req.user,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('debug/public')
  @ApiOperation({ 
    summary: 'Debug público',
    description: 'Endpoint de debug completamente público'
  })
  @ApiResponse({ status: 200, description: 'Debug público' })
  async debugPublic() {
    return {
      status: 'ok',
      message: 'Debug público funcionando',
      timestamp: new Date().toISOString(),
      endpoint: '/api/cases/debug/public',
      public: true
    };
  }

  @Get('debug/db')
  @ApiOperation({ 
    summary: 'Debug de base de datos',
    description: 'Test de conexión a base de datos sin autenticación'
  })
  @ApiResponse({ status: 200, description: 'Debug de BD' })
  async debugDatabase() {
    try {
      const result = await this.casesService.testDatabaseConnection();
      return {
        status: 'ok',
        message: 'Conexión a BD exitosa',
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return {
        status: 'error',
        message: 'Error en conexión a BD',
        error: errorMessage,
        timestamp: new Date().toISOString()
      };
    }
  }
} 