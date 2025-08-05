const axios = require('axios');
const fs = require('fs');

async function testFontsLarge() {
  try {
    console.log('🧪 Iniciando prueba con fuentes grandes...');
    
    // Datos de prueba con fuentes mucho más grandes
    const testInvoiceData = {
      numeroFactura: "LARGE-001",
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
          description: "Asesoramiento legal completo y documentación",
          quantity: 3,
          unitPrice: 10000,
          total: 30000
        },
        {
          description: "Gestión administrativa y trámites",
          quantity: 2,
          unitPrice: 5000,
          total: 10000
        },
        {
          description: "Consultoría especializada",
          quantity: 1,
          unitPrice: 15000,
          total: 15000
        }
      ],
      aplicarIVA: true,
      retencion: 0,
      descuento: 0,
      facturaOriginalId: "", // Factura normal
      tipoRectificacion: "",
      motivoRectificacion: "",
      provisionIds: ["109e0bcd-667f-4a91-ac49-16f4aba3c715"],
      expedienteId: "exp-c1-001"
    };

    console.log('📋 Datos de prueba con fuentes grandes');
    console.log('📊 Items:', testInvoiceData.items.length);
    console.log('💰 Provisiones:', testInvoiceData.provisionIds.length);
    console.log('🔄 Tipo: Normal');

    // Token de autorización
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imxhd3llcjFAZXhhbXBsZS5jb20iLCJzdWIiOiIzNDRiMmYyMi1kMGVlLTQ4OTgtYjg5Ni00MWNjZGJlNTFmMTkiLCJyb2xlIjoiQUJPR0FETyIsImlhdCI6MTc1NDE3MzgzOCwiZXhwIjoxNzU0MjYwMjM4fQ.VLrmWyf3jtApxjXVT8BpGgSzfhQEeuXnswGMc7Cq7Ek';

    // Crear la factura
    console.log('🔄 Creando factura con fuentes grandes...');
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
    console.log('📥 Descargando PDF con fuentes grandes...');
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
      min: 30000,  // Mínimo para una página A4 con fuentes grandes
      max: 150000  // Máximo para una página A4 con fuentes grandes
    };

    if (pdfResponse.data.length >= expectedSizeRange.min && pdfResponse.data.length <= expectedSizeRange.max) {
      console.log('✅ PDF parece ser de una sola página (tamaño dentro del rango esperado)');
    } else if (pdfResponse.data.length < expectedSizeRange.min) {
      console.log('⚠️ PDF muy pequeño, puede estar vacío o tener error');
    } else {
      console.log('⚠️ PDF puede tener múltiples páginas (tamaño fuera del rango esperado)');
    }

    // Guardar el PDF para inspección
    fs.writeFileSync('test-fonts-large.pdf', pdfResponse.data);
    console.log('📁 PDF guardado como: test-fonts-large.pdf');

    // Analizar el PDF
    console.log('🔍 Analizando PDF...');
    const pdfBuffer = pdfResponse.data;
    const pdfContent = pdfBuffer.toString('utf8', 0, Math.min(5000, pdfBuffer.length));
    
    // Verificar si es un PDF válido
    if (pdfContent.includes('%PDF-1.')) {
      console.log('✅ PDF válido detectado');
    } else {
      console.log('❌ PDF inválido o error en la generación');
    }

    // Verificar contenido específico
    const contentChecks = [
      'Despacho Legal',
      'EMISOR',
      'RECEPTOR',
      'FACTURA',
      'Base Imponible',
      'IVA',
      'TOTAL',
      'FACTURA RECTIFICATIVA' // No debería aparecer
    ];

    console.log('🔍 Verificando contenido del PDF...');
    contentChecks.forEach(check => {
      const count = (pdfContent.match(new RegExp(check, 'g')) || []).length;
      if (check === 'FACTURA RECTIFICATIVA') {
        if (count === 0) {
          console.log(`✅ "${check}": ${count} ocurrencias (correcto - no es rectificativa)`);
        } else {
          console.log(`❌ "${check}": ${count} ocurrencias (incorrecto - aparece en factura normal)`);
        }
      } else {
        console.log(`📋 "${check}": ${count} ocurrencias`);
      }
    });

    console.log('🎯 Prueba con fuentes grandes completada');
    console.log('📁 Archivo generado: test-fonts-large.pdf');
    console.log('📏 Tamaño final:', pdfBuffer.length, 'bytes');

  } catch (error) {
    console.error('❌ Error en la prueba con fuentes grandes:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba con fuentes grandes
testFontsLarge(); 