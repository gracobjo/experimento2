const axios = require('axios');

console.log('🔍 DIAGNÓSTICO DEL ERROR 500 EN VISUALIZACIÓN DE DOCUMENTOS');
console.log('================================================================\n');

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

// Función para diagnosticar el endpoint de visualización de documentos
async function debugDocumentViewEndpoint(token) {
  try {
    console.log('1️⃣ Probando endpoint de visualización de documentos...');
    
    // Primero obtener la lista de documentos para tener IDs válidos
    try {
      const documentsResponse = await axios.get(`${backendUrl}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(documentsResponse.data) && documentsResponse.data.length > 0) {
        const firstDoc = documentsResponse.data[0];
        console.log(`   📋 Documento encontrado: ${firstDoc.filename} (ID: ${firstDoc.id})`);
        
        // Probar el endpoint de visualización
        console.log('\n2️⃣ Probando endpoint de visualización...');
        try {
          const viewResponse = await axios.get(`${backendUrl}/api/documents/file/${firstDoc.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('   ✅ Visualización exitosa:', viewResponse.status);
          console.log('   📊 Tipo de respuesta:', typeof viewResponse.data);
          console.log('   📏 Tamaño de respuesta:', viewResponse.data?.length || 'N/A');
          
        } catch (viewError) {
          console.log('   ❌ Error en visualización:', viewError.response?.status, viewError.response?.data);
          
          if (viewError.response?.status === 500) {
            console.log('   🔍 Analizando respuesta de error...');
            console.log('   📊 Error data:', JSON.stringify(viewError.response.data, null, 2));
          }
        }
        
        // Probar endpoint de descarga
        console.log('\n3️⃣ Probando endpoint de descarga...');
        try {
          const downloadResponse = await axios.get(`${backendUrl}/api/documents/${firstDoc.id}/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            responseType: 'blob'
          });
          
          console.log('   ✅ Descarga exitosa:', downloadResponse.status);
          console.log('   📊 Tipo de respuesta:', downloadResponse.headers['content-type']);
          console.log('   📏 Tamaño del archivo:', downloadResponse.data?.size || 'N/A');
          
        } catch (downloadError) {
          console.log('   ❌ Error en descarga:', downloadError.response?.status, downloadError.response?.data);
        }
        
      } else {
        console.log('   ❌ No hay documentos disponibles para probar');
      }
      
    } catch (documentsError) {
      console.log('   ❌ Error obteniendo lista de documentos:', documentsError.response?.status);
    }

  } catch (error) {
    console.error('❌ Error general en diagnóstico de visualización:', error.message);
  }
}

// Función para verificar otros endpoints relacionados
async function checkRelatedEndpoints(token) {
  try {
    console.log('\n4️⃣ Verificando endpoints relacionados...');
    
    // Probar endpoint de documento individual
    try {
      const docResponse = await axios.get(`${backendUrl}/api/documents/test-doc-id`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Documento individual:', docResponse.status);
    } catch (error) {
      console.log('   ❌ Documento individual falló:', error.response?.status, error.response?.data);
    }

    // Probar endpoint de estadísticas
    try {
      const statsResponse = await axios.get(`${backendUrl}/api/documents/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('   ✅ Estadísticas:', statsResponse.status);
    } catch (error) {
      console.log('   ❌ Estadísticas fallaron:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('❌ Error verificando endpoints relacionados:', error.message);
  }
}

// Función para verificar la estructura de la base de datos
async function checkDatabaseStructure() {
  try {
    console.log('\n5️⃣ Verificando estructura de la base de datos...');
    
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
          console.log('   📊 Detalles:', documentTable);
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

// Función para probar diferentes formatos de endpoint
async function testDifferentEndpointFormats(token) {
  try {
    console.log('\n6️⃣ Probando diferentes formatos de endpoint...');
    
    // Probar diferentes variantes del endpoint
    const endpointVariants = [
      `/api/documents/file/test-id`,
      `/api/documents/test-id/file`,
      `/api/documents/test-id/view`,
      `/api/documents/test-id/download`,
      `/api/documents/file/download/test-id`
    ];
    
    for (const endpoint of endpointVariants) {
      try {
        const response = await axios.get(`${backendUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`   ✅ ${endpoint}:`, response.status);
      } catch (error) {
        console.log(`   ❌ ${endpoint}:`, error.response?.status);
      }
    }

  } catch (error) {
    console.error('❌ Error probando formatos de endpoint:', error.message);
  }
}

// Ejecutar diagnóstico completo
async function runCompleteDiagnosis() {
  try {
    const token = await getAuthToken();
    
    await debugDocumentViewEndpoint(token);
    await checkRelatedEndpoints(token);
    await checkDatabaseStructure();
    await testDifferentEndpointFormats(token);
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    console.log('==========================');
    console.log('\n📋 RESUMEN:');
    console.log('- Si /api/documents funciona pero /api/documents/file falla: Problema en endpoint de visualización');
    console.log('- Si ambos fallan: Problema general en servicio de documentos');
    console.log('- Si hay errores 500: Revisar implementación del endpoint de visualización');
    console.log('- Si hay errores 404: Endpoint no implementado o ruta incorrecta');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico completo:', error.message);
  }
}

runCompleteDiagnosis().catch(console.error);
