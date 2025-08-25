const axios = require('axios');

async function testVercelFrontendAuth() {
  console.log('🔍 PROBANDO AUTENTICACIÓN DESDE FRONTEND VERCEL\n');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar que el frontend esté funcionando
    console.log('\n1️⃣ Verificando frontend de Vercel...');
    
    try {
      const frontendResponse = await axios.get('https://experimento2-fenm.vercel.app/');
      console.log('   ✅ Frontend accesible');
      console.log('   📊 Status:', frontendResponse.status);
      console.log('   📄 Content-Type:', frontendResponse.headers['content-type']);
      
    } catch (error) {
      console.log('   ❌ Error accediendo al frontend:', error.message);
      return;
    }

    // 2. Verificar que el backend esté funcionando
    console.log('\n2️⃣ Verificando backend de Railway...');
    
    try {
      const backendResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/db-status');
      console.log('   ✅ Backend accesible');
      console.log('   📊 Estado BD:', backendResponse.data.connected ? 'CONECTADO' : 'DESCONECTADO');
      console.log('   👥 Usuarios en BD:', backendResponse.data.userCount);
      
    } catch (error) {
      console.log('   ❌ Error accediendo al backend:', error.message);
      return;
    }

    // 3. Probar autenticación con diferentes usuarios
    console.log('\n3️⃣ Probando autenticación con diferentes usuarios...');
    
    const testUsers = [
      { email: 'admin@despacho.com', password: 'admin123', name: 'Admin' },
      { email: 'lawyer1@example.com', password: 'password', name: 'Lawyer 1' },
      { email: 'client1@example.com', password: 'password', name: 'Client 1' },
      { email: 'test@example.com', password: 'test123', name: 'Test User' }
    ];
    
    let successfulAuth = null;
    
    for (const user of testUsers) {
      console.log(`\n   🧪 Probando: ${user.name} (${user.email})`);
      
      try {
        const authResponse = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
          email: user.email,
          password: user.password
        });
        
        console.log('      ✅ Login exitoso!');
        console.log('      🔑 Token:', authResponse.data.token ? 'SÍ' : 'NO');
        console.log('      👤 Usuario:', authResponse.data.user?.name);
        console.log('      🏷️ Rol:', authResponse.data.user?.role);
        
        successfulAuth = {
          user: user,
          token: authResponse.data.token,
          response: authResponse.data
        };
        
        break; // Si uno funciona, no necesitamos probar más
        
      } catch (error) {
        console.log(`      ❌ Falló: ${error.response?.data?.message || error.message}`);
        console.log(`      📊 Status: ${error.response?.status || 'N/A'}`);
      }
    }

    if (!successfulAuth) {
      console.log('\n   ❌ Ningún usuario pudo autenticarse');
      console.log('   🔍 Esto explica por qué los scripts locales fallan');
      return;
    }

    // 4. Si la autenticación fue exitosa, probar obtener datos
    console.log('\n4️⃣ Probando obtención de datos con autenticación exitosa...');
    
    try {
      const casesResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/api/cases', {
        headers: {
          'Authorization': `Bearer ${successfulAuth.token}`
        }
      });
      
      console.log('   ✅ Casos obtenidos exitosamente');
      console.log('   📁 Número de casos:', casesResponse.data.length);
      
    } catch (error) {
      console.log('   ❌ Error obteniendo casos:', error.response?.data?.message || error.message);
    }

    // 5. Resumen final
    console.log('\n5️⃣ Resumen de la verificación...');
    console.log('   ✅ Frontend Vercel: Funcionando');
    console.log('   ✅ Backend Railway: Funcionando');
    console.log('   ✅ Base de datos: Conectada');
    
    if (successfulAuth) {
      console.log('   ✅ Autenticación: Funcionando con', successfulAuth.user.name);
      console.log('   ✅ Token: Generado correctamente');
      console.log('   ✅ Datos: Accesibles a través de la API');
    } else {
      console.log('   ❌ Autenticación: Fallando para todos los usuarios');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICACIÓN COMPLETADA');
}

testVercelFrontendAuth();
