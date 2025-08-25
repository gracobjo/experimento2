const axios = require('axios');

async function testRailwayWithAuth() {
  try {
    console.log('🔍 Probando streaming en Railway con autenticación...\n');
    
    // URL correcta del backend en Railway
    const baseUrl = 'https://experimento2-production-54c0.up.railway.app';
    
    // 1. Primero intentar login para obtener token
    console.log('1️⃣ Intentando login...');
    
    try {
      const loginResponse = await axios.post(`${baseUrl}/api/auth/login`, {
        email: 'admin@despachoabogados.com',
        password: 'admin123'
      }, {
        timeout: 10000
      });
      
      if (loginResponse.data?.access_token) {
        const token = loginResponse.data.access_token;
        console.log('   ✅ Login exitoso, token obtenido');
        
        // 2. Probar streaming con token
        console.log('\n2️⃣ Probando streaming con token...');
        
        const documentId = 'doc-c1-002';
        console.log(`   📁 Documento: ${documentId}`);
        console.log(`   🌐 URL: ${baseUrl}/api/documents/file/${documentId}`);
        
        const streamingResponse = await axios.get(`${baseUrl}/api/documents/file/${documentId}`, {
          responseType: 'stream',
          timeout: 30000,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf,application/octet-stream,*/*',
            'User-Agent': 'Test-Streaming-Script/1.0'
          }
        });
        
        console.log('\n✅ Streaming exitoso:');
        console.log(`   Status: ${streamingResponse.status} ${streamingResponse.statusText}`);
        console.log(`   Content-Type: ${streamingResponse.headers['content-type']}`);
        console.log(`   Content-Length: ${streamingResponse.headers['content-length'] || 'No especificado'}`);
        
        // Verificar el stream
        let dataSize = 0;
        streamingResponse.data.on('data', (chunk) => {
          dataSize += chunk.length;
        });
        
        streamingResponse.data.on('end', () => {
          console.log(`   📊 Tamaño del archivo: ${dataSize} bytes`);
          console.log('\n🎉 ¡Streaming funcionando perfectamente!');
        });
        
        streamingResponse.data.on('error', (error) => {
          console.error(`   ❌ Error en stream: ${error.message}`);
        });
        
      } else {
        console.log('   ❌ No se pudo obtener token del login');
      }
      
    } catch (loginError) {
      console.log('   ❌ Error en login:', loginError.response?.status || loginError.message);
      
      // 3. Si falla el login, probar sin token para ver el error exacto
      console.log('\n3️⃣ Probando sin token para ver el error exacto...');
      
      try {
        const noAuthResponse = await axios.get(`${baseUrl}/api/documents/file/doc-c1-002`, {
          timeout: 10000
        });
        
        console.log('   ✅ Funcionó sin token (no debería)');
        
      } catch (noAuthError) {
        console.log('   ❌ Error sin token:', noAuthError.response?.status);
        if (noAuthError.response?.data) {
          console.log('   📝 Mensaje:', noAuthError.response.data.message || 'Sin mensaje');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testRailwayWithAuth();


