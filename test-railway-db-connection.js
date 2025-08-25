const axios = require('axios');

async function testRailwayDBConnection() {
  console.log('🔍 VERIFICANDO CONEXIÓN A BASE DE DATOS DESDE RAILWAY\n');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar endpoint de estado de la base de datos
    console.log('\n1️⃣ Verificando estado de la base de datos...');
    
    try {
      const dbStatus = await axios.get('https://experimento2-production-54c0.up.railway.app/db-status');
      console.log('   ✅ Estado de BD:', dbStatus.data.connected ? 'CONECTADO' : 'DESCONECTADO');
      console.log('   📊 Usuarios en BD:', dbStatus.data.userCount);
      console.log('   📋 Tablas disponibles:', dbStatus.data.tables.length);
      
      if (dbStatus.data.connected) {
        console.log('   ✅ La base de datos está conectada desde Railway');
      } else {
        console.log('   ❌ La base de datos NO está conectada desde Railway');
        console.log('   🔍 Error:', dbStatus.data.error);
        return;
      }
      
    } catch (error) {
      console.log('   ❌ Error verificando estado de BD:', error.response?.data?.message || error.message);
      return;
    }

    // 2. Verificar si hay algún problema con la consulta de usuarios
    console.log('\n2️⃣ Verificando consulta de usuarios...');
    
    try {
      // Intentar obtener usuarios a través de un endpoint que no requiera autenticación
      const usersResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/api/users');
      console.log('   ✅ Usuarios obtenidos exitosamente');
      console.log('   📊 Número de usuarios:', usersResponse.data.length);
      
      if (usersResponse.data.length > 0) {
        console.log('   👥 Primer usuario:', usersResponse.data[0].email);
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Endpoint protegido (requiere autenticación)');
      } else {
        console.log('   ❌ Error obteniendo usuarios:', error.response?.data?.message || error.message);
      }
    }

    // 3. Verificar si hay algún problema con bcrypt
    console.log('\n3️⃣ Verificando si hay problemas con bcrypt...');
    
    // Crear un endpoint de prueba que use bcrypt
    try {
      const testResponse = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      
      console.log('   ✅ Login exitoso (esto no debería pasar)');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Error 401 (como esperado)');
        
        // Verificar si hay algún mensaje de error específico de bcrypt
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('bcrypt') || errorMessage.includes('hash') || errorMessage.includes('password')) {
          console.log('   🔍 Error relacionado con bcrypt/hash detectado');
        } else {
          console.log('   🔍 Error genérico de credenciales inválidas');
        }
      } else {
        console.log('   ❌ Status inesperado:', error.response?.status);
      }
    }

    // 4. Verificar variables de entorno críticas
    console.log('\n4️⃣ Verificando variables de entorno críticas...');
    
    try {
      const debugResponse = await axios.get('https://experimento2-production-54c0.up.railway.app/debug-env');
      console.log('   ✅ Debug exitoso:');
      console.log('      JWT_SECRET:', debugResponse.data.jwtSecret);
      console.log('      DATABASE_URL:', debugResponse.data.databaseUrl);
      console.log('      NODE_ENV:', debugResponse.data.nodeEnv);
      
      // Verificar si las variables están configuradas correctamente
      if (debugResponse.data.jwtSecret === 'CONFIGURADO') {
        console.log('   ✅ JWT_SECRET está configurado');
      } else {
        console.log('   ❌ JWT_SECRET NO está configurado');
      }
      
      if (debugResponse.data.databaseUrl === 'CONFIGURADO') {
        console.log('   ✅ DATABASE_URL está configurado');
      } else {
        console.log('   ❌ DATABASE_URL NO está configurado');
      }
      
    } catch (error) {
      console.log('   ❌ Debug falló:', error.response?.data?.message || error.message);
    }

    // 5. Verificar si hay algún problema con el código del AuthService
    console.log('\n5️⃣ Verificando si hay problemas en el código...');
    
    // Intentar con un usuario que sabemos que existe y tiene una contraseña simple
    try {
      const response = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
        email: 'admin@despacho.com',
        password: 'admin'
      });
      
      console.log('   ✅ Login exitoso con admin/admin');
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Login falló como esperado (admin/admin)');
        
        // Intentar con otra combinación común
        try {
          const response2 = await axios.post('https://experimento2-production-54c0.up.railway.app/api/auth/login', {
            email: 'admin@despacho.com',
            password: 'admin123'
          });
          
          console.log('   ✅ Login exitoso con admin/admin123');
          
        } catch (error2) {
          console.log('   ❌ Login también falló con admin/admin123');
          console.log('   🔍 Esto confirma que hay un problema fundamental en el AuthService');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICACIÓN COMPLETADA');
}

testRailwayDBConnection();
