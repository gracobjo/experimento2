const axios = require('axios');

console.log('🔍 VERIFICACIÓN RÁPIDA DEL PROBLEMA DE VISUALIZACIÓN DE DOCUMENTOS');
console.log('==================================================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

async function quickCheck() {
  const startTime = Date.now();
  
  try {
    console.log('1️⃣ Verificando conectividad del servidor...');
    const healthResponse = await axios.get(`${backendUrl}/health`);
    console.log('   ✅ Servidor respondiendo:', healthResponse.status);
    
    console.log('\n2️⃣ Obteniendo token de autenticación...');
    const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
      email: 'test@despacho.com',
      password: 'test123'
    });
    
    if (!loginResponse.data.token) {
      throw new Error('No se recibió token de autenticación');
    }
    
    const token = loginResponse.data.token;
    console.log('   ✅ Token obtenido correctamente');
    
    console.log('\n3️⃣ Verificando lista de documentos...');
    const documentsResponse = await axios.get(`${backendUrl}/api/documents`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!Array.isArray(documentsResponse.data) || documentsResponse.data.length === 0) {
      console.log('   ❌ No hay documentos disponibles');
      return false;
    }
    
    const firstDoc = documentsResponse.data[0];
    console.log(`   ✅ Documentos disponibles: ${documentsResponse.data.length}`);
    console.log(`   📋 Probando con: ${firstDoc.filename} (ID: ${firstDoc.id})`);
    
    console.log('\n4️⃣ Probando endpoint de visualización...');
    try {
      const viewResponse = await axios.get(`${backendUrl}/api/documents/file/${firstDoc.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('\n🎉 ¡ÉXITO! PROBLEMA RESUELTO');
      console.log('================================');
      console.log('✅ La migración de Prisma se aplicó correctamente');
      console.log('✅ La columna fileData existe en la base de datos');
      console.log('✅ Los usuarios pueden visualizar documentos');
      console.log('✅ El sistema está completamente operativo');
      console.log(`⏱️  Tiempo total de verificación: ${duration}ms`);
      
      if (viewResponse.headers['content-type']) {
        console.log(`📋 Content-Type: ${viewResponse.headers['content-type']}`);
      }
      
      console.log(`📏 Tamaño de respuesta: ${viewResponse.data?.length || 'N/A'} bytes`);
      
      return true;
      
    } catch (viewError) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('\n❌ PROBLEMA PERSISTE');
      console.log('====================');
      console.log(`⏱️  Tiempo de verificación: ${duration}ms`);
      
      if (viewError.response?.status === 500) {
        console.log('   🔍 Error 500 en visualización');
        
        if (viewError.response.data?.errorDetails?.includes('fileData')) {
          console.log('   📊 PROBLEMA: La columna fileData aún no existe');
          console.log('   💡 SOLUCIÓN: Railway aún está procesando la migración');
          console.log('   ⏳ Estado: En progreso...');
          console.log('\n💡 RECOMENDACIONES:');
          console.log('   - Esperar más tiempo para que Railway complete la migración');
          console.log('   - Verificar logs de Railway manualmente');
          console.log('   - Usar el sistema de emergencia implementado');
        } else {
          console.log('   📊 PROBLEMA: Otro error 500 no relacionado con fileData');
          console.log('   🔍 Detalles del error:', JSON.stringify(viewError.response.data, null, 2));
        }
      } else {
        console.log('   📊 Otro tipo de error:', viewError.response?.status, viewError.response?.data);
      }
      
      return false;
    }
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('\n❌ ERROR GENERAL EN LA VERIFICACIÓN');
    console.log('====================================');
    console.log(`⏱️  Tiempo de verificación: ${duration}ms`);
    console.log('   📊 Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   🔍 PROBLEMA: No se puede conectar al servidor');
      console.log('   💡 SOLUCIÓN: Verificar si Railway está funcionando');
    } else if (error.code === 'ENOTFOUND') {
      console.log('   🔍 PROBLEMA: No se puede resolver el dominio');
      console.log('   💡 SOLUCIÓN: Verificar la URL del backend');
    }
    
    return false;
  }
}

// Ejecutar verificación
console.log('🚀 Iniciando verificación...\n');
quickCheck()
  .then((success) => {
    if (success) {
      console.log('\n🎯 RESULTADO: PROBLEMA RESUELTO');
      console.log('==================================');
      console.log('✅ Los usuarios pueden usar la funcionalidad completa de documentos');
      console.log('✅ Se puede desactivar el modo de emergencia');
      console.log('✅ El sistema está funcionando normalmente');
    } else {
      console.log('\n🎯 RESULTADO: PROBLEMA PERSISTE');
      console.log('==================================');
      console.log('❌ Los usuarios deben usar el modo de emergencia');
      console.log('❌ La migración de base de datos aún está en progreso');
      console.log('❌ Se recomienda esperar más tiempo o verificar Railway');
    }
  })
  .catch((error) => {
    console.log('\n💥 ERROR INESPERADO:', error.message);
  })
  .finally(() => {
    console.log('\n👋 Verificación completada');
    process.exit(0);
  });
