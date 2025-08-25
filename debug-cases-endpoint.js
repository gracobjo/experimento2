const axios = require('axios');

console.log('🔍 DIAGNÓSTICO DEL ENDPOINT DE CASOS');
console.log('=====================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Función para probar el endpoint de casos con diferentes escenarios
async function testCasesEndpoint() {
  try {
    console.log('1️⃣ Probando endpoint sin autenticación...');
    try {
      const response = await axios.get(`${backendUrl}/api/cases`);
      console.log('   ✅ Respuesta exitosa:', response.status);
      console.log('   📊 Datos:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('   ❌ Error esperado:', error.response.status, error.response.data);
      } else {
        console.log('   ❌ Error de red:', error.message);
      }
    }

    console.log('\n2️⃣ Probando endpoint con token inválido...');
    try {
      const response = await axios.get(`${backendUrl}/api/cases`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('   ✅ Respuesta inesperada:', response.status);
    } catch (error) {
      if (error.response) {
        console.log('   ❌ Error esperado:', error.response.status, error.response.data);
      } else {
        console.log('   ❌ Error de red:', error.message);
      }
    }

    console.log('\n3️⃣ Probando endpoint de health para verificar conectividad...');
    try {
      const response = await axios.get(`${backendUrl}/health`);
      console.log('   ✅ Health check exitoso:', response.status);
      console.log('   📊 Estado:', response.data);
    } catch (error) {
      console.log('   ❌ Health check falló:', error.message);
    }

    console.log('\n4️⃣ Probando endpoint de debug...');
    try {
      const response = await axios.get(`${backendUrl}/debug-env`);
      console.log('   ✅ Debug exitoso:', response.status);
      console.log('   📊 Variables de entorno:', response.data);
    } catch (error) {
      console.log('   ❌ Debug falló:', error.message);
    }

    console.log('\n5️⃣ Probando endpoint de base de datos...');
    try {
      const response = await axios.get(`${backendUrl}/db-status`);
      console.log('   ✅ DB status exitoso:', response.status);
      console.log('   📊 Estado BD:', response.data);
    } catch (error) {
      console.log('   ❌ DB status falló:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

// Función para verificar la estructura de la respuesta de error
async function analyzeErrorResponse() {
  console.log('\n🔍 ANÁLISIS DETALLADO DE ERRORES');
  console.log('==================================\n');

  try {
    // Intentar obtener más detalles del error
    const response = await axios.get(`${backendUrl}/api/cases`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: () => true // Aceptar cualquier status code
    });

    console.log('📊 Respuesta completa:');
    console.log('   Status:', response.status);
    console.log('   Headers:', response.headers);
    console.log('   Data:', response.data);
    console.log('   Status Text:', response.statusText);

  } catch (error) {
    console.log('📊 Error completo:');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Headers:', error.response.headers);
      console.log('   Data:', error.response.data);
      console.log('   Status Text:', error.response.statusText);
    } else if (error.request) {
      console.log('   Request error:', error.request);
    } else {
      console.log('   Error message:', error.message);
    }
    console.log('   Config:', error.config);
  }
}

// Ejecutar pruebas
async function runTests() {
  await testCasesEndpoint();
  await analyzeErrorResponse();
  
  console.log('\n✅ DIAGNÓSTICO COMPLETADO');
  console.log('==========================');
  console.log('\n📋 RESUMEN:');
  console.log('- Si el health check falla: Problema de conectividad');
  console.log('- Si el health check funciona pero casos falla: Problema de autenticación o lógica');
  console.log('- Si ambos funcionan pero hay error 500: Problema interno del servidor');
}

runTests().catch(console.error);
