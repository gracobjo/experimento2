const axios = require('axios');

// Configuración
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

async function testBackend() {
  console.log('🔍 Probando backend...');
  try {
    // Probar con un endpoint que sabemos que existe
    const response = await axios.get(`${BACKEND_URL}/api/cases/stats`);
    console.log('✅ Backend funcionando (status:', response.status, ')');
    return true;
  } catch (error) {
    if (error.response) {
      // Si hay respuesta pero es 401, significa que el backend está funcionando pero necesita autenticación
      if (error.response.status === 401) {
        console.log('✅ Backend funcionando (requiere autenticación)');
        return true;
      }
      console.log('❌ Backend no disponible (status:', error.response.status, ')');
    } else {
      console.log('❌ Backend no disponible:', error.message);
    }
    return false;
  }
}

async function testFrontend() {
  console.log('🔍 Probando frontend...');
  try {
    const response = await axios.get(FRONTEND_URL);
    console.log('✅ Frontend funcionando (status:', response.status, ')');
    return true;
  } catch (error) {
    console.log('❌ Frontend no disponible:', error.message);
    return false;
  }
}

async function testAutoFirma() {
  console.log('🔍 Probando AutoFirma...');
  try {
    const response = await axios.get('http://127.0.0.1:8080/status');
    console.log('✅ AutoFirma funcionando:', response.data.status);
    return true;
  } catch (error) {
    console.log('❌ AutoFirma no disponible:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de servicios...\n');
  
  const backendOk = await testBackend();
  const frontendOk = await testFrontend();
  const autofirmaOk = await testAutoFirma();
  
  console.log('\n📊 Resumen de estado:');
  console.log(`Backend: ${backendOk ? '✅' : '❌'}`);
  console.log(`Frontend: ${frontendOk ? '✅' : '❌'}`);
  console.log(`AutoFirma: ${autofirmaOk ? '✅' : '❌'}`);
  
  if (backendOk && frontendOk) {
    console.log('\n🎉 Todos los servicios están funcionando correctamente!');
    console.log('📝 Para probar el dashboard:');
    console.log('   1. Abre http://localhost:5173');
    console.log('   2. Inicia sesión como abogado');
    console.log('   3. Verifica la consola del navegador');
    console.log('   4. Deberías ver solo UN log de "Dashboard useEffect"');
  } else {
    console.log('\n⚠️  Algunos servicios no están funcionando.');
    console.log('💡 Comandos para iniciar servicios:');
    console.log('   Backend: cd backend && npm run start:dev');
    console.log('   Frontend: npm run dev');
    console.log('   AutoFirma: node autofirma-http-server.js');
  }
}

main().catch(console.error); 