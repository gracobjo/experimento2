const axios = require('axios');

async function testExistingFile() {
  try {
    console.log('🔍 Probando archivo que SÍ existe en Cloudinary...\n');
    
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
    
    console.log('\n2️⃣ Probando streaming del archivo que SÍ existe...');
    
    // ID del documento que SÍ existe (el que dio 401)
    const existingDocumentId = '01d8b8b6-32fe-4419-b353-0944354f173d';
    
    try {
      console.log(`   🔍 Probando streaming del documento: ${existingDocumentId}`);
      
      // Probar el endpoint de streaming
      const streamingResponse = await axios.get(`${backendUrl}/api/documents/file/${existingDocumentId}`, {
        headers: authHeaders,
        timeout: 15000,
        responseType: 'stream',
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log(`   ✅ Status del streaming: ${streamingResponse.status}`);
      console.log(`   📊 Content-Type: ${streamingResponse.headers['content-type'] || 'N/A'}`);
      console.log(`   📏 Content-Length: ${streamingResponse.headers['content-length'] || 'N/A'}`);
      
      if (streamingResponse.status === 200) {
        console.log(`   🎉 ¡STREAMING FUNCIONANDO! El archivo se puede ver`);
        
        // Verificar que realmente es un stream
        if (streamingResponse.data && typeof streamingResponse.data.pipe === 'function') {
          console.log(`   ✅ Confirmado: Es un stream válido`);
        } else {
          console.log(`   ⚠️ No es un stream válido`);
        }
        
      } else if (streamingResponse.status === 401) {
        console.log(`   🔒 Requiere autenticación adicional`);
      } else if (streamingResponse.status === 404) {
        console.log(`   ❌ Documento no encontrado en el backend`);
      } else {
        console.log(`   ⚠️ Estado inesperado: ${streamingResponse.status}`);
      }
      
    } catch (streamingError) {
      console.log(`   ❌ Error en streaming: ${streamingError.message}`);
      if (streamingError.response) {
        console.log(`      Status: ${streamingError.response.status}`);
        console.log(`      Error: ${streamingError.response.statusText}`);
      }
    }
    
    console.log('\n3️⃣ Probando endpoint de información del documento...');
    
    try {
      const infoResponse = await axios.get(`${backendUrl}/api/documents/${existingDocumentId}`, {
        headers: authHeaders,
        timeout: 15000
      });
      
      if (infoResponse.status === 200) {
        console.log(`   ✅ Información del documento obtenida`);
        const doc = infoResponse.data;
        console.log(`   📄 ID: ${doc.id}`);
        console.log(`   📁 Filename: ${doc.filename}`);
        console.log(`   🌐 FileUrl: ${doc.fileUrl}`);
        console.log(`   📊 FileSize: ${doc.fileSize || 'N/A'}`);
        console.log(`   🎯 MimeType: ${doc.mimeType || 'N/A'}`);
        
        if (doc.metadata) {
          console.log(`   🔧 Metadata: ${JSON.stringify(doc.metadata, null, 2)}`);
        }
      }
      
    } catch (infoError) {
      console.log(`   ❌ Error obteniendo información: ${infoError.message}`);
    }
    
    console.log('\n4️⃣ Análisis del resultado...');
    console.log('   🔍 Si el streaming funciona con este documento:');
    console.log('      1. El problema NO es del backend');
    console.log('      2. El problema NO es de Cloudinary');
    console.log('      3. El problema ES que los otros archivos no existen');
    
    console.log('\n   🔍 Si el streaming NO funciona:');
    console.log('      1. El problema SÍ es del backend');
    console.log('      2. Necesitamos revisar el código de streaming');
    
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Si funciona: Recrear los archivos faltantes en Cloudinary');
    console.log('   2. Si no funciona: Revisar el código de streaming del backend');
    console.log('   3. Verificar por qué los archivos fueron eliminados');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testExistingFile();




