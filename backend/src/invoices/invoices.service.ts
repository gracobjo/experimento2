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
import { PDFDocument, rgb } from 'pdf-lib';
import * as QRCode from 'qrcode';
import { InvoiceAuditService } from './invoice-audit.service';

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

      // Construir el objeto data para Prisma, solo incluyendo expedienteId si existe
      const prismaData: any = {
        ...invoiceData,
        numeroFactura,
        fechaFactura: invoiceData.fechaFactura ? new Date(invoiceData.fechaFactura) : new Date(),
        fechaOperacion: new Date(invoiceData.fechaOperacion),
        items: { create: items },
        estado: 'emitida',
      };

      // Calcular totales automáticamente basándose en los items
      const baseImponible = items.reduce((sum: number, item: any) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Aplicar descuento si existe
      const descuento = typeof invoiceData.descuento === 'number' ? invoiceData.descuento : 0;
      const baseConDescuento = baseImponible * (1 - descuento / 100);
      
      // Calcular descuento por provisiones asociadas
      let descuentoProvisiones = 0;
      if (provisionIds.length > 0) {
        const provisiones = await this.prisma.provisionFondos.findMany({
          where: { id: { in: provisionIds } },
        });
        descuentoProvisiones = provisiones.reduce((sum, prov) => sum + prov.amount, 0);
      }
      
      // Aplicar IVA solo si se especifica
      const aplicarIVA = invoiceData.aplicarIVA !== false; // Por defecto true
      const tipoIVA = typeof invoiceData.tipoIVA === 'number' ? invoiceData.tipoIVA : 21;
      
      // Calcular base imponible después de descuentos (incluyendo provisiones)
      const baseConDescuentos = baseConDescuento - descuentoProvisiones;
      
      // Calcular IVA sobre la base con descuentos
      const cuotaIVA = aplicarIVA ? baseConDescuentos * (tipoIVA / 100) : 0;
      
      // Aplicar retención si existe
      const retencion = typeof invoiceData.retencion === 'number' ? invoiceData.retencion : 0;
      const cuotaRetencion = baseConDescuentos * (retencion / 100);
      
      // Calcular total final
      const importeTotal = baseConDescuentos + cuotaIVA - cuotaRetencion;

      // Actualizar los totales calculados
      prismaData.baseImponible = baseConDescuentos;
      prismaData.cuotaIVA = cuotaIVA;
      prismaData.importeTotal = importeTotal;
      prismaData.tipoIVA = tipoIVA;
      prismaData.descuento = descuento;
      prismaData.retencion = retencion;
      prismaData.aplicarIVA = aplicarIVA;

      if (expedienteId) {
        prismaData.expedienteId = expedienteId;
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
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { emisor: true, receptor: true, expediente: true, items: true, provisionFondos: true },
    });
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
    
    // Obtener la factura actual para ver las provisiones asociadas y valores previos
    const currentInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { provisionFondos: true, items: true }
    });
    
    if (!currentInvoice) {
      throw new Error('Factura no encontrada');
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
      const baseImponible = items.reduce((sum: number, item: any) => {
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Aplicar descuento si existe
      const descuento = typeof invoiceData.descuento === 'number' ? invoiceData.descuento : 0;
      const baseConDescuento = baseImponible * (1 - descuento / 100);
      
      // Calcular descuento por provisiones asociadas
      let descuentoProvisiones = 0;
      if (currentInvoice.provisionFondos.length > 0) {
        descuentoProvisiones = currentInvoice.provisionFondos.reduce((sum, prov) => sum + prov.amount, 0);
      }
      
      // Aplicar IVA solo si se especifica
      const aplicarIVA = invoiceData.aplicarIVA !== false; // Por defecto true
      const tipoIVA = typeof invoiceData.tipoIVA === 'number' ? invoiceData.tipoIVA : 21;
      
      // Calcular base imponible después de descuentos (incluyendo provisiones)
      const baseConDescuentos = baseConDescuento - descuentoProvisiones;
      
      // Calcular IVA sobre la base con descuentos
      const cuotaIVA = aplicarIVA ? baseConDescuentos * (tipoIVA / 100) : 0;
      
      // Aplicar retención si existe
      const retencion = typeof invoiceData.retencion === 'number' ? invoiceData.retencion : 0;
      const cuotaRetencion = baseConDescuentos * (retencion / 100);
      
      // Calcular total final
      const importeTotal = baseConDescuentos + cuotaIVA - cuotaRetencion;
      
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
        include: { emisor: true },
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
        number: inv.numeroFactura,
        date: inv.fechaFactura,
        amount: inv.importeTotal,
        status: inv.estado,
        qrUrl: inv.xmlFirmado ? `/api/invoices/${inv.id}/qr` : null,
        pdfUrl: inv.xmlFirmado ? `/api/invoices/${inv.id}/pdf-qr` : null,
        paymentDate: inv.paymentDate,
        lawyerName: inv.emisor?.name || '',
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
   * Genera un PDF profesional de la factura usando el template HTML profesional (Puppeteer)
   * @param invoice Datos de la factura
   * @returns Buffer del PDF generado
   */
  async generateInvoicePdfWithQR(invoice: any): Promise<Buffer> {
    try {
      this.logger.log('Generando PDF profesional con template HTML y Puppeteer');
      // Usar siempre el servicio PdfGeneratorService (Puppeteer + HTML)
      return await this.pdfGeneratorService.generateInvoicePdf(invoice);
    } catch (error) {
      this.logger.error('Error generando PDF profesional:', error);
      throw new Error('Error generando PDF profesional');
    }
  }

  /**
   * Método de fallback para generar PDF básico
   */
  private async generateInvoicePdfFallback(invoice: any): Promise<Buffer> {
    // 1. Construir la cadena de datos para el QR según la normativa
    const qrData = [
      `NIF:${invoice.emisor?.email || ''}`,
      `NUM:${invoice.numeroFactura || ''}`,
      `FEC:${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}`,
      `IMP:${invoice.importeTotal || ''}`
    ].join('|');

    // Guardar el contenido del QR en el modelo de factura para su reutilización
    invoice.qrData = qrData;

    // 2. Generar imagen QR en base64
    const qrImageDataUrl = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'M', width: 200 });
    const qrImageBase64 = qrImageDataUrl.replace(/^data:image\/png;base64,/, '');
    const qrImageBytes = Buffer.from(qrImageBase64, 'base64');

    // 3. Crear PDF básico
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    // 4. Añadir datos básicos de la factura
    page.drawText('Factura', { x: 50, y: height - 50, size: 24, color: rgb(0, 0, 0) });
    page.drawText(`Número: ${invoice.numeroFactura || ''}`, { x: 50, y: height - 90, size: 12 });
    page.drawText(`Fecha: ${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}`, { x: 50, y: height - 110, size: 12 });
    page.drawText(`Importe total: ${invoice.importeTotal} €`, { x: 50, y: height - 130, size: 12 });

    // 5. Insertar QR en el PDF
    const qrImage = await pdfDoc.embedPng(qrImageBytes);
    page.drawImage(qrImage, {
      x: width - 170,
      y: height - 220,
      width: 120,
      height: 120,
    });
    page.drawText('Verifica esta factura escaneando el QR', { x: width - 200, y: height - 240, size: 8 });

    // 6. Finalizar PDF
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
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
    // Generar qrData igual que en el PDF
    const qrData = [
      `NIF:${invoice.emisor?.email || ''}`,
      `NUM:${invoice.numeroFactura || ''}`,
      `FEC:${invoice.fechaFactura ? new Date(invoice.fechaFactura).toISOString().slice(0, 10) : ''}`,
      `IMP:${invoice.importeTotal || ''}`
    ].join('|');
    const qrImageDataUrl = await (await import('qrcode')).toDataURL(qrData, { errorCorrectionLevel: 'M', width: 200, margin: 2 });
    const templateData = await this.pdfGeneratorService.prepareTemplateData(invoice, qrData, qrImageDataUrl);
    const fullHtml = await this.pdfGeneratorService.generateHtml(templateData);
    // Extraer solo <style> y <body> para la previsualización
    const styleMatch = fullHtml.match(/<style[\s\S]*?<\/style>/i);
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const style = styleMatch ? styleMatch[0] : '';
    const body = bodyMatch ? bodyMatch[1] : fullHtml;
    return `${style}\n${body}`;
  }
} 