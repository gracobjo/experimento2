const axios = require('axios');

console.log('🔍 DEBUGGEANDO ERROR 500 EN ENDPOINT DE CASOS');
console.log('=============================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Función para debuggear el endpoint de casos
async function debugCasesEndpoint() {
  try {
    console.log('1️⃣ Obteniendo token de autenticación...');
    
    // Login con usuario válido
    const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
      email: 'admin@despacho.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.token) {
      console.log('❌ No se recibió token');
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtenido exitosamente');
    
    console.log('\n2️⃣ Probando diferentes variantes del endpoint de casos...');
    
    // Probar endpoint básico
    console.log('   🔍 Probando GET /api/cases...');
    try {
      const casesResponse = await axios.get(`${backendUrl}/api/cases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Casos obtenidos exitosamente');
      console.log('   📊 Status:', casesResponse.status);
      console.log('   📋 Cantidad:', Array.isArray(casesResponse.data) ? casesResponse.data.length : 'No es array');
    } catch (error) {
      console.log('   ❌ Error 500 en /api/cases:', error.response?.status, error.response?.data);
    }
    
    // Probar endpoint de mis casos
    console.log('\n   🔍 Probando GET /api/cases/my...');
    try {
      const myCasesResponse = await axios.get(`${backendUrl}/api/cases/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Mis casos obtenidos exitosamente');
      console.log('   📊 Status:', myCasesResponse.status);
      console.log('   📋 Cantidad:', Array.isArray(myCasesResponse.data) ? myCasesResponse.data.length : 'No es array');
    } catch (error) {
      console.log('   ❌ Error en /api/cases/my:', error.response?.status, error.response?.data);
    }
    
    // Probar endpoint de estadísticas
    console.log('\n   🔍 Probando GET /api/cases/stats...');
    try {
      const statsResponse = await axios.get(`${backendUrl}/api/cases/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Estadísticas obtenidas exitosamente');
      console.log('   📊 Status:', statsResponse.status);
      console.log('   📋 Datos:', statsResponse.data);
    } catch (error) {
      console.log('   ❌ Error en /api/cases/stats:', error.response?.status, error.response?.data);
    }
    
    // Probar endpoint de debug
    console.log('\n   🔍 Probando GET /api/cases/debug/all...');
    try {
      const debugResponse = await axios.get(`${backendUrl}/api/cases/debug/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Debug obtenido exitosamente');
      console.log('   📊 Status:', debugResponse.status);
      console.log('   📋 Datos:', debugResponse.data);
    } catch (error) {
      console.log('   ❌ Error en /api/cases/debug/all:', error.response?.status, error.response?.data);
    }
    
    console.log('\n3️⃣ Verificando estructura de la base de datos...');
    
    // Verificar si hay expedientes en la base de datos
    try {
      const dbResponse = await axios.get(`${backendUrl}/db-status`);
      console.log('   ✅ Estado de BD:', dbResponse.data.connected ? 'Conectada' : 'Desconectada');
      
      if (dbResponse.data.tables) {
        const expedienteTable = dbResponse.data.tables.find(t => t.table_name === 'Expediente');
        if (expedienteTable) {
          console.log('   📋 Tabla Expediente: ✅ Encontrada');
        } else {
          console.log('   ❌ Tabla Expediente: No encontrada');
        }
      }
    } catch (error) {
      console.log('   ❌ Error verificando BD:', error.message);
    }
    
    console.log('\n4️⃣ Probando con diferentes roles...');
    
    // Crear y probar con usuario abogado
    try {
      console.log('   🔧 Creando usuario abogado...');
      const lawyerResponse = await axios.post(`${backendUrl}/api/auth/register`, {
        email: 'abogado@test.com',
        password: 'abogado123',
        name: 'Abogado Test',
        role: 'ABOGADO'
      });
      
      if (lawyerResponse.data.token) {
        console.log('   ✅ Usuario abogado creado');
        
        // Probar endpoint de casos con rol abogado
        console.log('   🔍 Probando casos con rol ABOGADO...');
        try {
          const lawyerCasesResponse = await axios.get(`${backendUrl}/api/cases`, {
            headers: {
              'Authorization': `Bearer ${lawyerResponse.data.token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('   ✅ Casos obtenidos con rol ABOGADO');
          console.log('   📊 Status:', lawyerCasesResponse.status);
        } catch (error) {
          console.log('   ❌ Error con rol ABOGADO:', error.response?.status, error.response?.data);
        }
      }
    } catch (error) {
      console.log('   ❌ Error creando usuario abogado:', error.response?.status);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Función para verificar logs del servidor
async function checkServerLogs() {
  console.log('\n🔍 VERIFICANDO LOGS DEL SERVIDOR');
  console.log('==================================\n');
  
  try {
    // Probar endpoints que podrían dar información sobre errores
    const endpoints = [
      '/health',
      '/debug-env',
      '/api-test'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${backendUrl}${endpoint}`);
        console.log(`   ✅ ${endpoint}:`, response.status);
      } catch (error) {
        console.log(`   ❌ ${endpoint}:`, error.response?.status);
      }
    }
    
  } catch (error) {
    console.log('❌ Error verificando logs:', error.message);
  }
}

// Ejecutar debug
async function runDebug() {
  await debugCasesEndpoint();
  await checkServerLogs();
  
  console.log('\n✅ DEBUG COMPLETADO');
  console.log('==================');
  console.log('\n📋 ANÁLISIS:');
  console.log('- Si solo /api/cases falla: Problema específico en el servicio de casos');
  console.log('- Si todos fallan: Problema general del servidor');
  console.log('- Si algunos funcionan: Problema en la lógica específica');
}

runDebug().catch(console.error);
