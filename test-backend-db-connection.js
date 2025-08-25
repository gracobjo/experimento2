const axios = require('axios');

async function testBackendDBConnection() {
  console.log('🔍 VERIFICANDO CONEXIÓN DEL BACKEND A LA BASE DE DATOS\n');
  console.log('=' .repeat(60));

  try {
    // 1. Probar endpoint de estado de la base de datos
    console.log('\n1️⃣ Probando endpoint de estado de BD...');
    try {
      const dbStatus = await axios.get('https://experimento2-production-54c0.up.railway.app/db-status');
      console.log('   ✅ Estado de BD:', dbStatus.data.connected ? 'CONECTADO' : 'DESCONECTADO');
      console.log('   📊 Usuarios en BD:', dbStatus.data.userCount);
      console.log('   📋 Tablas disponibles:', dbStatus.data.tables.length);
      
      if (dbStatus.data.tables) {
        console.log('   📋 Primeras 5 tablas:');
        dbStatus.data.tables.slice(0, 5).forEach((table, index) => {
          console.log(`      ${index + 1}. ${table.table_name}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error en endpoint de BD:', error.response?.data?.message || error.message);
    }

    // 2. Probar endpoint de test simple
    console.log('\n2️⃣ Probando endpoint de test...');
    try {
      const testResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/test');
      console.log('   ✅ Test exitoso:', testResponse.data.message);
    } catch (error) {
      console.log('   ❌ Error en test:', error.response?.data?.message || error.message);
    }

    // 3. Probar endpoint de debug de variables de entorno
    console.log('\n3️⃣ Probando endpoint de debug...');
    try {
      const debugResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/debug-env');
      console.log('   ✅ Debug exitoso:');
      console.log('      JWT_SECRET:', debugResponse.data.jwtSecret);
      console.log('      DATABASE_URL:', debugResponse.data.databaseUrl);
      console.log('      NODE_ENV:', debugResponse.data.nodeEnv);
    } catch (error) {
      console.log('   ❌ Error en debug:', error.response?.data?.message || error.message);
    }

    // 4. Probar endpoint de API test
    console.log('\n4️⃣ Probando endpoint de API test...');
    try {
      const apiTestResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/api-test');
      console.log('   ✅ API test exitoso:', apiTestResponse.data.message);
      console.log('   📋 Endpoints disponibles:', apiTestResponse.data.endpoints);
    } catch (error) {
      console.log('   ❌ Error en API test:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICACIÓN COMPLETADA');
}

testBackendDBConnection();
