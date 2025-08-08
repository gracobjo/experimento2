import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { generateFacturaeXML, generateFacturaeXMLFromInvoice, FacturaeDocument } from './facturae-xml.util';
import { signFacturaeXML, XAdESLevel, SigningOptions } from './xades-sign.util';
import { FacturaeService, FacturaeGenerationResult } from './facturae.service';
import { FacturaeValidator, ValidationResult } from './facturae-validator.util';
import { PdfGeneratorService } from './pdf-generator.service';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { PDFDocument, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { InvoiceAuditService } from './invoice-audit.service';
import { isInvoiceEditable, isInvoiceAuditable, isInvoiceCancellable, INVOICE_STATUS } from './invoice-status.constants';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private facturaeService: FacturaeService;

  constructor(
    private prisma: PrismaService,
    private pdfGeneratorService: PdfGeneratorService,
    private invoiceAuditService: InvoiceAuditService
  ) {
    this.facturaeService = new FacturaeService();
  }

  async create(data: CreateInvoiceDto) {
    try {
      console.log('DATA RECIBIDA EN SERVICE:', JSON.stringify(data, null, 2));
      let { items, expedienteId, provisionIds = [], ...invoiceData } = data;
      
      // Función para formatear números en español
      const formatNumberES = (num: number) => {
        const number = Number(num);
        const parts = number.toFixed(2).split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `${formattedInteger},${decimalPart}`;
      };
      console.log('items:', items);
      console.log('expedienteId:', expedienteId);
      console.log('provisionIds recibidos:', provisionIds);
      console.log('invoiceData:', invoiceData);

      // Validar que items sea un array válido
      if (!Array.isArray(items)) {
        throw new Error('Items debe ser un array válido');
      }

      // Si hay provisiones seleccionadas, las busco y agrego como líneas negativas
      if (provisionIds.length > 0) {
        console.log('Buscando provisiones con IDs:', provisionIds);
        const provisiones = await this.prisma.provisionFondos.findMany({
          where: { id: { in: provisionIds } },
        });
        console.log('Provisiones encontradas:', provisiones.length);
        console.log('Provisiones:', JSON.stringify(provisiones, null, 2));
        
        // NO agregamos las provisiones como conceptos negativos
        // Solo las asociaremos con la factura más adelante
        console.log('Provisiones encontradas para asociar:', provisiones.length);
      } else {
        console.log('No hay provisionIds para procesar');
      }

      // Generar numeroFactura si no viene en la petición
      let numeroFactura = invoiceData.numeroFactura;
      if (!numeroFactura) {
        // Si es una factura rectificativa, generar número basado en la factura original
        if (invoiceData.tipoFactura === 'R' && data.facturaOriginalId) {
          numeroFactura = await this.generateRectificativaNumber(data.facturaOriginalId, data.tipoRectificacion);
        } else {
          // Generar número normal para facturas completas
          const year = new Date().getFullYear();
          // Buscar el último número de factura de este año
          const lastInvoice = await this.prisma.invoice.findFirst({
            where: {
              numeroFactura: { startsWith: `fac-${year}-` },
            },
            orderBy: { createdAt: 'desc' },
          });
          let nextNumber = 1;
          if (lastInvoice && lastInvoice.numeroFactura) {
            const match = lastInvoice.numeroFactura.match(/fac-\d{4}-(\d{4})/);
            if (match) {
              nextNumber = parseInt(match[1], 10) + 1;
            }
          }
          numeroFactura = `fac-${year}-${nextNumber.toString().padStart(4, '0')}`;
        }
      }

      // Construir el objeto data para Prisma, solo incluyendo expedienteId si existe
      const prismaData: any = {
        ...invoiceData,
        numeroFactura,
        fechaFactura: invoiceData.fechaFactura ? new Date(invoiceData.fechaFactura) : new Date(),
        fechaOperacion: new Date(invoiceData.fechaOperacion),
        items: { create: items },
        estado: 'emitida',
        // Convertir strings vacíos a null para campos opcionales
        facturaOriginalId: invoiceData.facturaOriginalId || null,
        tipoRectificacion: invoiceData.tipoRectificacion || null,
        motivoRectificacion: invoiceData.motivoRectificacion || null,
      };

      // Calcular totales automáticamente basándose en los items
      let baseImponible = items.reduce((sum: number, item: any) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Aplicar descuento si existe
      const descuento = typeof invoiceData.descuento === 'number' ? invoiceData.descuento : 0;
      let baseConDescuento = baseImponible * (1 - descuento / 100);
      
      // Obtener valores de IVA y retención para cálculos
      const aplicarIVA = invoiceData.aplicarIVA !== false; // Por defecto true
      const tipoIVA = typeof invoiceData.tipoIVA === 'number' ? invoiceData.tipoIVA : 21;
      const retencion = typeof invoiceData.retencion === 'number' ? invoiceData.retencion : 0;
      
      // Calcular descuento por provisiones asociadas
      let descuentoProvisiones = 0;
      if (provisionIds.length > 0) {
        const provisiones = await this.prisma.provisionFondos.findMany({
          where: { id: { in: provisionIds } },
        });
        descuentoProvisiones = provisiones.reduce((sum, prov) => sum + prov.amount, 0);
        console.log('🔍 Descuento por provisiones:', descuentoProvisiones);
        
        // Validar que las provisiones no excedan el subtotal (base + IVA - retención)
        // Primero calculamos el subtotal para la validación
        const subtotalParaValidacion = baseConDescuento + (baseConDescuento * (tipoIVA / 100)) - (baseConDescuento * (retencion / 100));
        
        if (descuentoProvisiones > subtotalParaValidacion) {
          const exceso = descuentoProvisiones - subtotalParaValidacion;
          console.log('⚠️ ADVERTENCIA: Las provisiones exceden el subtotal');
          console.log('  - Subtotal estimado:', subtotalParaValidacion);
          console.log('  - Provisiones aplicadas:', descuentoProvisiones);
          console.log('  - Exceso:', exceso);
          
          // Agregar concepto de devolución de provisión
          const conceptoDevolucion = {
            description: `Devolución de Provisión (exceso de ${formatNumberES(exceso)}€)`,
            quantity: 1,
            unitPrice: -exceso,
            total: -exceso
          };
          
          // Agregar el concepto de devolución a los items
          items.push(conceptoDevolucion);
          console.log('  - Concepto de devolución agregado:', conceptoDevolucion);
          
          // Recalcular la base imponible incluyendo la devolución
          const nuevaBaseImponible = items.reduce((sum: number, item: any) => {
            const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
            const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
            return sum + (quantity * unitPrice);
          }, 0);
          
          console.log('  - Nueva base imponible con devolución:', nuevaBaseImponible);
          
          // Actualizar la base imponible para los cálculos posteriores
          baseImponible = nuevaBaseImponible;
          baseConDescuento = baseImponible * (1 - descuento / 100);
          
          // Recalcular el subtotal con la nueva base
          const nuevoSubtotal = baseConDescuento + (baseConDescuento * (tipoIVA / 100)) - (baseConDescuento * (retencion / 100));
          
          // Ahora las provisiones no exceden el subtotal
          descuentoProvisiones = Math.min(descuentoProvisiones, nuevoSubtotal);
          console.log('  - Provisiones ajustadas a:', descuentoProvisiones);
        }
      }
      
      // Calcular base imponible después de descuentos (SIN restar provisiones)
      // Las provisiones se restan del importe total a pagar, no de la base imponible
      const baseConDescuentos = Math.max(0, baseConDescuento);
      
      console.log('🔍 Cálculos:');
      console.log('  - Base imponible original:', baseImponible);
      console.log('  - Base con descuento (%):', baseConDescuento);
      console.log('  - Base final (sin provisiones):', baseConDescuentos);
      console.log('  - Provisiones a aplicar:', descuentoProvisiones);
      
      // Calcular IVA sobre la base con descuentos (sin provisiones)
      const cuotaIVA = aplicarIVA ? baseConDescuentos * (tipoIVA / 100) : 0;
      
      // Aplicar retención si existe
      const cuotaRetencion = baseConDescuentos * (retencion / 100);
      
      // Calcular subtotal (base + IVA - retención)
      const subtotal = baseConDescuentos + cuotaIVA - cuotaRetencion;
      
      // Calcular total final restando las provisiones del importe a pagar
      const importeTotal = Math.max(0, subtotal - descuentoProvisiones);
      
      console.log('🔍 Cálculos finales:');
      console.log('  - Subtotal (base + IVA - retención):', subtotal);
      console.log('  - Provisiones aplicadas:', descuentoProvisiones);
      console.log('  - Importe total a pagar:', importeTotal);

      // Actualizar los totales calculados
      prismaData.baseImponible = baseConDescuentos;
      prismaData.cuotaIVA = cuotaIVA;
      prismaData.importeTotal = importeTotal;
      prismaData.tipoIVA = tipoIVA;
      prismaData.descuento = descuento;
      prismaData.retencion = retencion;
      prismaData.aplicarIVA = aplicarIVA;

      if (expedienteId) {
        // Verificar que el expediente existe antes de asignarlo
        const expediente = await this.prisma.expediente.findUnique({
          where: { id: expedienteId }
        });
        if (expediente) {
          prismaData.expedienteId = expedienteId;
        } else {
          console.warn(`⚠️ Expediente con ID ${expedienteId} no encontrado, omitiendo expedienteId`);
        }
      }

      // Verificar que el receptor existe
      const receptor = await this.prisma.user.findUnique({
        where: { id: prismaData.receptorId }
      });
      if (!receptor) {
        throw new Error(`Receptor con ID ${prismaData.receptorId} no encontrado`);
      }

      console.log('PRISMA DATA:', JSON.stringify(prismaData, null, 2));

      // Crear la factura y sus items
      console.log('Intentando crear factura en Prisma...');
      const invoice = await this.prisma.invoice.create({
        data: prismaData,
        include: { items: true, emisor: true, receptor: true, expediente: true },
      });
      console.log('Factura creada exitosamente:', invoice.id);

      // Asociar provisiones a la factura
      if (provisionIds.length > 0) {
        console.log('Asociando provisiones con invoiceId:', invoice.id);
        console.log('ProvisionIds a actualizar:', provisionIds);
        
        const updateResult = await this.prisma.provisionFondos.updateMany({
          where: { id: { in: provisionIds } },
          data: { invoiceId: invoice.id },
        });
        
        console.log('Resultado de actualización de provisiones:', updateResult);
        
        // Verificar que se actualizaron correctamente
        const provisionesActualizadas = await this.prisma.provisionFondos.findMany({
          where: { id: { in: provisionIds } },
        });
        console.log('Provisiones después de actualizar:', JSON.stringify(provisionesActualizadas, null, 2));
      } else {
        console.log('No hay provisionIds para asociar');
      }

      // Generar el XML Facturae
      console.log('Generando XML...');
      const xml = generateFacturaeXMLFromInvoice(invoice);
      console.log('XML generado exitosamente');
      
      // Guardar el XML en la base de datos
      console.log('Guardando XML en BD...');
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { xml },
      });
      console.log('XML guardado exitosamente');

      // Firma automática si está habilitada
      let signedXml = null;
      if (process.env.FACTURAE_AUTO_SIGN === 'true') {
        try {
          console.log('Iniciando firma automática...');
          const signingResult = await this.generateAndSignInvoiceAdvanced(invoice.id, {
            level: (process.env.FACTURAE_XADES_LEVEL as any) || 'BES'
          });
          
          if (signingResult.success && signingResult.signedXmlContent) {
            signedXml = signingResult.signedXmlContent;
            console.log('Firma automática completada exitosamente');
          } else {
            console.warn('Firma automática falló:', signingResult.errors);
          }
        } catch (signError) {
          console.error('Error en firma automática:', signError);
          // No fallar la creación de la factura por error de firma
        }
      }
      
      // Lógica específica para facturas rectificativas - Devolver provisiones
      if (data.facturaOriginalId && data.tipoRectificacion) {
        console.log('🔄 Procesando factura rectificativa:', data.tipoRectificacion);
        await this.handleRectificativaProvisiones(data.facturaOriginalId, invoice.id, data.tipoRectificacion, invoice.importeTotal);
      }

      // Devolver la factura con el XML (y XML firmado si está disponible)
      return { 
        ...invoice, 
        xml,
        xmlFirmado: signedXml
      };
    } catch (error: any) {
      console.error('Error completo en create:', error);
      if (error && typeof error === 'object' && 'stack' in error) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  async findAll(user: any, lawyerId?: string, clientId?: string, paymentDate?: string) {
    const where: any = {};
    if (user?.role === 'ABOGADO') {
      where.emisorId = user.id;
    } else if (user?.role === 'CLIENTE') {
      where.receptorId = user.id;
    } else {
      if (lawyerId) where.emisorId = lawyerId;
      if (clientId) where.receptorId = clientId;
    }
    if (paymentDate) {
      const date = new Date(paymentDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      where.paymentDate = { gte: date, lt: nextDay };
    }
    const invoices = await this.prisma.invoice.findMany({
      where,
      include: { emisor: true, receptor: true, expediente: true, items: true, provisionFondos: true },
      orderBy: { fechaFactura: 'desc' },
    });
    return invoices.map((invoice: any) => ({
      id: invoice.id,
      numeroFactura: invoice.numeroFactura,
      fechaFactura: invoice.fechaFactura,
      estado: invoice.estado,
      importeTotal: invoice.importeTotal,
      paymentDate: invoice.paymentDate,
      tipoFactura: invoice.tipoFactura,
      baseImponible: invoice.baseImponible,
      cuotaIVA: invoice.cuotaIVA,
      tipoIVA: invoice.tipoIVA,
      descuento: invoice.descuento,
      retencion: invoice.retencion,
      aplicarIVA: invoice.aplicarIVA,
      regimenIvaEmisor: invoice.regimenIvaEmisor,
      claveOperacion: invoice.claveOperacion,
      metodoPago: invoice.metodoPago,
      fechaOperacion: invoice.fechaOperacion,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      motivoAnulacion: invoice.motivoAnulacion,
      emisorId: invoice.emisorId,
      receptorId: invoice.receptorId,
      expedienteId: invoice.expedienteId,
      emisor: invoice.emisor,
      receptor: invoice.receptor,
      expediente: invoice.expediente,
      items: invoice.items,
      provisionFondos: invoice.provisionFondos,
      xml: invoice.xml,
      xmlFirmado: invoice.xmlFirmado,
      selloTiempo: invoice.selloTiempo,
      qrData: [
        `NIF:${invoice.emisor?.email || ''}`,
        `NUM:${invoice.numeroFactura || ''}`,
        `FEC:${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}`,
        `IMP:${invoice.importeTotal || ''}`
      ].join('|')
    }));
  }

  async findOne(id: string) {
    console.log('[FINDONE] Buscando factura con ID:', id);
    
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { 
        emisor: true, 
        receptor: true, 
        expediente: true, 
        items: true, 
        provisionFondos: true,
        // Incluir la factura original si es una factura rectificativa
        facturaOriginal: {
          include: {
            emisor: true,
            receptor: true,
            expediente: true
          }
        }
      },
    });
    
    console.log('[FINDONE] Resultado de búsqueda:', invoice ? 'Factura encontrada' : 'Factura NO encontrada');
    if (invoice) {
      console.log('[FINDONE] Datos de la factura encontrada:', {
        id: invoice.id,
        numeroFactura: invoice.numeroFactura,
        emisorId: invoice.emisorId,
        estado: invoice.estado
      });
    }
    
    if (!invoice) return null;
    
    // Generar qrData dinámicamente y devolver junto con la factura
    return {
      ...invoice,
      qrData: [
        `NIF:${invoice.emisor?.email || ''}`,
        `NUM:${invoice.numeroFactura || ''}`,
        `FEC:${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}`,
        `IMP:${invoice.importeTotal || ''}`
      ].join('|')
    };
  }

  async update(id: string, data: UpdateInvoiceDto, userId?: string, ipAddress?: string, userAgent?: string) {
    const { items, provisionIds, ...invoiceData } = data;
    
    // Función para formatear números en español
    const formatNumberES = (num: number) => {
      const number = Number(num);
      const parts = number.toFixed(2).split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${formattedInteger},${decimalPart}`;
    };
    
    // Obtener la factura actual para ver las provisiones asociadas y valores previos
    const currentInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { provisionFondos: true, items: true }
    });
    
    if (!currentInvoice) {
      throw new Error('Factura no encontrada');
    }

    // Verificar si la factura es editable según su estado
    if (!isInvoiceEditable(currentInvoice.estado)) {
      throw new Error(`No se puede editar una factura con estado '${currentInvoice.estado}'. Solo se pueden editar facturas en estado 'borrador' o 'emitida'.`);
    }

    // Preparar datos de actualización - solo campos permitidos
    const updateData: Record<string, any> = {};
    
    // Solo incluir campos que realmente queremos actualizar
    if (invoiceData.fechaOperacion) {
      updateData.fechaOperacion = new Date(invoiceData.fechaOperacion);
    }
    if (invoiceData.fechaFactura) {
      updateData.fechaFactura = new Date(invoiceData.fechaFactura);
    }
    if (invoiceData.paymentDate) {
      updateData.paymentDate = new Date(invoiceData.paymentDate);
    }
    if (invoiceData.estado !== undefined) {
      updateData.estado = invoiceData.estado;
    }
    if (invoiceData.motivoAnulacion !== undefined) {
      updateData.motivoAnulacion = invoiceData.motivoAnulacion;
    }
    if (invoiceData.tipoIVA !== undefined) {
      updateData.tipoIVA = invoiceData.tipoIVA;
    }
    if (invoiceData.descuento !== undefined) {
      updateData.descuento = invoiceData.descuento;
    }
    if (invoiceData.retencion !== undefined) {
      updateData.retencion = invoiceData.retencion;
    }
    if (invoiceData.aplicarIVA !== undefined) {
      updateData.aplicarIVA = invoiceData.aplicarIVA;
    }
    if (invoiceData.tipoImpuesto !== undefined) {
      updateData.tipoImpuesto = invoiceData.tipoImpuesto;
    }
    if (invoiceData.regimenIvaEmisor !== undefined) {
      updateData.regimenIvaEmisor = invoiceData.regimenIvaEmisor;
    }
    if (invoiceData.claveOperacion !== undefined) {
      updateData.claveOperacion = invoiceData.claveOperacion;
    }
    if (invoiceData.metodoPago !== undefined) {
      updateData.metodoPago = invoiceData.metodoPago;
    }
    if (invoiceData.receptorId !== undefined) {
      updateData.receptorId = invoiceData.receptorId;
    }
    if (invoiceData.expedienteId !== undefined) {
      updateData.expedienteId = invoiceData.expedienteId;
    }

    // Calcular totales automáticamente si hay items
    if (items) {
      // Calcular base imponible
      let baseImponible = items.reduce((sum: number, item: any) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Aplicar descuento si existe
      const descuento = typeof invoiceData.descuento === 'number' ? invoiceData.descuento : 0;
      let baseConDescuento = baseImponible * (1 - descuento / 100);
      
      // Calcular descuento por provisiones asociadas
      let descuentoProvisiones = 0;
      if (provisionIds && provisionIds.length > 0) {
        // Buscar las provisiones seleccionadas
        const provisiones = await this.prisma.provisionFondos.findMany({
          where: { id: { in: provisionIds } },
        });
        descuentoProvisiones = provisiones.reduce((sum, prov) => sum + prov.amount, 0);
        console.log('🔍 UPDATE - Descuento por provisiones:', descuentoProvisiones);
      } else if (currentInvoice.provisionFondos.length > 0) {
        // Si no hay nuevas provisiones seleccionadas, usar las existentes
        descuentoProvisiones = currentInvoice.provisionFondos.reduce((sum, prov) => sum + prov.amount, 0);
        console.log('🔍 UPDATE - Usando provisiones existentes:', descuentoProvisiones);
      }
      
      // Validar que las provisiones no excedan la base imponible
      if (descuentoProvisiones > baseConDescuento) {
        const exceso = descuentoProvisiones - baseConDescuento;
        console.log('⚠️ UPDATE - ADVERTENCIA: Las provisiones exceden la base imponible');
        console.log('  - Base imponible:', baseConDescuento);
        console.log('  - Provisiones aplicadas:', descuentoProvisiones);
        console.log('  - Exceso:', exceso);
        
        // Agregar concepto de devolución de provisión
        const conceptoDevolucion = {
          description: `Devolución de Provisión (exceso de ${formatNumberES(exceso)}€)`,
          quantity: 1,
          unitPrice: -exceso,
          total: -exceso
        };
        
        // Agregar el concepto de devolución a los items
        items.push(conceptoDevolucion);
        console.log('  - Concepto de devolución agregado:', conceptoDevolucion);
        
        // Recalcular la base imponible incluyendo la devolución
        const nuevaBaseImponible = items.reduce((sum: number, item: any) => {
          const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
          const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
          return sum + (quantity * unitPrice);
        }, 0);
        
        console.log('  - Nueva base imponible con devolución:', nuevaBaseImponible);
        
        // Actualizar la base imponible para los cálculos posteriores
        baseImponible = nuevaBaseImponible;
        baseConDescuento = baseImponible * (1 - descuento / 100);
        
        // Ahora las provisiones no exceden la base
        descuentoProvisiones = Math.min(descuentoProvisiones, baseConDescuento);
        console.log('  - Provisiones ajustadas a:', descuentoProvisiones);
      }
      
      // Aplicar IVA solo si se especifica
      const aplicarIVA = invoiceData.aplicarIVA !== false; // Por defecto true
      const tipoIVA = typeof invoiceData.tipoIVA === 'number' ? invoiceData.tipoIVA : 21;
      
      // Calcular base imponible después de descuentos (SIN restar provisiones)
      // Las provisiones se restan del importe total a pagar, no de la base imponible
      const baseConDescuentos = Math.max(0, baseConDescuento);
      
      console.log('🔍 UPDATE - Cálculos:');
      console.log('  - Base imponible original:', baseImponible);
      console.log('  - Base con descuento (%):', baseConDescuento);
      console.log('  - Base final (sin provisiones):', baseConDescuentos);
      console.log('  - Provisiones a aplicar:', descuentoProvisiones);
      
      // Calcular IVA sobre la base con descuentos (sin provisiones)
      const cuotaIVA = aplicarIVA ? baseConDescuentos * (tipoIVA / 100) : 0;
      
      // Aplicar retención si existe
      const retencion = typeof invoiceData.retencion === 'number' ? invoiceData.retencion : 0;
      const cuotaRetencion = baseConDescuentos * (retencion / 100);
      
      // Calcular subtotal (base + IVA - retención)
      const subtotal = baseConDescuentos + cuotaIVA - cuotaRetencion;
      
      // Calcular total final restando las provisiones del importe a pagar
      const importeTotal = Math.max(0, subtotal - descuentoProvisiones);
      
      // Actualizar los totales calculados
      updateData.baseImponible = baseConDescuentos;
      updateData.cuotaIVA = cuotaIVA;
      updateData.importeTotal = importeTotal;
      updateData.tipoIVA = tipoIVA;
      updateData.descuento = descuento;
      updateData.retencion = retencion;
      updateData.aplicarIVA = aplicarIVA;
    }

    // Los items se actualizarán después de la actualización de la factura

    // Detectar cambios campo a campo
    const changes: Record<string, { oldValue: any; newValue: any }> = {};
    for (const key of Object.keys(updateData)) {
      if (typeof updateData[key] !== 'undefined' && updateData[key] !== currentInvoice[key]) {
        changes[key] = { oldValue: currentInvoice[key], newValue: updateData[key] };
      }
    }

    // Detectar cambios en items
    if (items) {
      const oldItems = (currentInvoice.items || []).map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice }));
      const newItems = items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice }));
      if (JSON.stringify(oldItems) !== JSON.stringify(newItems)) {
        changes['items'] = { oldValue: JSON.stringify(oldItems), newValue: JSON.stringify(newItems) };
      }
    }

    // Detectar cambios en provisiones
    if (provisionIds) {
      const oldProvisionIds = (currentInvoice.provisionFondos || []).map(p => p.id).sort();
      const newProvisionIds = [...provisionIds].sort();
      if (JSON.stringify(oldProvisionIds) !== JSON.stringify(newProvisionIds)) {
        changes['provisionFondos'] = { oldValue: JSON.stringify(oldProvisionIds), newValue: JSON.stringify(newProvisionIds) };
      }
    }

    // Actualizar la factura (sin items)
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData as any,
      include: {
        items: true,
        emisor: true,
        receptor: true,
        expediente: true,
        provisionFondos: true
      },
    });

    // Si hay items, actualizarlos por separado
    if (items && items.length > 0) {
      // Eliminar items existentes
      await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      
      // Crear nuevos items
      await this.prisma.invoiceItem.createMany({
        data: items.map(item => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }))
      });
    }

    // Obtener la factura actualizada con todos los datos
    const finalInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        emisor: true,
        receptor: true,
        expediente: true,
        provisionFondos: true
      },
    });

    // Asociar nuevas provisiones si se cambiaron
    if (provisionIds) {
      await this.prisma.provisionFondos.updateMany({
        where: { invoiceId: id, id: { notIn: provisionIds } },
        data: { invoiceId: null }
      });
      await this.prisma.provisionFondos.updateMany({
        where: { id: { in: provisionIds } },
        data: { invoiceId: id }
      });
    }

    // Registrar auditoría si hay cambios y hay usuario
    if (userId && Object.keys(changes).length > 0) {
      await this.invoiceAuditService.logInvoiceUpdate(id, userId, changes, ipAddress, userAgent);
    }

    return finalInvoice;
  }

  async remove(id: string) {
    // Primero verificamos que la factura existe
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true }
    });
    
    if (!invoice) {
      throw new Error('Factura no encontrada');
    }

    // Verificar si la factura puede ser anulada
    if (!isInvoiceCancellable(invoice.estado)) {
      throw new Error(`No se puede eliminar una factura con estado '${invoice.estado}'. Solo se pueden eliminar facturas en estado 'borrador', 'emitida' o 'enviada'.`);
    }

    // Usamos una transacción para asegurar que todo se elimine correctamente
    return await this.prisma.$transaction(async (prisma) => {
      // 1. Desvincular provisiones de fondos asociadas
      await prisma.provisionFondos.updateMany({
        where: { invoiceId: id },
        data: { invoiceId: null }
      });

      // 2. Eliminar los items de la factura
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      // 3. Eliminar la factura
      return await prisma.invoice.delete({
        where: { id },
        include: { items: true, emisor: true, receptor: true, expediente: true }
      });
    });
  }

  async sign(id: string, certPath?: string, keyPath?: string, certContent?: string, keyContent?: string) {
    // Obtener la factura y su XML
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice || !invoice.xml) {
      throw new Error('Factura o XML no encontrado');
    }
    // Obtener el contenido del certificado y la clave
    let cert = certContent;
    let key = keyContent;
    if (!cert && certPath) {
      cert = fs.readFileSync(certPath, 'utf8');
    }
    if (!key && keyPath) {
      key = fs.readFileSync(keyPath, 'utf8');
    }
    if (!cert || !key) {
      throw new Error('Certificado o clave no proporcionados');
    }
    // Firmar el XML
    const xmlFirmado = await signFacturaeXML(invoice.xml, cert, key);
    // Guardar el XML firmado
    await this.prisma.invoice.update({
      where: { id },
      data: { xmlFirmado },
    });
    return { ...invoice, xmlFirmado };
  }

  async generateXmlForInvoices(ids: string[], userId: string) {
    const result = [];
    for (const id of ids) {
      const invoice = await this.prisma.invoice.findUnique({ where: { id }, include: { emisor: true, items: true, receptor: true, expediente: true } });
      if (!invoice) throw new Error(`Factura ${id} no encontrada`);
      if (invoice.emisorId !== userId) throw new Error(`No autorizado para la factura ${id}`);
      // Generar XML si no existe
      let xml = invoice.xml;
      if (!xml) {
        xml = generateFacturaeXMLFromInvoice(invoice);
        await this.prisma.invoice.update({ where: { id }, data: { xml } });
      }
      result.push({ id, xml });
    }
    return result;
  }

  async saveSignedXml(id: string, signedXml: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error('Factura no encontrada');
    if (invoice.emisorId !== userId) throw new Error('No autorizado para firmar esta factura');
    await this.prisma.invoice.update({ where: { id }, data: { xmlFirmado: signedXml } });
    return { id, status: 'signed' };
  }

  async annul(id: string, motivoAnulacion: string, userId: string) {
    // Solo el emisor puede anular
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error('Factura no encontrada');
    if (invoice.emisorId !== userId) throw new Error('No autorizado para anular esta factura');
    if (invoice.estado === 'anulada') throw new Error('La factura ya está anulada');
    return this.prisma.invoice.update({
      where: { id },
      data: {
        estado: 'anulada',
        motivoAnulacion,
      },
      include: { items: true, emisor: true, receptor: true, expediente: true },
    });
  }

  async findByClientId(clientId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { receptorId: clientId },
      include: { emisor: true, receptor: true, expediente: true, items: true, provisionFondos: true },
    });
    // Añadir qrData a cada factura
    return invoices.map(invoice => ({
      ...invoice,
      qrData: [
        `NIF:${invoice.emisor?.email || ''}`,
        `NUM:${invoice.numeroFactura || ''}`,
        `FEC:${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}`,
        `IMP:${invoice.importeTotal || ''}`
      ].join('|')
    }));
  }

  async createForClient(clientId: string, createInvoiceDto: CreateInvoiceDto, userId: string) {
    const {
      numeroFactura, fechaFactura, tipoFactura, expedienteId, importeTotal, baseImponible, cuotaIVA, tipoIVA,
      descuento, retencion, aplicarIVA, regimenIvaEmisor, claveOperacion, metodoPago, fechaOperacion, estado,
      motivoAnulacion, items
    } = createInvoiceDto;
    return this.prisma.invoice.create({
      data: {
        numeroFactura,
        fechaFactura: fechaFactura ? new Date(fechaFactura) : undefined,
        tipoFactura,
        expedienteId,
        importeTotal,
        baseImponible,
        cuotaIVA,
        tipoIVA,
        descuento,
        retencion,
        aplicarIVA,
        regimenIvaEmisor,
        claveOperacion,
        metodoPago,
        fechaOperacion: fechaOperacion ? new Date(fechaOperacion) : undefined,
        estado,
        motivoAnulacion,
        emisorId: userId,
        receptorId: clientId,
        items: items ? { create: items } : undefined,
      },
      include: { items: true }
    });
  }

  async updateForClient(clientId: string, invoiceId: string, updateInvoiceDto: UpdateInvoiceDto, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, receptorId: clientId } });
    if (!invoice) throw new Error('Factura no encontrada para este cliente');
    
    // Solo permitir actualizar campos específicos para clientes
    const {
      fechaFactura, expedienteId, tipoIVA, descuento, retencion, aplicarIVA,
      regimenIvaEmisor, claveOperacion, metodoPago, fechaOperacion, estado,
      motivoAnulacion, paymentDate
    } = updateInvoiceDto;
    
    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        fechaFactura: fechaFactura ? new Date(fechaFactura) : undefined,
        expedienteId,
        tipoIVA,
        descuento,
        retencion,
        aplicarIVA,
        regimenIvaEmisor,
        claveOperacion,
        metodoPago,
        fechaOperacion: fechaOperacion ? new Date(fechaOperacion) : undefined,
        estado,
        motivoAnulacion,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      }
    });
  }

  async patchForClient(clientId: string, invoiceId: string, updateInvoiceDto: UpdateInvoiceDto, userId: string) {
    return this.updateForClient(clientId, invoiceId, updateInvoiceDto, userId);
  }

  async deleteForClient(clientId: string, invoiceId: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, receptorId: clientId } });
    if (!invoice) throw new Error('Factura no encontrada para este cliente');
    await this.prisma.invoice.delete({ where: { id: invoiceId } });
    return { message: 'Factura eliminada exitosamente' };
  }

  async findForClient(clientId: string, lawyerId?: string, paymentDate?: string) {
    console.log('=== findForClient CALLED [DEBUG] ===');
    console.log('Parameters:', { clientId, lawyerId, paymentDate });
    
    const where: any = { receptorId: clientId };
    console.log('Initial where clause:', where);
    
    if (lawyerId) {
      where.emisorId = lawyerId;
      console.log('Added lawyerId filter:', where);
    }
    
    if (paymentDate) {
      // Filtrar por fecha de pago exacta (ignorando hora)
      const date = new Date(paymentDate);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      where.paymentDate = { gte: date, lt: nextDay };
      console.log('Added paymentDate filter:', where);
    }
    
    console.log('Final Prisma where filter:', JSON.stringify(where, null, 2));
    
    try {
      const invoices = await this.prisma.invoice.findMany({
        where,
        include: { 
          emisor: true,
          receptor: true,
          expediente: true,
          items: true,
          provisionFondos: true
        },
        orderBy: { fechaFactura: 'desc' },
      });
      
      console.log('Facturas encontradas en DB:', invoices.length);
      console.log('Primera factura (si existe):', invoices[0] ? {
        id: invoices[0].id,
        numeroFactura: invoices[0].numeroFactura,
        receptorId: invoices[0].receptorId,
        emisorId: invoices[0].emisorId
      } : 'No hay facturas');
      
      const result = invoices.map((inv: any) => ({
        id: inv.id,
        numeroFactura: inv.numeroFactura,
        fechaEmision: inv.fechaFactura,
        fechaFactura: inv.fechaFactura,
        tipoFactura: inv.tipoFactura,
        estado: inv.estado,
        receptorId: inv.receptorId,
        importeTotal: inv.importeTotal,
        baseImponible: inv.baseImponible,
        cuotaIVA: inv.cuotaIVA,
        tipoIVA: inv.tipoIVA,
        regimenIvaEmisor: inv.regimenIvaEmisor,
        claveOperacion: inv.claveOperacion,
        metodoPago: inv.metodoPago,
        fechaOperacion: inv.fechaOperacion,
        items: inv.items || [],
        receptor: inv.receptor,
        emisor: inv.emisor,
        expediente: inv.expediente,
        provisionFondos: inv.provisionFondos || [],
        createdAt: inv.createdAt,
        updatedAt: inv.updatedAt,
        motivoAnulacion: inv.motivoAnulacion,
        aplicarIVA: inv.aplicarIVA,
        retencion: inv.retencion,
        descuento: inv.descuento,
        tipoImpuesto: inv.tipoImpuesto,
        selloTiempo: inv.selloTiempo,
        emisorId: inv.emisorId,
        expedienteId: inv.expedienteId,
        xml: inv.xml,
        xmlFirmado: inv.xmlFirmado,
        paymentDate: inv.paymentDate,
        fechaVencimiento: inv.fechaVencimiento,
        concepto: inv.concepto,
        observaciones: inv.observaciones,
      }));
      
      console.log('Result mapped, returning:', result.length, 'invoices');
      return result;
    } catch (error) {
      console.error('Error in findForClient:', error);
      throw error;
    }
  }

  async getClientsWithInvoices() {
    // Usando Prisma para agrupar facturas por receptorId (cliente)
    const grouped = await this.prisma.invoice.groupBy({
      by: ['receptorId'],
      _count: { id: true },
    });
    const clientIds = grouped.map(g => g.receptorId);
    if (clientIds.length === 0) return [];
    // Obtener datos de los clientes
    const clients = await this.prisma.user.findMany({
      where: { id: { in: clientIds }, role: 'CLIENTE' },
      select: { id: true, name: true, email: true },
    });
    // Unir datos
    return clients.map(client => {
      const count = grouped.find(g => g.receptorId === client.id)?._count.id || 0;
      return { clientId: client.id, name: client.name, email: client.email, facturaCount: count };
    });
  }

  // ===== NUEVOS MÉTODOS PARA FACTURACIÓN ELECTRÓNICA AVANZADA =====

  /**
   * Genera y firma una factura electrónica con XAdES avanzado
   */
  async generateAndSignInvoiceAdvanced(
    id: string, 
    options: Partial<SigningOptions> = {}
  ): Promise<FacturaeGenerationResult> {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id },
        include: { 
          items: true, 
          emisor: true, 
          receptor: true, 
          expediente: true 
        }
      });

      if (!invoice) {
        throw new Error('Factura no encontrada');
      }

      // Convertir a formato FacturaeDocument
      const facturaeData = this.convertToFacturaeDocument(invoice);
      
      // Generar y firmar usando el servicio avanzado
      const result = await this.facturaeService.generateAndSignInvoice(facturaeData, options);
      
      if (result.success && result.signedXmlContent) {
        // Guardar XML firmado en la base de datos
        await this.prisma.invoice.update({
          where: { id },
          data: { 
            xmlFirmado: result.signedXmlContent,
            xml: result.xmlContent 
          }
        });
      }

      return result;
    } catch (error) {
      this.logger.error('Error en generateAndSignInvoiceAdvanced', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * Valida una factura electrónica
   */
  async validateInvoice(id: string, checkSignature: boolean = true): Promise<ValidationResult> {
    try {
      const invoice = await this.prisma.invoice.findUnique({ where: { id } });
      if (!invoice || !invoice.xml) {
        throw new Error('Factura o XML no encontrado');
      }

      const xmlToValidate = checkSignature && invoice.xmlFirmado ? invoice.xmlFirmado : invoice.xml;
      return await this.facturaeService.validateInvoice(xmlToValidate, checkSignature);
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
   * Obtiene información del certificado
   */
  async getCertificateInfo() {
    return await this.facturaeService.getCertificateInfo();
  }

  /**
   * Verifica el estado del certificado
   */
  async checkCertificateStatus() {
    return await this.facturaeService.checkCertificateStatus();
  }

  /**
   * Genera un reporte de validación
   */
  async generateValidationReport(id: string): Promise<string> {
    try {
      const invoice = await this.prisma.invoice.findUnique({ where: { id } });
      if (!invoice || !invoice.xml) {
        throw new Error('Factura o XML no encontrado');
      }

      const xmlToValidate = invoice.xmlFirmado || invoice.xml;
      return await this.facturaeService.generateValidationReport(xmlToValidate);
    } catch (error) {
      this.logger.error('Error al generar reporte', error);
      return `Error al generar reporte: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Convierte una factura de la base de datos al formato FacturaeDocument
   */
  private convertToFacturaeDocument(invoice: any): FacturaeDocument {
    return {
      fileHeader: {
        schemaVersion: '3.2.2',
        modality: 'I',
        issuerParty: {
          taxIdentification: {
            personTypeCode: 'J',
            residenceTypeCode: 'R',
            taxIdentificationNumber: invoice.emisor?.dni || 'B00000000'
          },
          legalEntity: {
            corporateName: invoice.emisor?.name || 'Empresa Emisora'
          },
          address: {
            address: 'Dirección del Emisor',
            postCode: '28001',
            town: 'Madrid',
            province: 'Madrid',
            countryCode: 'ESP'
          }
        },
        receiverParty: {
          taxIdentification: {
            personTypeCode: 'J',
            residenceTypeCode: 'R',
            taxIdentificationNumber: invoice.receptor?.dni || 'B00000000'
          },
          legalEntity: {
            corporateName: invoice.receptor?.name || 'Empresa Receptora'
          },
          address: {
            address: 'Dirección del Receptor',
            postCode: '28001',
            town: 'Madrid',
            province: 'Madrid',
            countryCode: 'ESP'
          }
        },
        documentType: 'FC'
      },
      part: {
        sellerParty: {
          taxIdentification: {
            personTypeCode: 'J',
            residenceTypeCode: 'R',
            taxIdentificationNumber: invoice.emisor?.dni || 'B00000000'
          },
          legalEntity: {
            corporateName: invoice.emisor?.name || 'Empresa Emisora'
          },
          address: {
            address: 'Dirección del Emisor',
            postCode: '28001',
            town: 'Madrid',
            province: 'Madrid',
            countryCode: 'ESP'
          }
        },
        buyerParty: {
          taxIdentification: {
            personTypeCode: 'J',
            residenceTypeCode: 'R',
            taxIdentificationNumber: invoice.receptor?.dni || 'B00000000'
          },
          legalEntity: {
            corporateName: invoice.receptor?.name || 'Empresa Receptora'
          },
          address: {
            address: 'Dirección del Receptor',
            postCode: '28001',
            town: 'Madrid',
            province: 'Madrid',
            countryCode: 'ESP'
          }
        },
        invoices: [{
          invoiceHeader: {
            invoiceNumber: invoice.numeroFactura || 'FAC-001',
            invoiceDocumentType: 'FC',
            invoiceClass: 'OO'
          },
          invoiceIssueData: {
            issueDate: invoice.fechaFactura || new Date(),
            languageCode: 'es',
            currencyCode: 'EUR'
          },
          invoiceTotals: {
            totalGrossAmount: invoice.importeTotal || 0,
            totalGrossAmountBeforeTaxes: invoice.baseImponible || 0,
            totalTaxOutputs: invoice.cuotaIVA || 0,
            totalTaxesWithheld: 0,
            invoiceTotal: invoice.importeTotal || 0,
            totalOutstandingAmount: invoice.importeTotal || 0,
            totalExecutableAmount: invoice.importeTotal || 0
          },
          items: (invoice.items || []).map((item: any) => ({
            itemDescription: item.description || '',
            quantity: item.quantity || 0,
            unitPriceWithoutTax: item.unitPrice || 0,
            totalCost: (item.quantity || 0) * (item.unitPrice || 0),
            grossAmount: item.total || 0
          }))
        }]
      }
    };
  }

  /**
   * Genera un PDF profesional de la factura usando el template HTML profesional
   * @param invoice Datos de la factura
   * @returns Buffer del PDF generado
   */
  async generateInvoicePdfWithQR(invoice: any): Promise<Buffer> {
    try {
      this.logger.log('Generando PDF simple y confiable');
      
      // Crear un PDF simple y confiable usando pdf-lib
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();

      // Configurar fuentes
      const helveticaFont = await pdfDoc.embedFont('Helvetica');
      const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');

      // Colores
      const primaryColor = rgb(0, 0.2, 0.4);
      const darkGray = rgb(0.2, 0.2, 0.2);

      // Título
      page.drawText('FACTURA', {
        x: 50,
        y: height - 60,
        size: 24,
        font: helveticaBoldFont,
        color: primaryColor
      });

      // Número de factura
      page.drawText(`Número: ${invoice.numeroFactura || 'N/A'}`, {
        x: 50,
        y: height - 100,
        size: 14,
        font: helveticaFont,
        color: darkGray
      });

      // Fecha
      const fechaText = invoice.fechaFactura ? new Date(invoice.fechaFactura).toLocaleDateString('es-ES') : 'N/A';
      page.drawText(`Fecha: ${fechaText}`, {
        x: 50,
        y: height - 120,
        size: 14,
        font: helveticaFont,
        color: darkGray
      });

      // Importe total
      page.drawText(`Importe Total: ${invoice.importeTotal || 0} €`, {
        x: 50,
        y: height - 140,
        size: 16,
        font: helveticaBoldFont,
        color: primaryColor
      });

      // Estado
      page.drawText(`Estado: ${invoice.estado || 'N/A'}`, {
        x: 50,
        y: height - 160,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });

      // Emisor
      if (invoice.emisor) {
        page.drawText(`Emisor: ${invoice.emisor.name || 'N/A'}`, {
          x: 50,
          y: height - 180,
          size: 12,
          font: helveticaFont,
          color: darkGray
        });
      }

      // Receptor
      if (invoice.receptor) {
        page.drawText(`Receptor: ${invoice.receptor.name || 'N/A'}`, {
          x: 50,
          y: height - 200,
          size: 12,
          font: helveticaFont,
          color: darkGray
        });
      }

      // Generar QR según normativa española de facturación electrónica
      try {
        // Formatear fecha en formato ISO
        const fechaFactura = invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : '';
        
        // Formatear importe con 2 decimales
        const importeTotal = (invoice.importeTotal || 0).toFixed(2);
        
        // Obtener NIF del emisor (si está disponible)
        const nifEmisor = invoice.emisor?.dni || invoice.emisor?.nif || '';
        
        // Obtener NIF del receptor (si está disponible)
        const nifReceptor = invoice.receptor?.dni || invoice.receptor?.nif || '';
        
        // Generar hash de integridad
        const invoiceHash = this.generateInvoiceHash(invoice);
        
        // Construir datos del QR según normativa española con hash
        // Formato: NIF|NUM|FEC|IMP|TIPO|HASH
        const qrData = [
          `NIF:${nifEmisor}`,
          `NUM:${invoice.numeroFactura || ''}`,
          `FEC:${fechaFactura}`,
          `IMP:${importeTotal}`,
          `TIPO:${invoice.tipoFactura || 'F'}`,
          `NIF_RECEPTOR:${nifReceptor}`,
          `ESTADO:${invoice.estado || 'EMITIDA'}`,
          `HASH:${invoiceHash}`
        ].join('|');
        
        this.logger.log('QR Data generado:', qrData);
        
        // Guardar los datos del QR en la factura para su reutilización
        invoice.qrData = qrData;
        
        const qrImageDataUrl = await QRCode.toDataURL(qrData, { 
          errorCorrectionLevel: 'M', 
          width: 200,
          margin: 2
        });
        const qrImageBase64 = qrImageDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrImageBytes = Buffer.from(qrImageBase64, 'base64');
        
        // Insertar imagen QR
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        const qrDims = qrImage.scale(0.6);
        page.drawImage(qrImage, {
          x: width - 120,
          y: height - 120,
          width: qrDims.width,
          height: qrDims.height
        });
        
        // Agregar texto explicativo del QR
        page.drawText('Código QR para facturación electrónica', {
          x: width - 120,
          y: height - 140,
          size: 8,
          font: helveticaFont,
          color: darkGray
        });
        
        this.logger.log('QR generado exitosamente con datos normativos');
      } catch (qrError) {
        this.logger.warn('Error generando QR, continuando sin QR:', qrError);
      }

      // Generar el PDF
      const pdfBytes = await pdfDoc.save();
      this.logger.log('PDF simple generado exitosamente');
      return Buffer.from(pdfBytes);
      
    } catch (error) {
      this.logger.error('Error generando PDF simple:', error);
      throw new Error('Error generando PDF simple');
    }
  }

  /**
   * Convierte HTML a PDF usando Puppeteer con manejo de errores robusto
   */
  private async htmlToPdfWithPuppeteer(htmlContent: string): Promise<Buffer> {
    const puppeteer = await import('puppeteer');
    let browser;
    
    try {
      this.logger.log('[PUPPETEER] Iniciando Puppeteer...');
      browser = await puppeteer.default.launch({
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

      // Configurar viewport
      await page.setViewport({ 
        width: 900, 
        height: 1200,
        deviceScaleFactor: 2
      });

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

      // Establecer contenido HTML con CSS compacto
      this.logger.log('[PUPPETEER] Estableciendo contenido HTML con CSS compacto...');
      const htmlWithCompactCss = htmlContent.replace('</head>', `${compactCss}</head>`);
      await page.setContent(htmlWithCompactCss, { 
        waitUntil: ['networkidle0', 'domcontentloaded', 'load'] 
      });

      // Esperar un poco más para asegurar que todo se renderice
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generar PDF optimizado para una sola página
      this.logger.log('[PUPPETEER] Generando PDF optimizado...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: {
          top: '5mm',
          right: '5mm',
          bottom: '5mm',
          left: '5mm'
        },
        displayHeaderFooter: false,
        scale: 0.8,
        timeout: 30000,
        waitForFunction: 'document.readyState === "complete"'
      });

      // Asegura que pdfBuffer es un Buffer
      if (!Buffer.isBuffer(pdfBuffer)) {
        return Buffer.from(pdfBuffer);
      }

      this.logger.log(`[PUPPETEER] PDF generado. Tamaño: ${pdfBuffer.length} bytes`);
      return pdfBuffer;
    } catch (error) {
      this.logger.error('[PUPPETEER] Error:', error);
      throw error;
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          this.logger.warn('[PUPPETEER] Error cerrando browser:', closeError);
        }
      }
    }
  }

  /**
   * Método de fallback para generar PDF básico
   */
  private async generateInvoicePdfFallback(invoice: any): Promise<Buffer> {
    try {
      this.logger.log('Generando PDF profesional con pdf-lib (formato mejorado)');
      
      // 1. Construir la cadena de datos para el QR según la normativa española con hash
      const fechaFactura = invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : '';
      const importeTotal = (invoice.importeTotal || 0).toFixed(2);
      const nifEmisor = invoice.emisor?.dni || invoice.emisor?.nif || '';
      const nifReceptor = invoice.receptor?.dni || invoice.receptor?.nif || '';
      
      // Generar hash de integridad
      const invoiceHash = this.generateInvoiceHash(invoice);
      
      const qrData = [
        `NIF:${nifEmisor}`,
        `NUM:${invoice.numeroFactura || ''}`,
        `FEC:${fechaFactura}`,
        `IMP:${importeTotal}`,
        `TIPO:${invoice.tipoFactura || 'F'}`,
        `NIF_RECEPTOR:${nifReceptor}`,
        `ESTADO:${invoice.estado || 'EMITIDA'}`,
        `HASH:${invoiceHash}`
      ].join('|');

      // Guardar el contenido del QR en el modelo de factura para su reutilización
      invoice.qrData = qrData;

      // 2. Generar imagen QR en base64
      const qrImageDataUrl = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'M', width: 200 });
      const qrImageBase64 = qrImageDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrImageBytes = Buffer.from(qrImageBase64, 'base64');

      // 3. Crear PDF profesional
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4
      const { width, height } = page.getSize();

      // 4. Configurar fuentes
      const helveticaFont = await pdfDoc.embedFont('Helvetica');
      const helveticaBoldFont = await pdfDoc.embedFont('Helvetica-Bold');

      // 5. Colores corporativos (similar al template HTML)
      const primaryColor = rgb(0, 0.2, 0.4); // #003366
      const secondaryColor = rgb(0.4, 0.4, 0.4); // #666
      const lightGray = rgb(0.95, 0.95, 0.95); // #f8fafc
      const darkGray = rgb(0.2, 0.2, 0.2); // #222

      // 6. Encabezado profesional
      // Logo y título
      page.drawText('DL', {
        x: 50,
        y: height - 60,
        size: 24,
        font: helveticaBoldFont,
        color: primaryColor
      });

      page.drawText('Despacho Legal', {
        x: 80,
        y: height - 60,
        size: 20,
        font: helveticaBoldFont,
        color: primaryColor
      });

      page.drawText('Servicios Jurídicos Profesionales', {
        x: 80,
        y: height - 80,
        size: 12,
        font: helveticaFont,
        color: secondaryColor
      });

      page.drawText('Especialistas en Derecho Civil y Mercantil', {
        x: 80,
        y: height - 95,
        size: 12,
        font: helveticaFont,
        color: secondaryColor
      });

      // 7. Información de la factura (centrada)
      const facturaText = `FACTURA ${invoice.numeroFactura || 'N/A'}`;
      const facturaWidth = helveticaBoldFont.widthOfTextAtSize(facturaText, 16);
      page.drawText(facturaText, {
        x: (width - facturaWidth) / 2,
        y: height - 130,
        size: 16,
        font: helveticaBoldFont,
        color: primaryColor
      });

      const fechaText = invoice.fechaFactura ? new Date(invoice.fechaFactura).toLocaleDateString('es-ES') : 'N/A';
      const fechaWidth = helveticaFont.widthOfTextAtSize(fechaText, 12);
      page.drawText(fechaText, {
        x: (width - fechaWidth) / 2,
        y: height - 150,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });

      // Estado con badge
      const estadoText = (invoice.estado || 'EMITIDA').toUpperCase();
      const estadoWidth = helveticaBoldFont.widthOfTextAtSize(estadoText, 10);
      page.drawText(estadoText, {
        x: (width - estadoWidth) / 2,
        y: height - 165,
        size: 10,
        font: helveticaBoldFont,
        color: rgb(0.1, 0.4, 0.1) // Verde oscuro
      });

      // 8. Secciones de datos (EMISOR y RECEPTOR)
      let yPosition = height - 200;

      // EMISOR
      page.drawText('EMISOR', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor
      });
      yPosition -= 20;

      page.drawText(`Nombre: ${invoice.emisor?.name || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      yPosition -= 15;

      page.drawText(`Email: ${invoice.emisor?.email || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      yPosition -= 15;

      page.drawText(`Régimen IVA: ${invoice.regimenIvaEmisor || 'General'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      yPosition -= 30;

      // RECEPTOR
      page.drawText('RECEPTOR', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor
      });
      yPosition -= 20;

      page.drawText(`Nombre: ${invoice.receptor?.name || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      yPosition -= 15;

      page.drawText(`Email: ${invoice.receptor?.email || 'N/A'}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      yPosition -= 15;

      if (invoice.expediente?.title) {
        page.drawText(`Expediente: ${invoice.expediente.title}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: helveticaFont,
          color: darkGray
        });
        yPosition -= 15;
      }
      yPosition -= 20;

      // 9. Tabla de conceptos (si hay items)
      if (invoice.items && invoice.items.length > 0) {
        page.drawText('CONCEPTOS', {
          x: 50,
          y: yPosition,
          size: 14,
          font: helveticaBoldFont,
          color: primaryColor
        });
        yPosition -= 25;

        // Cabecera de tabla
        page.drawText('Descripción', {
          x: 50,
          y: yPosition,
          size: 12,
          font: helveticaBoldFont,
          color: rgb(1, 1, 1)
        });
        page.drawText('Cant.', {
          x: 300,
          y: yPosition,
          size: 12,
          font: helveticaBoldFont,
          color: rgb(1, 1, 1)
        });
        page.drawText('Precio', {
          x: 380,
          y: yPosition,
          size: 12,
          font: helveticaBoldFont,
          color: rgb(1, 1, 1)
        });
        page.drawText('Total', {
          x: 480,
          y: yPosition,
          size: 12,
          font: helveticaBoldFont,
          color: rgb(1, 1, 1)
        });
        yPosition -= 20;

        // Items
        for (const item of invoice.items) {
          page.drawText(item.description || '', {
            x: 50,
            y: yPosition,
            size: 11,
            font: helveticaFont,
            color: darkGray
          });
          page.drawText((item.quantity || 0).toString(), {
            x: 300,
            y: yPosition,
            size: 11,
            font: helveticaFont,
            color: darkGray
          });
          page.drawText(`${(item.unitPrice || 0).toFixed(2)} €`, {
            x: 380,
            y: yPosition,
            size: 11,
            font: helveticaFont,
            color: darkGray
          });
          page.drawText(`${(item.total || 0).toFixed(2)} €`, {
            x: 480,
            y: yPosition,
            size: 11,
            font: helveticaFont,
            color: darkGray
          });
          yPosition -= 15;
        }
        yPosition -= 20;
      }

      // 10. Totales
      page.drawText('TOTALES', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor
      });
      yPosition -= 25;

      // Base imponible
      page.drawText('Base Imponible:', {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      page.drawText(`${(invoice.baseImponible || 0).toFixed(2)} €`, {
        x: 480,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      yPosition -= 15;

      // IVA
      page.drawText(`IVA (${invoice.tipoIVA || 21}%):`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      page.drawText(`${(invoice.cuotaIVA || 0).toFixed(2)} €`, {
        x: 480,
        y: yPosition,
        size: 12,
        font: helveticaFont,
        color: darkGray
      });
      yPosition -= 20;

      // Total
      page.drawText('TOTAL:', {
        x: 50,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor
      });
      page.drawText(`${(invoice.importeTotal || 0).toFixed(2)} €`, {
        x: 480,
        y: yPosition,
        size: 14,
        font: helveticaBoldFont,
        color: primaryColor
      });

      // 11. Insertar QR en el PDF (esquina inferior derecha)
      try {
        const qrImage = await pdfDoc.embedPng(qrImageBytes);
        page.drawImage(qrImage, {
          x: width - 120,
          y: 120,
          width: 80,
          height: 80,
        });

        // Texto del QR
        page.drawText('Verifica esta factura', {
          x: width - 120,
          y: 100,
          size: 8,
          font: helveticaFont,
          color: secondaryColor
        });
        page.drawText('escaneando el QR', {
          x: width - 120,
          y: 90,
          size: 8,
          font: helveticaFont,
          color: secondaryColor
        });
      } catch (error) {
        this.logger.warn('No se pudo insertar el QR en el PDF:', error);
      }

      // 12. Pie de página
      page.drawText('Firmado electrónicamente conforme a la ley vigente.', {
        x: 50,
        y: 60,
        size: 10,
        font: helveticaFont,
        color: secondaryColor
      });
      page.drawText(`Generado el: ${new Date().toLocaleString('es-ES')}`, {
        x: 50,
        y: 45,
        size: 10,
        font: helveticaFont,
        color: secondaryColor
      });

      // 13. Finalizar PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      this.logger.log('PDF generado exitosamente con formato profesional');
      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error en generateInvoicePdfFallback:', error);
      throw error;
    }
  }

  async markAsSigned(id: string) {
    await this.prisma.invoice.update({
      where: { id },
      data: {
        estado: 'firmada',
        updatedAt: new Date(),
      },
    });
    this.logger.log(`Factura ${id} marcada como firmada.`);
  }

  async generateInvoiceHtml(invoice: any): Promise<string> {
    // Log para debug de provisiones
    console.log('🔍 [generateInvoiceHtml] Invoice recibida:', {
      id: invoice.id,
      numeroFactura: invoice.numeroFactura,
      baseImponible: invoice.baseImponible,
      cuotaIVA: invoice.cuotaIVA,
      importeTotal: invoice.importeTotal,
      provisionFondos: invoice.provisionFondos?.length || 0,
      facturaOriginalId: invoice.facturaOriginalId,
      tipoRectificacion: invoice.tipoRectificacion
    });
    
    if (invoice.provisionFondos && invoice.provisionFondos.length > 0) {
      console.log('🔍 [generateInvoiceHtml] Provisiones encontradas:', invoice.provisionFondos.map((p: any) => ({
        id: p.id,
        description: p.description,
        amount: p.amount
      })));
    }
    
    // Calcular el TOTAL para el QR (base + IVA - retención, sin restar provisiones)
    const totalParaQR = Number(invoice.baseImponible || 0) + 
      Number(invoice.cuotaIVA || 0) - 
      (Number(invoice.baseImponible || 0) * (Number(invoice.retencion || 0) / 100));
    
    console.log('🔍 [generateInvoiceHtml] Total para QR calculado:', totalParaQR);
    
    // Generar hash de integridad
    const invoiceHash = this.generateInvoiceHash(invoice);
    
    // Generar qrData con el total correcto y hash
    const fechaFactura = invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : '';
    const importeTotal = Math.round(totalParaQR * 100) / 100;
    const nifEmisor = invoice.emisor?.dni || invoice.emisor?.nif || '';
    const nifReceptor = invoice.receptor?.dni || invoice.receptor?.nif || '';
    
    const qrData = [
      `NIF:${nifEmisor}`,
      `NUM:${invoice.numeroFactura || ''}`,
      `FEC:${fechaFactura}`,
      `IMP:${importeTotal}`,
      `TIPO:${invoice.tipoFactura || 'F'}`,
      `NIF_RECEPTOR:${nifReceptor}`,
      `ESTADO:${invoice.estado || 'EMITIDA'}`,
      `HASH:${invoiceHash}`
    ].join('|');
    
    console.log('🔍 [generateInvoiceHtml] QR Data generado:', qrData);
    
    const qrImageDataUrl = await (await import('qrcode')).toDataURL(qrData, { errorCorrectionLevel: 'M', width: 200, margin: 2 });
    
    // Si es una factura rectificativa, obtener los datos de la factura original
    if (invoice.facturaOriginalId) {
      console.log('🔄 [generateInvoiceHtml] Es factura rectificativa, obteniendo datos de factura original');
      const facturaOriginal = await this.prisma.invoice.findUnique({
        where: { id: invoice.facturaOriginalId },
        include: { emisor: true, receptor: true, expediente: true }
      });
      
      if (facturaOriginal) {
        console.log('✅ [generateInvoiceHtml] Datos de factura original obtenidos:', {
          numeroFactura: facturaOriginal.numeroFactura,
          fechaFactura: facturaOriginal.fechaFactura,
          importeTotal: facturaOriginal.importeTotal
        });
        invoice.facturaOriginal = facturaOriginal;
      } else {
        console.warn('⚠️ [generateInvoiceHtml] No se encontró la factura original:', invoice.facturaOriginalId);
      }
    }
    
    const templateData = await this.pdfGeneratorService.prepareTemplateData(invoice, qrData, qrImageDataUrl);
    const fullHtml = await this.pdfGeneratorService.generateHtml(templateData);
    // Extraer solo <style> y <body> para la previsualización
    const styleMatch = fullHtml.match(/<style[\s\S]*?<\/style>/i);
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const style = styleMatch ? styleMatch[0] : '';
    const body = bodyMatch ? bodyMatch[1] : fullHtml;
    return `${style}\n${body}`;
  }

  /**
   * Maneja la devolución de provisiones para facturas rectificativas
   */
  private async handleRectificativaProvisiones(
    facturaOriginalId: string, 
    facturaRectificativaId: string, 
    tipoRectificacion: string, 
    importeRectificativa: number
  ) {
    try {
      console.log('🔄 Iniciando devolución de provisiones para rectificativa');
      
      // Obtener la factura original con sus provisiones
      const facturaOriginal = await this.prisma.invoice.findUnique({
        where: { id: facturaOriginalId },
        include: { provisionFondos: true }
      });

      if (!facturaOriginal) {
        console.warn('⚠️ Factura original no encontrada:', facturaOriginalId);
        return;
      }

      const provisionesOriginales = facturaOriginal.provisionFondos || [];
      console.log('📋 Provisiones de factura original:', provisionesOriginales.length);

      if (provisionesOriginales.length === 0) {
        console.log('ℹ️ No hay provisiones que devolver');
        return;
      }

      // Calcular factor de devolución según tipo de rectificación
      let factorDevolucion = 1.0; // 100% por defecto
      
      switch (tipoRectificacion) {
        case 'R1': // Anulación completa
          factorDevolucion = 1.0; // Devolver 100%
          console.log('🔄 R1 - Anulación completa: Devolver 100% de provisiones');
          break;
          
        case 'R2': // Corrección (solo datos, no importes)
          factorDevolucion = 0.0; // No devolver nada
          console.log('🔄 R2 - Corrección: No devolver provisiones');
          break;
          
        case 'R3': // Descuento
        case 'R4': // Devolución
          // Calcular proporción basada en la diferencia de importes
          const diferencia = facturaOriginal.importeTotal - importeRectificativa;
          if (diferencia > 0) {
            factorDevolucion = diferencia / facturaOriginal.importeTotal;
            console.log(`🔄 ${tipoRectificacion} - Diferencia: ${diferencia}€, Factor: ${(factorDevolucion * 100).toFixed(2)}%`);
          } else {
            factorDevolucion = 0.0;
            console.log(`🔄 ${tipoRectificacion} - Sin diferencia, no devolver provisiones`);
          }
          break;
          
        default:
          console.warn('⚠️ Tipo de rectificación no reconocido:', tipoRectificacion);
          return;
      }

      // Procesar devolución de provisiones
      if (factorDevolucion > 0) {
        console.log(`💰 Devolviendo ${(factorDevolucion * 100).toFixed(2)}% de provisiones`);
        
        for (const provision of provisionesOriginales) {
          const importeDevolver = provision.amount * factorDevolucion;
          
          if (importeDevolver > 0) {
            console.log(`  - Provisión ${provision.id}: ${provision.amount}€ → Devolver ${importeDevolver.toFixed(2)}€`);
            
            // Crear nueva provisión con el importe devuelto
            await this.prisma.provisionFondos.create({
              data: {
                clientId: provision.clientId,
                expedienteId: provision.expedienteId,
                amount: importeDevolver,
                description: `Devolución por rectificativa ${tipoRectificacion} - ${provision.description}`,
                date: new Date(),
                invoiceId: null, // Disponible para uso futuro
              }
            });
            
            console.log(`  ✅ Provisión devuelta: ${importeDevolver.toFixed(2)}€`);
          }
        }
        
        console.log('✅ Devolución de provisiones completada');
      } else {
        console.log('ℹ️ No se requieren devoluciones de provisiones');
      }
      
    } catch (error) {
      console.error('❌ Error en devolución de provisiones:', error);
      // No fallar la creación de la factura por error en devolución de provisiones
    }
  }

  /**
   * Genera un hash SHA-256 de los datos críticos de la factura
   * para garantizar la integridad en el QR
   */
  private generateInvoiceHash(invoice: any): string {
    try {
      // Datos críticos para el hash (ordenados alfabéticamente para consistencia)
      const criticalData = {
        numeroFactura: invoice.numeroFactura || '',
        fechaFactura: invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : '',
        importeTotal: (invoice.importeTotal || 0).toFixed(2),
        nifEmisor: invoice.emisor?.dni || invoice.emisor?.nif || '',
        nifReceptor: invoice.receptor?.dni || invoice.receptor?.nif || '',
        tipoFactura: invoice.tipoFactura || 'F',
        estado: invoice.estado || 'EMITIDA',
        id: invoice.id || ''
      };

      // Crear string ordenado y consistente
      const dataString = Object.entries(criticalData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join('|');

      // Generar hash SHA-256
      const hash = crypto.createHash('sha256').update(dataString).digest('hex');
      
      this.logger.log(`Hash generado para factura ${invoice.numeroFactura}: ${hash.substring(0, 16)}...`);
      
      return hash.substring(0, 16); // Usar solo los primeros 16 caracteres para el QR
    } catch (error) {
      this.logger.error('Error generando hash de factura:', error);
      return '';
    }
  }

  /**
   * Genera el número de factura rectificativa basado en la factura original
   */
  private async generateRectificativaNumber(facturaOriginalId: string, tipoRectificacion: string): Promise<string> {
    try {
      // Obtener la factura original
      const facturaOriginal = await this.prisma.invoice.findUnique({
        where: { id: facturaOriginalId },
        select: { numeroFactura: true }
      });

      if (!facturaOriginal) {
        throw new Error('Factura original no encontrada');
      }

      // Contar cuántas rectificativas ya existen para esta factura original
      const rectificativasExistentes = await this.prisma.invoice.count({
        where: {
          facturaOriginalId: facturaOriginalId,
          tipoFactura: 'R'
        }
      });

      // Generar sufijo basado en el tipo de rectificación y el número de rectificativa
      const numeroRectificativa = rectificativasExistentes + 1;
      const sufijo = `${tipoRectificacion}-${numeroRectificativa.toString().padStart(2, '0')}`;

      // Crear número de factura rectificativa
      const numeroRectificativaCompleto = `${facturaOriginal.numeroFactura}-${sufijo}`;

      console.log(`🔄 Generando número de factura rectificativa: ${numeroRectificativaCompleto}`);
      console.log(`  - Factura original: ${facturaOriginal.numeroFactura}`);
      console.log(`  - Tipo rectificación: ${tipoRectificacion}`);
      console.log(`  - Número de rectificativa: ${numeroRectificativa}`);

      return numeroRectificativaCompleto;

    } catch (error) {
      console.error('❌ Error generando número de factura rectificativa:', error);
      throw error;
    }
  }
} 