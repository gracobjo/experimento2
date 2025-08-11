// Script para probar el acceso al documento
const documentId = '62703705-ae66-4435-9003-2519992fad63';
const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

console.log('🔍 Probando acceso al documento:', documentId);
console.log('🔍 Backend URL:', backendUrl);

// Probar endpoint de información del documento
async function testDocumentInfo() {
  try {
    console.log('\n📋 Probando GET /api/documents/:id...');
    
    const response = await fetch(`${backendUrl}/api/documents/${documentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📋 Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 Documento encontrado:', {
        id: data.id,
        filename: data.filename,
        originalName: data.originalName,
        expedienteId: data.expedienteId
      });
    } else {
      const errorText = await response.text();
      console.log('📋 Error:', errorText);
    }
    
  } catch (error) {
    console.error('📋 Error en la petición:', error.message);
  }
}

// Probar endpoint de descarga
async function testDocumentDownload() {
  try {
    console.log('\n⬇️ Probando GET /api/documents/:id/download...');
    
    const response = await fetch(`${backendUrl}/api/documents/${documentId}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('⬇️ Status:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('⬇️ Descarga exitosa');
      const headers = response.headers;
      console.log('⬇️ Content-Type:', headers.get('content-type'));
      console.log('⬇️ Content-Disposition:', headers.get('content-disposition'));
    } else {
      const errorText = await response.text();
      console.log('⬇️ Error:', errorText);
    }
    
  } catch (error) {
    console.error('⬇️ Error en la petición:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas...\n');
  
  await testDocumentInfo();
  await testDocumentDownload();
  
  console.log('\n✅ Pruebas completadas');
}

runTests();

