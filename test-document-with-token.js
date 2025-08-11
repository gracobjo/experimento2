// Script para probar el acceso al documento con token
const documentId = '62703705-ae66-4435-9003-2519992fad63';
const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

console.log('🔍 Probando acceso al documento:', documentId);
console.log('🔍 Backend URL:', backendUrl);

// Función para obtener token del localStorage del navegador
function getTokenFromBrowser() {
  console.log('\n🔑 Instrucciones para obtener el token:');
  console.log('1. Abre el navegador y ve a: https://experimento2-fenm.vercel.app/client/documents');
  console.log('2. Abre las DevTools (F12)');
  console.log('3. Ve a la pestaña Console');
  console.log('4. Ejecuta: console.log(localStorage.getItem("token"))');
  console.log('5. Copia el token y pégalo aquí');
  
  // Aquí puedes pegar el token manualmente
  const token = 'PEGA_AQUI_TU_TOKEN_JWT';
  
  if (token === 'PEGA_AQUI_TU_TOKEN_JWT') {
    console.log('❌ Por favor, pega tu token JWT en la variable "token"');
    return null;
  }
  
  return token;
}

// Probar endpoint de información del documento
async function testDocumentInfo(token) {
  try {
    console.log('\n📋 Probando GET /api/documents/:id con token...');
    
    const response = await fetch(`${backendUrl}/api/documents/${documentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
        expedienteId: data.expedienteId,
        uploadedBy: data.uploadedBy
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
async function testDocumentDownload(token) {
  try {
    console.log('\n⬇️ Probando GET /api/documents/:id/download con token...');
    
    const response = await fetch(`${backendUrl}/api/documents/${documentId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('⬇️ Status:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('⬇️ Descarga exitosa');
      const headers = response.headers;
      console.log('⬇️ Content-Type:', headers.get('content-type'));
      console.log('⬇️ Content-Disposition:', headers.get('content-disposition'));
      console.log('⬇️ Content-Length:', headers.get('content-length'));
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
  console.log('🚀 Iniciando pruebas con autenticación...\n');
  
  const token = getTokenFromBrowser();
  if (!token) {
    console.log('❌ No se puede continuar sin token');
    return;
  }
  
  console.log('🔑 Token obtenido:', token.substring(0, 20) + '...');
  
  await testDocumentInfo(token);
  await testDocumentDownload(token);
  
  console.log('\n✅ Pruebas completadas');
}

runTests();

