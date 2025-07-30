const axios = require('axios');

async function testInvoicePDF() {
  console.log('🧪 Probando generación de PDF de facturas...');

  try {
    // 1. Login como abogado
    console.log('🔐 Iniciando sesión como abogado...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'lawyer1@example.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');

    // 2. Obtener facturas
    console.log('📋 Obteniendo facturas...');
    const invoicesResponse = await axios.get('http://localhost:3000/api/invoices', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const invoices = invoicesResponse.data;
    console.log(`📄 Encontradas ${invoices.length} facturas`);

    if (invoices.length === 0) {
      console.log('❌ No hay facturas para probar');
      return;
    }

    // 3. Probar la primera factura
    const firstInvoice = invoices[0];
    console.log(`🎯 Probando factura: ${firstInvoice.numeroFactura}`);
    console.log(`📊 Items en la factura: ${firstInvoice.items?.length || 0}`);

    if (firstInvoice.items && firstInvoice.items.length > 0) {
      console.log('📋 Items encontrados:');
      firstInvoice.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.description} - ${item.quantity}x ${item.unitPrice}€ = ${item.total}€`);
      });
    } else {
      console.log('⚠️  La factura no tiene items');
    }

    // 4. Generar PDF
    console.log('🖨️  Generando PDF...');
    const pdfResponse = await axios.get(`http://localhost:3000/api/invoices/${firstInvoice.id}/pdf-qr`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer'
    });

    console.log(`✅ PDF generado exitosamente`);
    console.log(`📏 Tamaño del PDF: ${pdfResponse.data.length} bytes`);

    // 5. Guardar PDF para verificación
    const fs = require('fs');
    const path = require('path');
    const pdfPath = path.join(__dirname, `test-invoice-${firstInvoice.numeroFactura}.pdf`);
    
    fs.writeFileSync(pdfPath, pdfResponse.data);
    console.log(`💾 PDF guardado en: ${pdfPath}`);

    console.log('🎉 Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('📄 Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testInvoicePDF(); 