import { Injectable, Logger } from '@nestjs/common';
import { generateFacturaeXML, FacturaeDocument, FacturaeInvoice } from './facturae-xml.util';
import { 
  signFacturaeXMLAdvanced, 
  XAdESLevel, 
  SigningOptions, 
  validateCertificate, 
  validateSignature,
  checkCertificateStatus,
  getTimestamp,
  CertificateInfo 
} from './xades-sign.util';
import { FacturaeValidator, ValidationResult } from './facturae-validator.util';
import * as fs from 'fs';
import * as path from 'path';

export interface FacturaeConfig {
  certificatePath: string;
  privateKeyPath: string;
  tsaUrl?: string;
  ocspUrl?: string;
  xadesLevel: XAdESLevel;
  outputPath: string;
}

export interface FacturaeGenerationResult {
  success: boolean;
  xmlContent?: string;
  signedXmlContent?: string;
  validationResult?: ValidationResult;
  errors?: string[];
  warnings?: string[];
}

@Injectable()
export class FacturaeService {
  private readonly logger = new Logger(FacturaeService.name);
  private config: FacturaeConfig;

  constructor() {
    // Configuración por defecto
    this.config = {
      certificatePath: process.env.FACTURAE_CERT_PATH || './certs/certificate.pem',
      privateKeyPath: process.env.FACTURAE_KEY_PATH || './certs/private_key.pem',
      tsaUrl: process.env.FACTURAE_TSA_URL,
      ocspUrl: process.env.FACTURAE_OCSP_URL,
      xadesLevel: XAdESLevel.BES,
      outputPath: process.env.FACTURAE_OUTPUT_PATH || './output'
    };
  }

