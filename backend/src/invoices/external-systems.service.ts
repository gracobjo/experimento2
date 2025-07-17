import { Injectable, Logger } from '@nestjs/common';
import { FacturaeValidator, ExternalSystemValidation } from './facturae-validator.util';
import { InvoicesService } from './invoices.service';

export interface ExternalSystemConfig {
  name: string;
  url: string;
  apiKey?: string;
  username?: string;
  password?: string;
  timeout?: number;
  retries?: number;
}

export interface SendToExternalSystemResult {
  success: boolean;
  system: string;
  message: string;
  externalId?: string;
  errors?: string[];
  warnings?: string[];
  responseData?: any;
}

@Injectable()
export class ExternalSystemsService {
  private readonly logger = new Logger(ExternalSystemsService.name);
  
  private readonly systemConfigs: Map<string, ExternalSystemConfig> = new Map([
    ['AEAT', {
      name: 'AEAT',
      url: process.env.AEAT_URL || 'https://www2.agenciatributaria.gob.es/wlpl/BUGTR/ws/fe/',
      apiKey: process.env.AEAT_API_KEY,
      timeout: 30000,
      retries: 3
    }],
    ['FACE', {
      name: 'FACE',
      url: process.env.FACE_URL || 'https://face.gob.es/webservices/',
      apiKey: process.env.FACE_API_KEY,
      timeout: 30000,
      retries: 3
    }],
    ['GENERAL', {
      name: 'GENERAL',
      url: process.env.GENERAL_SYSTEM_URL || '',
      apiKey: process.env.GENERAL_SYSTEM_API_KEY,
      timeout: 30000,
      retries: 3
    }]
  ]);

  constructor(private readonly invoicesService: InvoicesService) {}

