const axios = require('axios');

async function testInvoiceGeneration() {
  try {
    console.log('🧪 Iniciando prueba de generación de factura...');
    
    // Datos de prueba para la factura
    const testInvoiceData = {
      numeroFactura: "TEST-2025-001",
      tipoFactura: "F",
      receptorId: "77fed687-4d7e-4861-afd4-dd52a01c4761", // Cliente Uno
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
      provisionIds: ["109e0bcd-667f-4a91-ac49-16f4aba3c715"], // Provisión existente
      expedienteId: "exp-c1-001"
    };

    console.log('📋 Datos de prueba preparados');
    console.log('📊 Items:', testInvoiceData.items.length);
    console.log('💰 Provisiones:', testInvoiceData.provisionIds.length);

    // Crear la factura
    console.log('🔄 Creando factura de prueba...');
    const createResponse = await axios.post('http://localhost:3000/api/invoices', testInvoiceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imxhd3llcjFAZXhhbXBsZS5jb20iLCJzdWIiOiIzNDRiMmYyMi1kMGVlLTQ4OTgtYjg5Ni00MWNjZGJlNTFmMTkiLCJyb2xlIjoiQUJPR0FETyIsImlhdCI6MTc1NDE3MzgzOCwiZXhwIjoxNzU0MjYwMjM4fQ.VLrmWyf3jtApxjXVT8BpGgSzfhQEeuXnswGMc7Cq7Ek'
      }
    });

    console.log('✅ Factura creada exitosamente');
    console.log('🆔 ID de factura:', createResponse.data.id);
    console.log('📄 Número de factura:', createResponse.data.numeroFactura);

    // Descargar el PDF
    console.log('📥 Descargando PDF...');
    const pdfResponse = await axios.get(`http://localhost:3000/api/invoices/${createResponse.data.id}/pdf`, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imxhd3llcjFAZXhhbXBsZS5jb20iLCJzdWIiOiIzNDRiMmYyMi1kMGVlLTQ4OTgtYjg5Ni00MWNjZGJlNTFmMTkiLCJyb2xlIjoiQUJPR0FETyIsImlhdCI6MTc1NDE3MzgzOCwiZXhwIjoxNzU0MjYwMjM4fQ.VLrmWyf3jtApxjXVT8BpGgSzfhQEeuXnswGMc7Cq7Ek'
      }
    });

    console.log('✅ PDF descargado exitosamente');
    console.log('📏 Tamaño del PDF:', pdfResponse.data.length, 'bytes');

    // Verificar si el PDF tiene el tamaño esperado para una sola página
    const expectedSizeRange = {
      min: 50000,  // Mínimo para una página A4
      max: 200000  // Máximo para una página A4
    };

    if (pdfResponse.data.length >= expectedSizeRange.min && pdfResponse.data.length <= expectedSizeRange.max) {
      console.log('✅ PDF parece ser de una sola página (tamaño dentro del rango esperado)');
    } else {
      console.log('⚠️ PDF puede tener múltiples páginas (tamaño fuera del rango esperado)');
    }

    console.log('🎯 Prueba completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testInvoiceGeneration(); 