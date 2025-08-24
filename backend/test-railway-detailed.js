const axios = require('axios');

async function testRailwayDetailed() {
  try {
    console.log('🔍 Probando streaming en Railway con detalles...\n');
    
    // URL correcta del backend en Railway
    const baseUrl = 'https://experimento2-production-54c0.up.railway.app';
    
    // 1. Primero hacer login para obtener token
    console.log('1️⃣ Haciendo login...');
    
    const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      email: 'admin@despacho.com', // Usar admin que es más probable que funcione
      password: 'admin123' // Contraseña típica de admin
    }, {
      timeout: 10000
    });
    
    if (!loginResponse.data?.access_token) {
      throw new Error('No se pudo obtener token del login');
    }
    
    const token = loginResponse.data.access_token;
    console.log('   ✅ Login exitoso, token obtenido');
    
    // 2. Probar endpoint de documentos para ver si responde
    console.log('\n2️⃣ Probando endpoint de documentos...');
    
    try {
      const docsResponse = await axios.get(`${baseUrl}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      console.log(`   ✅ Documents endpoint: ${docsResponse.status}`);
      console.log(`   📁 Documentos disponibles: ${docsResponse.data?.length || 0}`);
      
      if (docsResponse.data && docsResponse.data.length > 0) {
        console.log('   📋 Primeros documentos:');
        docsResponse.data.slice(0, 3).forEach((doc, index) => {
          console.log(`      ${index + 1}. ID: ${doc.id}, Filename: ${doc.filename}`);
        });
      }
      
    } catch (docsError) {
      console.log(`   ❌ Documents endpoint: ${docsError.response?.status || 'Error de conexión'}`);
      if (docsError.response?.data) {
        console.log('   📝 Detalles:', JSON.stringify(docsError.response.data, null, 2));
      }
    }
    
    // 3. Probar streaming con el documento específico
    console.log('\n3️⃣ Probando streaming del documento específico...');
    
    const documentId = 'doc-c1-002'; // El mismo que falló en el frontend
    console.log(`   📁 Documento: ${documentId}`);
    console.log(`   🌐 URL: ${baseUrl}/api/documents/file/${documentId}`);
    
    try {
      const streamingResponse = await axios.get(`${baseUrl}/api/documents/file/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf,application/octet-stream,*/*',
          'User-Agent': 'Test-Streaming-Script/1.0'
        },
        timeout: 30000,
        validateStatus: function (status) {
          return status < 500; // Aceptar cualquier status < 500 para ver el error completo
        }
      });
      
      console.log('\n✅ Streaming exitoso:');
      console.log(`   Status: ${streamingResponse.status} ${streamingResponse.statusText}`);
      console.log(`   Content-Type: ${streamingResponse.headers['content-type']}`);
      console.log(`   Content-Length: ${streamingResponse.headers['content-length'] || 'No especificado'}`);
      
    } catch (streamingError) {
      console.log('\n❌ Error en streaming:');
      console.log(`   Status: ${streamingError.response?.status || 'Error de conexión'}`);
      console.log(`   Message: ${streamingError.response?.data?.message || 'Sin mensaje'}`);
      console.log(`   Error: ${streamingError.response?.data?.error || 'Sin error específico'}`);
      
      // Mostrar detalles completos del error
      if (streamingError.response?.data) {
        console.log('\n   📝 Detalles completos del error:');
        console.log(JSON.stringify(streamingError.response.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.status, error.response.data);
    }
  }
}

testRailwayDetailed();