  /**
   * Envía una factura a un sistema externo específico
   */
  async sendToExternalSystem(
    invoiceId: string, 
    system: 'AEAT' | 'FACE' | 'GENERAL'
  ): Promise<SendToExternalSystemResult> {
    try {
      this.logger.log(`Enviando factura ${invoiceId} a ${system}`);

      // Obtener la factura y su XML firmado
      const invoice = await this.invoicesService.findOne(invoiceId);
      if (!invoice) {
        return {
          success: false,
          system,
          message: 'Factura no encontrada',
          errors: ['Factura no encontrada']
        };
      }

      const xmlContent = invoice.xmlFirmado || invoice.xml;
      if (!xmlContent) {
        return {
          success: false,
          system,
          message: 'XML no encontrado',
          errors: ['XML de la factura no encontrado']
        };
      }

      // Validar para el sistema específico
      const validation = FacturaeValidator.validateForExternalSystem(xmlContent, system);
      if (!validation.isValid) {
        return {
          success: false,
          system,
          message: `Validación fallida para ${system}`,
          errors: validation.errors,
          warnings: validation.warnings
        };
      }

      // Enviar al sistema externo
      const config = this.systemConfigs.get(system);
      if (!config) {
        return {
          success: false,
          system,
          message: `Configuración no encontrada para ${system}`,
          errors: [`Configuración no encontrada para ${system}`]
        };
      }

      const sendResult = await this.sendToSystem(xmlContent, config, invoice);
      
      // Actualizar estado de la factura
      if (sendResult.success) {
        await this.updateInvoiceStatus(invoiceId, system, sendResult.externalId);
      }

      return sendResult;

    } catch (error) {
      this.logger.error(`Error enviando factura a ${system}:`, error);
      return {
        success: false,
        system,
        message: `Error enviando a ${system}`,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Envía XML a un sistema específico
   */
  private async sendToSystem(
    xmlContent: string, 
    config: ExternalSystemConfig, 
    invoice: any
  ): Promise<SendToExternalSystemResult> {
    try {
      // Simular envío al sistema externo
      // En una implementación real, aquí se haría la llamada HTTP real
      
      this.logger.log(`Enviando a ${config.name} en ${config.url}`);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular respuesta exitosa
      const externalId = `EXT-${config.name}-${Date.now()}`;
      
      this.logger.log(`Factura enviada exitosamente a ${config.name} con ID: ${externalId}`);
      
      return {
        success: true,
        system: config.name,
        message: `Factura enviada exitosamente a ${config.name}`,
        externalId,
        responseData: {
          externalId,
          timestamp: new Date().toISOString(),
          status: 'ACCEPTED'
        }
      };

    } catch (error) {
      this.logger.error(`Error enviando a ${config.name}:`, error);
      return {
        success: false,
        system: config.name,
        message: `Error enviando a ${config.name}`,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Actualiza el estado de la factura tras el envío
   */
  private async updateInvoiceStatus(
    invoiceId: string, 
    system: string, 
    externalId?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        estado: 'enviada',
        sistemaEnvio: system,
        fechaEnvio: new Date()
      };

      if (externalId) {
        updateData.externalId = externalId;
      }

      await this.invoicesService.update(invoiceId, updateData);
      
      this.logger.log(`Estado de factura ${invoiceId} actualizado a enviada`);
    } catch (error) {
      this.logger.error(`Error actualizando estado de factura ${invoiceId}:`, error);
    }
  }

  /**
   * Valida una factura para un sistema específico sin enviarla
   */
  async validateForExternalSystem(
    invoiceId: string, 
    system: 'AEAT' | 'FACE' | 'GENERAL'
  ): Promise<ExternalSystemValidation> {
    try {
      const invoice = await this.invoicesService.findOne(invoiceId);
      if (!invoice) {
        return {
          system,
          isValid: false,
          errors: ['Factura no encontrada'],
          warnings: [],
          requirements: []
        };
      }

      const xmlContent = invoice.xmlFirmado || invoice.xml;
      if (!xmlContent) {
        return {
          system,
          isValid: false,
          errors: ['XML de la factura no encontrado'],
          warnings: [],
          requirements: []
        };
      }

      return FacturaeValidator.validateForExternalSystem(xmlContent, system);

    } catch (error) {
      this.logger.error(`Error validando factura para ${system}:`, error);
      return {
        system,
        isValid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: [],
        requirements: []
      };
    }
  }

  /**
   * Obtiene la configuración de un sistema
   */
  getSystemConfig(system: string): ExternalSystemConfig | undefined {
    return this.systemConfigs.get(system);
  }

  /**
   * Lista todos los sistemas disponibles
   */
  getAvailableSystems(): string[] {
    return Array.from(this.systemConfigs.keys());
  }

  /**
   * Verifica la conectividad con un sistema externo
   */
  async testConnectivity(system: string): Promise<{
    success: boolean;
    system: string;
    message: string;
    details?: any;
  }> {
    try {
      const config = this.systemConfigs.get(system);
      if (!config) {
        return {
          success: false,
          system,
          message: `Configuración no encontrada para ${system}`
        };
      }

      // Simular test de conectividad
      // En una implementación real, aquí se haría un ping o health check
      
      this.logger.log(`Probando conectividad con ${system} en ${config.url}`);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        system,
        message: `Conectividad exitosa con ${system}`,
        details: {
          url: config.url,
          timeout: config.timeout,
          retries: config.retries
        }
      };

    } catch (error) {
      this.logger.error(`Error probando conectividad con ${system}:`, error);
      return {
        success: false,
        system,
        message: `Error de conectividad con ${system}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Obtiene el estado de una factura en un sistema externo
   */
  async getExternalStatus(
    invoiceId: string, 
    system: string
  ): Promise<{
    success: boolean;
    system: string;
    status?: string;
    message: string;
    details?: any;
  }> {
    try {
      const invoice = await this.invoicesService.findOne(invoiceId);
      if (!invoice || !invoice.externalId) {
        return {
          success: false,
          system,
          message: 'Factura no encontrada o sin ID externo'
        };
      }

      // Simular consulta de estado
      // En una implementación real, aquí se consultaría el estado real
      
      this.logger.log(`Consultando estado de factura ${invoice.externalId} en ${system}`);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        system,
        status: 'ACCEPTED',
        message: `Estado consultado exitosamente`,
        details: {
          externalId: invoice.externalId,
          status: 'ACCEPTED',
          timestamp: new Date().toISOString(),
          system: system
        }
      };

    } catch (error) {
      this.logger.error(`Error consultando estado en ${system}:`, error);
      return {
        success: false,
        system,
        message: `Error consultando estado: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
} 