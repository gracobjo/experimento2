import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { ParametrosService } from '../parametros/parametros.service';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private templatePath: string;

  constructor(private readonly parametrosService: ParametrosService) {
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
      
      // Calcular el TOTAL para el QR (base + IVA - retención, sin restar provisiones)
      const totalParaQR = Number(invoice.baseImponible || 0) + 
        Number(invoice.cuotaIVA || 0) - 
        (Number(invoice.baseImponible || 0) * (Number(invoice.retencion || 0) / 100));
      
      // Log para debug del QR
      this.logger.log(`[QR-DEBUG] Base imponible: ${invoice.baseImponible}, IVA: ${invoice.cuotaIVA}, Retención: ${invoice.retencion}`);
      this.logger.log(`[QR-DEBUG] Total para QR calculado: ${totalParaQR}`);
      this.logger.log(`[QR-DEBUG] Importe total original: ${invoice.importeTotal}`);
      
      // Formato pipe-separated como en el ejemplo
      const qrData = `NIF:${invoice.emisor?.email || ''}|NUM:${invoice.numeroFactura || ''}|FEC:${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}|IMP:${Math.round(totalParaQR * 100) / 100}`;
      
      this.logger.log(`[QR-DEBUG] QR Data generado: ${qrData}`);
      const qrImageDataUrl = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'M', width: 200, margin: 2 });

      // 2. Preparar datos para el template
      const templateData = await this.prepareTemplateData(invoice, qrData, qrImageDataUrl);

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

    // Función para formatear números en español
    const formatNumberES = (num: number) => {
      const number = Number(num);
      const parts = number.toFixed(2).split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${formattedInteger},${decimalPart}`;
    };

    // Función para formatear fechas en español
    const formatDateES = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    // Log de los totales formateados
    this.logger.log(`[FORMAT-NUMBERS] Totales formateados: baseImponible: ${formatNumberES(Number(invoice.baseImponible || 0))}, cuotaIVA: ${formatNumberES(Number(invoice.cuotaIVA || 0))}, importeTotal: ${formatNumberES(Number(invoice.importeTotal || 0))}`);

    // Log de datos de factura rectificativa
    this.logger.log(`[RECTIFICATIVA-DEBUG] facturaOriginalId: ${invoice.facturaOriginalId}`);
    this.logger.log(`[RECTIFICATIVA-DEBUG] tipoRectificacion: ${invoice.tipoRectificacion}`);
    this.logger.log(`[RECTIFICATIVA-DEBUG] motivoRectificacion: ${invoice.motivoRectificacion}`);
    this.logger.log(`[RECTIFICATIVA-DEBUG] facturaOriginal: ${JSON.stringify(invoice.facturaOriginal, null, 2)}`);

    // Calcular subtotal (base + IVA - retención)
    const subtotalCalculado = Number(invoice.baseImponible || 0) + 
      Number(invoice.cuotaIVA || 0) - 
      (Number(invoice.baseImponible || 0) * (Number(invoice.retencion || 0) / 100));
    
    // Log específico del subtotal
    this.logger.log(`[SUBTOTAL-CALC] Base: ${Number(invoice.baseImponible || 0)}, IVA: ${Number(invoice.cuotaIVA || 0)}, Retención: ${Number(invoice.retencion || 0)}`);
    this.logger.log(`[SUBTOTAL-CALC] Subtotal calculado: ${subtotalCalculado}`);
    this.logger.log(`[SUBTOTAL-CALC] Subtotal formateado: ${formatNumberES(subtotalCalculado)}`);

    return {
      // Datos básicos
      numeroFactura: invoice.numeroFactura || 'N/A',
      fechaFactura: formatDateES(invoice.fechaFactura),
      estado: invoice.estado || 'N/A',
      fechaOperacion: formatDateES(invoice.fechaOperacion),
      metodoPago: invoice.metodoPago || 'N/A',
      claveOperacion: invoice.claveOperacion || 'N/A',
      regimenIvaEmisor: invoice.regimenIvaEmisor || 'N/A',
      tipoIVA: invoice.tipoIVA || 21,
      motivoAnulacion: invoice.motivoAnulacion || null,
      fechaCreacion: formatDateES(invoice.createdAt),

      // Totales
      baseImponible: formatNumberES(Number(invoice.baseImponible || 0)),
      cuotaIVA: formatNumberES(Number(invoice.cuotaIVA || 0)),
      importeTotal: formatNumberES(Number(invoice.importeTotal || 0)),
      descuento: invoice.descuento || 0,
      descuentoCalculado: formatNumberES(descuentoCalculado),
      retencion: invoice.retencion || 0,
      cuotaRetencion: formatNumberES((Number(invoice.baseImponible || 0) * (Number(invoice.retencion || 0) / 100))),
      
      // Calcular subtotal (base + IVA - retención)
      subtotal: formatNumberES(subtotalCalculado),
      
      // Descuento por provisiones
      descuentoProvisiones: formatNumberES(
        (invoice.provisionFondos || []).reduce((sum: number, prov: any) => sum + (prov.amount || 0), 0)
      ),

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
      items: (invoice.items || []).map((item: any) => {
        const precioUnitario = Number(item.unitPrice || 0);
        const total = Number(item.total || 0);
        this.logger.log(`[FORMAT-NUMBERS] Item: ${item.description}, precioUnitario: ${precioUnitario} -> ${formatNumberES(precioUnitario)}, total: ${total} -> ${formatNumberES(total)}`);
        return {
          descripcion: item.description || '',
          cantidad: Number(item.quantity || 0),
          precioUnitario: formatNumberES(precioUnitario),
          total: formatNumberES(total)
        };
      }),

      // Provisiones
      provisiones: (invoice.provisionFondos || []).map((provision: any) => ({
        descripcion: provision.description || 'Sin descripción',
        fecha: formatDateES(provision.date),
        importe: formatNumberES(provision.amount || 0)
      })),

      // QR
      qrData: qrData,
      qrImage: qrImageDataUrl,
      verificacionUrl: verificacionUrl,

      // Datos de factura rectificativa - solo si realmente es una factura rectificativa
      facturaOriginal: (invoice.facturaOriginalId && invoice.facturaOriginal) ? {
        numeroFactura: invoice.facturaOriginal.numeroFactura || 'N/A',
        fechaFactura: formatDateES(invoice.facturaOriginal.fechaFactura),
        importeTotal: formatNumberES(Number(invoice.facturaOriginal.importeTotal || 0))
      } : null,
      tipoRectificacion: (invoice.facturaOriginalId && invoice.tipoRectificacion) ? invoice.tipoRectificacion : null,
      motivoRectificacion: (invoice.facturaOriginalId && invoice.motivoRectificacion) ? invoice.motivoRectificacion : null
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
        importeTotal: data.importeTotal,
        provisionesCount: data.provisiones?.length || 0,
        descuentoProvisiones: data.descuentoProvisiones,
        subtotal: data.subtotal,
        baseImponible: data.baseImponible,
        cuotaIVA: data.cuotaIVA,
        facturaOriginal: data.facturaOriginal,
        tipoRectificacion: data.tipoRectificacion,
        motivoRectificacion: data.motivoRectificacion
      });
      
      // Log específico de provisiones
      this.logger.log(`[PDF-TEMPLATE] Provisiones recibidas:`, JSON.stringify(data.provisiones, null, 2));
      
      // Log específico de items
      this.logger.log(`[PDF-TEMPLATE] Items recibidos:`, JSON.stringify(data.items, null, 2));

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
      'subtotal', 'descuentoProvisiones', 'retencion', 'cuotaRetencion', 'qrData', 'qrImage', 'verificacionUrl',
      'tipoRectificacion', 'motivoRectificacion'
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
      this.logger.log(`[TEMPLATE-VARS] Datos de provisiones:`, JSON.stringify(data.provisiones, null, 2));
      
      // Procesar TODAS las secciones de provisiones en el template
      let provisionesProcessed = 0;
      
      // Buscar y procesar cada sección {{#if provisiones}} en el template
      const provisionesRegex = /{{#if provisiones}}([\s\S]*?){{\/if}}/g;
      let match;
      
      while ((match = provisionesRegex.exec(template)) !== null) {
        provisionesProcessed++;
        this.logger.log(`[TEMPLATE-VARS] Procesando sección de provisiones #${provisionesProcessed}, longitud: ${match[1].length}`);
        
        const provisionesSection = match[1];
        
        // Buscar el loop dentro de la sección
        const eachMatch = provisionesSection.match(/{{#each provisiones}}([\s\S]*?){{\/each}}/);
        if (eachMatch) {
          const provisionTemplate = eachMatch[1];
          this.logger.log(`[TEMPLATE-VARS] Template de provisión encontrado en sección #${provisionesProcessed}, longitud: ${provisionTemplate.length}`);
          
          // Generar HTML para cada provisión
          const provisionesHtml = data.provisiones.map((provision: any) => {
            let provisionHtml = provisionTemplate;
            provisionHtml = provisionHtml.replace(/{{descripcion}}/g, provision.descripcion || '');
            provisionHtml = provisionHtml.replace(/{{fecha}}/g, provision.fecha || '');
            provisionHtml = provisionHtml.replace(/{{importe}}/g, provision.importe || '0.00');
            return provisionHtml;
          }).join('');
          
          this.logger.log(`[TEMPLATE-VARS] HTML de provisiones generado para sección #${provisionesProcessed}, longitud: ${provisionesHtml.length}`);
          
          // Reemplazar el loop con el HTML generado
          const newProvisionesSection = provisionesSection.replace(/{{#each provisiones}}[\s\S]*?{{\/each}}/, provisionesHtml);
          
          // Reemplazar la sección completa en el template
          template = template.replace(match[0], newProvisionesSection);
          
          this.logger.log(`[TEMPLATE-VARS] Sección #${provisionesProcessed} actualizada con provisiones`);
        } else {
          this.logger.warn(`[TEMPLATE-VARS] No se encontró {{#each provisiones}} en la sección #${provisionesProcessed}`);
          // Si no hay loop, eliminar toda la sección
          template = template.replace(match[0], '');
        }
      }
      
      this.logger.log(`[TEMPLATE-VARS] Total de secciones de provisiones procesadas: ${provisionesProcessed}`);
      
      if (provisionesProcessed === 0) {
        this.logger.warn(`[TEMPLATE-VARS] No se encontró ninguna sección {{#if provisiones}}`);
      }
    } else {
      this.logger.log(`[TEMPLATE-VARS] No hay provisiones, eliminando sección de provisiones`);
      template = template.replace(/{{#if provisiones}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar retención
    if (data.retencion && data.retencion > 0) {
      template = template.replace(/{{#if retencion}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      template = template.replace(/{{#if retencion}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar motivo de anulación
    if (data.motivoAnulacion) {
      template = template.replace(/{{#if motivoAnulacion}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      template = template.replace(/{{#if motivoAnulacion}}[\s\S]*?{{\/if}}/g, '');
    }

    // Reemplazar sección de factura rectificativa
    if (data.facturaOriginal) {
      this.logger.log(`[TEMPLATE-VARS] Procesando factura rectificativa`);
      this.logger.log(`[TEMPLATE-VARS] Datos de factura original:`, JSON.stringify(data.facturaOriginal, null, 2));
      
      // Buscar la sección de factura rectificativa
      const rectificativaMatch = template.match(/{{#if facturaOriginal}}([\s\S]*?){{\/if}}/);
      if (rectificativaMatch) {
        const rectificativaSection = rectificativaMatch[1];
        this.logger.log(`[TEMPLATE-VARS] Sección de factura rectificativa encontrada, longitud: ${rectificativaSection.length}`);
        
        // Reemplazar variables de la factura original
        let rectificativaHtml = rectificativaSection;
        rectificativaHtml = rectificativaHtml.replace(/{{facturaOriginal\.numeroFactura}}/g, data.facturaOriginal.numeroFactura || 'N/A');
        rectificativaHtml = rectificativaHtml.replace(/{{facturaOriginal\.fechaFactura}}/g, data.facturaOriginal.fechaFactura || 'N/A');
        rectificativaHtml = rectificativaHtml.replace(/{{facturaOriginal\.importeTotal}}/g, data.facturaOriginal.importeTotal || 'N/A');
        
        // Procesar bloques anidados dentro de la sección de factura rectificativa
        // Procesar {{#if facturaOriginal.importeTotal}}
        if (data.facturaOriginal.importeTotal) {
          rectificativaHtml = rectificativaHtml.replace(/{{#if facturaOriginal\.importeTotal}}([\s\S]*?){{\/if}}/g, '$1');
        } else {
          rectificativaHtml = rectificativaHtml.replace(/{{#if facturaOriginal\.importeTotal}}[\s\S]*?{{\/if}}/g, '');
        }
        
        this.logger.log(`[TEMPLATE-VARS] HTML de factura rectificativa generado, longitud: ${rectificativaHtml.length}`);
        
        // Reemplazar la sección completa
        template = template.replace(/{{#if facturaOriginal}}[\s\S]*?{{\/if}}/, rectificativaHtml);
      } else {
        this.logger.warn(`[TEMPLATE-VARS] No se encontró la sección {{#if facturaOriginal}}`);
      }
    } else {
      this.logger.log(`[TEMPLATE-VARS] No es factura rectificativa, eliminando sección`);
      template = template.replace(/{{#if facturaOriginal}}[\s\S]*?{{\/if}}/g, '');
    }

    // Limpieza final de cualquier código Handlebars sin procesar
    this.logger.log(`[TEMPLATE-VARS] Limpieza final de código Handlebars sin procesar`);
    template = template.replace(/{{#if[^}]*}}/g, '');
    template = template.replace(/{{#each[^}]*}}/g, '');
    template = template.replace(/{{\/if}}/g, '');
    template = template.replace(/{{\/each}}/g, '');
    template = template.replace(/{{[^}]*}}/g, '');

    this.logger.log(`[TEMPLATE-VARS] Procesamiento completado. Longitud final del template: ${template.length}`);
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

      // Configurar viewport optimizado para A4 con scale 0.75
      await page.setViewport({ 
        width: 794, // A4 width en píxeles a 96 DPI
        height: 1123, // A4 height en píxeles a 96 DPI
        deviceScaleFactor: 1
      });
      
      // Esperar a que el contenido se renderice completamente
      await page.waitForTimeout(1000);

      // CSS optimizado para forzar una sola página A4 con fuentes muy grandes
      const compactCss = `
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }

          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            font-size: 16px;
            overflow: hidden;
          }

          .invoice-container {
            width: 100%;
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-after: avoid;
            break-after: avoid;
            padding: 16px !important;
          }

          /* Compactar todo */
          * {
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            line-height: 1.4 !important;
          }

          .header .title { font-size: 28px !important; }
          .header .lema { font-size: 16px !important; }

          .data-blocks,
          .items-section,
          .totals-section,
          .footer,
          .factura-datos,
          .party-block,
          .additional-info,
          .firma-block {
            font-size: 16px !important;
            line-height: 1.4 !important;
            padding: 6px !important;
          }

          .items-table, .totals-table {
            font-size: 16px !important;
            border-collapse: collapse !important;
            width: 100%;
          }

          .items-table th,
          .items-table td,
          .totals-table td {
            padding: 6px 8px !important;
            border: none !important;
            text-align: left;
          }

          .qr-integrated .qr-section img {
            width: 80px !important;
            height: 80px !important;
          }

          .qr-integrated .qr-legend {
            font-size: 10px !important;
            max-width: 80px !important;
          }

          .firma-block {
            margin-top: 10px !important;
            height: auto !important;
          }

          .logo span {
            font-size: 20px !important;
          }

          /* Evitar saltos de página */
          table, tr, td, th, div, section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
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

      // Generar PDF optimizado para una sola página
      this.logger.log('[PUPPETEER] Generando PDF...');
      let pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '5mm',
          right: '5mm',
          bottom: '5mm',
          left: '5mm'
        },
        scale: 0.8,
        displayHeaderFooter: false,
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