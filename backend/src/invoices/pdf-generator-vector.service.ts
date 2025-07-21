import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

@Injectable()
export class PdfGeneratorVectorService {
  private readonly logger = new Logger(PdfGeneratorVectorService.name);

  /**
   * Genera un PDF profesional de la factura usando texto vectorial
   */
  async generateInvoicePdf(invoice: any): Promise<Buffer> {
    try {
      this.logger.log('Iniciando generación de PDF con texto vectorial');

      // 1. Generar QR
      const qrData = [
        `NIF:${invoice.emisor?.email || ''}`,
        `NUM:${invoice.numeroFactura || ''}`,
        `FEC:${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}`,
        `IMP:${invoice.importeTotal || ''}`
      ].join('|');

      const qrImageDataUrl = await QRCode.toDataURL(qrData, { 
        errorCorrectionLevel: 'M', 
        width: 150,
        margin: 2
      });

      // 2. Crear PDF con texto vectorial
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();

      // 3. Configurar fuentes
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // 4. Dibujar encabezado
      page.drawText('FACTURA', {
        x: 50,
        y: height - 50,
        size: 24,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });

      // 5. Información de la factura
      let yPosition = height - 100;
      const lineHeight = 20;

      page.drawText(`Número: ${invoice.numeroFactura || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      page.drawText(`Fecha: ${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      // 6. Información del emisor
      yPosition -= 10;
      page.drawText('EMISOR:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      page.drawText(`Nombre: ${invoice.emisor?.nombre || invoice.emisor?.name || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      page.drawText(`Email: ${invoice.emisor?.email || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      // 7. Información del receptor
      yPosition -= 10;
      page.drawText('RECEPTOR:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      page.drawText(`Nombre: ${invoice.receptor?.nombre || invoice.receptor?.name || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      page.drawText(`Email: ${invoice.receptor?.email || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      // 8. Detalles de la factura
      yPosition -= 20;
      page.drawText('DETALLES DE LA FACTURA:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      // 9. Items
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item: any, index: number) => {
          const description = item.description || item.descripcion || 'Sin descripción';
          const quantity = item.quantity || item.cantidad || 0;
          const unitPrice = item.unitPrice || item.precioUnitario || 0;
          const total = item.total || (quantity * unitPrice);

          page.drawText(`${index + 1}. ${description}`, {
            x: 50,
            y: yPosition,
            size: 12,
            font: helveticaFont,
            color: rgb(0, 0, 0)
          });
          yPosition -= lineHeight;

          page.drawText(`   Cantidad: ${quantity} x ${unitPrice.toFixed(2)} EUR = ${total.toFixed(2)} EUR`, {
            x: 70,
            y: yPosition,
            size: 11,
            font: helveticaFont,
            color: rgb(0, 0, 0)
          });
          yPosition -= lineHeight;
        });
      } else {
        page.drawText('No hay items en esta factura', {
          x: 50,
          y: yPosition,
          size: 12,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5)
        });
        yPosition -= lineHeight;
      }

      // 10. Totales
      yPosition -= 20;
      page.drawText('TOTALES:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      page.drawText(`Importe Total: ${invoice.importeTotal || 0} EUR`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      // 11. Estado
      page.drawText(`Estado: ${invoice.estado || 'EMITIDA'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0)
      });
      yPosition -= lineHeight;

      // 12. QR Code (en la esquina superior derecha)
      try {
        const qrImageBase64 = qrImageDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrImageBytes = Buffer.from(qrImageBase64, 'base64');
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        
        page.drawImage(qrImage, {
          x: width - 170,
          y: height - 170,
          width: 120,
          height: 120,
        });

        page.drawText('Verifica esta factura escaneando el QR', {
          x: width - 200,
          y: height - 190,
          size: 8,
          font: helveticaFont,
          color: rgb(0.5, 0.5, 0.5)
        });
      } catch (error) {
        this.logger.warn('No se pudo insertar el QR en el PDF:', error);
      }

      // 13. Pie de página
      page.drawText(`Generado el: ${new Date().toLocaleString('es-ES')}`, {
        x: 50,
        y: 50,
        size: 10,
        font: helveticaFont,
        color: rgb(0.5, 0.5, 0.5)
      });

      // 14. Finalizar PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      this.logger.log('PDF generado exitosamente con texto vectorial');
      return pdfBuffer;

    } catch (error) {
      this.logger.error('Error generando PDF con texto vectorial:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error generando PDF: ${errorMessage}`);
    }
  }
} 