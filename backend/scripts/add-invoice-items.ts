/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addInvoiceItems() {
  console.log('🔄 Agregando items a las facturas existentes...');

  try {
    // Obtener todas las facturas que no tienen items
    const invoices = await prisma.invoice.findMany({
      where: {
        items: {
          none: {}
        }
      },
      include: {
        expediente: true
      }
    });

    console.log(`📋 Encontradas ${invoices.length} facturas sin items`);

    for (const invoice of invoices) {
      console.log(`📄 Procesando factura: ${invoice.numeroFactura}`);

      // Crear items de ejemplo basados en el tipo de expediente
      const items = [];
      
      if (invoice.expediente) {
        // Items basados en el expediente
        if (invoice.expediente.title.toLowerCase().includes('contrato')) {
          items.push({
            description: 'Asesoramiento legal en contrato de compraventa',
            quantity: 1,
            unitPrice: 300.00,
            total: 300.00
          });
          items.push({
            description: 'Revisión y redacción de cláusulas contractuales',
            quantity: 2,
            unitPrice: 150.00,
            total: 300.00
          });
          items.push({
            description: 'Gestión de documentación y trámites',
            quantity: 1,
            unitPrice: 100.00,
            total: 100.00
          });
        } else if (invoice.expediente.title.toLowerCase().includes('laboral')) {
          items.push({
            description: 'Asesoramiento en derecho laboral',
            quantity: 1,
            unitPrice: 250.00,
            total: 250.00
          });
          items.push({
            description: 'Preparación de demanda laboral',
            quantity: 1,
            unitPrice: 400.00,
            total: 400.00
          });
          items.push({
            description: 'Representación en audiencia previa',
            quantity: 1,
            unitPrice: 350.00,
            total: 350.00
          });
        } else if (invoice.expediente.title.toLowerCase().includes('divorcio')) {
          items.push({
            description: 'Asesoramiento en proceso de divorcio',
            quantity: 1,
            unitPrice: 300.00,
            total: 300.00
          });
          items.push({
            description: 'Elaboración de convenio regulador',
            quantity: 1,
            unitPrice: 500.00,
            total: 500.00
          });
          items.push({
            description: 'Gestión de liquidación de gananciales',
            quantity: 1,
            unitPrice: 200.00,
            total: 200.00
          });
        } else {
          // Items genéricos para otros tipos de expedientes
          items.push({
            description: 'Asesoramiento legal general',
            quantity: 1,
            unitPrice: 200.00,
            total: 200.00
          });
          items.push({
            description: 'Análisis de documentación',
            quantity: 1,
            unitPrice: 150.00,
            total: 150.00
          });
          items.push({
            description: 'Elaboración de informes jurídicos',
            quantity: 1,
            unitPrice: 250.00,
            total: 250.00
          });
        }
      } else {
        // Items genéricos para facturas sin expediente
        items.push({
          description: 'Servicios de asesoramiento legal',
          quantity: 1,
          unitPrice: 200.00,
          total: 200.00
        });
        items.push({
          description: 'Consultoría jurídica',
          quantity: 1,
          unitPrice: 150.00,
          total: 150.00
        });
        items.push({
          description: 'Gestión administrativa',
          quantity: 1,
          unitPrice: 100.00,
          total: 100.00
        });
      }

      // Crear los items en la base de datos
      for (const item of items) {
        await prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }
        });
      }

      console.log(`✅ Agregados ${items.length} items a la factura ${invoice.numeroFactura}`);
    }

    console.log('🎉 Proceso completado exitosamente');

  } catch (error) {
    console.error('❌ Error agregando items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
addInvoiceItems(); 