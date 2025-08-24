const axios = require('axios');

async function debugStreamingError() {
  try {
    console.log('🔍 Diagnosticando error específico del streaming...\n');
    
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
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium":v="120", "Google Chrome":v="120"',
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
    
    console.log('\n2️⃣ Probando diferentes endpoints para identificar el problema...');
    
    // ID del documento que SÍ existe
    const existingDocumentId = '01d8b8b6-32fe-4419-b353-0944354f173d';
    
    // Probar diferentes endpoints
    const endpoints = [
      {
        name: 'Información del documento',
        url: `${backendUrl}/api/documents/${existingDocumentId}`,
        method: 'GET'
      },
      {
        name: 'Streaming del archivo',
        url: `${backendUrl}/api/documents/file/${existingDocumentId}`,
        method: 'GET'
      },
      {
        name: 'Lista de documentos',
        url: `${backendUrl}/api/documents`,
        method: 'GET'
      }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔍 Probando: ${endpoint.name}`);
      console.log(`   📍 URL: ${endpoint.url}`);
      
      try {
        const config = {
          method: endpoint.method.toLowerCase(),
          url: endpoint.url,
          headers: authHeaders,
          timeout: 15000
        };
        
        // Configuración especial para streaming
        if (endpoint.name.includes('Streaming')) {
          config.responseType = 'stream';
          config.validateStatus = function (status) {
            return status < 500;
          };
        }
        
        const response = await axios(config);
        
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📊 Content-Type: ${response.headers['content-type'] || 'N/A'}`);
        console.log(`   📏 Content-Length: ${response.headers['content-length'] || 'N/A'}`);
        
        if (endpoint.name.includes('Streaming') && response.status === 200) {
          // Verificar que realmente es un stream
          if (response.data && typeof response.data.pipe === 'function') {
            console.log(`   ✅ Confirmado: Es un stream válido`);
          } else {
            console.log(`   ⚠️ No es un stream válido`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.response) {
          console.log(`      Status: ${error.response.status}`);
          console.log(`      Error: ${error.response.statusText}`);
          
          // Intentar obtener más detalles del error
          if (error.response.data) {
            try {
              if (typeof error.response.data === 'string') {
                console.log(`      Response: ${error.response.data}`);
              } else {
                console.log(`      Response: ${JSON.stringify(error.response.data, null, 2)}`);
              }
            } catch (parseError) {
              console.log(`      Response: [No se pudo parsear]`);
            }
          }
        }
      }
      
      // Pausa entre pruebas
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n3️⃣ Probando acceso directo a Cloudinary desde el script...');
    
    try {
      // Obtener la URL del documento
      const docResponse = await axios.get(`${backendUrl}/api/documents/${existingDocumentId}`, {
        headers: authHeaders,
        timeout: 15000
      });
      
      if (docResponse.status === 200 && docResponse.data.fileUrl) {
        const cloudinaryUrl = docResponse.data.fileUrl;
        console.log(`   🌐 URL de Cloudinary: ${cloudinaryUrl}`);
        
        // Probar acceso directo
        const directResponse = await axios.get(cloudinaryUrl, {
          timeout: 15000,
          validateStatus: function (status) {
            return status < 500;
          }
        });
        
        console.log(`   ✅ Acceso directo a Cloudinary: Status ${directResponse.status}`);
        console.log(`   📊 Content-Type: ${directResponse.headers['content-type'] || 'N/A'}`);
        console.log(`   📏 Content-Length: ${directResponse.headers['content-length'] || 'N/A'}`);
        
        if (directResponse.status === 401) {
          console.log(`   🔒 Cloudinary requiere autenticación (normal para archivos privados)`);
          console.log(`   💡 El archivo SÍ existe, pero requiere credenciales`);
        }
        
      }
      
    } catch (cloudinaryError) {
      console.log(`   ❌ Error accediendo a Cloudinary: ${cloudinaryError.message}`);
    }
    
    console.log('\n4️⃣ Análisis del problema...');
    console.log('   🔍 El problema está en el backend durante el streaming');
    console.log('   🔍 Posibles causas:');
    console.log('      1. Error en CloudinaryStorageService');
    console.log('      2. Problema con las credenciales de Cloudinary en el backend');
    console.log('      3. Error en el manejo del stream');
    console.log('      4. Problema de permisos en Railway');
    
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Revisar logs del backend en Railway');
    console.log('   2. Verificar variables de entorno CLOUDINARY_* en Railway');
    console.log('   3. Revisar el código de CloudinaryStorageService');
    console.log('   4. Probar con un archivo más simple');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugStreamingError();