  /**
   * Configura el servicio de facturación electrónica
   */
  setConfig(config: Partial<FacturaeConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Genera y firma una factura electrónica completa
   */
  async generateAndSignInvoice(
    invoiceData: FacturaeDocument,
    options: Partial<SigningOptions> = {}
  ): Promise<FacturaeGenerationResult> {
    try {
      this.logger.log('Iniciando generación de factura electrónica');

      // 1. Generar XML Facturae
      const xmlContent = generateFacturaeXML(invoiceData);
      this.logger.log('XML Facturae generado correctamente');

      // 2. Validar XML antes de firmar
      const validationResult = FacturaeValidator.validateXML(xmlContent, {
        validateSchema: true,
        validateBusinessRules: true,
        strictMode: false
      });

      if (!validationResult.isValid) {
        this.logger.warn('XML generado tiene errores de validación', validationResult.errors);
      }

      // 3. Cargar certificado y clave privada
      const certPem = await this.loadCertificate();
      const keyPem = await this.loadPrivateKey();

      // 4. Validar certificado
      const certInfo = validateCertificate(certPem);
      if (!certInfo.isValid) {
        throw new Error(`Certificado no válido: ${certInfo.subject}`);
      }

      // 5. Configurar opciones de firma
      const signingOptions: SigningOptions = {
        level: this.config.xadesLevel,
        tsaUrl: this.config.tsaUrl,
        ocspUrl: this.config.ocspUrl,
        ...options
      };

      // 6. Firmar XML
      const signedXmlContent = await signFacturaeXMLAdvanced(
        xmlContent,
        certPem,
        keyPem,
        signingOptions
      );

      this.logger.log('Factura firmada correctamente');

      // 7. Validar firma
      const isSignatureValid = validateSignature(signedXmlContent);
      if (!isSignatureValid) {
        throw new Error('La firma digital no es válida');
      }

      // 8. Guardar archivos
      await this.saveInvoiceFiles(invoiceData, xmlContent, signedXmlContent);

      return {
        success: true,
        xmlContent,
        signedXmlContent,
        validationResult,
        warnings: validationResult.warnings
      };

    } catch (error) {
      this.logger.error('Error al generar factura electrónica', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Genera solo el XML sin firmar
   */
  async generateInvoiceXML(invoiceData: FacturaeDocument): Promise<FacturaeGenerationResult> {
    try {
      this.logger.log('Generando XML de factura sin firma');

      const xmlContent = generateFacturaeXML(invoiceData);
      
      const validationResult = FacturaeValidator.validateXML(xmlContent, {
        validateSchema: true,
        validateBusinessRules: true,
        strictMode: false
      });

      return {
        success: true,
        xmlContent,
        validationResult,
        warnings: validationResult.warnings
      };

    } catch (error) {
      this.logger.error('Error al generar XML de factura', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Firma un XML existente
   */
  async signExistingXML(
    xmlContent: string,
    options: Partial<SigningOptions> = {}
  ): Promise<FacturaeGenerationResult> {
    try {
      this.logger.log('Firmando XML existente');

      // Validar XML antes de firmar
      const validationResult = FacturaeValidator.validateXML(xmlContent);
      if (!validationResult.isValid) {
        throw new Error(`XML inválido: ${validationResult.errors.join(', ')}`);
      }

      // Cargar certificado y clave
      const certPem = await this.loadCertificate();
      const keyPem = await this.loadPrivateKey();

      // Configurar opciones de firma
      const signingOptions: SigningOptions = {
        level: this.config.xadesLevel,
        tsaUrl: this.config.tsaUrl,
        ocspUrl: this.config.ocspUrl,
        ...options
      };

      // Firmar
      const signedXmlContent = await signFacturaeXMLAdvanced(
        xmlContent,
        certPem,
        keyPem,
        signingOptions
      );

      return {
        success: true,
        xmlContent,
        signedXmlContent,
        validationResult
      };

    } catch (error) {
      this.logger.error('Error al firmar XML', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Valida una factura electrónica
   */
  async validateInvoice(xmlContent: string, checkSignature: boolean = true): Promise<ValidationResult> {
    try {
      this.logger.log('Validando factura electrónica');

      if (checkSignature) {
        return FacturaeValidator.validateSignedDocument(xmlContent, {
          validateSchema: true,
          validateBusinessRules: true,
          strictMode: false
        });
      } else {
        return FacturaeValidator.validateXML(xmlContent, {
          validateSchema: true,
          validateBusinessRules: true,
          strictMode: false
        });
      }

    } catch (error) {
      this.logger.error('Error al validar factura', error);
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        warnings: []
      };
    }
  }

  /**
   * Verifica el estado de un certificado
   */
  async checkCertificateStatus(): Promise<{ isValid: boolean; info: CertificateInfo; ocspValid?: boolean }> {
    try {
      const certPem = await this.loadCertificate();
      const certInfo = validateCertificate(certPem);

      let ocspValid: boolean | undefined;
      if (this.config.ocspUrl) {
        ocspValid = await checkCertificateStatus(certPem, this.config.ocspUrl);
      }

      return {
        isValid: certInfo.isValid,
        info: certInfo,
        ocspValid
      };

    } catch (error) {
      this.logger.error('Error al verificar certificado', error);
      return {
        isValid: false,
        info: {
          subject: 'Error',
          issuer: 'Error',
          serialNumber: 'Error',
          validFrom: new Date(),
          validTo: new Date(),
          isValid: false
        }
      };
    }
  }

  /**
   * Obtiene información del certificado
   */
  async getCertificateInfo(): Promise<CertificateInfo> {
    try {
      const certPem = await this.loadCertificate();
      return validateCertificate(certPem);
    } catch (error) {
      this.logger.error('Error al obtener información del certificado', error);
      throw error;
    }
  }

  /**
   * Carga el certificado desde archivo
   */
  private async loadCertificate(): Promise<string> {
    try {
      if (!fs.existsSync(this.config.certificatePath)) {
        throw new Error(`Certificado no encontrado en: ${this.config.certificatePath}`);
      }
      return fs.readFileSync(this.config.certificatePath, 'utf8');
    } catch (error) {
      this.logger.error('Error al cargar certificado', error);
      throw error;
    }
  }

  /**
   * Carga la clave privada desde archivo
   */
  private async loadPrivateKey(): Promise<string> {
    try {
      if (!fs.existsSync(this.config.privateKeyPath)) {
        throw new Error(`Clave privada no encontrada en: ${this.config.privateKeyPath}`);
      }
      return fs.readFileSync(this.config.privateKeyPath, 'utf8');
    } catch (error) {
      this.logger.error('Error al cargar clave privada', error);
      throw error;
    }
  }

  /**
   * Guarda los archivos de factura
   */
  private async saveInvoiceFiles(
    invoiceData: FacturaeDocument,
    xmlContent: string,
    signedXmlContent: string
  ): Promise<void> {
    try {
      // Crear directorio de salida si no existe
      if (!fs.existsSync(this.config.outputPath)) {
        fs.mkdirSync(this.config.outputPath, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const invoiceNumber = invoiceData.part.invoices[0]?.invoiceHeader.invoiceNumber || 'FAC-001';

      // Guardar XML sin firma
      const xmlPath = path.join(this.config.outputPath, `${invoiceNumber}_${timestamp}.xml`);
      fs.writeFileSync(xmlPath, xmlContent, 'utf8');

      // Guardar XML firmado
      const signedXmlPath = path.join(this.config.outputPath, `${invoiceNumber}_${timestamp}_signed.xml`);
      fs.writeFileSync(signedXmlPath, signedXmlContent, 'utf8');

      this.logger.log(`Archivos guardados en: ${this.config.outputPath}`);

    } catch (error) {
      this.logger.error('Error al guardar archivos', error);
      throw error;
    }
  }

  /**
   * Genera un reporte de validación
   */
  async generateValidationReport(xmlContent: string): Promise<string> {
    try {
      const validationResult = await this.validateInvoice(xmlContent, true);
      const certInfo = await this.getCertificateInfo();

      let report = '=== REPORTE DE VALIDACIÓN FACTURAE ===\n\n';
      
      // Información del certificado
      report += 'CERTIFICADO DIGITAL:\n';
      report += `- Sujeto: ${certInfo.subject}\n`;
      report += `- Emisor: ${certInfo.issuer}\n`;
      report += `- Número de serie: ${certInfo.serialNumber}\n`;
      report += `- Válido desde: ${certInfo.validFrom.toISOString()}\n`;
      report += `- Válido hasta: ${certInfo.validTo.toISOString()}\n`;
      report += `- Estado: ${certInfo.isValid ? 'VÁLIDO' : 'INVÁLIDO'}\n\n`;

      // Resultado de validación
      report += 'VALIDACIÓN XML:\n';
      report += `- Estado: ${validationResult.isValid ? 'VÁLIDO' : 'INVÁLIDO'}\n`;
      
      if (validationResult.errors.length > 0) {
        report += '- Errores:\n';
        validationResult.errors.forEach(error => {
          report += `  * ${error}\n`;
        });
      }

      if (validationResult.warnings.length > 0) {
        report += '- Advertencias:\n';
        validationResult.warnings.forEach(warning => {
          report += `  * ${warning}\n`;
        });
      }

      return report;

    } catch (error) {
      this.logger.error('Error al generar reporte', error);
      return `Error al generar reporte: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
} 