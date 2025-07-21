import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { ParametrosService } from '../parametros/parametros.service'; // Added import for ParametrosService

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private templatePath: string;

  constructor(private readonly parametrosService: ParametrosService) { // inyectar el servicio de parámetros
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
        this.logger.log(`Template HTML usado para PDF: ${this.templatePath}`);
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
      // QR: ahora como JSON con datos fiscales y URL de verificación
      const verificacionUrl = `https://tudominio.com/verificar/${invoice.numeroFactura}`;
      const qrJson = JSON.stringify({
        NIF: invoice.emisor?.email || '',
        NUM: invoice.numeroFactura || '',
        FEC: invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : '',
        IMP: invoice.importeTotal || '',
        verificacion: verificacionUrl
      });
      const qrImageDataUrl = await QRCode.toDataURL(qrJson, { errorCorrectionLevel: 'M', width: 200, margin: 2 });

      // 2. Preparar datos para el template
      const templateData = await this.prepareTemplateData(invoice, qrJson, qrImageDataUrl);

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

  // Cambiar a public para permitir uso desde InvoicesService
  public async prepareTemplateData(invoice: any, qrData: string, qrImageDataUrl: string): Promise<any> {
    this.logger.log('Preparando datos para template. Items recibidos:', invoice.items?.length || 0);
    this.logger.log('Items detallados:', JSON.stringify(invoice.items, null, 2));
    
    // Calcular descuento si existe
    let descuentoCalculado = 0;
    if (invoice.descuento && invoice.descuento > 0) {
      descuentoCalculado = (invoice.items?.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice), 0) || 0) * (invoice.descuento / 100);
    }

    // Obtener la base de la URL de verificación desde parámetros
    let verificacionUrlBase = 'https://tudominio.com/verificar/';
    try {
      const param = await this.parametrosService.findByClave?.('VERIFICACION_URL_BASE');
      if (param && param.valor) {
        verificacionUrlBase = param.valor;
      }
    } catch {}
    const verificacionUrl = `${verificacionUrlBase}${invoice.numeroFactura}`;

    // Utilidad para formato español
    const formatNumberES = (num: number) => Number(num).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
      baseImponible: formatNumberES(invoice.baseImponible || 0),
      cuotaIVA: formatNumberES(invoice.cuotaIVA || 0),
      importeTotal: formatNumberES(invoice.importeTotal || 0),
      descuento: invoice.descuento || 0,
      descuentoCalculado: formatNumberES(descuentoCalculado),

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
        cantidad: Number(item.quantity || 0),
        precioUnitario: formatNumberES(Number(item.unitPrice || 0)),
        total: formatNumberES(Number(item.total || 0))
      })),

      // Provisiones
      provisiones: (invoice.provisionFondos || []).map((provision: any) => ({
        descripcion: provision.description || 'Sin descripción',
        fecha: provision.date ? new Date(provision.date).toISOString().slice(0, 10) : 'N/A',
        importe: formatNumberES(provision.amount || 0)
      })),

      // QR
      qrData: qrData,
      qrImage: qrImageDataUrl,
      verificacionUrl: verificacionUrl
    };
  }

  // Cambiar a public para permitir uso desde InvoicesService
  public async generateHtml(data: any): Promise<string> {
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

    // Reemplazar items - ARREGLADO para manejar correctamente la sintaxis de Handlebars
    if (data.items && data.items.length > 0) {
      this.logger.log(`[TEMPLATE-VARS] Procesando ${data.items.length} items`);
      
      // Buscar la sección de items en el template
      const itemsMatch = template.match(/{{#if items}}([\s\S]*?){{\/if}}/);
      if (itemsMatch) {
        const itemsSection = itemsMatch[1];
        this.logger.log(`[TEMPLATE-VARS] Sección de items encontrada, longitud: ${itemsSection.length}`);
        
        // Buscar el each dentro de la sección de items
        const eachMatch = itemsSection.match(/{{#each items}}([\s\S]*?){{\/each}}/);
        if (eachMatch) {
          const itemTemplate = eachMatch[1];
          this.logger.log(`[TEMPLATE-VARS] Template de item encontrado, longitud: ${itemTemplate.length}`);
          
          // Generar HTML para cada item
          const itemsHtml = data.items.map((item: any) => {
            let itemHtml = itemTemplate;
            itemHtml = itemHtml.replace(/{{descripcion}}/g, item.descripcion || '');
            itemHtml = itemHtml.replace(/{{cantidad}}/g, item.cantidad || 0);
            itemHtml = itemHtml.replace(/{{precioUnitario}}/g, item.precioUnitario || '0.00');
            itemHtml = itemHtml.replace(/{{total}}/g, item.total || '0.00');
            return itemHtml;
          }).join('');
          
          this.logger.log(`[TEMPLATE-VARS] HTML de items generado, longitud: ${itemsHtml.length}`);
          
          // Reemplazar la sección completa
          const newItemsSection = itemsSection.replace(/{{#each items}}[\s\S]*?{{\/each}}/, itemsHtml);
          template = template.replace(/{{#if items}}[\s\S]*?{{\/if}}/, newItemsSection);
        } else {
          this.logger.warn(`[TEMPLATE-VARS] No se encontró {{#each items}} en la sección de items`);
        }
      } else {
        this.logger.warn(`[TEMPLATE-VARS] No se encontró la sección {{#if items}}`);
      }
    } else {
      this.logger.log(`[TEMPLATE-VARS] No hay items, eliminando sección de items`);
      template = template.replace(/{{#if items}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar descuentos
    if (data.descuento > 0) {
      template = template.replace(/{{#if descuento}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      template = template.replace(/{{#if descuento}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar provisiones - ARREGLADO para manejar correctamente la sintaxis de Handlebars
    if (data.provisiones && data.provisiones.length > 0) {
      this.logger.log(`[TEMPLATE-VARS] Procesando ${data.provisiones.length} provisiones`);
      
      const provisionesMatch = template.match(/{{#if provisiones}}([\s\S]*?){{\/if}}/);
      if (provisionesMatch) {
        const provisionesSection = provisionesMatch[1];
        const eachMatch = provisionesSection.match(/{{#each provisiones}}([\s\S]*?){{\/each}}/);
        if (eachMatch) {
          const provisionTemplate = eachMatch[1];
          const provisionesHtml = data.provisiones.map((provision: any) => {
            let provisionHtml = provisionTemplate;
            provisionHtml = provisionHtml.replace(/{{descripcion}}/g, provision.descripcion || '');
            provisionHtml = provisionHtml.replace(/{{fecha}}/g, provision.fecha || '');
            provisionHtml = provisionHtml.replace(/{{importe}}/g, provision.importe || '0.00');
            return provisionHtml;
          }).join('');
          
          const newProvisionesSection = provisionesSection.replace(/{{#each provisiones}}[\s\S]*?{{\/each}}/, provisionesHtml);
          template = template.replace(/{{#if provisiones}}[\s\S]*?{{\/if}}/, newProvisionesSection);
        }
      }
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
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--font-render-hinting=none',
          '--disable-font-subpixel-positioning'
        ]
      });

      this.logger.log('[PUPPETEER] Browser iniciado correctamente');
      const page = await browser.newPage();

      // Configurar viewport más pequeño para forzar compactación
      await page.setViewport({ 
        width: 900, 
        height: 1200,
        deviceScaleFactor: 2
      });

      // Inyectar CSS para compactar el diseño y reducir márgenes y fuentes
      const compactCss = `
        <style>
          body { font-size: 10px !important; }
          .invoice-container { padding: 8px !important; }
          .header, .parties, .items-section, .totals-section, .footer, .additional-info { margin-bottom: 8px !important; }
          .qr-code, .qr-code img { width: 60px !important; height: 60px !important; }
          .items-table th, .items-table td, .totals-table td, .provisions-table th, .provisions-table td { padding: 4px 3px !important; font-size: 10px !important; }
          .section-title, .invoice-title { font-size: 18px !important; }
          .company-logo { font-size: 16px !important; }
          .discount-box, .party, .additional-info { padding: 6px !important; }
          /* Permite ajustar el tamaño aquí si necesitas más compactación */
        </style>
      `;
      const htmlWithCompactCss = htmlContent.replace('</head>', `${compactCss}</head>`);

      // Establecer contenido HTML
      this.logger.log('[PUPPETEER] Estableciendo contenido HTML...');
      await page.setContent(htmlWithCompactCss, { 
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'] 
      });

      // Esperar un poco más para asegurar que todo se renderice
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar PDF con márgenes reducidos
      this.logger.log('[PUPPETEER] Generando PDF...');
      let pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '8mm',
          right: '8mm',
          bottom: '8mm',
          left: '8mm'
        },
        displayHeaderFooter: false,
        scale: 1.0,
        timeout: 30000,
        waitForFunction: 'document.readyState === "complete"'
      });

      // Asegura que pdfBuffer es un Buffer
      if (!Buffer.isBuffer(pdfBuffer)) {
        pdfBuffer = Buffer.from(pdfBuffer);
      }

      this.logger.log(`[PUPPETEER] PDF generado. Tipo: ${typeof pdfBuffer}, Es Buffer: ${Buffer.isBuffer(pdfBuffer)}, Tamaño: ${pdfBuffer?.length || 'undefined'} bytes`);
      return pdfBuffer;
    } finally {
      if (browser) await browser.close();
    }
  }
} 