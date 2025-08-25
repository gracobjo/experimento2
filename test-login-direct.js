const axios = require('axios');

async function testLoginDirect() {
  try {
    console.log('🔐 PROBANDO LOGIN DIRECTO\n');
    console.log('=' .repeat(50));

    const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    });

    console.log('✅ Login exitoso!');
    console.log('📊 Respuesta completa:');
    console.log(JSON.stringify(response.data, null, 2));

    // Verificar la estructura de la respuesta
    if (response.data.token) {
      console.log('\n🔑 Token encontrado en response.data.token');
    } else if (response.data.access_token) {
      console.log('\n🔑 Token encontrado en response.data.access_token');
    } else {
      console.log('\n❌ No se encontró token en la respuesta');
      console.log('🔍 Campos disponibles:', Object.keys(response.data));
    }

  } catch (error) {
    console.log('❌ Error en login:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Mensaje:', error.response.data.message);
      console.log('   Datos completos:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('   Error:', error.message);
    }
  }
}

testLoginDirect();
