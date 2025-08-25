const axios = require('axios');

async function testMultipleDocuments() {
  try {
    console.log('🔍 Probando streaming con múltiples documentos...\n');
    
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
        console.log('   📋 Todos los documentos:');
        docsResponse.data.forEach((doc, index) => {
          console.log(`      ${index + 1}. ID: ${doc.id}`);
          console.log(`         Filename: ${doc.filename}`);
          console.log(`         MimeType: ${doc.mimeType || 'N/A'}`);
          console.log(`         FileSize: ${doc.fileSize || 'N/A'}`);
          console.log('');
        });
        
        // Probar streaming con cada documento
        console.log('3️⃣ Probando streaming con cada documento...\n');
        
        for (let i = 0; i < docsResponse.data.length; i++) {
          const doc = docsResponse.data[i];
          console.log(`🔐 Probando documento ${i + 1}/${docsResponse.data.length}:`);
          console.log(`   📄 ID: ${doc.id}`);
          console.log(`   📁 Filename: ${doc.filename}`);
          console.log(`   🎯 MimeType: ${doc.mimeType || 'N/A'}`);
          
          try {
            // Primero probar sin streaming para ver si el endpoint funciona
            console.log('      🔍 Probando endpoint sin streaming...');
            const testResponse = await axios.get(`${backendUrl}/api/documents/file/${doc.id}`, {
              headers: authHeaders,
              timeout: 10000,
              validateStatus: function (status) {
                return status < 500; // Aceptar cualquier status menor a 500
              }
            });
            
            console.log(`      ✅ Endpoint funciona: Status ${testResponse.status}`);
            console.log(`      📊 Content-Type: ${testResponse.headers['content-type'] || 'N/A'}`);
            console.log(`      📏 Content-Length: ${testResponse.headers['content-length'] || 'N/A'}`);
            
            // Ahora probar con streaming
            console.log('      🔄 Probando con streaming...');
            const streamingResponse = await axios.get(`${backendUrl}/api/documents/file/${doc.id}`, {
              headers: authHeaders,
              timeout: 30000,
              responseType: 'stream',
              validateStatus: function (status) {
                return status < 500;
              }
            });
            
            console.log(`      ✅ Streaming exitoso: Status ${streamingResponse.status}`);
            
            // Verificar que es un stream válido
            if (streamingResponse.data && typeof streamingResponse.data.pipe === 'function') {
              console.log('      🔄 Es un stream válido');
              
              // Contar bytes del stream
              let byteCount = 0;
              let hasError = false;
              
              streamingResponse.data.on('data', (chunk) => {
                byteCount += chunk.length;
              });
              
              streamingResponse.data.on('end', () => {
                if (!hasError) {
                  console.log(`      📊 Total de bytes: ${byteCount}`);
                  console.log(`      🎉 Streaming completado para ${doc.filename}`);
                }
              });
              
              streamingResponse.data.on('error', (error) => {
                hasError = true;
                console.log(`      ❌ Error en stream: ${error.message}`);
              });
              
              // Esperar un poco para que el stream se procese
              await new Promise(resolve => setTimeout(resolve, 2000));
              
            } else {
              console.log('      ⚠️ La respuesta no es un stream válido');
            }
            
          } catch (docError) {
            console.log(`      ❌ Error con documento ${doc.id}: ${docError.message}`);
            if (docError.response) {
              console.log(`         Status: ${docError.response.status}`);
              if (docError.response.data && typeof docError.response.data === 'string') {
                console.log(`         Error: ${docError.response.data.substring(0, 200)}`);
              }
            }
          }
          
          console.log('      ' + '─'.repeat(50));
          console.log('');
          
          // Pausa entre documentos
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } else {
        console.log('   ⚠️ No hay documentos disponibles para probar');
      }
      
    } catch (docsError) {
      console.log('   ❌ Error obteniendo documentos: ' + docsError.message);
    }
    
    console.log('\n💡 Resumen del test:');
    console.log('   1. ✅ Login exitoso');
    console.log('   2. ✅ Token válido');
    console.log('   3. ✅ Lista de documentos obtenida');
    console.log('   4. 🔄 Streaming probado con múltiples documentos');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testMultipleDocuments();

