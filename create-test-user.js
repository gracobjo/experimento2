const axios = require('axios');

console.log('🔧 CREANDO USUARIO DE PRUEBA');
console.log('=============================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Función para crear un usuario de prueba
async function createTestUser() {
  try {
    console.log('1️⃣ Creando usuario de prueba...');
    
    const userData = {
      email: 'test@despacho.com',
      password: 'test123',
      name: 'Usuario de Prueba',
      role: 'ADMIN'
    };
    
    try {
      const response = await axios.post(`${backendUrl}/api/auth/register`, userData);
      console.log('   ✅ Usuario creado exitosamente');
      console.log('   📊 ID:', response.data.user.id);
      console.log('   👤 Email:', response.data.user.email);
      console.log('   🔑 Role:', response.data.user.role);
      console.log('   🎫 Token:', response.data.token ? 'Presente' : 'Ausente');
      
      // Probar login inmediatamente
      console.log('\n2️⃣ Probando login con el usuario creado...');
      const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
        email: userData.email,
        password: userData.password
      });
      
      console.log('   ✅ Login exitoso');
      console.log('   🎫 Token recibido:', loginResponse.data.token ? 'Presente' : 'Ausente');
      
      if (loginResponse.data.token) {
        const token = loginResponse.data.token;
        
        console.log('\n3️⃣ Probando endpoint de casos...');
        try {
          const casesResponse = await axios.get(`${backendUrl}/api/cases`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('   ✅ Casos obtenidos exitosamente');
          console.log('   📊 Status:', casesResponse.status);
          console.log('   📋 Cantidad de casos:', Array.isArray(casesResponse.data) ? casesResponse.data.length : 'No es array');
          
        } catch (casesError) {
          console.log('   ❌ Error obteniendo casos:', casesError.response?.status, casesError.response?.data);
        }
        
        console.log('\n4️⃣ Probando endpoint de tareas...');
        try {
          const tasksResponse = await axios.get(`${backendUrl}/api/tasks`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('   ✅ Tareas obtenidas exitosamente');
          console.log('   📊 Status:', tasksResponse.status);
          console.log('   📋 Cantidad de tareas:', Array.isArray(tasksResponse.data) ? tasksResponse.data.length : 'No es array');
          
        } catch (tasksError) {
          console.log('   ❌ Error obteniendo tareas:', tasksError.response?.status, tasksError.response?.data);
        }
      }
      
    } catch (registerError) {
      console.log('   ❌ Error creando usuario:', registerError.response?.status, registerError.response?.data);
      
      // Si el registro falla, intentar con login directo
      console.log('\n🔄 Intentando login directo...');
      try {
        const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
          email: userData.email,
          password: userData.password
        });
        
        console.log('   ✅ Login directo exitoso');
        console.log('   🎫 Token recibido:', loginResponse.data.token ? 'Presente' : 'Ausente');
        
      } catch (loginError) {
        console.log('   ❌ Login directo falló:', loginError.response?.status, loginError.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Función para verificar usuarios existentes
async function checkExistingUsers() {
  console.log('\n🔍 VERIFICANDO USUARIOS EXISTENTES');
  console.log('===================================\n');
  
  try {
    // Intentar obtener información de usuarios existentes
    const testEmails = [
      'admin@despacho.com',
      'abogado@despacho.com', 
      'cliente@despacho.com',
      'test@despacho.com',
      'user@despacho.com'
    ];
    
    for (const email of testEmails) {
      try {
        console.log(`   🔑 Probando: ${email}`);
        const response = await axios.post(`${backendUrl}/api/auth/login`, {
          email: email,
          password: 'password123'
        });
        console.log(`   ✅ Login exitoso con ${email}`);
        break;
      } catch (error) {
        console.log(`   ❌ Falló con ${email}:`, error.response?.status);
      }
    }
    
  } catch (error) {
    console.log('❌ Error verificando usuarios:', error.message);
  }
}

// Ejecutar pruebas
async function runTests() {
  await checkExistingUsers();
  await createTestUser();
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
  console.log('======================');
  console.log('\n📋 INSTRUCCIONES PARA EL FRONTEND:');
  console.log('1. Usar las credenciales del usuario creado');
  console.log('2. Verificar que el token se guarde correctamente');
  console.log('3. Probar los endpoints protegidos');
  console.log('4. Verificar que no haya errores 500');
}

runTests().catch(console.error);
