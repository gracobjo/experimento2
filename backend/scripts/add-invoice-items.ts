/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Agregando items a las facturas existentes...');

  // Obtener todas las facturas que no tienen items
  const invoices = await prisma.invoice.findMany({
    where: {
      items: {
        none: {}
      }
    },
    include: {
      items: true
    }
  });

  console.log(`📋 Encontradas ${invoices.length} facturas sin items`);

  for (const invoice of invoices) {
    console.log(`📄 Procesando factura: ${invoice.numeroFactura}`);

    // Crear items de ejemplo basados en el importe total
    const items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = [];
    const importeTotal = invoice.importeTotal;
    
    // Dividir el importe en 2-3 conceptos
    if (importeTotal <= 200) {
      // Una sola línea
      items.push({
        description: 'Servicios de asesoría legal',
        quantity: 1,
        unitPrice: importeTotal,
        total: importeTotal
      });
    } else if (importeTotal <= 500) {
      // Dos líneas
      const parte1 = Math.round(importeTotal * 0.7);
      const parte2 = importeTotal - parte1;
      
      items.push({
        description: 'Consulta y asesoría legal',
        quantity: 1,
        unitPrice: parte1,
        total: parte1
      });
      
      items.push({
        description: 'Documentación y trámites',
        quantity: 1,
        unitPrice: parte2,
        total: parte2
      });
    } else {
      // Tres líneas
      const parte1 = Math.round(importeTotal * 0.5);
      const parte2 = Math.round(importeTotal * 0.3);
      const parte3 = importeTotal - parte1 - parte2;
      
      items.push({
        description: 'Asesoría legal especializada',
        quantity: 1,
        unitPrice: parte1,
        total: parte1
      });
      
      items.push({
        description: 'Elaboración de documentación',
        quantity: 1,
        unitPrice: parte2,
        total: parte2
      });
      
      items.push({
        description: 'Gestión de trámites administrativos',
        quantity: 1,
        unitPrice: parte3,
        total: parte3
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
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 