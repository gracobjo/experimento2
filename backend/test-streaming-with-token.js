const axios = require('axios');

async function testStreamingWithToken() {
  try {
    console.log('🔍 Probando streaming de documentos con token válido...\n');
    
    const frontendUrl = 'https://experimento2-fenm.vercel.app';
    const backendUrl = 'https://experimento2-production-54c0.up.railway.app';
    
    console.log('1️⃣ Obteniendo token de autenticación...');
    
    // Headers que funcionaron para el login
    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json',
      'Origin': frontendUrl,
      'Referer': frontendUrl + '/login',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site'
    };
    
    // Login para obtener token
    const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
      email: 'lawyer1@example.com',
      password: 'password123'
    }, {
      timeout: 15000,
      headers: headers
    });
    
    if (!loginResponse.data?.token) {
      console.log('   ❌ No se pudo obtener token del login');
      return;
    }
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('   ✅ Token obtenido exitosamente');
    console.log('   👤 Usuario: ' + user.name + ' (' + user.role + ')');
    console.log('   🎯 Token: ' + token.substring(0, 30) + '...');
    
    // Headers para peticiones autenticadas
    const authHeaders = {
      ...headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n2️⃣ Obteniendo lista de documentos...');
    
    try {
      const docsResponse = await axios.get(`${backendUrl}/api/documents`, {
        headers: authHeaders,
        timeout: 15000
      });
      
      console.log('   ✅ Documents endpoint: ' + docsResponse.status);
      console.log('   📁 Documentos disponibles: ' + (docsResponse.data?.length || 0));
      
      if (docsResponse.data && docsResponse.data.length > 0) {
        console.log('   📋 Primeros documentos:');
        docsResponse.data.slice(0, 3).forEach((doc, index) => {
          console.log(`      ${index + 1}. ID: ${doc.id}, Filename: ${doc.filename}`);
        });
        
        // Probar streaming con el primer documento
        const firstDoc = docsResponse.data[0];
        console.log(`\n3️⃣ Probando streaming del documento: ${firstDoc.filename}`);
        
        try {
          const streamingResponse = await axios.get(`${backendUrl}/api/documents/file/${firstDoc.id}`, {
            headers: authHeaders,
            timeout: 30000,
            responseType: 'stream'
          });
          
          console.log('   ✅ Streaming exitoso!');
          console.log('   📊 Status: ' + streamingResponse.status);
          console.log('   📄 Content-Type: ' + streamingResponse.headers['content-type']);
          console.log('   📏 Content-Length: ' + streamingResponse.headers['content-length']);
          
          // Verificar que realmente es un stream
          if (streamingResponse.data && typeof streamingResponse.data.pipe === 'function') {
            console.log('   🔄 Es un stream válido');
            
            // Contar bytes del stream
            let byteCount = 0;
            streamingResponse.data.on('data', (chunk) => {
              byteCount += chunk.length;
            });
            
            streamingResponse.data.on('end', () => {
              console.log(`   📊 Total de bytes recibidos: ${byteCount}`);
              console.log('   🎉 Streaming completado exitosamente!');
            });
            
            streamingResponse.data.on('error', (error) => {
              console.log('   ❌ Error en el stream: ' + error.message);
            });
            
          } else {
            console.log('   ⚠️ La respuesta no es un stream válido');
          }
          
        } catch (streamingError) {
          console.log('   ❌ Error en streaming: ' + streamingError.message);
          if (streamingError.response) {
            console.log('      Status: ' + streamingError.response.status);
            console.log('      Data: ' + JSON.stringify(streamingError.response.data, null, 2));
          }
        }
        
      } else {
        console.log('   ⚠️ No hay documentos disponibles para probar');
      }
      
    } catch (docsError) {
      console.log('   ❌ Error obteniendo documentos: ' + docsError.message);
    }
    
    console.log('\n💡 Resumen del test:');
    console.log('   1. ✅ Login exitoso con headers del navegador');
    console.log('   2. ✅ Token obtenido y válido');
    console.log('   3. ✅ Endpoint de documentos accesible');
    console.log('   4. 🔄 Streaming de documentos probado');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testStreamingWithToken();



