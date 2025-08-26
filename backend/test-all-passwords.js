const axios = require('axios');

async function testAllPasswords() {
  try {
    console.log('🔍 Probando todas las contraseñas posibles...\n');
    
    const baseUrl = 'https://experimento2-production-54c0.up.railway.app';
    
    // Lista de usuarios y contraseñas a probar
    const testCases = [
      { email: 'admin@despacho.com', password: 'admin123', description: 'Admin con admin123' },
      { email: 'admin@despacho.com', password: 'password123', description: 'Admin con password123' },
      { email: 'admin@despacho.com', password: 'admin', description: 'Admin con admin' },
      { email: 'admin@despacho.com', password: '123456', description: 'Admin con 123456' },
      { email: 'lawyer1@example.com', password: 'password123', description: 'Lawyer1 con password123' },
      { email: 'lawyer1@example.com', password: 'lawyer123', description: 'Lawyer1 con lawyer123' },
      { email: 'lawyer1@example.com', password: '123456', description: 'Lawyer1 con 123456' },
      { email: 'lawyer2@example.com', password: 'password123', description: 'Lawyer2 con password123' },
      { email: 'lawyer2@example.com', password: 'lawyer123', description: 'Lawyer2 con lawyer123' },
      { email: 'client1@example.com', password: 'password123', description: 'Client1 con password123' },
      { email: 'client1@example.com', password: 'client123', description: 'Client1 con client123' },
      { email: 'cliente2@email.com', password: 'password123', description: 'Cliente2 con password123' },
      { email: 'cliente2@email.com', password: 'cliente123', description: 'Cliente2 con cliente123' }
    ];
    
    console.log(`📋 Probando ${testCases.length} combinaciones de credenciales...\n`);
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`${i + 1}/${testCases.length} 🔐 ${testCase.description}...`);
      
      try {
        const response = await axios.post(`${baseUrl}/api/auth/login`, {
          email: testCase.email,
          password: testCase.password
        }, {
          timeout: 5000
        });
        
        if (response.data?.access_token) {
          console.log(`   ✅ ÉXITO! Token obtenido: ${response.data.access_token.substring(0, 20)}...`);
          console.log(`   📧 Email: ${testCase.email}`);
          console.log(`   🔑 Password: ${testCase.password}`);
          console.log(`   🎯 Usar estas credenciales en el script de streaming!\n`);
          
          // Probar también el endpoint de documentos
          try {
            const docsResponse = await axios.get(`${baseUrl}/api/documents`, {
              headers: { Authorization: `Bearer ${response.data.access_token}` },
              timeout: 5000
            });
            console.log(`   📁 Documents endpoint: ${docsResponse.status} (${docsResponse.data?.length || 0} documentos)`);
          } catch (docsError) {
            console.log(`   ❌ Documents endpoint: ${docsError.response?.status || 'Error'}`);
          }
          
          return; // Salir después del primer éxito
        }
        
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`   ❌ 401 - Credenciales inválidas`);
        } else if (error.response?.status) {
          console.log(`   ❌ ${error.response.status} - ${error.response.data?.message || 'Error'}`);
        } else {
          console.log(`   ❌ Error de conexión: ${error.message}`);
        }
      }
      
      // Pequeña pausa entre intentos
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n❌ No se encontraron credenciales válidas');
    console.log('💡 Sugerencia: Verificar en el frontend qué contraseña funciona realmente');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testAllPasswords();




