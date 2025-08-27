const axios = require('axios');

async function testRealisticPasswords() {
  try {
    console.log('🔍 Probando contraseñas más realistas...\n');
    
    const baseUrl = 'https://experimento2-production-54c0.up.railway.app';
    
    // Contraseñas más realistas basadas en el dominio legal
    const testCases = [
      // Admin - contraseñas típicas de administrador
      { email: 'admin@despacho.com', password: 'admin2024', description: 'Admin con admin2024' },
      { email: 'admin@despacho.com', password: 'despacho2024', description: 'Admin con despacho2024' },
      { email: 'admin@despacho.com', password: 'sistema2024', description: 'Admin con sistema2024' },
      { email: 'admin@despacho.com', password: 'administrador', description: 'Admin con administrador' },
      
      // Lawyer1 - contraseñas específicas del abogado
      { email: 'lawyer1@example.com', password: 'abogado123', description: 'Lawyer1 con abogado123' },
      { email: 'lawyer1@example.com', password: 'lawyer2024', description: 'Lawyer1 con lawyer2024' },
      { email: 'lawyer1@example.com', password: 'despacho123', description: 'Lawyer1 con despacho123' },
      { email: 'lawyer1@example.com', password: 'legal123', description: 'Lawyer1 con legal123' },
      { email: 'lawyer1@example.com', password: 'justicia123', description: 'Lawyer1 con justicia123' },
      
      // Lawyer2 - variaciones del segundo abogado
      { email: 'lawyer2@example.com', password: 'abogado456', description: 'Lawyer2 con abogado456' },
      { email: 'lawyer2@example.com', password: 'lawyer789', description: 'Lawyer2 con lawyer789' },
      { email: 'lawyer2@example.com', password: 'despacho456', description: 'Lawyer2 con despacho456' },
      
      // Clientes - contraseñas típicas de cliente
      { email: 'client1@example.com', password: 'cliente123', description: 'Client1 con cliente123' },
      { email: 'client1@example.com', password: 'usuario123', description: 'Client1 con usuario123' },
      { email: 'cliente2@email.com', password: 'cliente456', description: 'Cliente2 con cliente456' },
      { email: 'cliente2@email.com', password: 'usuario456', description: 'Cliente2 con usuario456' },
      
      // Contraseñas genéricas pero probables
      { email: 'admin@despacho.com', password: '123456789', description: 'Admin con 123456789' },
      { email: 'lawyer1@example.com', password: '123456789', description: 'Lawyer1 con 123456789' },
      { email: 'admin@despacho.com', password: 'qwerty123', description: 'Admin con qwerty123' },
      { email: 'lawyer1@example.com', password: 'qwerty123', description: 'Lawyer1 con qwerty123' }
    ];
    
    console.log(`📋 Probando ${testCases.length} contraseñas realistas...\n`);
    
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
          console.log(`\n🎉 ¡ÉXITO! Credenciales encontradas:`);
          console.log(`   📧 Email: ${testCase.email}`);
          console.log(`   🔑 Password: ${testCase.password}`);
          console.log(`   🎯 Token: ${response.data.access_token.substring(0, 30)}...`);
          
          // Probar el endpoint de documentos
          try {
            const docsResponse = await axios.get(`${baseUrl}/api/documents`, {
              headers: { Authorization: `Bearer ${response.data.access_token}` },
              timeout: 5000
            });
            console.log(`\n📁 Documents endpoint: ${docsResponse.status} (${docsResponse.data?.length || 0} documentos)`);
            
            if (docsResponse.data && docsResponse.data.length > 0) {
              console.log('   📋 Documentos disponibles:');
              docsResponse.data.slice(0, 3).forEach((doc, index) => {
                console.log(`      ${index + 1}. ID: ${doc.id}, Filename: ${doc.filename}`);
              });
            }
          } catch (docsError) {
            console.log(`   ❌ Documents endpoint: ${docsError.response?.status || 'Error'}`);
          }
          
          return; // Salir después del primer éxito
        }
        
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`   ❌ 401 - Credenciales inválidas`);
        } else if (error.response?.status === 400) {
          console.log(`   ❌ 400 - ${error.response.data?.message || 'Error de validación'}`);
        } else if (error.response?.status) {
          console.log(`   ❌ ${error.response.status} - ${error.response.data?.message || 'Error'}`);
        } else {
          console.log(`   ❌ Error de conexión: ${error.message}`);
        }
      }
      
      // Pausa entre intentos
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log('\n❌ No se encontraron credenciales válidas');
    console.log('💡 Próximos pasos:');
    console.log('   1. Verificar en el frontend qué contraseña funciona');
    console.log('   2. Revisar el código del frontend para credenciales');
    console.log('   3. Verificar en la base de datos las contraseñas hasheadas');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testRealisticPasswords();





