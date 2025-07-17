import { Controller, Post, Get, Param, Body, UseGuards, Request, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { XAdESLevel, SigningOptions } from './xades-sign.util';

@ApiTags('Facturación Electrónica - Facturae')
@ApiBearerAuth()
@Controller('facturae')
@UseGuards(JwtAuthGuard)
export class FacturaeController {
  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Genera y firma una factura electrónica con XAdES avanzado
   */
  @Post(':id/generate-and-sign')
  @ApiOperation({
    summary: 'Generar y firmar factura electrónica',
    description: 'Genera el XML Facturae 3.2.2 y lo firma digitalmente con XAdES avanzado'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la factura a firmar',
    type: 'string'
  })
  @ApiBody({
    description: 'Opciones de firma digital',
    schema: {
      type: 'object',
      properties: {
        level: {
          type: 'string',
          enum: ['BES', 'T', 'C', 'X', 'XL'],
          description: 'Nivel XAdES de firma digital',
          default: 'BES'
        },
        tsaUrl: {
          type: 'string',
          description: 'URL del servidor TSA para sellos de tiempo',
          example: 'https://tsa.example.com/timestamp'
        },
        ocspUrl: {
          type: 'string',
          description: 'URL del servidor OCSP para validación de certificados',
          example: 'https://ocsp.example.com'
        },
        policy: {
          type: 'string',
          description: 'Política de firma',
          example: 'urn:oid:2.16.724.1.3.1.1.2.1.9'
        },
        signerRole: {
          type: 'string',
          description: 'Rol del firmante',
          example: 'Emisor'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Factura generada y firmada exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        xmlContent: { type: 'string', description: 'XML sin firma' },
        signedXmlContent: { type: 'string', description: 'XML firmado' },
        validationResult: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean' },
            errors: { type: 'array', items: { type: 'string' } },
            warnings: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la generación o firma',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async generateAndSignInvoiceAdvanced(
    @Param('id') id: string,
    @Body() options: {
      level?: XAdESLevel;
      tsaUrl?: string;
      ocspUrl?: string;
      policy?: string;
      signerRole?: string;
    } = {}
  ) {
    const signingOptions: Partial<SigningOptions> = {
      level: options.level || XAdESLevel.BES,
      tsaUrl: options.tsaUrl,
      ocspUrl: options.ocspUrl,
      policy: options.policy,
      signerRole: options.signerRole
    };

    return await this.invoicesService.generateAndSignInvoiceAdvanced(id, signingOptions);
  }

  /**
   * Valida una factura electrónica
   */
  @Get(':id/validate')
  @ApiOperation({
    summary: 'Validar factura electrónica',
    description: 'Valida el XML Facturae y opcionalmente la firma digital'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la factura a validar',
    type: 'string'
  })
  @ApiQuery({
    name: 'signature',
    description: 'Validar también la firma digital',
    type: 'boolean',
    required: false,
    example: true
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la validación',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async validateInvoice(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const checkSignature = req.query.signature !== 'false';
    return await this.invoicesService.validateInvoice(id, checkSignature);
  }

  /**
   * Descargar XML firmado
   */
  @Get(':id/download')
  @ApiOperation({
    summary: 'Descargar XML firmado',
    description: 'Descarga el XML Facturae firmado como archivo'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la factura',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo XML descargado',
    content: {
      'application/xml': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Factura o XML no encontrado' })
  async downloadSignedXML(
    @Param('id') id: string,
    @Res() res: Response
  ) {
    try {
      const invoice = await this.invoicesService.findOne(id);
      if (!invoice || !invoice.xmlFirmado) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Factura o XML firmado no encontrado'
        });
      }

      const filename = `factura_${invoice.numeroFactura}_firmada.xml`;
      
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(invoice.xmlFirmado, 'utf8'));
      
      return res.send(invoice.xmlFirmado);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al descargar el archivo',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Obtiene información del certificado
   */
  @Get('certificate/info')
  @ApiOperation({
    summary: 'Información del certificado',
    description: 'Obtiene información detallada del certificado digital'
  })
  @ApiResponse({
    status: 200,
    description: 'Información del certificado',
    schema: {
      type: 'object',
      properties: {
        subject: { type: 'string' },
        issuer: { type: 'string' },
        serialNumber: { type: 'string' },
        validFrom: { type: 'string', format: 'date-time' },
        validTo: { type: 'string', format: 'date-time' },
        isValid: { type: 'boolean' }
      }
    }
  })
  async getCertificateInfo() {
    return await this.invoicesService.getCertificateInfo();
  }

  /**
   * Verifica el estado del certificado
   */
  @Get('certificate/status')
  @ApiOperation({
    summary: 'Estado del certificado',
    description: 'Verifica el estado del certificado mediante OCSP'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del certificado',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        info: {
          type: 'object',
          properties: {
            subject: { type: 'string' },
            issuer: { type: 'string' },
            serialNumber: { type: 'string' },
            validFrom: { type: 'string', format: 'date-time' },
            validTo: { type: 'string', format: 'date-time' },
            isValid: { type: 'boolean' }
          }
        },
        ocspValid: { type: 'boolean' }
      }
    }
  })
  async checkCertificateStatus() {
    return await this.invoicesService.checkCertificateStatus();
  }

  /**
   * Genera un reporte de validación
   */
  @Get(':id/validation-report')
  @ApiOperation({
    summary: 'Reporte de validación',
    description: 'Genera un reporte detallado de validación de la factura'
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la factura',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Reporte de validación',
    schema: {
      type: 'object',
      properties: {
        report: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  async generateValidationReport(@Param('id') id: string) {
    const report = await this.invoicesService.generateValidationReport(id);
    return { report };
  }

  /**
   * Valida un XML Facturae directamente
   */
  @Post('validate-xml')
  @ApiOperation({
    summary: 'Validar XML directamente',
    description: 'Valida un XML Facturae proporcionado directamente'
  })
  @ApiBody({
    description: 'XML a validar',
    schema: {
      type: 'object',
      properties: {
        xml: {
          type: 'string',
          description: 'Contenido XML de la factura',
          example: '<Facturae xmlns="http://www.facturae.es/Facturae/2014/v3.2.2/Facturae">...</Facturae>'
        },
        checkSignature: {
          type: 'boolean',
          description: 'Validar también la firma digital',
          default: true
        }
      },
      required: ['xml']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la validación',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
        warnings: { type: 'array', items: { type: 'string' } }
      }
    }
  })
  async validateXML(
    @Body() data: { xml: string; checkSignature?: boolean }
  ) {
    const { xml, checkSignature = true } = data;
    
    // Importar el validador directamente
    const { FacturaeValidator } = await import('./facturae-validator.util');
    
    if (checkSignature) {
      return FacturaeValidator.validateSignedDocument(xml, {
        validateSchema: true,
        validateBusinessRules: true,
        strictMode: false
      });
    } else {
      return FacturaeValidator.validateXML(xml, {
        validateSchema: true,
        validateBusinessRules: true,
        strictMode: false
      });
    }
  }

  /**
   * Obtiene la configuración actual del servicio
   */
  @Get('config')
  @ApiOperation({
    summary: 'Configuración del servicio',
    description: 'Obtiene la configuración actual del servicio Facturae'
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración del servicio',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        note: { type: 'string' }
      }
    }
  })
  async getConfig() {
    return {
      message: 'Configuración del servicio Facturae',
      note: 'La configuración se maneja a través de variables de entorno'
    };
  }

  /**
   * Prueba de conectividad con servicios externos
   */
  @Get('test-connectivity')
  @ApiOperation({
    summary: 'Prueba de conectividad',
    description: 'Prueba la conectividad con servicios externos (TSA, OCSP)'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de conectividad',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        certificate: {
          type: 'object',
          properties: {
            isValid: { type: 'boolean' },
            info: { type: 'object' },
            ocspValid: { type: 'boolean' }
          }
        },
        services: {
          type: 'object',
          properties: {
            tsa: { type: 'string' },
            ocsp: { type: 'string' }
          }
        }
      }
    }
  })
  async testConnectivity() {
    try {
      const certStatus = await this.invoicesService.checkCertificateStatus();
      
      return {
        success: true,
        certificate: certStatus,
        services: {
          tsa: 'Configurado' + (process.env.FACTURAE_TSA_URL ? ' (URL disponible)' : ' (No configurado)'),
          ocsp: 'Configurado' + (process.env.FACTURAE_OCSP_URL ? ' (URL disponible)' : ' (No configurado)')
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
} 