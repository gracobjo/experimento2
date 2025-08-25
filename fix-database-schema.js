const axios = require('axios');

console.log('🔧 SINCRONIZANDO BASE DE DATOS CON ESQUEMA DE PRISMA');
console.log('=====================================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Función para verificar el estado actual de la base de datos
async function checkCurrentDatabaseState() {
  try {
    console.log('1️⃣ Verificando estado actual de la base de datos...');
    
    const dbResponse = await axios.get(`${backendUrl}/db-status`);
    console.log('   ✅ Base de datos:', dbResponse.data.connected ? 'Conectada' : 'Desconectada');
    
    if (dbResponse.data.tables) {
      console.log(`   📋 Tablas disponibles: ${dbResponse.data.tables.length}`);
      
      // Buscar tabla de documentos
      const documentTable = dbResponse.data.tables.find(t => 
        t.table_name === 'Document' || 
        t.table_name === 'document'
      );
      
      if (documentTable) {
        console.log('   📄 Tabla Document: ✅ Encontrada');
        console.log('   📊 Detalles:', documentTable);
        
        // Verificar si hay información de columnas
        if (dbResponse.data.columns) {
          const documentColumns = dbResponse.data.columns.filter(c => 
            c.table_name === 'Document' || 
            c.table_name === 'document'
          );
          
          if (documentColumns.length > 0) {
            console.log('   🔍 Columnas de la tabla Document:');
            documentColumns.forEach(col => {
              console.log(`      - ${col.column_name}: ${col.data_type}`);
            });
            
            // Buscar específicamente la columna fileData
            const fileDataColumn = documentColumns.find(c => 
              c.column_name === 'fileData' || 
              c.column_name === 'filedata'
            );
            
            if (fileDataColumn) {
              console.log('   ✅ Columna fileData: Encontrada');
              console.log(`      Tipo: ${fileDataColumn.data_type}`);
            } else {
              console.log('   ❌ Columna fileData: NO ENCONTRADA');
              console.log('   🔄 Necesita sincronización con esquema de Prisma');
            }
          }
        }
      } else {
        console.log('   ❌ Tabla Document: No encontrada');
      }
    }
    
  } catch (error) {
    console.log('   ❌ Error verificando BD:', error.message);
  }
}

// Función para verificar el estado de las migraciones
async function checkMigrationStatus() {
  try {
    console.log('\n2️⃣ Verificando estado de las migraciones...');
    
    // Intentar acceder a un endpoint que podría mostrar información de migraciones
    try {
      const migrationResponse = await axios.get(`${backendUrl}/prisma-status`);
      console.log('   ✅ Estado de Prisma:', migrationResponse.status);
      console.log('   📊 Datos:', migrationResponse.data);
    } catch (error) {
      console.log('   ❌ Endpoint de Prisma no disponible:', error.response?.status);
    }
    
    // Verificar si hay algún endpoint de debug de base de datos
    try {
      const debugResponse = await axios.get(`${backendUrl}/debug-db`);
      console.log('   ✅ Debug de BD:', debugResponse.status);
      console.log('   📊 Datos:', debugResponse.data);
    } catch (error) {
      console.log('   ❌ Debug de BD no disponible:', error.response?.status);
    }
    
  } catch (error) {
    console.log('   ❌ Error verificando migraciones:', error.message);
  }
}

// Función para probar endpoints de documentos después de la corrección
async function testDocumentEndpoints() {
  try {
    console.log('\n3️⃣ Probando endpoints de documentos...');
    
    // Obtener token de autenticación
    let token;
    try {
      const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
        email: 'test@despacho.com',
        password: 'test123'
      });
      
      if (loginResponse.data.token) {
        token = loginResponse.data.token;
        console.log('   ✅ Token obtenido para pruebas');
      }
    } catch (error) {
      console.log('   ❌ Error obteniendo token:', error.message);
      return;
    }
    
    if (token) {
      // Probar endpoint principal de documentos
      try {
        const docsResponse = await axios.get(`${backendUrl}/api/documents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('   ✅ Lista de documentos:', docsResponse.status);
        
        if (Array.isArray(docsResponse.data) && docsResponse.data.length > 0) {
          const firstDoc = docsResponse.data[0];
          console.log(`   📋 Documento disponible: ${firstDoc.filename} (ID: ${firstDoc.id})`);
          
          // Probar endpoint de visualización
          try {
            const viewResponse = await axios.get(`${backendUrl}/api/documents/file/${firstDoc.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            console.log('   ✅ Visualización de documento:', viewResponse.status);
          } catch (error) {
            console.log('   ❌ Visualización falló:', error.response?.status, error.response?.data);
          }
        }
        
      } catch (error) {
        console.log('   ❌ Lista de documentos falló:', error.response?.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Error probando endpoints:', error.message);
  }
}

// Función para sugerir soluciones
function suggestSolutions() {
  console.log('\n4️⃣ ANÁLISIS Y SOLUCIONES');
  console.log('==========================');
  console.log('\n🔍 PROBLEMA IDENTIFICADO:');
  console.log('   ❌ La columna fileData no existe en la tabla Document');
  console.log('   ❌ La migración 20250824212806_add_file_data_to_documents no se aplicó');
  console.log('   ❌ Los endpoints de visualización fallan con error 500');
  
  console.log('\n💡 SOLUCIONES RECOMENDADAS:');
  console.log('   1️⃣ FORZAR SINCRONIZACIÓN DE PRISMA:');
  console.log('      - Ejecutar: npx prisma db push --force-reset');
  console.log('      - O ejecutar: npx prisma migrate deploy');
  console.log('      - O ejecutar: npx prisma db push');
  
  console.log('   2️⃣ VERIFICAR ESTADO DE MIGRACIONES:');
  console.log('      - Revisar logs de Railway para errores de migración');
  console.log('      - Verificar que la base de datos esté sincronizada');
  
  console.log('   3️⃣ ALTERNATIVA TEMPORAL:');
  console.log('      - Modificar el código para no depender de fileData');
  console.log('      - Usar solo fileUrl para documentos');
  
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('   - Ejecutar migración de Prisma en Railway');
  console.log('   - Verificar que la columna fileData se cree');
  console.log('   - Probar endpoints de visualización nuevamente');
}

// Ejecutar diagnóstico completo
async function runCompleteDiagnosis() {
  try {
    await checkCurrentDatabaseState();
    await checkMigrationStatus();
    await testDocumentEndpoints();
    suggestSolutions();
    
    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    console.log('==========================');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico completo:', error.message);
  }
}

runCompleteDiagnosis().catch(console.error);
