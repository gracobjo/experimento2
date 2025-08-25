const axios = require('axios');

async function debugAuthService() {
  console.log('🔍 DEBUGGEANDO AUTH SERVICE PASO A PASO\n');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar que el endpoint esté respondiendo
    console.log('\n1️⃣ Verificando respuesta del endpoint...');
    
    try {
      const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      
      console.log('   ✅ Login exitoso (esto no debería pasar)');
      console.log('   📊 Respuesta:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('   ❌ Login falló como esperado');
      console.log('   📊 Status:', error.response?.status);
      console.log('   📊 Mensaje:', error.response?.data?.message);
      console.log('   📊 Error:', error.response?.data?.error);
      
      // 2. Analizar el error en detalle
      console.log('\n2️⃣ Analizando el error...');
      
      if (error.response?.status === 401) {
        console.log('   ✅ Status 401 (Unauthorized) - correcto para credenciales inválidas');
      } else {
        console.log('   ❌ Status inesperado:', error.response?.status);
      }
      
      if (error.response?.data?.message === 'Credenciales inválidas') {
        console.log('   ✅ Mensaje correcto: "Credenciales inválidas"');
      } else {
        console.log('   ❌ Mensaje inesperado:', error.response?.data?.message);
      }
    }

    // 3. Probar con usuario que sabemos que existe
    console.log('\n3️⃣ Probando con usuario existente en Railway...');
    
    const existingUsers = [
      { email: 'admin@despacho.com', password: 'admin123' },
      { email: 'lawyer1@example.com', password: 'password' },
      { email: 'client1@example.com', password: 'password' }
    ];
    
    for (const user of existingUsers) {
      console.log(`\n   🧪 Probando: ${user.email}`);
      
      try {
        const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
          email: user.email,
          password: user.password
        });
        
        console.log('      ✅ Login exitoso!');
        console.log('      🔑 Token:', response.data.token ? 'SÍ' : 'NO');
        break;
        
      } catch (error) {
        console.log(`      ❌ Falló: ${error.response?.data?.message || error.message}`);
        
        if (error.response?.status === 401) {
          console.log('      📊 Status: 401 (Unauthorized)');
        }
      }
    }

    // 4. Verificar si hay algún problema con el formato de los datos
    console.log('\n4️⃣ Verificando formato de datos...');
    
    const testCases = [
      {
        name: 'Datos exactos',
        data: { email: 'test@example.com', password: 'test123' }
      },
      {
        name: 'Con espacios en email',
        data: { email: ' test@example.com ', password: 'test123' }
      },
      {
        name: 'Con espacios en password',
        data: { email: 'test@example.com', password: ' test123 ' }
      },
      {
        name: 'Email en mayúsculas',
        data: { email: 'TEST@EXAMPLE.COM', password: 'test123' }
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n   🧪 ${testCase.name}:`);
      
      try {
        const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', testCase.data);
        console.log('      ✅ Éxito!');
        break;
      } catch (error) {
        console.log(`      ❌ Falló: ${error.response?.data?.message || error.message}`);
      }
    }

    // 5. Verificar si hay algún problema con la validación del DTO
    console.log('\n5️⃣ Verificando validación del DTO...');
    
    try {
      const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'invalid-email',
        password: 'test123'
      });
      
      console.log('   ❌ Login con email inválido funcionó (no debería)');
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Validación funcionando (email inválido rechazado)');
        console.log('   📊 Mensaje de validación:', error.response.data.message);
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

debugAuthService();
