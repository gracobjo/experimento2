const { exec } = require('child_process');
const fs = require('fs');

async function testInvoiceWithCurl() {
  try {
    console.log('🧪 Iniciando prueba de generación de factura con curl...');
    
    // Datos de prueba para la factura
    const testInvoiceData = {
      numeroFactura: "TEST-2025-001",
      tipoFactura: "F",
      receptorId: "77fed687-4d7e-4861-afd4-dd52a01c4761",
      tipoIVA: 21,
      regimenIvaEmisor: "General",
      claveOperacion: "01",
      metodoPago: "TRANSFERENCIA",
      fechaOperacion: "2025-08-03",
      estado: "emitida",
      items: [
        {
          description: "Consulta legal inicial",
          quantity: 1,
          unitPrice: 5000,
          total: 5000
        },
        {
          description: "Análisis de documentación",
          quantity: 2,
          unitPrice: 3000,
          total: 6000
        }
      ],
      aplicarIVA: true,
      retencion: 0,
      descuento: 0,
      facturaOriginalId: "",
      tipoRectificacion: "",
      motivoRectificacion: "",
      provisionIds: ["109e0bcd-667f-4a91-ac49-16f4aba3c715"],
      expedienteId: "exp-c1-001"
    };

    console.log('📋 Datos de prueba preparados');
    console.log('📊 Items:', testInvoiceData.items.length);
    console.log('💰 Provisiones:', testInvoiceData.provisionIds.length);

    // Guardar datos en archivo temporal
    const tempFile = 'temp-invoice-data.json';
    fs.writeFileSync(tempFile, JSON.stringify(testInvoiceData, null, 2));

    console.log('🔄 Creando factura de prueba...');
    
    // Comando curl para crear la factura
    const createCommand = `curl -X POST http://localhost:3000/api/invoices \
      -H "Content-Type: application/json" \
      -d @${tempFile} \
      -o create-response.json`;

    exec(createCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error creando factura:', error.message);
        return;
      }

      console.log('✅ Factura creada exitosamente');
      
      // Leer la respuesta para obtener el ID
      try {
        const response = JSON.parse(fs.readFileSync('create-response.json', 'utf8'));
        const invoiceId = response.id;
        
        console.log('🆔 ID de factura:', invoiceId);
        console.log('📄 Número de factura:', response.numeroFactura);

        // Descargar el PDF
        console.log('📥 Descargando PDF...');
        const pdfCommand = `curl -X GET http://localhost:3000/api/invoices/${invoiceId}/pdf \
          -o test-invoice.pdf`;

        exec(pdfCommand, (pdfError, pdfStdout, pdfStderr) => {
          if (pdfError) {
            console.error('❌ Error descargando PDF:', pdfError.message);
            return;
          }

          console.log('✅ PDF descargado exitosamente');
          
          // Verificar el tamaño del archivo
          const stats = fs.statSync('test-invoice.pdf');
          console.log('📏 Tamaño del PDF:', stats.size, 'bytes');

          // Verificar si el PDF tiene el tamaño esperado para una sola página
          const expectedSizeRange = {
            min: 50000,  // Mínimo para una página A4
            max: 200000  // Máximo para una página A4
          };

          if (stats.size >= expectedSizeRange.min && stats.size <= expectedSizeRange.max) {
            console.log('✅ PDF parece ser de una sola página (tamaño dentro del rango esperado)');
          } else {
            console.log('⚠️ PDF puede tener múltiples páginas (tamaño fuera del rango esperado)');
          }

          console.log('🎯 Prueba completada');
          console.log('📁 Archivos generados:');
          console.log('   - create-response.json (respuesta de creación)');
          console.log('   - test-invoice.pdf (PDF de la factura)');
          
          // Limpiar archivo temporal
          fs.unlinkSync(tempFile);
        });

      } catch (parseError) {
        console.error('❌ Error parseando respuesta:', parseError.message);
      }
    });

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testInvoiceWithCurl(); 