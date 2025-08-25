const axios = require('axios');

async function diagnoseBackendStreaming() {
  try {
    console.log('🔍 Diagnóstico del problema de streaming en el backend...\n');
    
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
    
    console.log('\n2️⃣ Verificando endpoints del backend...');
    
    // Probar diferentes endpoints para identificar dónde está el problema
    const endpoints = [
      { name: 'Health', path: '/health', method: 'GET' },
      { name: 'Documents List', path: '/api/documents', method: 'GET' },
      { name: 'Document Info', path: '/api/documents/doc-001', method: 'GET' },
      { name: 'Document File (sin streaming)', path: '/api/documents/file/doc-001', method: 'GET' },
      { name: 'Document File (con streaming)', path: '/api/documents/file/doc-001', method: 'GET', streaming: true }
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔍 Probando: ${endpoint.name}`);
        console.log(`   🌐 ${endpoint.method} ${endpoint.path}`);
        
        let response;
        
        if (endpoint.streaming) {
          // Probar con streaming
          response = await axios.get(`${backendUrl}${endpoint.path}`, {
            headers: authHeaders,
            timeout: 30000,
            responseType: 'stream',
            validateStatus: function (status) {
              return status < 500; // Aceptar cualquier status menor a 500
            }
          });
        } else {
          // Probar sin streaming
          response = await axios({
            method: endpoint.method.toLowerCase(),
            url: `${backendUrl}${endpoint.path}`,
            headers: authHeaders,
            timeout: 15000,
            validateStatus: function (status) {
              return status < 500;
            }
          });
        }
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📊 Content-Type: ${response.headers['content-type'] || 'N/A'}`);
        console.log(`   📏 Content-Length: ${response.headers['content-length'] || 'N/A'}`);
        
        if (endpoint.streaming) {
          if (response.data && typeof response.data.pipe === 'function') {
            console.log(`   🔄 Es un stream válido`);
            
            // Intentar leer el stream para ver si hay errores
            let hasError = false;
            let byteCount = 0;
            
            response.data.on('data', (chunk) => {
              byteCount += chunk.length;
            });
            
            response.data.on('end', () => {
              if (!hasError) {
                console.log(`   📊 Bytes recibidos: ${byteCount}`);
                console.log(`   🎉 Stream completado`);
              }
            });
            
            response.data.on('error', (error) => {
              hasError = true;
              console.log(`   ❌ Error en stream: ${error.message}`);
            });
            
            // Esperar un poco para procesar el stream
            await new Promise(resolve => setTimeout(resolve, 3000));
            
          } else {
            console.log(`   ⚠️ No es un stream válido`);
          }
        } else {
          if (response.data) {
            if (typeof response.data === 'string') {
              console.log(`   📄 Data: ${response.data.substring(0, 100)}...`);
            } else if (typeof response.data === 'object') {
              console.log(`   📄 Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
            }
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.response) {
          console.log(`      Status: ${error.response.status}`);
          if (error.response.data) {
            if (typeof error.response.data === 'string') {
              console.log(`      Error: ${error.response.data.substring(0, 200)}`);
            } else {
              console.log(`      Error: ${JSON.stringify(error.response.data).substring(0, 200)}`);
            }
          }
        }
      }
      
      console.log('   ' + '─'.repeat(50));
    }
    
    console.log('\n3️⃣ Análisis del problema...');
    console.log('   🔍 El problema está en el endpoint de streaming');
    console.log('   🔍 Error 500 indica problema interno del backend');
    console.log('   🔍 Posibles causas:');
    console.log('      1. Error en el código del streaming');
    console.log('      2. Problema con Cloudinary');
    console.log('      3. Error en la base de datos');
    console.log('      4. Problema de memoria o timeout');
    
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Revisar logs del backend en Railway');
    console.log('   2. Verificar el código del endpoint de streaming');
    console.log('   3. Probar con un documento más simple');
    console.log('   4. Verificar configuración de Cloudinary');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

diagnoseBackendStreaming();

