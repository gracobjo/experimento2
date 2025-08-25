const axios = require('axios');

async function debugAuthStepByStep() {
  console.log('🔍 DEBUGGEANDO AUTENTICACIÓN PASO A PASO\n');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar que el endpoint de auth esté disponible
    console.log('\n1️⃣ Verificando disponibilidad del endpoint de auth...');
    try {
      const optionsResponse = await axios.options('https://experimento2-production-54c0.up.railway.app/api/auth/login');
      console.log('   ✅ OPTIONS request exitoso');
      console.log('   📋 Headers permitidos:', optionsResponse.headers['access-control-allow-headers']);
      console.log('   🔄 Métodos permitidos:', optionsResponse.headers['access-control-allow-methods']);
    } catch (error) {
      console.log('   ❌ OPTIONS request falló:', error.message);
    }

    // 2. Probar login con diferentes formatos de datos
    console.log('\n2️⃣ Probando diferentes formatos de login...');
    
    const testCases = [
      {
        name: 'Formato estándar',
        data: { email: 'test@example.com', password: 'test123' }
      },
      {
        name: 'Con espacios extra',
        data: { email: ' test@example.com ', password: ' test123 ' }
      },
      {
        name: 'Con campos adicionales',
        data: { email: 'test@example.com', password: 'test123', extra: 'field' }
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n   🧪 ${testCase.name}:`);
      try {
        const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', testCase.data);
        console.log('      ✅ Éxito!');
        console.log('      📊 Respuesta:', JSON.stringify(response.data, null, 2));
        break; // Si uno funciona, no necesitamos probar más
      } catch (error) {
        console.log(`      ❌ Falló: ${error.response?.data?.message || error.message}`);
        if (error.response?.data) {
          console.log('      🔍 Detalles:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }

    // 3. Verificar si hay problemas de CORS o headers
    console.log('\n3️⃣ Verificando headers y CORS...');
    try {
      const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Test-Script/1.0'
        }
      });
      console.log('   ✅ Login exitoso con headers personalizados');
    } catch (error) {
      console.log('   ❌ Login falló con headers personalizados:', error.response?.data?.message || error.message);
    }

    // 4. Verificar si el problema está en la validación
    console.log('\n4️⃣ Verificando validación de datos...');
    try {
      const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'invalid-email',
        password: 'test123'
      });
      console.log('   ✅ Login con email inválido funcionó (no debería)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Validación funcionando (email inválido rechazado)');
      } else {
        console.log('   ❌ Validación no funcionando como esperado:', error.response?.status);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ DEBUG COMPLETADO');
}

debugAuthStepByStep();
