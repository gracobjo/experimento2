const axios = require('axios');

async function testBackendHealth() {
  try {
    console.log('🔍 Verificando salud del backend...\n');
    
    // URL del backend en Railway
    const baseUrl = 'https://despacho-legal-backend-production.up.railway.app';
    
    // 1. Probar endpoint de salud
    console.log('1️⃣ Probando endpoint de salud...');
    try {
      const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 10000 });
      console.log(`   ✅ Health: ${healthResponse.status} - ${healthResponse.data?.status || 'OK'}`);
    } catch (error) {
      console.log(`   ❌ Health: ${error.response?.status || 'Error de conexión'}`);
    }
    
    // 2. Probar endpoint raíz
    console.log('\n2️⃣ Probando endpoint raíz...');
    try {
      const rootResponse = await axios.get(baseUrl, { timeout: 10000 });
      console.log(`   ✅ Root: ${rootResponse.status} - ${rootResponse.data?.message || 'OK'}`);
    } catch (error) {
      console.log(`   ❌ Root: ${error.response?.status || 'Error de conexión'}`);
    }
    
    // 3. Probar endpoint de documentos
    console.log('\n3️⃣ Probando endpoint de documentos...');
    try {
      const docsResponse = await axios.get(`${baseUrl}/api/documents`, { timeout: 10000 });
      console.log(`   ✅ Documents: ${docsResponse.status} - ${docsResponse.data?.length || 0} documentos`);
    } catch (error) {
      console.log(`   ❌ Documents: ${error.response?.status || 'Error de conexión'}`);
      if (error.response?.data) {
        console.log(`   📝 Detalles: ${JSON.stringify(error.response.data)}`);
      }
    }
    
    // 4. Probar endpoint específico con autenticación
    console.log('\n4️⃣ Probando endpoint específico (puede requerir auth)...');
    try {
      const fileResponse = await axios.get(`${baseUrl}/api/documents/file/doc-001`, { 
        timeout: 10000,
        headers: {
          'Accept': 'application/json,application/pdf,*/*'
        }
      });
      console.log(`   ✅ File endpoint: ${fileResponse.status}`);
    } catch (error) {
      console.log(`   ❌ File endpoint: ${error.response?.status || 'Error de conexión'}`);
      if (error.response?.data) {
        console.log(`   📝 Detalles: ${JSON.stringify(error.response.data)}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testBackendHealth();



