const axios = require('axios');

async function testOptimizedInvoice() {
  try {
    console.log('🧪 Iniciando prueba de factura optimizada...');
    
    // Datos de prueba más simples
    const testInvoiceData = {
      numeroFactura: "OPT-2025-001",
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
          description: "Consulta legal",
          quantity: 1,
          unitPrice: 5000,
          total: 5000
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

    console.log('📋 Datos de prueba optimizados');
    console.log('📊 Items:', testInvoiceData.items.length);
    console.log('💰 Provisiones:', testInvoiceData.provisionIds.length);

    // Token de autorización
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imxhd3llcjFAZXhhbXBsZS5jb20iLCJzdWIiOiIzNDRiMmYyMi1kMGVlLTQ4OTgtYjg5Ni00MWNjZGJlNTFmMTkiLCJyb2xlIjoiQUJPR0FETyIsImlhdCI6MTc1NDE3MzgzOCwiZXhwIjoxNzU0MjYwMjM4fQ.VLrmWyf3jtApxjXVT8BpGgSzfhQEeuXnswGMc7Cq7Ek';

    // Crear la factura
    console.log('🔄 Creando factura optimizada...');
    const createResponse = await axios.post('http://localhost:3000/api/invoices', testInvoiceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Factura creada exitosamente');
    console.log('🆔 ID de factura:', createResponse.data.id);
    console.log('📄 Número de factura:', createResponse.data.numeroFactura);

    // Descargar el PDF
    console.log('📥 Descargando PDF optimizado...');
    const pdfResponse = await axios.get(`http://localhost:3000/api/invoices/${createResponse.data.id}/pdf-qr`, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ PDF descargado exitosamente');
    console.log('📏 Tamaño del PDF:', pdfResponse.data.length, 'bytes');

    // Verificar si el PDF tiene el tamaño esperado para una sola página
    const expectedSizeRange = {
      min: 30000,  // Mínimo para una página A4 optimizada
      max: 150000  // Máximo para una página A4 optimizada
    };

    if (pdfResponse.data.length >= expectedSizeRange.min && pdfResponse.data.length <= expectedSizeRange.max) {
      console.log('✅ PDF parece ser de una sola página (tamaño dentro del rango esperado)');
    } else if (pdfResponse.data.length < expectedSizeRange.min) {
      console.log('⚠️ PDF muy pequeño, puede estar vacío o tener error');
    } else {
      console.log('⚠️ PDF puede tener múltiples páginas (tamaño fuera del rango esperado)');
    }

    // Guardar el PDF para inspección
    const fs = require('fs');
    fs.writeFileSync('test-invoice-optimized.pdf', pdfResponse.data);
    console.log('📁 PDF guardado como: test-invoice-optimized.pdf');

    console.log('🎯 Prueba optimizada completada');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testOptimizedInvoice(); 