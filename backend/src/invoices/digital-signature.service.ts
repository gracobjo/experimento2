import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface SignatureRequest {
  fileName: string;
  fileContent: string; // Base64
  fileSize: number;
  certificateType: 'FNMT' | 'DNIe' | 'Other';
  userId: string;
  invoiceId: string;
}

export interface SignatureResponse {
  success: boolean;
  signedPdf?: string; // Base64
  signatureInfo?: {
    signer: string;
    timestamp: string;
    certificate: string;
    signatureAlgorithm: string;
  };
  error?: string;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
}

@Injectable()
export class DigitalSignatureService {
  private readonly logger = new Logger(DigitalSignatureService.name);
  private readonly autofirmaUrl = 'http://127.0.0.1:8080';

  /**
   * Firma digitalmente un PDF usando AutoFirma
   */
  async signPdfWithAutoFirma(request: SignatureRequest): Promise<SignatureResponse> {
    try {
      this.logger.log(`Iniciando firma digital de PDF: ${request.fileName}`);

      // 1. Verificar que AutoFirma esté disponible
      await this.checkAutoFirmaStatus();

      // 2. Preparar datos para AutoFirma
      const signatureRequest = {
        fileName: request.fileName,
        fileContent: request.fileContent,
        fileSize: request.fileSize,
        certificateType: request.certificateType,
        userId: request.userId,
        invoiceId: request.invoiceId,
        timestamp: new Date().toISOString()
      };

      // 3. Enviar solicitud a AutoFirma
      this.logger.log('Enviando solicitud de firma a AutoFirma...');
      const response = await axios.post(
        `${this.autofirmaUrl}/afirma-sign-pdf`,
        signatureRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LegalManagementSystem/1.0'
          },
          timeout: 30000 // 30 segundos
        }
      );

      if (response.data.success) {
        this.logger.log('PDF firmado exitosamente');
        return {
          success: true,
          signedPdf: response.data.signedPdf.signedPdf,
          signatureInfo: response.data.signatureInfo
        };
      } else {
        throw new Error(response.data.error || 'Error desconocido en AutoFirma');
      }

    } catch (error) {
      this.logger.error('Error en firma digital:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return {
            success: false,
            error: 'AutoFirma no está disponible. Verifique que esté instalado y ejecutándose.'
          };
        }
        if (error.response?.status === 500) {
          return {
            success: false,
            error: 'Error interno en AutoFirma: ' + (error.response.data?.error || 'Error desconocido')
          };
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido en firma digital'
      };
    }
  }

  /**
   * Verifica el estado del servicio AutoFirma
   */
  async checkAutoFirmaStatus(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.autofirmaUrl}/status`, {
        timeout: 5000
      });
      
      this.logger.log('AutoFirma status:', response.data);
      
      // Verificar que AutoFirma esté instalado y ejecutándose
      if (response.data.autofirma) {
        const { installed, running, available } = response.data.autofirma;
        
        if (!installed) {
          this.logger.error('AutoFirma no está instalado');
          throw new Error('AutoFirma no está instalado en el sistema');
        }
        
        if (!running) {
          this.logger.error('AutoFirma no está ejecutándose');
          throw new Error('AutoFirma no está ejecutándose. Abre AutoFirma manualmente');
        }
        
        if (!available) {
          this.logger.error('AutoFirma no está disponible');
          throw new Error('AutoFirma no está disponible para firmar');
        }
      }
      
      return response.data.status === 'running';
    } catch (error) {
      this.logger.error('Error verificando estado de AutoFirma:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          throw new Error('AutoFirma HTTP Server no está ejecutándose. Ejecuta: node autofirma-http-server.js');
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error(error instanceof Error ? error.message : 'AutoFirma no está disponible');
    }
  }

  /**
   * Obtiene información detallada del estado de AutoFirma
   */
  async getAutoFirmaDetailedStatus(): Promise<any> {
    try {
      const response = await axios.get(`${this.autofirmaUrl}/status`, {
        timeout: 5000
      });
      
      return response.data;
    } catch (error) {
      this.logger.error('Error obteniendo estado detallado de AutoFirma:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return {
            status: 'error',
            autofirma: {
              installed: false,
              running: false,
              available: false,
              error: 'AutoFirma HTTP Server no está ejecutándose'
            },
            message: 'Ejecuta: node autofirma-http-server.js'
          };
        }
      }
      
      return {
        status: 'error',
        autofirma: {
          installed: false,
          running: false,
          available: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        },
        message: 'Error verificando AutoFirma'
      };
    }
  }

  /**
   * Obtiene información del certificado del usuario
   */
  async getCertificateInfo(userId: string): Promise<CertificateInfo | null> {
    try {
      // En un entorno real, aquí se consultaría la base de datos
      // para obtener el certificado asociado al usuario
      
      // Simulación de certificado
      return {
        subject: 'CN=Abogado Demo, OU=Despacho Legal, O=Demo, C=ES',
        issuer: 'CN=AC FNMT Usuarios, O=FNMT, C=ES',
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2025-01-01T00:00:00Z',
        serialNumber: '1234567890ABCDEF'
      };
    } catch (error) {
      this.logger.error('Error obteniendo información del certificado:', error);
      return null;
    }
  }

  /**
   * Valida un PDF firmado
   */
  async validateSignedPdf(signedPdfBase64: string): Promise<boolean> {
    try {
      // En un entorno real, aquí se validaría la firma digital
      // usando bibliotecas como node-forge o similar
      
      this.logger.log('Validando PDF firmado...');
      
      // Simulación de validación
      const pdfBuffer = Buffer.from(signedPdfBase64, 'base64');
      const pdfContent = pdfBuffer.toString();
      
      // Verificar que es un PDF válido con contenido de firma
      const isValid = pdfBuffer.length > 0 && 
                     pdfContent.startsWith('%PDF-1.4') && 
                     pdfContent.includes('FACTURA FIRMADA DIGITALMENTE');
      
      this.logger.log(`PDF firmado válido: ${isValid}`);
      return isValid;
    } catch (error) {
      this.logger.error('Error validando PDF firmado:', error);
      return false;
    }
  }

  /**
   * Guarda el PDF firmado en el sistema de archivos
   */
  async saveSignedPdf(invoiceId: string, signedPdfBase64: string): Promise<string> {
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'signed-invoices');
      
      // Crear directorio si no existe
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `factura_firmada_${invoiceId}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      
      const pdfBuffer = Buffer.from(signedPdfBase64, 'base64');
      fs.writeFileSync(filePath, pdfBuffer);
      
      this.logger.log(`PDF firmado guardado en: ${filePath}`);
      return fileName;
    } catch (error) {
      this.logger.error('Error guardando PDF firmado:', error);
      throw new Error('Error guardando PDF firmado');
    }
  }

  /**
   * Obtiene la URL de descarga de un PDF firmado
   */
  getSignedPdfDownloadUrl(fileName: string): string {
    return `/uploads/signed-invoices/${fileName}`;
  }
} 