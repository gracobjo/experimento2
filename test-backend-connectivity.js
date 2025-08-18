const axios = require('axios');

const BACKEND_URL = 'https://experimento2-production-54c0.up.railway.app';
const FRONTEND_URL = 'https://experimento2-fenm.vercel.app';

console.log('🔍 === DIAGNÓSTICO DE CONECTIVIDAD BACKEND ===');
console.log(`🌐 Backend URL: ${BACKEND_URL}`);
console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
console.log('');

async function testEndpoints() {
  try {
    // Test 1: Health endpoint (sin autenticación)
    console.log('🔍 Test 1: Health endpoint (sin autenticación)');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log(`✅ Health: ${healthResponse.status} - ${JSON.stringify(healthResponse.data)}`);
  } catch (error) {
    console.log(`❌ Health Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Headers:`, error.response.headers);
    }
  }

  console.log('');

  try {
    // Test 2: Debug env endpoint
    console.log('🔍 Test 2: Debug env endpoint');
    const debugResponse = await axios.get(`${BACKEND_URL}/debug-env`);
    console.log(`✅ Debug Env: ${debugResponse.status} - ${JSON.stringify(debugResponse.data)}`);
  } catch (error) {
    console.log(`❌ Debug Env Error: ${error.message}`);
  }

  console.log('');

  try {
    // Test 3: Database status endpoint
    console.log('🔍 Test 3: Database status endpoint');
    const dbResponse = await axios.get(`${BACKEND_URL}/db-status`);
    console.log(`✅ DB Status: ${dbResponse.status} - ${JSON.stringify(dbResponse.data)}`);
  } catch (error) {
    console.log(`❌ DB Status Error: ${error.message}`);
  }

  console.log('');

  try {
    // Test 4: Appointments test endpoint
    console.log('🔍 Test 4: Appointments test endpoint');
    const appointmentsResponse = await axios.get(`${BACKEND_URL}/appointments-test`);
    console.log(`✅ Appointments Test: ${appointmentsResponse.status} - ${JSON.stringify(appointmentsResponse.data)}`);
  } catch (error) {
    console.log(`❌ Appointments Test Error: ${error.message}`);
  }

  console.log('');

  try {
    // Test 4.5: Documents test endpoint
    console.log('🔍 Test 4.5: Documents test endpoint');
    const documentsResponse = await axios.get(`${BACKEND_URL}/documents-test`);
    console.log(`✅ Documents Test: ${documentsResponse.status} - ${JSON.stringify(documentsResponse.data)}`);
  } catch (error) {
    console.log(`❌ Documents Test Error: ${error.message}`);
  }

  console.log('');

  try {
    // Test 5: Appointments endpoint (con autenticación simulada)
    console.log('🔍 Test 5: Appointments endpoint (con autenticación simulada)');
    const appointmentsResponse = await axios.get(`${BACKEND_URL}/api/appointments`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Origin': FRONTEND_URL,
        'Content-Type': 'application/json'
      }
    });
    console.log(`✅ Appointments API: ${appointmentsResponse.status} - ${JSON.stringify(appointmentsResponse.data)}`);
  } catch (error) {
    console.log(`❌ Appointments API Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
      console.log(`   Headers:`, error.response.headers);
    }
  }

  console.log('');

  try {
    // Test 6: CORS preflight test
    console.log('🔍 Test 6: CORS preflight test');
    const preflightResponse = await axios.options(`${BACKEND_URL}/api/appointments`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    console.log(`✅ CORS Preflight: ${preflightResponse.status}`);
    console.log(`   Access-Control-Allow-Origin: ${preflightResponse.headers['access-control-allow-origin']}`);
    console.log(`   Access-Control-Allow-Methods: ${preflightResponse.headers['access-control-allow-methods']}`);
    console.log(`   Access-Control-Allow-Headers: ${preflightResponse.headers['access-control-allow-headers']}`);
  } catch (error) {
    console.log(`❌ CORS Preflight Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Headers:`, error.response.headers);
    }
  }
}

console.log('🚀 Iniciando tests...');
testEndpoints().then(() => {
  console.log('');
  console.log('✅ === DIAGNÓSTICO COMPLETADO ===');
}).catch(error => {
  console.log('');
  console.log('❌ === ERROR EN EL DIAGNÓSTICO ===');
  console.log(error.message);
});

