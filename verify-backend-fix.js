const axios = require('axios');

console.log('🔍 VERIFICANDO SI EL ERROR 500 SE HA RESUELTO');
console.log('==============================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

async function verifyBackendFix() {
  try {
    console.log('1️⃣ Verificando conectividad general...');
    
    // Health check
    try {
      const healthResponse = await axios.get(`${backendUrl}/health`);
      console.log('   ✅ Health check:', healthResponse.status);
    } catch (error) {
      console.log('   ❌ Health check falló:', error.message);
      return;
    }

    // DB status
    try {
      const dbResponse = await axios.get(`${backendUrl}/db-status`);
      console.log('   ✅ Base de datos:', dbResponse.data.connected ? 'Conectada' : 'Desconectada');
    } catch (error) {
      console.log('   ❌ DB status falló:', error.message);
    }

    console.log('\n2️⃣ Obteniendo token de autenticación...');
    
    // Login para obtener token
    let token;
    try {
      const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
        email: 'test@despacho.com',
        password: 'test123'
      });
      
      if (loginResponse.data.token) {
        token = loginResponse.data.token;
        console.log('   ✅ Token obtenido exitosamente');
      } else {
        console.log('   ❌ No se recibió token');
        return;
      }
    } catch (error) {
      console.log('   ❌ Login falló:', error.response?.status || error.message);
      return;
    }

    console.log('\n3️⃣ Probando endpoint principal de casos...');
    
    // Probar el endpoint principal que antes daba error 500
    try {
      const casesResponse = await axios.get(`${backendUrl}/api/cases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   🎉 ¡ÉXITO! Endpoint principal funcionando:', casesResponse.status);
      console.log(`   📊 Casos obtenidos: ${Array.isArray(casesResponse.data) ? casesResponse.data.length : 'No es array'}`);
      
      if (Array.isArray(casesResponse.data) && casesResponse.data.length > 0) {
        console.log('   📋 Primer caso:', {
          id: casesResponse.data[0].id,
          title: casesResponse.data[0].title,
          status: casesResponse.data[0].status
        });
      }
      
      console.log('\n   🚀 El backend está funcionando correctamente!');
      console.log('   🔄 El sistema de fallback ya no es necesario');
      
    } catch (error) {
      if (error.response?.status === 500) {
        console.log('   ❌ Error 500 persiste:', error.response.data);
        console.log('   ⏳ El backend aún está en build o la corrección no se aplicó');
      } else {
        console.log('   ❌ Otro error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n4️⃣ Verificando otros endpoints...');
    
    // Probar estadísticas
    try {
      const statsResponse = await axios.get(`${backendUrl}/api/cases/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Estadísticas:', statsResponse.status);
    } catch (error) {
      console.log('   ❌ Estadísticas fallaron:', error.response?.status);
    }

    // Probar mis casos
    try {
      const myCasesResponse = await axios.get(`${backendUrl}/api/cases/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Mis casos:', myCasesResponse.status);
    } catch (error) {
      console.log('   ❌ Mis casos fallaron:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Error general en la verificación:', error.message);
  }
}

// Función para verificar estado del build
async function checkBuildStatus() {
  console.log('\n🔧 VERIFICANDO ESTADO DEL BUILD');
  console.log('================================\n');
  
  try {
    // Intentar obtener información del build
    const response = await axios.get(`${backendUrl}/health`);
    console.log('   📊 Status del servidor:', response.status);
    console.log('   🕐 Timestamp:', new Date().toLocaleString());
    
    // Si llegamos aquí, el servidor está respondiendo
    console.log('   ✅ Servidor activo y respondiendo');
    
  } catch (error) {
    console.log('   ❌ Servidor no responde:', error.message);
    console.log('   🔄 Posiblemente aún en build...');
  }
}

// Ejecutar verificación
async function runVerification() {
  await checkBuildStatus();
  await verifyBackendFix();
  
  console.log('\n✅ VERIFICACIÓN COMPLETADA');
  console.log('==========================');
  console.log('\n📋 RESUMEN:');
  console.log('- Si el endpoint principal funciona: ✅ Problema resuelto');
  console.log('- Si persiste error 500: ⏳ Aún en build o corrección pendiente');
  console.log('- Si hay otros errores: 🔍 Revisar logs del servidor');
}

runVerification().catch(console.error);
