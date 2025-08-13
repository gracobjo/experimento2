import { Injectable, Logger } from '@nestjs/common';
import { CloudinaryStorageService } from '../storage/cloudinary-storage.service';
import { ConfigService } from '@nestjs/config';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoiceStorageService {
  private readonly logger = new Logger(InvoiceStorageService.name);

  constructor(
    private cloudinaryStorage: CloudinaryStorageService,
    private configService: ConfigService
  ) {}

  /**
   * Genera un PDF de factura y lo sube a Cloudinary
   */
  async generateAndStoreInvoicePDF(invoiceData: any): Promise<{ url: string; publicId: string }> {
    try {
      this.logger.log(`Generando PDF para factura: ${invoiceData.invoiceNumber}`);

      // Generar PDF usando PDFKit
      const pdfBuffer = await this.generateInvoicePDF(invoiceData);

      // Crear un archivo temporal para subir a Cloudinary
      const tempFile = {
        buffer: pdfBuffer,
        originalname: `${invoiceData.invoiceNumber}.pdf`,
        mimetype: 'application/pdf',
        size: pdfBuffer.length,
        path: null, // Cloudinary puede manejar buffers directamente
        fieldname: 'invoice',
        encoding: '7bit',
        stream: null,
        destination: null,
        filename: `${invoiceData.invoiceNumber}.pdf`
      } as any;

      // Subir a Cloudinary
      const uploadResult = await this.cloudinaryStorage.uploadFile(
        tempFile,
        `experimento2/facturas/${invoiceData.expedienteId}`,
        {
          invoiceId: invoiceData.id,
          expedienteId: invoiceData.expedienteId,
          invoiceNumber: invoiceData.invoiceNumber,
          type: 'invoice_pdf'
        }
      );

      this.logger.log(`Factura subida a Cloudinary: ${uploadResult.publicId}`);

      return {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      };

    } catch (error) {
      this.logger.error(`Error generando/subiendo factura: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Genera el PDF de la factura usando PDFKit
   */
  private async generateInvoicePDF(invoiceData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        // Encabezado
        doc.fontSize(20)
           .text('Despacho Legal', { align: 'center' })
           .fontSize(12)
           .text('Servicios Jurídicos Profesionales', { align: 'center' })
           .text('Especialistas en Derecho Civil y Mercantil', { align: 'center' })
           .moveDown();

        // Información del emisor y receptor
        doc.fontSize(14)
           .text('EMISOR', { underline: true })
           .fontSize(10)
           .text(`Nombre: ${invoiceData.lawyer?.name || 'Abogado'}`)
           .text(`Email: ${invoiceData.lawyer?.email || 'lawyer@example.com'}`)
           .text('Régimen IVA: General')
           .moveDown();

        doc.fontSize(14)
           .text('RECEPTOR', { underline: true })
           .fontSize(10)
           .text(`Nombre: ${invoiceData.client?.name || 'Cliente'}`)
           .text(`Email: ${invoiceData.client?.email || 'client@example.com'}`)
           .moveDown();

        // Información de la factura
        doc.fontSize(14)
           .text(`Expediente: ${invoiceData.expediente?.title || 'N/A'}`, { underline: true })
           .fontSize(12)
           .text(`FACTURA ${invoiceData.invoiceNumber}`)
           .text(`Fecha de Factura: ${new Date(invoiceData.issueDate).toLocaleDateString('es-ES')} emitida`)
           .text(`Fecha de Operación: ${new Date(invoiceData.operationDate).toLocaleDateString('es-ES')}`)
           .text(`Fecha de Creación: ${new Date(invoiceData.creationDate).toLocaleDateString('es-ES')}`)
           .moveDown();

        // Tabla de items
        doc.fontSize(14)
           .text('Descripción', 50, doc.y)
           .text('Cantidad', 300, doc.y)
           .text('Precio Unitario', 400, doc.y)
           .text('Total', 500, doc.y)
           .moveDown();

        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();

        // Items de la factura
        if (invoiceData.items && invoiceData.items.length > 0) {
          invoiceData.items.forEach((item: any) => {
            doc.fontSize(10)
               .text(item.description, 50, doc.y)
               .text(item.quantity.toString(), 300, doc.y)
               .text(`${item.unitPrice.toFixed(2)} €`, 400, doc.y)
               .text(`${item.total.toFixed(2)} €`, 500, doc.y)
               .moveDown();
          });
        } else {
          // Item por defecto
          doc.fontSize(10)
             .text('Servicios legales', 50, doc.y)
             .text('1', 300, doc.y)
             .text(`${invoiceData.subtotal.toFixed(2)} €`, 400, doc.y)
             .text(`${invoiceData.subtotal.toFixed(2)} €`, 500, doc.y)
             .moveDown();
        }

        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown();

        // Totales
        doc.fontSize(12)
           .text(`Descuento (${((invoiceData.discount / invoiceData.subtotal) * 100).toFixed(0)}%)`, 400, doc.y)
           .text(`-${invoiceData.discount.toFixed(2)} €`, 500, doc.y)
           .moveDown();

        doc.fontSize(14)
           .text(`Base Imponible`, 400, doc.y)
           .text(`${(invoiceData.subtotal - invoiceData.discount).toFixed(2)} €`, 500, doc.y)
           .moveDown();

        doc.text(`IVA (21%)`, 400, doc.y)
           .text(`${invoiceData.taxAmount.toFixed(2)} €`, 500, doc.y)
           .moveDown();

        doc.fontSize(16)
           .text(`TOTAL`, 400, doc.y)
           .text(`${invoiceData.total.toFixed(2)} €`, 500, doc.y)
           .moveDown(2);

        // Pie de página
        doc.fontSize(10)
           .text('Firmado electrónicamente conforme a la ley vigente.', { align: 'center' })
           .text('Código de verificación incluido.', { align: 'center' })
           .text(`Verifica la autenticidad en: https://tudominio.com/verificar/${invoiceData.invoiceNumber}`, { align: 'center' });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtiene la URL de descarga de una factura
   */
  async getInvoiceDownloadUrl(publicId: string): Promise<string> {
    try {
      return await this.cloudinaryStorage.generateDownloadUrl(publicId);
    } catch (error) {
      this.logger.error(`Error obteniendo URL de descarga: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Elimina una factura de Cloudinary
   */
  async deleteInvoice(publicId: string): Promise<void> {
    try {
      await this.cloudinaryStorage.deleteFile(publicId);
      this.logger.log(`Factura eliminada de Cloudinary: ${publicId}`);
    } catch (error) {
      this.logger.error(`Error eliminando factura: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
