const axios = require('axios');

console.log('🔍 PROBANDO SI LA VISUALIZACIÓN DE DOCUMENTOS FUNCIONA');
console.log('======================================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

async function testDocumentView() {
  try {
    console.log('1️⃣ Obteniendo token de autenticación...');
    
    const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
      email: 'test@despacho.com',
      password: 'test123'
    });
    
    if (!loginResponse.data.token) {
      throw new Error('No se recibió token');
    }
    
    const token = loginResponse.data.token;
    console.log('   ✅ Token obtenido exitosamente');
    
    console.log('\n2️⃣ Obteniendo lista de documentos...');
    
    const documentsResponse = await axios.get(`${backendUrl}/api/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!Array.isArray(documentsResponse.data) || documentsResponse.data.length === 0) {
      console.log('   ❌ No hay documentos disponibles para probar');
      return;
    }
    
    const firstDoc = documentsResponse.data[0];
    console.log(`   📋 Documento encontrado: ${firstDoc.filename} (ID: ${firstDoc.id})`);
    
    console.log('\n3️⃣ Probando endpoint de visualización...');
    
    try {
      const viewResponse = await axios.get(`${backendUrl}/api/documents/file/${firstDoc.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   🎉 ¡ÉXITO! Visualización funcionando:', viewResponse.status);
      console.log('   📊 Tipo de respuesta:', typeof viewResponse.data);
      console.log('   📏 Tamaño de respuesta:', viewResponse.data?.length || 'N/A');
      
      if (viewResponse.headers['content-type']) {
        console.log('   📋 Content-Type:', viewResponse.headers['content-type']);
      }
      
      console.log('\n   🚀 La corrección temporal está funcionando!');
      console.log('   ✅ Los usuarios pueden visualizar documentos');
      
    } catch (error) {
      if (error.response?.status === 500) {
        console.log('   ❌ Error 500 persiste en visualización');
        console.log('   📊 Error data:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data?.errorDetails?.includes('fileData')) {
          console.log('\n   🔍 PROBLEMA: La columna fileData aún no existe');
          console.log('   💡 SOLUCIÓN: Esperar a que Railway aplique la migración');
        } else {
          console.log('\n   🔍 PROBLEMA: Otro error 500 no relacionado con fileData');
          console.log('   💡 SOLUCIÓN: Revisar logs del servidor');
        }
      } else {
        console.log('   ❌ Otro error:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testDocumentView().catch(console.error);
