const axios = require('axios');

async function testFrontendDownload() {
  console.log('🧪 Probando descarga de PDF desde el frontend...');

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
    console.log(`🎯 Probando descarga de factura: ${firstInvoice.numeroFactura}`);

    // 4. Descargar PDF usando el endpoint que usa el frontend
    console.log('📥 Descargando PDF...');
    const pdfResponse = await axios.get(`http://localhost:3000/api/invoices/${firstInvoice.id}/pdf-qr`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer'
    });

    console.log(`✅ PDF descargado exitosamente`);
    console.log(`📏 Tamaño del PDF: ${pdfResponse.data.length} bytes`);
    console.log(`📋 Content-Type: ${pdfResponse.headers['content-type']}`);
    console.log(`📋 Content-Disposition: ${pdfResponse.headers['content-disposition']}`);

    // 5. Verificar que es un PDF válido
    const buffer = Buffer.from(pdfResponse.data);
    const isPdf = buffer.slice(0, 4).toString() === '%PDF';
    console.log(`🔍 ¿Es un PDF válido? ${isPdf ? '✅ Sí' : '❌ No'}`);

    // 6. Guardar PDF para verificación
    const fs = require('fs');
    const path = require('path');
    const pdfPath = path.join(__dirname, `frontend-download-${firstInvoice.numeroFactura}.pdf`);
    
    fs.writeFileSync(pdfPath, buffer);
    console.log(`💾 PDF guardado en: ${pdfPath}`);

    console.log('🎉 Prueba de descarga completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📄 Headers:', error.response.headers);
      console.error('📄 Data:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testFrontendDownload(); 