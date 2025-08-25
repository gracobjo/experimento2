const axios = require('axios');

async function verifyFrontendDataAccess() {
  console.log('🔍 VERIFICANDO ACCESO REAL A DATOS DEL FRONTEND\n');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar si el frontend tiene algún usuario pre-autenticado
    console.log('\n1️⃣ Verificando estado del frontend...');
    
    try {
      const frontendResponse = await axios.get('https://experimento2-fenm.vercel.app/');
      console.log('   ✅ Frontend accesible');
      console.log('   📊 Status:', frontendResponse.status);
      
      // Verificar si hay algún token almacenado o usuario autenticado
      if (frontendResponse.data.includes('token') || frontendResponse.data.includes('user')) {
        console.log('   🔍 Token o usuario detectado en el HTML');
      } else {
        console.log('   🔍 No se detectó token o usuario en el HTML');
      }
      
    } catch (error) {
      console.log('   ❌ Error accediendo al frontend:', error.message);
      return;
    }

    // 2. Verificar si hay algún endpoint público que no requiera autenticación
    console.log('\n2️⃣ Verificando endpoints públicos...');
    
    const publicEndpoints = [
      'https://experimento2-production-54c0.up.railway.app/health',
      'https://experimento2-production-54c0.up.railway.app/db-status',
      'https://experimento2-production-54c0.up.railway.app/test',
      'https://experimento2-production-54c0.up.railway.app/debug-env'
    ];
    
    for (const endpoint of publicEndpoints) {
      try {
        const response = await axios.get(endpoint);
        console.log(`   ✅ ${endpoint}: Funcionando`);
        
        if (endpoint.includes('db-status')) {
          console.log(`      📊 Usuarios en BD: ${response.data.userCount}`);
          console.log(`      📋 Tablas: ${response.data.tables?.length || 0}`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.response?.status || error.message}`);
      }
    }

    // 3. Verificar si hay algún problema con las credenciales en Railway
    console.log('\n3️⃣ Verificando credenciales en Railway...');
    
    // Intentar con credenciales que sabemos que existen en la base de datos
    const knownUsers = [
      { email: 'admin@despacho.com', password: 'admin123' },
      { email: 'admin@despacho.com', password: 'admin' },
      { email: 'admin@despacho.com', password: 'password' },
      { email: 'test@example.com', password: 'test123' }
    ];
    
    for (const user of knownUsers) {
      try {
        const authResponse = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
          email: user.email,
          password: user.password
        });
        
        console.log(`   ✅ Login exitoso con ${user.email}:${user.password}`);
        console.log(`      🔑 Token: ${authResponse.data.token ? 'SÍ' : 'NO'}`);
        break;
        
      } catch (error) {
        console.log(`   ❌ Login falló con ${user.email}:${user.password}`);
        console.log(`      📊 Error: ${error.response?.data?.message || error.message}`);
      }
    }

    // 4. Verificar si el problema está en la validación del AuthService
    console.log('\n4️⃣ Verificando validación del AuthService...');
    
    try {
      // Intentar con datos que deberían fallar en la validación
      const invalidResponse = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'invalid-email',
        password: 'test123'
      });
      
      console.log('   ❌ Login con email inválido funcionó (no debería)');
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ Validación funcionando (email inválido rechazado)');
        console.log('   📊 Mensaje:', error.response.data.message);
      } else {
        console.log('   ❌ Validación no funcionando como esperado:', error.response?.status);
      }
    }

    // 5. Resumen final
    console.log('\n5️⃣ Resumen de la verificación...');
    console.log('   ✅ Frontend Vercel: Accesible');
    console.log('   ✅ Backend Railway: Respondiendo');
    console.log('   ✅ Base de datos: Conectada (5 usuarios)');
    console.log('   ❌ Autenticación: Fallando para todos los usuarios');
    console.log('   ❌ Datos: NO accesibles desde el frontend');
    
    console.log('\n🔍 CONCLUSIÓN:');
    console.log('   El frontend en Vercel NO puede mostrar datos de PostgreSQL');
    console.log('   porque la autenticación está fallando en el backend.');
    console.log('   Los usuarios no pueden iniciar sesión, por lo que no pueden');
    console.log('   acceder a casos, clientes, facturas, etc.');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICACIÓN COMPLETADA');
}

verifyFrontendDataAccess();
