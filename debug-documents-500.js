const axios = require('axios');

console.log('🔍 DIAGNÓSTICO DEL ERROR 500 EN ENDPOINT DE DOCUMENTOS');
console.log('======================================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    console.log('🔑 Obteniendo token de autenticación...');
    
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

// Función para diagnosticar el endpoint de documentos
async function debugDocumentsEndpoint(token) {
  try {
    console.log('1️⃣ Probando endpoint principal de documentos...');
    
    try {
      const response = await axios.get(`${backendUrl}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   ✅ Documentos obtenidos exitosamente');
      console.log('   📊 Status:', response.status);
      console.log('   📋 Cantidad:', Array.isArray(response.data) ? response.data.length : 'No es array');
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('   📋 Primer documento:', {
          id: response.data[0].id,
          filename: response.data[0].filename,
          expedienteId: response.data[0].expedienteId
        });
      }
      
    } catch (error) {
      console.log('   ❌ Error 500 en /api/documents:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 500) {
        console.log('   🔍 Analizando respuesta de error...');
        console.log('   📊 Error data:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n2️⃣ Probando variantes del endpoint de documentos...');
    
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

    // Probar endpoint de documentos por expediente
    try {
      const expedienteDocsResponse = await axios.get(`${backendUrl}/api/documents/expediente/test-expediente-id`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Documentos por expediente:', expedienteDocsResponse.status);
    } catch (error) {
      console.log('   ❌ Documentos por expediente fallaron:', error.response?.status, error.response?.data);
    }

    // Probar endpoint de estadísticas de documentos
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
    console.error('❌ Error general en diagnóstico de documentos:', error.message);
  }
}

// Función para verificar la estructura de la base de datos
async function checkDatabaseStructure() {
  try {
    console.log('\n3️⃣ Verificando estructura de la base de datos...');
    
    const dbResponse = await axios.get(`${backendUrl}/db-status`);
    console.log('   ✅ Estado de BD:', dbResponse.data.connected ? 'Conectada' : 'Desconectada');
    
    if (dbResponse.data.tables) {
      console.log(`   📋 Tablas disponibles: ${dbResponse.data.tables.length}`);
      
      // Buscar tabla de documentos
      const documentTable = dbResponse.data.tables.find(t => 
        t.table_name === 'Document' || 
        t.table_name === 'document' || 
        t.table_name.toLowerCase().includes('document')
      );
      
      if (documentTable) {
        console.log('   📄 Tabla Document: ✅ Encontrada');
        console.log('   📊 Detalles:', documentTable);
      } else {
        console.log('   ❌ Tabla Document: No encontrada');
      }
      
      // Buscar tabla de expedientes
      const expedienteTable = dbResponse.data.tables.find(t => 
        t.table_name === 'Expediente' || 
        t.table_name === 'expediente'
      );
      
      if (expedienteTable) {
        console.log('   📁 Tabla Expediente: ✅ Encontrada');
      } else {
        console.log('   ❌ Tabla Expediente: No encontrada');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Error verificando BD:', error.message);
  }
}

// Función para verificar logs del servidor
async function checkServerLogs() {
  try {
    console.log('\n4️⃣ Verificando logs del servidor...');
    
    // Probar endpoints que podrían dar información sobre errores
    const endpoints = [
      '/health',
      '/debug-env',
      '/api-test'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${backendUrl}${endpoint}`);
        console.log(`   ✅ ${endpoint}:`, response.status);
      } catch (error) {
        console.log(`   ❌ ${endpoint}:`, error.response?.status);
      }
    }
    
  } catch (error) {
    console.log('   ❌ Error verificando logs:', error.message);
  }
}

// Función para probar endpoints alternativos
async function testAlternativeEndpoints(token) {
  try {
    console.log('\n5️⃣ Probando endpoints alternativos...');
    
    // Probar si hay algún endpoint de debug para documentos
    try {
      const debugResponse = await axios.get(`${backendUrl}/api/documents/debug`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Debug de documentos:', debugResponse.status);
    } catch (error) {
      console.log('   ❌ Debug de documentos no disponible:', error.response?.status);
    }

    // Probar endpoint de casos para ver si funciona
    try {
      const casesResponse = await axios.get(`${backendUrl}/api/cases`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Casos (para comparar):', casesResponse.status);
    } catch (error) {
      console.log('   ❌ Casos fallaron:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Error probando endpoints alternativos:', error.message);
  }
}

// Ejecutar diagnóstico completo
async function runCompleteDiagnosis() {
  try {
    const token = await getAuthToken();
    
    await debugDocumentsEndpoint(token);
    await checkDatabaseStructure();
    await checkServerLogs();
    await testAlternativeEndpoints(token);
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    console.log('==========================');
    console.log('\n📋 RESUMEN:');
    console.log('- Si solo /api/documents falla: Problema específico en el servicio de documentos');
    console.log('- Si la tabla Document no existe: Problema de estructura de BD');
    console.log('- Si otros endpoints fallan: Problema general del servidor');
    console.log('- Si el error persiste: Revisar logs del backend');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico completo:', error.message);
  }
}

runCompleteDiagnosis().catch(console.error);
