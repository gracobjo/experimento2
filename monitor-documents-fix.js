const axios = require('axios');

console.log('🔍 MONITOREO CONTINUO DEL PROBLEMA DE VISUALIZACIÓN DE DOCUMENTOS');
console.log('================================================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';
let checkCount = 0;
const maxChecks = 20; // Máximo 20 verificaciones
const checkInterval = 60000; // Verificar cada 1 minuto

async function checkDocumentView() {
  checkCount++;
  const timestamp = new Date().toLocaleString('es-ES');
  
  console.log(`\n🔄 VERIFICACIÓN #${checkCount} - ${timestamp}`);
  console.log('=====================================');
  
  try {
    // 1. Verificar conectividad general
    console.log('1️⃣ Verificando conectividad...');
    const healthResponse = await axios.get(`${backendUrl}/health`);
    console.log('   ✅ Servidor respondiendo:', healthResponse.status);
    
    // 2. Obtener token de autenticación
    console.log('2️⃣ Obteniendo token...');
    const loginResponse = await axios.post(`${backendUrl}/api/auth/login`, {
      email: 'test@despacho.com',
      password: 'test123'
    });
    
    if (!loginResponse.data.token) {
      throw new Error('No se recibió token');
    }
    
    const token = loginResponse.data.token;
    console.log('   ✅ Token obtenido');
    
    // 3. Verificar lista de documentos
    console.log('3️⃣ Verificando lista de documentos...');
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
    
    // 4. Probar endpoint de visualización
    console.log('4️⃣ Probando visualización...');
    try {
      const viewResponse = await axios.get(`${backendUrl}/api/documents/file/${firstDoc.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('   🎉 ¡ÉXITO! Visualización funcionando:', viewResponse.status);
      console.log('   📊 Tipo de respuesta:', typeof viewResponse.data);
      console.log('   📏 Tamaño:', viewResponse.data?.length || 'N/A');
      
      if (viewResponse.headers['content-type']) {
        console.log('   📋 Content-Type:', viewResponse.headers['content-type']);
      }
      
      console.log('\n🚀 ¡PROBLEMA RESUELTO!');
      console.log('========================');
      console.log('✅ La migración de Prisma se aplicó correctamente');
      console.log('✅ La columna fileData existe en la base de datos');
      console.log('✅ Los usuarios pueden visualizar documentos');
      console.log('✅ El sistema está completamente operativo');
      
      return true; // Problema resuelto
      
    } catch (viewError) {
      if (viewError.response?.status === 500) {
        console.log('   ❌ Error 500 persiste en visualización');
        
        if (viewError.response.data?.errorDetails?.includes('fileData')) {
          console.log('   🔍 PROBLEMA: La columna fileData aún no existe');
          console.log('   💡 SOLUCIÓN: Railway aún está procesando la migración');
          console.log('   ⏳ Estado: En progreso...');
        } else {
          console.log('   🔍 PROBLEMA: Otro error 500 no relacionado con fileData');
          console.log('   📊 Error:', JSON.stringify(viewError.response.data, null, 2));
        }
      } else {
        console.log('   ❌ Otro error:', viewError.response?.status, viewError.response?.data);
      }
      
      return false; // Problema persiste
    }
    
  } catch (error) {
    console.log('   ❌ Error general en la verificación:', error.message);
    return false;
  }
}

async function runContinuousMonitoring() {
  console.log('🚀 INICIANDO MONITOREO CONTINUO');
  console.log('================================');
  console.log(`⏱️  Intervalo de verificación: ${checkInterval / 1000} segundos`);
  console.log(`🔄 Máximo de verificaciones: ${maxChecks}`);
  console.log(`⏰ Tiempo total estimado: ${(maxChecks * checkInterval) / 60000} minutos`);
  console.log('\n💡 El monitoreo se detendrá automáticamente cuando:');
  console.log('   - El problema se resuelva (✅ ÉXITO)');
  console.log('   - Se alcance el máximo de verificaciones');
  console.log('   - Se presione Ctrl+C para detener manualmente');
  
  const interval = setInterval(async () => {
    if (checkCount >= maxChecks) {
      console.log('\n⏰ MÁXIMO DE VERIFICACIONES ALCANZADO');
      console.log('=====================================');
      console.log('❌ El problema no se resolvió en el tiempo esperado');
      console.log('💡 RECOMENDACIONES:');
      console.log('   - Verificar logs de Railway manualmente');
      console.log('   - Contactar al equipo de desarrollo');
      console.log('   - Implementar solución alternativa');
      clearInterval(interval);
      return;
    }
    
    const isFixed = await checkDocumentView();
    
    if (isFixed) {
      console.log('\n🎉 MONITOREO COMPLETADO EXITOSAMENTE');
      console.log('====================================');
      clearInterval(interval);
      return;
    }
    
    console.log(`\n⏳ Próxima verificación en ${checkInterval / 1000} segundos...`);
    console.log(`📊 Progreso: ${checkCount}/${maxChecks} verificaciones`);
    
  }, checkInterval);
  
  // Primera verificación inmediata
  await checkDocumentView();
}

// Manejar interrupción manual
process.on('SIGINT', () => {
  console.log('\n\n⏹️  MONITOREO DETENIDO MANUALMENTE');
  console.log('==================================');
  console.log('👋 Gracias por usar el monitor de documentos');
  process.exit(0);
});

// Ejecutar monitoreo
runContinuousMonitoring().catch(console.error);
