const https = require('https');
const http = require('http');

// Configuración
const BACKEND_URL = 'https://experimento2-production-54c0.up.railway.app';
const TEST_DOCUMENT_ID = 'doc-c1-001'; // El ID que está fallando

// Función para hacer petición HTTP/HTTPS
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

    req.setTimeout(30000); // 30 segundos
    req.end();
  });
}

// Función principal de prueba
async function testDocumentProxy() {
  console.log('🧪 INICIANDO PRUEBA DEL PROXY DE DOCUMENTOS');
  console.log('=' .repeat(50));

  try {
    // 1. Probar endpoint de health check
    console.log('\n1️⃣ Probando health check...');
    const healthResponse = await makeRequest(`${BACKEND_URL}/health`);
    console.log(`✅ Health check: ${healthResponse.statusCode}`);

    // 2. Probar endpoint de documentos
    console.log('\n2️⃣ Probando endpoint de documentos...');
    const documentsResponse = await makeRequest(`${BACKEND_URL}/api/documents`);
    console.log(`✅ Lista de documentos: ${documentsResponse.statusCode}`);

    // 3. Probar endpoint específico del documento que está fallando
    console.log('\n3️⃣ Probando endpoint del documento específico...');
    const documentResponse = await makeRequest(`${BACKEND_URL}/api/documents/file/${TEST_DOCUMENT_ID}`);
    console.log(`✅ Documento específico: ${documentResponse.statusCode}`);

    // 4. Probar endpoint de debug del documento
    console.log('\n4️⃣ Probando endpoint de debug...');
    const debugResponse = await makeRequest(`${BACKEND_URL}/api/documents/debug/${TEST_DOCUMENT_ID}`);
    console.log(`✅ Debug del documento: ${debugResponse.statusCode}`);

    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');

  } catch (error) {
    console.error('\n💥 ERROR EN LA PRUEBA:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testDocumentProxy();
