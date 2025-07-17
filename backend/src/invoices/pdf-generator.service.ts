import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private templatePath: string;

  constructor() {
    // Buscar el template en múltiples ubicaciones posibles
    const possiblePaths = [
      // Template original con formato profesional
      path.join(process.cwd(), 'src', 'invoices', 'templates', 'invoice-template.html'),
      // En desarrollo
      path.join(__dirname, 'templates', 'invoice-template.html'),
      // En producción (después del build)
      path.join(__dirname, 'invoices', 'templates', 'invoice-template.html'),
      // Ruta absoluta desde el directorio del proyecto
      path.join(process.cwd(), 'dist', 'invoices', 'templates', 'invoice-template.html'),
      // Template simplificado como fallback
      path.join(process.cwd(), 'src', 'invoices', 'templates', 'invoice-template-simple.html')
    ];

    // Encontrar la primera ruta que existe
    for (const templatePath of possiblePaths) {
      if (fs.existsSync(templatePath)) {
        this.templatePath = templatePath;
        this.logger.log(`Template encontrado en: ${this.templatePath}`);
        break;
      }
    }

    if (!this.templatePath) {
      this.logger.error('No se pudo encontrar el template HTML en ninguna ubicación');
      this.logger.error('Rutas buscadas:', possiblePaths);
    }
  }

  /**
   * Genera un PDF profesional de la factura usando el template HTML
   */
  async generateInvoicePdf(invoice: any): Promise<Buffer> {
    try {
      this.logger.log('Iniciando generación de PDF profesional');

      // 1. Generar QR
      const qrData = [
        `NIF:${invoice.emisor?.email || ''}`,
        `NUM:${invoice.numeroFactura || ''}`,
        `FEC:${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}`,
        `IMP:${invoice.importeTotal || ''}`
      ].join('|');

      const qrImageDataUrl = await QRCode.toDataURL(qrData, { 
        errorCorrectionLevel: 'M', 
        width: 200,
        margin: 2
      });

      // 2. Preparar datos para el template
      const templateData = this.prepareTemplateData(invoice, qrData, qrImageDataUrl);

      // 3. Generar HTML con los datos
      const htmlContent = await this.generateHtml(templateData);

      // 4. Convertir HTML a PDF usando Puppeteer
      const pdfBuffer = await this.htmlToPdf(htmlContent);

      this.logger.log('PDF generado exitosamente');
      return pdfBuffer;

    } catch (error) {
      this.logger.error('Error generando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error generando PDF: ${errorMessage}`);
    }
  }

  /**
   * Prepara los datos para el template
   */
  private prepareTemplateData(invoice: any, qrData: string, qrImageDataUrl: string): any {
    this.logger.log('Preparando datos para template. Items recibidos:', invoice.items?.length || 0);
    this.logger.log('Items detallados:', JSON.stringify(invoice.items, null, 2));
    
    // Calcular descuento si existe
    let descuentoCalculado = 0;
    if (invoice.descuento && invoice.descuento > 0) {
      descuentoCalculado = (invoice.items?.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice), 0) || 0) * (invoice.descuento / 100);
    }

    return {
      // Datos básicos
      numeroFactura: invoice.numeroFactura || 'N/A',
      fechaFactura: invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : 'N/A',
      estado: invoice.estado || 'N/A',
      fechaOperacion: invoice.fechaOperacion ? new Date(invoice.fechaOperacion).toISOString().slice(0, 10) : 'N/A',
      metodoPago: invoice.metodoPago || 'N/A',
      claveOperacion: invoice.claveOperacion || 'N/A',
      regimenIvaEmisor: invoice.regimenIvaEmisor || 'N/A',
      tipoIVA: invoice.tipoIVA || 21,
      motivoAnulacion: invoice.motivoAnulacion || null,
      fechaCreacion: new Date(invoice.createdAt).toISOString().slice(0, 10),

      // Totales
      baseImponible: (invoice.baseImponible || 0).toFixed(2),
      cuotaIVA: (invoice.cuotaIVA || 0).toFixed(2),
      importeTotal: (invoice.importeTotal || 0).toFixed(2),
      descuento: invoice.descuento || 0,
      descuentoCalculado: descuentoCalculado.toFixed(2),

      // Emisor
      emisor: {
        nombre: invoice.emisor?.name || 'N/A',
        email: invoice.emisor?.email || 'N/A'
      },

      // Receptor
      receptor: {
        nombre: invoice.receptor?.name || 'N/A',
        email: invoice.receptor?.email || 'N/A'
      },

      // Expediente
      expediente: invoice.expediente ? {
        titulo: invoice.expediente.title
      } : null,

      // Items
      items: (invoice.items || []).map((item: any) => ({
        descripcion: item.description || '',
        cantidad: item.quantity || 0,
        precioUnitario: (item.unitPrice || 0).toFixed(2),
        total: (item.total || 0).toFixed(2)
      })),

      // Provisiones
      provisiones: (invoice.provisionFondos || []).map((provision: any) => ({
        descripcion: provision.description || 'Sin descripción',
        fecha: provision.date ? new Date(provision.date).toISOString().slice(0, 10) : 'N/A',
        importe: (provision.amount || 0).toFixed(2)
      })),

      // QR
      qrData: qrData,
      qrImage: qrImageDataUrl
    };
  }

  /**
   * Genera el HTML con los datos del template
   */
  private async generateHtml(data: any): Promise<string> {
    try {
      this.logger.log(`[PDF-TEMPLATE] Buscando template en: ${this.templatePath}`);
      this.logger.log(`[PDF-TEMPLATE] __dirname: ${__dirname}`);
      this.logger.log(`[PDF-TEMPLATE] process.cwd(): ${process.cwd()}`);
      if (!fs.existsSync(this.templatePath)) {
        this.logger.error(`[PDF-TEMPLATE] El archivo NO existe en la ruta: ${this.templatePath}`);
        throw new Error('Template HTML no encontrado');
      } else {
        this.logger.log(`[PDF-TEMPLATE] El archivo SÍ existe en la ruta: ${this.templatePath}`);
      }
      
      // Leer el template
      let template = fs.readFileSync(this.templatePath, 'utf8');
      this.logger.log(`[PDF-TEMPLATE] Template leído. Tamaño: ${template.length} caracteres`);

      // Log de los datos que se van a insertar
      this.logger.log(`[PDF-TEMPLATE] Datos a insertar:`, {
        numeroFactura: data.numeroFactura,
        fechaFactura: data.fechaFactura,
        emisor: data.emisor,
        receptor: data.receptor,
        itemsCount: data.items?.length || 0,
        importeTotal: data.importeTotal
      });

      // Reemplazar variables del template
      template = this.replaceTemplateVariables(template, data);
      
      this.logger.log(`[PDF-TEMPLATE] Template procesado. Tamaño final: ${template.length} caracteres`);
      
      // Guardar el HTML generado para diagnóstico
      const debugHtmlPath = path.join(process.cwd(), 'debug-template-generated.html');
      fs.writeFileSync(debugHtmlPath, template);
      this.logger.log(`[PDF-TEMPLATE] HTML generado guardado en: ${debugHtmlPath}`);

      return template;
    } catch (error) {
      this.logger.error('Error leyendo template:', error);
      throw new Error('Error procesando template HTML');
    }
  }

  /**
   * Reemplaza las variables del template con los datos
   */
  private replaceTemplateVariables(template: string, data: any): string {
    this.logger.log(`[TEMPLATE-VARS] Iniciando reemplazo de variables`);
    
    // Reemplazar variables simples
    const simpleReplacements = [
      'numeroFactura', 'fechaFactura', 'estado', 'fechaOperacion', 'metodoPago',
      'claveOperacion', 'regimenIvaEmisor', 'tipoIVA', 'motivoAnulacion', 'fechaCreacion',
      'baseImponible', 'cuotaIVA', 'importeTotal', 'descuento', 'descuentoCalculado',
      'qrData', 'qrImage'
    ];

    simpleReplacements.forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = data[key] || '';
      const beforeCount = (template.match(regex) || []).length;
      template = template.replace(regex, value);
      const afterCount = (template.match(regex) || []).length;
      this.logger.log(`[TEMPLATE-VARS] ${key}: "${value}" - Reemplazos: ${beforeCount} -> ${afterCount}`);
    });

    // Reemplazar datos del emisor
    template = template.replace(/{{emisor\.nombre}}/g, data.emisor.nombre);
    template = template.replace(/{{emisor\.email}}/g, data.emisor.email);

    // Reemplazar datos del receptor
    template = template.replace(/{{receptor\.nombre}}/g, data.receptor.nombre);
    template = template.replace(/{{receptor\.email}}/g, data.receptor.email);

    // Reemplazar expediente si existe
    if (data.expediente) {
      template = template.replace(/{{expediente\.titulo}}/g, data.expediente.titulo);
      template = template.replace(/{{#if expediente}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      template = template.replace(/{{#if expediente}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar items
    if (data.items && data.items.length > 0) {
      const itemsHtml = data.items.map((item: any) => `
        <tr>
          <td>${item.descripcion}</td>
          <td class="text-center">${item.cantidad}</td>
          <td class="text-right">${item.precioUnitario} €</td>
          <td class="text-right">${item.total} €</td>
        </tr>
      `).join('');
      
      // Reemplazar el contenido dentro del each
      template = template.replace(/{{#each items}}([\s\S]*?){{\/each}}/g, (match, content) => {
        return itemsHtml;
      });
      template = template.replace(/{{#if items}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      template = template.replace(/{{#if items}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar descuentos
    if (data.descuento > 0) {
      template = template.replace(/{{#if descuento}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      template = template.replace(/{{#if descuento}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar provisiones
    if (data.provisiones && data.provisiones.length > 0) {
      const provisionesHtml = data.provisiones.map((provision: any) => `
        <tr>
          <td>${provision.descripcion}</td>
          <td class="text-center">${provision.fecha}</td>
          <td class="text-right">${provision.importe} €</td>
        </tr>
      `).join('');
      
      template = template.replace(/{{#each provisiones}}([\s\S]*?){{\/each}}/g, provisionesHtml);
      template = template.replace(/{{#if provisiones}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      template = template.replace(/{{#if provisiones}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar motivo de anulación
    if (data.motivoAnulacion) {
      template = template.replace(/{{#if motivoAnulacion}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      template = template.replace(/{{#if motivoAnulacion}}[\s\S]*?{{\/if}}/g, '');
    }

    return template;
  }

  /**
   * Convierte HTML a PDF usando Puppeteer
   */
  private async htmlToPdf(htmlContent: string): Promise<Buffer> {
    let browser;
    try {
      this.logger.log('[PUPPETEER] Iniciando Puppeteer...');
      
      // Lanzar browser con configuración mejorada
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.logger.log('[PUPPETEER] Browser iniciado correctamente');
      const page = await browser.newPage();

      // Configurar viewport más grande para mejor renderizado
      await page.setViewport({ width: 1920, height: 1080 });

      // Establecer contenido HTML con tiempo de espera adicional
      this.logger.log('[PUPPETEER] Estableciendo contenido HTML...');
      await page.setContent(htmlContent, { 
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'] 
      });

      // Esperar un poco más para asegurar que todo se renderice (compatible con versiones antiguas)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verificar que el contenido se cargó correctamente
      const title = await page.title();
      this.logger.log(`[PUPPETEER] Título de la página: ${title}`);

      // Verificar que los elementos principales están presentes
      const invoiceNumber = await page.$('.invoice-number');
      const itemsTable = await page.$('.items-table');
      const totalsTable = await page.$('.totals-table');
      
      this.logger.log(`[PUPPETEER] Elementos encontrados:`, {
        invoiceNumber: !!invoiceNumber,
        itemsTable: !!itemsTable,
        totalsTable: !!totalsTable
      });

      // Generar PDF con configuración mejorada
      this.logger.log('[PUPPETEER] Generando PDF...');
      let pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        },
        displayHeaderFooter: false,
        scale: 1.0
      });

      this.logger.log(`[PUPPETEER] PDF generado. Tipo: ${typeof pdfBuffer}, Es Buffer: ${Buffer.isBuffer(pdfBuffer)}, Tamaño: ${pdfBuffer?.length || 'undefined'} bytes`);
      
      // Si no es un Buffer, intentar convertirlo
      if (!Buffer.isBuffer(pdfBuffer)) {
        this.logger.warn(`[PUPPETEER] pdfBuffer no es un Buffer. Intentando convertir...`);
        
        // Si es un objeto con propiedades numéricas, convertirlo a Buffer
        if (typeof pdfBuffer === 'object' && pdfBuffer !== null) {
          try {
            const keys = Object.keys(pdfBuffer).filter(k => !isNaN(Number(k)));
            if (keys.length > 0) {
              this.logger.log(`[PUPPETEER] Convirtiendo objeto con ${keys.length} bytes a Buffer...`);
              const byteArray = new Uint8Array(keys.length);
              keys.forEach(key => {
                const index = parseInt(key);
                byteArray[index] = pdfBuffer[key];
              });
              pdfBuffer = Buffer.from(byteArray);
              this.logger.log(`[PUPPETEER] Conversión exitosa. Nuevo tipo: ${typeof pdfBuffer}, Es Buffer: ${Buffer.isBuffer(pdfBuffer)}`);
            }
          } catch (error) {
            this.logger.error(`[PUPPETEER] Error en conversión: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
      }
      
      if (!Buffer.isBuffer(pdfBuffer)) {
        this.logger.error(`[PUPPETEER] Error: pdfBuffer no es un Buffer después de conversión. Tipo: ${typeof pdfBuffer}`);
        this.logger.error(`[PUPPETEER] Contenido: ${JSON.stringify(pdfBuffer).substring(0, 200)}...`);
        throw new Error('Puppeteer no devolvió un Buffer válido');
      }

      this.logger.log(`[PUPPETEER] Buffer válido generado. Primeros bytes: ${Array.from(pdfBuffer.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
      return pdfBuffer;

    } catch (error) {
      this.logger.error('Error en Puppeteer:', error);
      throw new Error('Error generando PDF con Puppeteer');
    } finally {
      if (browser) {
        await browser.close();
        this.logger.log('[PUPPETEER] Browser cerrado');
      }
    }
  }
} 