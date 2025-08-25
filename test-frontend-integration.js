const axios = require('axios');

// Configuración del backend
const BACKEND_URL = 'https://experimento2-production-54c0.up.railway.app';

async function testFrontendIntegration() {
  console.log('🔍 PROBANDO INTEGRACIÓN FRONTEND-BACKEND\n');
  console.log('=' .repeat(60));

  try {
    // 1. Probar endpoint de estado de la base de datos
    console.log('\n1️⃣ Probando endpoint de estado de BD...');
    try {
      const dbStatus = await axios.get(`${BACKEND_URL}/db-status`);
      console.log('   ✅ Estado de BD:', dbStatus.data.connected ? 'CONECTADO' : 'DESCONECTADO');
      console.log('   📊 Usuarios en BD:', dbStatus.data.userCount);
      console.log('   📋 Tablas disponibles:', dbStatus.data.tables.length);
    } catch (error) {
      console.log('   ❌ Error en endpoint de BD:', error.response?.data?.message || error.message);
    }

    // 2. Probar endpoint de autenticación con usuario de prueba
    console.log('\n2️⃣ Probando endpoint de autenticación...');
    let token = null;
    
    try {
      const authResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'test123'
      });
      console.log('   ✅ Login exitoso');
      console.log('   🔑 Token recibido:', authResponse.data.access_token ? 'SÍ' : 'NO');
      
      token = authResponse.data.access_token;
    } catch (error) {
      console.log('   ❌ Error en login:', error.response?.data?.message || error.message);
      console.log('   🔍 Detalles del error:', error.response?.data);
      return; // No podemos continuar sin token
    }

    // 3. Probar endpoint de casos con autenticación
    console.log('\n3️⃣ Probando endpoint de casos (con autenticación)...');
    try {
      const casesResponse = await axios.get(`${BACKEND_URL}/api/cases`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ✅ Casos obtenidos exitosamente');
      console.log('   📁 Número de casos:', casesResponse.data.length);
      
      if (casesResponse.data.length > 0) {
        console.log('   📋 Primer caso:', casesResponse.data[0].title);
      }
    } catch (error) {
      console.log('   ❌ Error obteniendo casos:', error.response?.data?.message || error.message);
    }

    // 4. Probar endpoint de usuarios
    console.log('\n4️⃣ Probando endpoint de usuarios...');
    try {
      const usersResponse = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ✅ Usuarios obtenidos exitosamente');
      console.log('   👥 Número de usuarios:', usersResponse.data.length);
    } catch (error) {
      console.log('   ❌ Error obteniendo usuarios:', error.response?.data?.message || error.message);
    }

    // 5. Probar endpoint de facturas
    console.log('\n5️⃣ Probando endpoint de facturas...');
    try {
      const invoicesResponse = await axios.get(`${BACKEND_URL}/api/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ✅ Facturas obtenidas exitosamente');
      console.log('   💰 Número de facturas:', invoicesResponse.data.length);
      
      if (invoicesResponse.data.length > 0) {
        console.log('   📄 Primera factura:', invoicesResponse.data[0].numeroFactura);
      }
    } catch (error) {
      console.log('   ❌ Error obteniendo facturas:', error.response?.data?.message || error.message);
    }

    // 6. Probar endpoint de documentos
    console.log('\n6️⃣ Probando endpoint de documentos...');
    try {
      const docsResponse = await axios.get(`${BACKEND_URL}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ✅ Documentos obtenidos exitosamente');
      console.log('   📄 Número de documentos:', docsResponse.data.length);
    } catch (error) {
      console.log('   ❌ Error obteniendo documentos:', error.response?.data?.message || error.message);
    }

    // 7. Probar endpoint de tareas
    console.log('\n7️⃣ Probando endpoint de tareas...');
    try {
      const tasksResponse = await axios.get(`${BACKEND_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('   ✅ Tareas obtenidas exitosamente');
      console.log('   ✅ Número de tareas:', tasksResponse.data.length);
    } catch (error) {
      console.log('   ❌ Error obteniendo tareas:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ PRUEBA DE INTEGRACIÓN COMPLETADA');
}

testFrontendIntegration();
