const axios = require('axios');

console.log('🔍 PROBANDO NUEVA FUNCIONALIDAD DE AUTENTICACIÓN');
console.log('================================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Función para simular el flujo de autenticación completo
async function testAuthenticationFlow() {
  try {
    console.log('1️⃣ Probando endpoint de login...');
    
    // Intentar login con credenciales de prueba
    const loginData = {
      email: 'admin@despacho.com',
      password: 'admin123'
    };
    
    try {
      const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, loginData);
      console.log('   ✅ Login exitoso');
      console.log('   📊 Token recibido:', loginResponse.data.token ? 'Presente' : 'Ausente');
      console.log('   👤 Usuario recibido:', loginResponse.data.user ? 'Presente' : 'Ausente');
      
      if (loginResponse.data.token) {
        const token = loginResponse.data.token;
        
        console.log('\n2️⃣ Probando endpoint de casos con token válido...');
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
          
          if (Array.isArray(casesResponse.data) && casesResponse.data.length > 0) {
            console.log('   📋 Primer caso:', {
              id: casesResponse.data[0].id,
              title: casesResponse.data[0].title,
              status: casesResponse.data[0].status
            });
          }
          
        } catch (casesError) {
          console.log('   ❌ Error obteniendo casos:', casesError.response?.status, casesError.response?.data);
        }
        
        console.log('\n3️⃣ Probando endpoint de tareas con token válido...');
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
        
        console.log('\n4️⃣ Probando endpoint de documentos con token válido...');
        try {
          const documentsResponse = await axios.get(`${backendUrl}/api/documents`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('   ✅ Documentos obtenidos exitosamente');
          console.log('   📊 Status:', documentsResponse.status);
          console.log('   📋 Cantidad de documentos:', Array.isArray(documentsResponse.data) ? documentsResponse.data.length : 'No es array');
          
        } catch (documentsError) {
          console.log('   ❌ Error obteniendo documentos:', documentsError.response?.status, documentsError.response?.data);
        }
        
        console.log('\n5️⃣ Probando endpoint de facturas con token válido...');
        try {
          const invoicesResponse = await axios.get(`${backendUrl}/api/invoices`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('   ✅ Facturas obtenidas exitosamente');
          console.log('   📊 Status:', invoicesResponse.status);
          console.log('   📋 Cantidad de facturas:', Array.isArray(invoicesResponse.data) ? invoicesResponse.data.length : 'No es array');
          
        } catch (invoicesError) {
          console.log('   ❌ Error obteniendo facturas:', invoicesError.response?.status, invoicesError.response?.data);
        }
        
      } else {
        console.log('   ❌ No se recibió token en el login');
      }
      
    } catch (loginError) {
      console.log('   ❌ Error en login:', loginError.response?.status, loginError.response?.data);
      
      // Si el login falla, probar con credenciales alternativas
      console.log('\n🔄 Probando con credenciales alternativas...');
      
      const alternativeCredentials = [
        { email: 'abogado@despacho.com', password: 'abogado123' },
        { email: 'cliente@despacho.com', password: 'cliente123' },
        { email: 'test@despacho.com', password: 'test123' }
      ];
      
      for (const cred of alternativeCredentials) {
        try {
          console.log(`   🔑 Probando: ${cred.email}`);
          const altResponse = await axios.post(`${backendUrl}/api/auth/login`, cred);
          console.log('   ✅ Login alternativo exitoso con:', cred.email);
          break;
        } catch (altError) {
          console.log(`   ❌ Falló con ${cred.email}:`, altError.response?.status);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error general en el flujo de autenticación:', error.message);
  }
}

// Función para verificar la estructura de la base de datos
async function verifyDatabaseStructure() {
  console.log('\n🔍 VERIFICANDO ESTRUCTURA DE LA BASE DE DATOS');
  console.log('==============================================\n');
  
  try {
    const dbResponse = await axios.get(`${backendUrl}/db-status`);
    console.log('✅ Estado de la base de datos:', dbResponse.data.connected ? 'Conectada' : 'Desconectada');
    
    if (dbResponse.data.tables) {
      console.log('📋 Tablas disponibles:', dbResponse.data.tables.length);
      
      // Verificar tablas críticas
      const criticalTables = ['User', 'Expediente', 'Document', 'Invoice', 'Task'];
      criticalTables.forEach(table => {
        const exists = dbResponse.data.tables.some(t => t.table_name === table);
        console.log(`   ${table}: ${exists ? '✅' : '❌'}`);
      });
    }
    
    if (dbResponse.data.userCount) {
      console.log('👥 Usuarios en la base de datos:', dbResponse.data.userCount);
    }
    
  } catch (error) {
    console.log('❌ Error verificando base de datos:', error.message);
  }
}

// Ejecutar pruebas
async function runAllTests() {
  await testAuthenticationFlow();
  await verifyDatabaseStructure();
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
  console.log('======================');
  console.log('\n📋 RESUMEN:');
  console.log('- Si el login funciona: El problema está en el frontend');
  console.log('- Si el login falla: El problema está en el backend o credenciales');
  console.log('- Si los endpoints funcionan con token: El problema está en el frontend');
  console.log('- Si los endpoints fallan con token: El problema está en el backend');
}

runAllTests().catch(console.error);
