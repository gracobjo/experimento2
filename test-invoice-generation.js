const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testInvoiceGeneration() {
  try {
    console.log('🚀 Iniciando prueba de generación de factura...');
    
    // Datos de la factura de prueba
    const invoiceData = {
      numeroFactura: 'FAC-TEST-001',
      fechaFactura: '2025-08-02',
      fechaOperacion: '2025-08-02',
      tipoFactura: 'F',
      receptorId: '1', // ID de un cliente existente
      importeTotal: 1500.00,
      baseImponible: 1239.67,
      cuotaIVA: 260.33,
      tipoIVA: 21,
      regimenIvaEmisor: 'General',
      claveOperacion: '01',
      metodoPago: 'TRANSFERENCIA',
      estado: 'emitida',
      items: [
        {
          description: 'Servicios de asesoría legal',
          quantity: 10,
          unitPrice: 123.97,
          total: 1239.67
        }
      ],
      aplicarIVA: true,
      retencion: '',
      descuento: 0,
      tipoImpuesto: 'iva'
    };

    console.log('📝 Creando factura de prueba...');
    
    // Crear la factura
    const createResponse = await axios.post('http://localhost:3000/api/invoices', invoiceData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de prueba
      }
    });

    if (createResponse.data && createResponse.data.id) {
      const invoiceId = createResponse.data.id;
      console.log(`✅ Factura creada con ID: ${invoiceId}`);
      
      // Descargar el PDF
      console.log('📄 Descargando PDF...');
      const pdfResponse = await axios.get(`http://localhost:3000/api/invoices/${invoiceId}/pdf-qr`, {
        responseType: 'arraybuffer',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      if (pdfResponse.data) {
        const pdfPath = path.join(__dirname, 'factura-test-nueva.pdf');
        fs.writeFileSync(pdfPath, pdfResponse.data);
        console.log(`✅ PDF guardado en: ${pdfPath}`);
        console.log(`📊 Tamaño del PDF: ${(pdfResponse.data.length / 1024).toFixed(2)} KB`);
      } else {
        console.log('❌ No se pudo descargar el PDF');
      }
    } else {
      console.log('❌ No se pudo crear la factura');
    }

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar la prueba
testInvoiceGeneration(); 