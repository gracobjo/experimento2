const axios = require('axios');

async function testAuthWithoutRateLimit() {
  console.log('🔍 PROBANDO AUTENTICACIÓN SIN RATE LIMITING\n');
  console.log('=' .repeat(60));

  try {
    // 1. Probar login con delay entre intentos
    console.log('\n1️⃣ Probando login con delay...');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`\n   🧪 Intento ${i}:`);
      
      try {
        const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
          email: 'test@example.com',
          password: 'test123'
        });
        
        console.log('      ✅ Login exitoso!');
        console.log('      🔑 Token recibido:', response.data.token ? 'SÍ' : 'NO');
        console.log('      📊 Respuesta:', JSON.stringify(response.data, null, 2));
        break;
        
      } catch (error) {
        console.log(`      ❌ Falló: ${error.response?.data?.message || error.message}`);
        
        if (error.response?.status === 429) {
          console.log('      ⚠️ Rate limit alcanzado, esperando...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
        }
      }
      
      // Esperar entre intentos
      if (i < 3) {
        console.log('      ⏳ Esperando 1 segundo antes del siguiente intento...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 2. Probar con diferentes headers para evitar rate limiting
    console.log('\n2️⃣ Probando con headers personalizados...');
    
    try {
      const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Test-Script/1.0',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('   ✅ Login exitoso con headers personalizados');
      console.log('   🔑 Token:', response.data.token ? 'SÍ' : 'NO');
      
    } catch (error) {
      console.log('   ❌ Login falló con headers personalizados:', error.response?.data?.message || error.message);
    }

    // 3. Probar endpoint de debug para ver si hay problemas de configuración
    console.log('\n3️⃣ Verificando configuración del backend...');
    
    try {
      const debugResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/debug-env');
      console.log('   ✅ Debug exitoso:');
      console.log('      JWT_SECRET:', debugResponse.data.jwtSecret);
      console.log('      DATABASE_URL:', debugResponse.data.databaseUrl);
      console.log('      NODE_ENV:', debugResponse.data.nodeEnv);
      
      if (debugResponse.data.jwtSecret === 'NO CONFIGURADO') {
        console.log('   ⚠️ JWT_SECRET no está configurado en Railway');
      }
      
    } catch (error) {
      console.log('   ❌ Debug falló:', error.response?.data?.message || error.message);
    }

    // 4. Probar si el problema está en la validación de datos
    console.log('\n4️⃣ Probando validación de datos...');
    
    try {
      const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos de timeout
      });
      
      console.log('   ✅ Login exitoso con timeout extendido');
      
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log('   ❌ Timeout alcanzado - el backend está muy lento');
      } else {
        console.log('   ❌ Error de validación:', error.response?.data?.message || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ PRUEBA COMPLETADA');
}

testAuthWithoutRateLimit();
