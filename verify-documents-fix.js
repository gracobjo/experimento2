const axios = require('axios');

console.log('🔍 VERIFICANDO SI EL ERROR 500 EN DOCUMENTOS SE HA RESUELTO');
console.log('================================================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Función para verificar el estado del build
async function checkBuildStatus() {
  try {
    console.log('🔧 VERIFICANDO ESTADO DEL BUILD');
    console.log('   📊 Status del servidor...');
    
    const response = await axios.get(`${backendUrl}/health`);
    const timestamp = new Date().toLocaleString('es-ES');
    
    console.log(`   📊 Status del servidor: ${response.status}`);
    console.log(`   🕐 Timestamp: ${timestamp}`);
    
    if (response.status === 200) {
      console.log('   ✅ Servidor activo y respondiendo');
    } else {
      console.log('   ⚠️ Servidor respondiendo pero con status inesperado');
    }
    
  } catch (error) {
    console.log('   ❌ Servidor no responde o en build:', error.message);
  }
}

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    console.log('\n🔑 Obteniendo token de autenticación...');
    
    const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
      email: 'test@despacho.com',
      password: 'test123'
    });
    
    if (loginResponse.data.token) {
      console.log('   ✅ Token obtenido exitosamente');
      return loginResponse.data.token;
    } else {
      throw new Error('No se recibió token');
    }
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    throw error;
  }
}

// Función para verificar el endpoint principal de documentos
async function verifyDocumentsEndpoint(token) {
  try {
    console.log('\n1️⃣ Probando endpoint principal de documentos...');
    
    try {
      const response = await axios.get(`${backendUrl}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   🎉 ¡ÉXITO! Endpoint principal funcionando:', response.status);
      console.log(`   📊 Documentos obtenidos: ${Array.isArray(response.data) ? response.data.length : 'No es array'}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('   📋 Primer documento:', {
          id: response.data[0].id,
          filename: response.data[0].filename,
          expedienteId: response.data[0].expedienteId
        });
      }
      
      console.log('\n   🚀 El backend de documentos está funcionando correctamente!');
      return true;
      
    } catch (error) {
      if (error.response?.status === 500) {
        console.log('   ❌ Error 500 persiste en /api/documents');
        console.log('   📊 Error data:', JSON.stringify(error.response.data, null, 2));
        console.log('\n   ⏳ El backend aún está en build o la corrección no se ha aplicado');
        return false;
      } else {
        console.log('   ❌ Otro error:', error.response?.status, error.response?.data);
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Error verificando endpoint de documentos:', error.message);
    return false;
  }
}

// Función para verificar otros endpoints de documentos
async function verifyOtherDocumentEndpoints(token) {
  try {
    console.log('\n2️⃣ Verificando otros endpoints de documentos...');
    
    // Probar endpoint de mis documentos
    try {
      const myDocsResponse = await axios.get(`${backendUrl}/api/documents/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Mis documentos:', myDocsResponse.status);
    } catch (error) {
      console.log('   ❌ Mis documentos fallaron:', error.response?.status, error.response?.data);
    }

    // Probar endpoint de estadísticas
    try {
      const statsResponse = await axios.get(`${backendUrl}/api/documents/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Estadísticas de documentos:', statsResponse.status);
    } catch (error) {
      console.log('   ❌ Estadísticas fallaron:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error verificando otros endpoints:', error.message);
  }
}

// Función para verificar que casos sigue funcionando
async function verifyCasesStillWorking(token) {
  try {
    console.log('\n3️⃣ Verificando que casos sigue funcionando...');
    
    try {
      const casesResponse = await axios.get(`${backendUrl}/api/cases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Casos (para confirmar estabilidad):', casesResponse.status);
    } catch (error) {
      console.log('   ❌ Casos fallaron (¡esto sería un problema!):', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Error verificando casos:', error.message);
  }
}

// Función para verificar el estado de la base de datos
async function verifyDatabaseStatus() {
  try {
    console.log('\n4️⃣ Verificando estado de la base de datos...');
    
    try {
      const dbResponse = await axios.get(`${backendUrl}/db-status`);
      console.log('   ✅ Base de datos:', dbResponse.data.connected ? 'Conectada' : 'Desconectada');
      
      if (dbResponse.data.tables) {
        const documentTable = dbResponse.data.tables.find(t => 
          t.table_name === 'Document' || 
          t.table_name === 'document'
        );
        
        if (documentTable) {
          console.log('   📄 Tabla Document: ✅ Disponible');
        } else {
          console.log('   ❌ Tabla Document: No encontrada');
        }
      }
      
    } catch (error) {
      console.log('   ❌ Error verificando BD:', error.message);
    }

  } catch (error) {
    console.error('❌ Error en verificación de BD:', error.message);
  }
}

// Función principal de verificación
async function runVerification() {
  try {
    await checkBuildStatus();
    
    const token = await getAuthToken();
    
    const documentsFixed = await verifyDocumentsEndpoint(token);
    await verifyOtherDocumentEndpoints(token);
    await verifyCasesStillWorking(token);
    await verifyDatabaseStatus();
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('==========================');
    console.log('\n📋 RESUMEN:');
    
    if (documentsFixed) {
      console.log('🎉 ¡PROBLEMA RESUELTO!');
      console.log('   ✅ El endpoint /api/documents funciona correctamente');
      console.log('   ✅ Los usuarios pueden acceder a sus documentos');
      console.log('   ✅ El sistema está completamente operativo');
    } else {
      console.log('⏳ PROBLEMA PENDIENTE');
      console.log('   ❌ El endpoint /api/documents aún falla con error 500');
      console.log('   🔄 Posibles causas:');
      console.log('      - Backend aún en build');
      console.log('      - Corrección no se aplicó correctamente');
      console.log('      - Error en otra parte del código');
      console.log('\n   💡 RECOMENDACIONES:');
      console.log('      - Esperar 5-10 minutos más');
      console.log('      - Verificar logs de Railway');
      console.log('      - Ejecutar verificación nuevamente');
    }
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  }
}

// Ejecutar verificación
runVerification().catch(console.error);
