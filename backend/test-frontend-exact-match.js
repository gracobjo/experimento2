const axios = require('axios');

async function testFrontendExactMatch() {
  try {
    console.log('🔍 Replicando EXACTAMENTE la petición del frontend...\n');
    
    const frontendUrl = 'https://experimento2-fenm.vercel.app';
    const backendUrl = 'https://experimento2-production-54c0.up.railway.app';
    
    console.log('1️⃣ Configuración del frontend:');
    console.log('   🌐 Frontend: ' + frontendUrl);
    console.log('   🔧 Backend: ' + backendUrl);
    console.log('   📧 Email: lawyer1@example.com');
    console.log('   🔑 Password: password123');
    console.log('');
    
    // Primera prueba: replicar EXACTAMENTE la petición del frontend
    try {
      console.log('🔐 Intento 1: Replicando EXACTAMENTE el frontend...');
      
      // Headers que envía un navegador real
      const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/json',
        'Origin': frontendUrl,
        'Referer': frontendUrl + '/login',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'cross-site'
      };
      
      const response1 = await axios.post(`${backendUrl}/api/auth/login`, {
        email: 'lawyer1@example.com',
        password: 'password123'
      }, {
        timeout: 15000,
        headers: headers,
        validateStatus: function (status) {
          return status < 500; // Aceptar cualquier status menor a 500
        }
      });
      
      console.log('   📊 Respuesta del servidor:');
      console.log('      Status: ' + response1.status);
      console.log('      Headers: ' + JSON.stringify(response1.headers, null, 2));
      
      if (response1.data) {
        console.log('      Data: ' + JSON.stringify(response1.data, null, 2));
      }
      
      if (response1.data?.access_token) {
        console.log('\n🎉 ¡ÉXITO! Login exitoso replicando el frontend');
        console.log('   🎯 Token: ' + response1.data.access_token.substring(0, 30) + '...');
        return;
      }
      
    } catch (error1) {
      console.log('   ❌ Error: ' + error1.message);
      if (error1.response) {
        console.log('      Status: ' + error1.response.status);
        console.log('      Data: ' + JSON.stringify(error1.response.data, null, 2));
      }
    }
    
    // Segunda prueba: verificar si hay diferencias en el endpoint
    console.log('\n🔐 Intento 2: Verificando endpoint exacto...');
    
    try {
      const response2 = await axios.post(`${backendUrl}/api/auth/login`, {
        email: 'lawyer1@example.com',
        password: 'password123'
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Origin': frontendUrl
        },
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log('   📊 Respuesta: Status ' + response2.status);
      if (response2.data) {
        console.log('      Data: ' + JSON.stringify(response2.data, null, 2));
      }
      
    } catch (error2) {
      console.log('   ❌ Error: ' + error2.message);
    }
    
    // Tercera prueba: verificar si hay diferencias en el formato de datos
    console.log('\n🔐 Intento 3: Diferentes formatos de datos...');
    
    const dataFormats = [
      { email: 'lawyer1@example.com', password: 'password123' },
      { email: 'lawyer1@example.com', password: 'password123', remember: true },
      { email: 'lawyer1@example.com', password: 'password123', timestamp: Date.now() }
    ];
    
    for (let i = 0; i < dataFormats.length; i++) {
      try {
        console.log(`      Probando formato ${i + 1}...`);
        const response3 = await axios.post(`${backendUrl}/api/auth/login`, dataFormats[i], {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
            'Origin': frontendUrl
          }
        });
        
        if (response3.data?.access_token) {
          console.log(`   🎉 ¡ÉXITO! Con formato ${i + 1}`);
          console.log('   🎯 Token: ' + response3.data.access_token.substring(0, 30) + '...');
          return;
        }
        
      } catch (error3) {
        console.log(`      ❌ Formato ${i + 1} falló: ${error3.response?.status || error3.message}`);
      }
    }
    
    // Cuarta prueba: verificar si hay diferencias en el timing
    console.log('\n🔐 Intento 4: Verificando timing y rate limiting...');
    
    try {
      // Esperar un poco antes de intentar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response4 = await axios.post(`${backendUrl}/api/auth/login`, {
        email: 'lawyer1@example.com',
        password: 'password123'
      }, {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json',
          'Origin': frontendUrl
        }
      });
      
      if (response4.data?.access_token) {
        console.log('   🎉 ¡ÉXITO! Después de esperar');
        console.log('   🎯 Token: ' + response4.data.access_token.substring(0, 30) + '...');
        return;
      }
      
    } catch (error4) {
      console.log('   ❌ Error después de esperar: ' + error4.message);
    }
    
    console.log('\n❌ No se pudo replicar el login del frontend');
    console.log('💡 Posibles causas:');
    console.log('   1. El frontend usa un token o sesión previa');
    console.log('   2. Hay diferencias en el entorno (dev vs production)');
    console.log('   3. El backend tiene validaciones específicas');
    console.log('   4. Las credenciales en Railway son diferentes');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testFrontendExactMatch();




