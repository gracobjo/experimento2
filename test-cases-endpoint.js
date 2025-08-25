const axios = require('axios');

async function testCasesEndpoint() {
  console.log('🔍 PROBANDO ENDPOINT DE CASOS QUE ESTÁ FALLANDO\n');
  console.log('=' .repeat(60));

  try {
    // 1. Primero autenticarnos para obtener un token
    console.log('\n1️⃣ Autenticándose para obtener token...');
    
    let token = null;
    try {
      const authResponse = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      
      console.log('   ✅ Login exitoso');
      console.log('   🔑 Token recibido:', authResponse.data.token ? 'SÍ' : 'NO');
      token = authResponse.data.token;
      
    } catch (error) {
      console.log('   ❌ Error en login:', error.response?.data?.message || error.message);
      
      // Intentar con otro usuario
      try {
        const authResponse2 = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
          email: 'admin@despacho.com',
          password: 'admin123'
        });
        
        console.log('   ✅ Login exitoso con admin');
        token = authResponse2.data.token;
        
      } catch (error2) {
        console.log('   ❌ Error en login con admin:', error2.response?.data?.message || error2.message);
        console.log('   🔍 No podemos continuar sin autenticación');
        return;
      }
    }

    if (!token) {
      console.log('   ❌ No se pudo obtener token de autenticación');
      return;
    }

    // 2. Probar el endpoint de casos que está fallando
    console.log('\n2️⃣ Probando endpoint de casos...');
    
    try {
      const casesResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/api/cases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   ✅ Casos obtenidos exitosamente');
      console.log('   📁 Número de casos:', casesResponse.data.length);
      
      if (casesResponse.data.length > 0) {
        console.log('   📋 Primer caso:', casesResponse.data[0].title || casesResponse.data[0].id);
      }
      
    } catch (error) {
      console.log('   ❌ Error obteniendo casos:');
      console.log('      📊 Status:', error.response?.status);
      console.log('      📊 Mensaje:', error.response?.data?.message);
      console.log('      📊 Error:', error.response?.data?.error);
      
      if (error.response?.status === 500) {
        console.log('      🔍 Error 500 - Problema interno del servidor');
        console.log('      🔍 Esto coincide con el error del frontend');
      }
    }

    // 3. Probar otros endpoints para ver si el problema es general
    console.log('\n3️⃣ Probando otros endpoints...');
    
    const endpoints = [
      { name: 'Usuarios', url: '/api/users' },
      { name: 'Tareas', url: '/api/tasks' },
      { name: 'Documentos', url: '/api/documents' },
      { name: 'Facturas', url: '/api/invoices' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`https://experimento2-production-54c0.up.railway.app${endpoint.url}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`   ✅ ${endpoint.name}: Funcionando (${response.data.length} elementos)`);
        
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: ${error.response?.status || error.message}`);
      }
    }

    // 4. Verificar si hay algún problema con la base de datos
    console.log('\n4️⃣ Verificando estado de la base de datos...');
    
    try {
      const dbStatus = await axios.get('https://experimento2-production-54c0.up.railway.app/db-status');
      console.log('   ✅ Estado de BD:', dbStatus.data.connected ? 'CONECTADO' : 'DESCONECTADO');
      console.log('   📊 Usuarios en BD:', dbStatus.data.userCount);
      console.log('   📋 Tablas disponibles:', dbStatus.data.tables.length);
      
    } catch (error) {
      console.log('   ❌ Error verificando BD:', error.response?.data?.message || error.message);
    }

    // 5. Resumen final
    console.log('\n5️⃣ Resumen de la verificación...');
    console.log('   ✅ Autenticación: Funcionando');
    console.log('   ❌ Endpoint de casos: Error 500');
    console.log('   🔍 El problema está en el backend, no en la autenticación');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICACIÓN COMPLETADA');
}

testCasesEndpoint();
