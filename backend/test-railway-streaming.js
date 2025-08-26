const axios = require('axios');

async function testRailwayStreaming() {
  try {
    console.log('🔍 Probando streaming en Railway...\n');
    
    // URL correcta del backend en Railway
    const baseUrl = 'https://experimento2-production-54c0.up.railway.app';
    
    // Probar con el documento corregido
    const documentId = 'doc-c1-002'; // El mismo que falló en el frontend
    
    console.log(`📁 Probando documento: ${documentId}`);
    console.log(`🌐 URL: ${baseUrl}/api/documents/file/${documentId}\n`);
    
    // Hacer la petición
    const response = await axios.get(`${baseUrl}/api/documents/file/${documentId}`, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'Accept': 'application/pdf,application/octet-stream,*/*',
        'User-Agent': 'Test-Streaming-Script/1.0'
      }
    });
    
    console.log('✅ Respuesta recibida:');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Length: ${response.headers['content-length'] || 'No especificado'}`);
    console.log(`   Content-Disposition: ${response.headers['content-disposition'] || 'No especificado'}`);
    
    // Verificar si es un PDF
    if (response.headers['content-type'] && response.headers['content-type'].includes('pdf')) {
      console.log('   📄 Archivo PDF detectado correctamente');
    }
    
    // Verificar el tamaño del stream
    let dataSize = 0;
    response.data.on('data', (chunk) => {
      dataSize += chunk.length;
    });
    
    response.data.on('end', () => {
      console.log(`   📊 Tamaño del archivo recibido: ${dataSize} bytes`);
      console.log('\n🎉 Streaming funcionando correctamente!');
    });
    
    response.data.on('error', (error) => {
      console.error(`   ❌ Error en el stream: ${error.message}`);
    });
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error en la respuesta:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || 'Sin mensaje'}`);
      console.error(`   Error: ${error.response.data?.error || 'Sin error específico'}`);
      
      // Mostrar más detalles del error
      if (error.response.data) {
        console.error('   📝 Detalles completos:');
        console.error(JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      console.error('❌ Error de conexión:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testRailwayStreaming();




