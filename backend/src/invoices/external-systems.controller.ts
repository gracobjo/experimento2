import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ExternalSystemsService } from './external-systems.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sistemas Externos - Facturación')
@ApiBearerAuth()
@Controller('external-systems')
@UseGuards(JwtAuthGuard)
export class ExternalSystemsController {
  constructor(private readonly externalSystemsService: ExternalSystemsService) {}

  /**
   * Envía una factura a un sistema externo
   */
  @Post(':invoiceId/send/:system')
  @ApiOperation({
    summary: 'Enviar factura a sistema externo',
    description: 'Envía una factura firmada a un sistema externo (AEAT, FACE, etc.)'
  })
  @ApiParam({
    name: 'invoiceId',
    description: 'ID de la factura a enviar',
    type: 'string'
  })
  @ApiParam({
    name: 'system',
    description: 'Sistema externo destino',
    enum: ['AEAT', 'FACE', 'GENERAL'],
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Factura enviada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        system: { type: 'string' },
        message: { type: 'string' },
        externalId: { type: 'string' },
        responseData: { type: 'object' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Error en el envío',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        system: { type: 'string' },
        message: { type: 'string' },
        errors: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async sendToExternalSystem(
    @Param('invoiceId') invoiceId: string,
    @Param('system') system: 'AEAT' | 'FACE' | 'GENERAL'
  ) {
    return await this.externalSystemsService.sendToExternalSystem(invoiceId, system);
  }

  /**
   * Valida una factura para un sistema externo
   */
  @Get(':invoiceId/validate/:system')
  @ApiOperation({
    summary: 'Validar factura para sistema externo',
    description: 'Valida una factura para asegurar que cumple los requisitos de un sistema externo'
  })
  @ApiParam({
    name: 'invoiceId',
    description: 'ID de la factura a validar',
    type: 'string'
  })
  @ApiParam({
    name: 'system',
    description: 'Sistema externo para validar',
    enum: ['AEAT', 'FACE', 'GENERAL'],
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la validación',
    schema: {
      type: 'object',
      properties: {
        system: { type: 'string' },
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } },
        requirements: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async validateForExternalSystem(
    @Param('invoiceId') invoiceId: string,
    @Param('system') system: 'AEAT' | 'FACE' | 'GENERAL'
  ) {
    return await this.externalSystemsService.validateForExternalSystem(invoiceId, system);
  }

  /**
   * Prueba la conectividad con un sistema externo
   */
  @Get('test-connectivity/:system')
  @ApiOperation({
    summary: 'Probar conectividad con sistema externo',
    description: 'Prueba la conectividad con un sistema externo específico'
  })
  @ApiParam({
    name: 'system',
    description: 'Sistema externo a probar',
    enum: ['AEAT', 'FACE', 'GENERAL'],
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la prueba de conectividad',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        system: { type: 'string' },
        message: { type: 'string' },
        details: { type: 'object' }
      }
    }
  })
  async testConnectivity(@Param('system') system: string) {
    return await this.externalSystemsService.testConnectivity(system);
  }

  /**
   * Obtiene el estado de una factura en un sistema externo
   */
  @Get(':invoiceId/status/:system')
  @ApiOperation({
    summary: 'Consultar estado en sistema externo',
    description: 'Consulta el estado de una factura en un sistema externo'
  })
  @ApiParam({
    name: 'invoiceId',
    description: 'ID de la factura',
    type: 'string'
  })
  @ApiParam({
    name: 'system',
    description: 'Sistema externo',
    enum: ['AEAT', 'FACE', 'GENERAL'],
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de la factura',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        system: { type: 'string' },
        status: { type: 'string' },
        message: { type: 'string' },
        details: { type: 'object' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async getExternalStatus(
    @Param('invoiceId') invoiceId: string,
    @Param('system') system: string
  ) {
    return await this.externalSystemsService.getExternalStatus(invoiceId, system);
  }

  /**
   * Lista los sistemas externos disponibles
   */
  @Get('available')
  @ApiOperation({
    summary: 'Sistemas externos disponibles',
    description: 'Lista todos los sistemas externos configurados'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sistemas disponibles',
    schema: {
      type: 'object',
      properties: {
        systems: { 
          type: 'array', 
          items: { type: 'string' },
          example: ['AEAT', 'FACE', 'GENERAL']
        }
      }
    }
  })
  async getAvailableSystems() {
    const systems = this.externalSystemsService.getAvailableSystems();
    return { systems };
  }

  /**
   * Obtiene la configuración de un sistema externo
   */
  @Get('config/:system')
  @ApiOperation({
    summary: 'Configuración de sistema externo',
    description: 'Obtiene la configuración de un sistema externo específico'
  })
  @ApiParam({
    name: 'system',
    description: 'Sistema externo',
    enum: ['AEAT', 'FACE', 'GENERAL'],
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración del sistema',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        url: { type: 'string' },
        timeout: { type: 'number' },
        retries: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Sistema no encontrado' })
  async getSystemConfig(@Param('system') system: string) {
    const config = this.externalSystemsService.getSystemConfig(system);
    if (!config) {
      return { error: 'Sistema no encontrado' };
    }
    
    // No devolver información sensible como API keys
    return {
      name: config.name,
      url: config.url,
      timeout: config.timeout,
      retries: config.retries
    };
  }

  /**
   * Envía múltiples facturas a un sistema externo
   */
  @Post('batch-send/:system')
  @ApiOperation({
    summary: 'Envío masivo a sistema externo',
    description: 'Envía múltiples facturas a un sistema externo'
  })
  @ApiParam({
    name: 'system',
    description: 'Sistema externo destino',
    enum: ['AEAT', 'FACE', 'GENERAL'],
    type: 'string'
  })
  @ApiBody({
    description: 'IDs de facturas a enviar',
    schema: {
      type: 'object',
      properties: {
        invoiceIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de IDs de facturas'
        }
      },
      required: ['invoiceIds']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado del envío masivo',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        system: { type: 'string' },
        total: { type: 'number' },
        successful: { type: 'number' },
        failed: { type: 'number' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              invoiceId: { type: 'string' },
              success: { type: 'boolean' },
              message: { type: 'string' },
              externalId: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async batchSendToExternalSystem(
    @Param('system') system: 'AEAT' | 'FACE' | 'GENERAL',
    @Body() data: { invoiceIds: string[] }
  ) {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const invoiceId of data.invoiceIds) {
      try {
        const result = await this.externalSystemsService.sendToExternalSystem(invoiceId, system);
        results.push({
          invoiceId,
          success: result.success,
          message: result.message,
          externalId: result.externalId
        });

        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      } catch (error) {
        results.push({
          invoiceId,
          success: false,
          message: error instanceof Error ? error.message : String(error)
        });
        failed++;
      }
    }

    return {
      success: failed === 0,
      system,
      total: data.invoiceIds.length,
      successful,
      failed,
      results
    };
  }
} 