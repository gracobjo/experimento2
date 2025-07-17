const axios = require('axios');

async function testInvoiceUpdate() {
  console.log('🧪 Probando actualización de facturas...');

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
    console.log(`🎯 Probando actualización de factura: ${firstInvoice.numeroFactura}`);

    // 4. Preparar datos de actualización
    const updateData = {
      fechaOperacion: '2025-07-15', // Formato yyyy-MM-dd
      estado: 'emitida',
      tipoIVA: 21,
      descuento: 5,
      retencion: 0,
      items: [
        {
          description: 'Servicio de asesoría legal actualizado',
          quantity: 2,
          unitPrice: 200.00
        },
        {
          description: 'Documentación y trámites actualizados',
          quantity: 1,
          unitPrice: 150.00
        }
      ]
    };

    console.log('📝 Datos de actualización:', JSON.stringify(updateData, null, 2));

    // 5. Actualizar la factura
    console.log('🔄 Actualizando factura...');
    const updateResponse = await axios.put(`http://localhost:3000/api/invoices/${firstInvoice.id}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Factura actualizada exitosamente');
    console.log('📊 Respuesta del servidor:', {
      id: updateResponse.data.id,
      numeroFactura: updateResponse.data.numeroFactura,
      fechaOperacion: updateResponse.data.fechaOperacion,
      estado: updateResponse.data.estado,
      itemsCount: updateResponse.data.items?.length || 0
    });

    // 6. Verificar que los items se actualizaron correctamente
    if (updateResponse.data.items && updateResponse.data.items.length > 0) {
      console.log('📋 Items actualizados:');
      updateResponse.data.items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.description} - ${item.quantity}x ${item.unitPrice}€ = ${item.total}€`);
      });
    }

    console.log('🎉 Prueba de actualización completada exitosamente');

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
testInvoiceUpdate(); 