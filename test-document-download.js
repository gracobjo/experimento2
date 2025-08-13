// Script de prueba para diagnosticar problemas de descarga de documentos
const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Token de prueba (necesitarás reemplazarlo con un token válido)
const testToken = 'YOUR_TEST_TOKEN_HERE';

async function testDocumentEndpoints() {
  console.log('🔍 Probando endpoints de documentos...\n');

  try {
    // 1. Probar endpoint de listado de documentos
    console.log('1️⃣ Probando GET /api/documents...');
    const listResponse = await fetch(`${backendUrl}/api/documents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('   Status:', listResponse.status, listResponse.statusText);
    
    if (listResponse.ok) {
      const documents = await listResponse.json();
      console.log('   Documentos encontrados:', documents.length);
      
      if (documents.length > 0) {
        const firstDoc = documents[0];
        console.log('   Primer documento:', {
          id: firstDoc.id,
          filename: firstDoc.filename,
          originalName: firstDoc.originalName,
          mimeType: firstDoc.mimeType
        });

        // 2. Probar endpoint de descarga
        console.log('\n2️⃣ Probando GET /api/documents/:id/download...');
        const downloadResponse = await fetch(`${backendUrl}/api/documents/${firstDoc.id}/download`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${testToken}`
          }
        });

        console.log('   Status:', downloadResponse.status, downloadResponse.statusText);
        console.log('   Headers:', {
          'content-type': downloadResponse.headers.get('content-type'),
          'content-disposition': downloadResponse.headers.get('content-disposition'),
          'content-length': downloadResponse.headers.get('content-length')
        });

        if (downloadResponse.ok) {
          console.log('   ✅ Descarga exitosa');
        } else {
          const errorText = await downloadResponse.text();
          console.log('   ❌ Error:', errorText);
        }
      } else {
        console.log('   ⚠️ No hay documentos para probar');
      }
    } else {
      const errorText = await listResponse.text();
      console.log('   ❌ Error:', errorText);
    }

    // 3. Probar endpoint de archivo estático
    console.log('\n3️⃣ Probando GET /api/documents/file/:filename...');
    if (documents && documents.length > 0) {
      const firstDoc = documents[0];
      const fileResponse = await fetch(`${backendUrl}/api/documents/file/${firstDoc.filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testToken}`
        }
      });

      console.log('   Status:', fileResponse.status, fileResponse.statusText);
      console.log('   Headers:', {
        'content-type': fileResponse.headers.get('content-type'),
        'content-disposition': fileResponse.headers.get('content-disposition')
      });

      if (fileResponse.ok) {
        console.log('   ✅ Archivo servido correctamente');
      } else {
        const errorText = await fileResponse.text();
        console.log('   ❌ Error:', errorText);
      }
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

async function testHealthEndpoints() {
  console.log('\n🏥 Probando endpoints de health...\n');

  try {
    // Probar diferentes endpoints de health
    const healthEndpoints = [
      '/health',
      '/api/health',
      '/debug-env',
      '/api/debug-env'
    ];

    for (const endpoint of healthEndpoints) {
      console.log(`Probando ${endpoint}...`);
      try {
        const response = await fetch(`${backendUrl}${endpoint}`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.text();
          console.log(`   Response: ${data.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error en health endpoints:', error.message);
  }
}

// Función principal
async function runDiagnostics() {
  console.log('🚀 Iniciando diagnóstico de documentos...\n');
  
  if (testToken === 'YOUR_TEST_TOKEN_HERE') {
    console.log('⚠️  IMPORTANTE: Reemplaza YOUR_TEST_TOKEN_HERE con un token válido');
    console.log('   Puedes obtener un token iniciando sesión en la aplicación web\n');
    return;
  }

  await testHealthEndpoints();
  await testDocumentEndpoints();
  
  console.log('\n✅ Diagnóstico completado');
}

// Ejecutar diagnóstico
runDiagnostics();
