const axios = require('axios');

async function getFrontendConfig() {
  try {
    console.log('🔍 Obteniendo la configuración COMPLETA del frontend...\n');
    
    const frontendUrl = 'https://experimento2-fenm.vercel.app';
    
    console.log('1️⃣ Obteniendo archivo de configuración completo...');
    
    try {
      const configResponse = await axios.get(`${frontendUrl}/config.js`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('   ✅ Archivo de configuración obtenido');
      console.log('   📄 Configuración COMPLETA:');
      console.log('   ' + '='.repeat(80));
      console.log(configResponse.data);
      console.log('   ' + '='.repeat(80));
      
      // Extraer la URL de la API del archivo de configuración
      const configContent = configResponse.data;
      const apiUrlMatch = configContent.match(/API_URL:\s*['"`]([^'"`]+)['"`]/);
      
      if (apiUrlMatch) {
        const apiUrl = apiUrlMatch[1];
        console.log('\n🎯 URL de la API encontrada en la configuración:');
        console.log('   🔧 ' + apiUrl);
        
        // Verificar si esta URL es diferente a la que estamos probando
        const expectedUrl = 'https://experimento2-production-54c0.up.railway.app';
        if (apiUrl === expectedUrl) {
          console.log('   ✅ La URL coincide con la esperada');
        } else {
          console.log('   ⚠️ La URL es DIFERENTE a la esperada');
          console.log('   🔍 Esperada: ' + expectedUrl);
          console.log('   🔍 Encontrada: ' + apiUrl);
          
          // Probar login con la URL encontrada
          console.log('\n🔐 Probando login con la URL del frontend...');
          try {
            const loginResponse = await axios.post(`${apiUrl}/api/auth/login`, {
              email: 'lawyer1@example.com',
              password: 'password123'
            }, {
              timeout: 10000,
              headers: {
                'Content-Type': 'application/json',
                'Origin': frontendUrl
              }
            });
            
            if (loginResponse.data?.access_token) {
              console.log('   🎉 ¡ÉXITO! Login exitoso con la URL del frontend');
              console.log('   🎯 Token: ' + loginResponse.data.access_token.substring(0, 30) + '...');
              return;
            }
            
          } catch (loginError) {
            console.log('   ❌ Login falló con la URL del frontend: ' + loginError.message);
          }
        }
      } else {
        console.log('   ❌ No se pudo extraer la URL de la API de la configuración');
      }
      
    } catch (configError) {
      console.log('   ❌ Error obteniendo configuración: ' + configError.message);
    }
    
    // Segunda opción: verificar si hay otros archivos de configuración
    console.log('\n2️⃣ Verificando otros archivos de configuración...');
    
    const configFiles = [
      '/config.js',
      '/public/config.js',
      '/static/config.js',
      '/api/config',
      '/_next/static/config.js'
    ];
    
    for (const configFile of configFiles) {
      try {
        const response = await axios.get(`${frontendUrl}${configFile}`, {
          timeout: 5000
        });
        
        if (response.data && response.data.includes('API_URL')) {
          console.log('   ✅ Configuración encontrada en: ' + configFile);
          console.log('   📄 Contenido: ' + response.data.substring(0, 300) + '...');
          break;
        }
        
      } catch (error) {
        // Ignorar errores para archivos que no existen
      }
    }
    
    console.log('\n💡 Análisis final:');
    console.log('   1. El frontend tiene configuración específica');
    console.log('   2. Necesitamos usar la misma URL que usa el frontend');
    console.log('   3. Las credenciales son correctas pero la URL puede ser diferente');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

getFrontendConfig();



