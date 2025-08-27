const https = require('https');
const http = require('http');

// Configuración
const BACKEND_URL = 'https://experimento2-production-54c0.up.railway.app';
const TEST_DOCUMENT_ID = 'doc-c1-001';

// Función para hacer petición HTTP/HTTPS con headers personalizados
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    console.log(`🌐 Haciendo petición a: ${url}`);
    console.log(`📋 Opciones:`, requestOptions);

    const req = protocol.request(requestOptions, (res) => {
      console.log(`📡 Respuesta recibida: ${res.statusCode} ${res.statusMessage}`);
      console.log(`📊 Headers de respuesta:`, res.headers);

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Petición exitosa`);
          if (data.length > 100) {
            console.log(`📄 Contenido (primeros 100 chars): ${data.substring(0, 100)}...`);
          } else {
            console.log(`📄 Contenido: ${data}`);
          }
        } else if (res.statusCode === 401) {
          console.log(`🔒 Petición requiere autenticación (401)`);
          console.log(`📄 Respuesta: ${data}`);
        } else {
          console.log(`❌ Petición falló con código: ${res.statusCode}`);
          console.log(`📄 Respuesta de error: ${data}`);
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Error en la petición:`, error.message);
      reject(error);
    });

    req.on('timeout', () => {
      console.error(`⏰ Timeout en la petición`);
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.setTimeout(30000);
    req.end();
  });
}

// Función para obtener token de autenticación
async function getAuthToken() {
  console.log('\n🔑 Intentando obtener token de autenticación...');
  
  try {
    // Intentar login con credenciales de prueba
    const loginData = JSON.stringify({
      email: 'admin@test.com',
      password: 'admin123'
    });

    const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    });

    if (loginResponse.statusCode === 200) {
      const responseData = JSON.parse(loginResponse.data);
      if (responseData.access_token) {
        console.log(`✅ Token obtenido exitosamente`);
        return responseData.access_token;
      }
    }
    
    console.log(`⚠️ No se pudo obtener token, continuando sin autenticación`);
    return null;
    
  } catch (error) {
    console.log(`⚠️ Error obteniendo token: ${error.message}`);
    return null;
  }
}

// Función principal de prueba
async function testDocumentProxyWithAuth() {
  console.log('🧪 INICIANDO PRUEBA DEL PROXY DE DOCUMENTOS CON AUTENTICACIÓN');
  console.log('=' .repeat(60));

  try {
    // 1. Probar health check (sin autenticación)
    console.log('\n1️⃣ Probando health check (sin auth)...');
    const healthResponse = await makeRequest(`${BACKEND_URL}/health`);
    console.log(`✅ Health check: ${healthResponse.statusCode}`);

    // 2. Intentar obtener token de autenticación
    const authToken = await getAuthToken();

    // 3. Probar endpoint de documentos (con auth si está disponible)
    console.log('\n2️⃣ Probando endpoint de documentos...');
    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
      console.log(`🔑 Usando token de autenticación`);
    } else {
      console.log(`⚠️ Sin token de autenticación`);
    }
    
    const documentsResponse = await makeRequest(`${BACKEND_URL}/api/documents`, {
      headers: headers
    });
    console.log(`📄 Lista de documentos: ${documentsResponse.statusCode}`);

    // 4. Probar endpoint específico del documento
    console.log('\n3️⃣ Probando endpoint del documento específico...');
    const documentResponse = await makeRequest(`${BACKEND_URL}/api/documents/file/${TEST_DOCUMENT_ID}`, {
      headers: headers
    });
    console.log(`📁 Documento específico: ${documentResponse.statusCode}`);

    // 5. Probar endpoint de debug (con auth)
    console.log('\n4️⃣ Probando endpoint de debug...');
    const debugResponse = await makeRequest(`${BACKEND_URL}/api/documents/debug/${TEST_DOCUMENT_ID}`, {
      headers: headers
    });
    console.log(`🔍 Debug del documento: ${debugResponse.statusCode}`);

    // 6. Análisis de resultados
    console.log('\n📊 ANÁLISIS DE RESULTADOS:');
    console.log('=' .repeat(40));
    
    if (documentResponse.statusCode === 200) {
      console.log(`🎉 ¡ÉXITO! El proxy de documentos está funcionando`);
      console.log(`✅ El documento ${TEST_DOCUMENT_ID} se puede acceder correctamente`);
    } else if (documentResponse.statusCode === 401) {
      console.log(`🔒 El endpoint requiere autenticación (correcto)`);
      console.log(`💡 Para probar completamente, necesitas un token JWT válido`);
    } else if (documentResponse.statusCode === 404) {
      console.log(`❌ El documento no se encontró (posible problema de ID)`);
    } else {
      console.log(`⚠️ Estado inesperado: ${documentResponse.statusCode}`);
    }

    console.log('\n🎯 RECOMENDACIONES:');
    if (documentResponse.statusCode === 401) {
      console.log('1. 🔑 Obtén un token JWT válido desde el frontend');
      console.log('2. 📱 Prueba la visualización desde la interfaz web');
      console.log('3. 🔍 Revisa los logs del backend en Railway');
    }

    console.log('\n🎉 PRUEBA COMPLETADA');

  } catch (error) {
    console.error('\n💥 ERROR EN LA PRUEBA:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testDocumentProxyWithAuth();

