const axios = require('axios');

async function testFrontendExact() {
  try {
    console.log('🔍 Replicando EXACTAMENTE la petición del frontend...\n');
    
    const baseUrl = 'https://experimento2-production-54c0.up.railway.app';
    
    console.log('1️⃣ Probando con las credenciales EXACTAS del frontend:');
    console.log('   📧 Email: lawyer1@example.com');
    console.log('   🔑 Password: password123');
    console.log('   🌐 URL: ' + baseUrl + '/api/auth/login');
    console.log('');
    
    // Primera prueba: endpoint exacto del frontend
    try {
      console.log('🔐 Intento 1: Endpoint /api/auth/login...');
      const response1 = await axios.post(`${baseUrl}/api/auth/login`, {
        email: 'lawyer1@example.com',
        password: 'password123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive'
        }
      });
      
      if (response1.data?.access_token) {
        console.log('   ✅ ÉXITO! Login exitoso');
        console.log('   🎯 Token: ' + response1.data.access_token.substring(0, 30) + '...');
        return;
      }
      
    } catch (error1) {
      console.log('   ❌ Error: ' + (error1.response?.status || 'Conexión') + ' - ' + (error1.response?.data?.message || error1.message));
    }
    
    // Segunda prueba: endpoint alternativo
    try {
      console.log('\n🔐 Intento 2: Endpoint /auth/login (sin /api)...');
      const response2 = await axios.post(`${baseUrl}/auth/login`, {
        email: 'lawyer1@example.com',
        password: 'password123'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response2.data?.access_token) {
        console.log('   ✅ ÉXITO! Login exitoso (endpoint alternativo)');
        console.log('   🎯 Token: ' + response2.data.access_token.substring(0, 30) + '...');
        return;
      }
      
    } catch (error2) {
      console.log('   ❌ Error: ' + (error2.response?.status || 'Conexión') + ' - ' + (error2.response?.data?.message || error2.message));
    }
    
    // Tercera prueba: verificar si el frontend usa una URL diferente
    console.log('\n🔐 Intento 3: Verificando endpoints disponibles...');
    
    try {
      const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
      console.log('   ✅ Health endpoint: ' + healthResponse.status);
    } catch (healthError) {
      console.log('   ❌ Health endpoint: ' + (healthError.response?.status || 'No disponible'));
    }
    
    try {
      const rootResponse = await axios.get(`${baseUrl}/`, { timeout: 5000 });
      console.log('   ✅ Root endpoint: ' + rootResponse.status);
    } catch (rootError) {
      console.log('   ❌ Root endpoint: ' + (rootError.response?.status || 'No disponible'));
    }
    
    // Cuarta prueba: verificar si hay diferencias en el formato de datos
    console.log('\n🔐 Intento 4: Diferentes formatos de datos...');
    
    try {
      const response4 = await axios.post(`${baseUrl}/api/auth/login`, {
        email: 'lawyer1@example.com',
        password: 'password123',
        remember: true
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response4.data?.access_token) {
        console.log('   ✅ ÉXITO! Login con campo adicional');
        console.log('   🎯 Token: ' + response4.data.access_token.substring(0, 30) + '...');
        return;
      }
      
    } catch (error4) {
      console.log('   ❌ Error: ' + (error4.response?.status || 'Conexión') + ' - ' + (error4.response?.data?.message || error4.message));
    }
    
    console.log('\n❌ No se pudo replicar el login del frontend');
    console.log('💡 Posibles causas:');
    console.log('   1. El frontend usa una URL diferente');
    console.log('   2. El frontend usa headers específicos');
    console.log('   3. El frontend usa un formato de datos diferente');
    console.log('   4. Hay diferencias de entorno (dev vs production)');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testFrontendExact();





