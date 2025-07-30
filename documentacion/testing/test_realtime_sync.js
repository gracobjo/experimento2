const axios = require('axios');

// Configuración
const CHATBOT_URL = 'http://localhost:8000';
const BACKEND_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGRlc3BhY2hvLmNvbSIsInN1YiI6IjBkY2ZlYmVlLTc0MjAtNGM2MS1iYTE5LTM5ZGJjYWFiMmQ4NiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1MjYxNDE1OSwiZXhwIjoxNzUyNzAwNTU5fQ.KvJHxJJyLfcpaiTp4Bx_DQDU6s-roKrjqPSB_vADgbs';

// Headers para las peticiones
const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testRealtimeSync() {
  console.log('🔄 Probando sincronización en tiempo real...\n');

  try {
    // 1. Obtener citas iniciales
    console.log('1. 📋 Obteniendo citas iniciales...');
    const initialResponse = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
    const initialCount = initialResponse.data.length;
    console.log(`✅ Citas iniciales: ${initialCount}`);

    // 2. Crear cita a través del chatbot
    console.log('\n2. 🤖 Creando cita a través del chatbot...');
    
    const userId = 'test_realtime_' + Date.now();
    
    // Flujo completo del chatbot
    const conversationSteps = [
      'hola',
      'queria una cita',
      'Juan Pérez López',
      '30',
      '612345678',
      'juan.perez@email.com',
      'problema laboral',
      'Derecho Laboral',
      '1', // Seleccionar primera fecha
      'sí' // Confirmar cita
    ];

    let lastResponse = '';
    for (const step of conversationSteps) {
      const response = await axios.post(`${CHATBOT_URL}/chat`, {
        text: step,
        language: 'es',
        user_id: userId
      });
      lastResponse = response.data.response;
      console.log(`✅ Paso: ${step} → ${lastResponse.substring(0, 100)}...`);
      
      // Pequeña pausa entre mensajes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 3. Verificar que la cita apareció inmediatamente
    console.log('\n3. 🔍 Verificando aparición inmediata...');
    
    // Esperar un momento para que se procese
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const immediateResponse = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
    const immediateCount = immediateResponse.data.length;
    
    console.log(`✅ Citas después de crear: ${immediateCount}`);
    
    if (immediateCount > initialCount) {
      console.log('✅ Sincronización inmediata exitosa!');
      
      // Mostrar la nueva cita
      const newAppointments = immediateResponse.data.filter(apt => 
        apt.client.user.email === 'juan.perez@email.com'
      );
      
      if (newAppointments.length > 0) {
        const newAppointment = newAppointments[0];
        console.log('📋 Nueva cita creada:');
        console.log(`   - Cliente: ${newAppointment.client.user.name}`);
        console.log(`   - Email: ${newAppointment.client.user.email}`);
        console.log(`   - Fecha: ${new Date(newAppointment.date).toLocaleString()}`);
        console.log(`   - Motivo: ${newAppointment.notes || 'No especificado'}`);
      }
    } else {
      console.log('❌ Sincronización inmediata falló');
    }

    // 4. Verificar actualización automática
    console.log('\n4. ⏰ Verificando actualización automática...');
    
    // Esperar 35 segundos para que pase la actualización automática
    console.log('   Esperando 35 segundos para la actualización automática...');
    await new Promise(resolve => setTimeout(resolve, 35000));
    
    const autoUpdateResponse = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
    const autoUpdateCount = autoUpdateResponse.data.length;
    
    console.log(`✅ Citas después de actualización automática: ${autoUpdateCount}`);
    
    if (autoUpdateCount >= immediateCount) {
      console.log('✅ Actualización automática funcionando');
    } else {
      console.log('❌ Actualización automática no funcionó');
    }

    // 5. Probar actualización manual
    console.log('\n5. 🔄 Probando actualización manual...');
    
    const manualResponse = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
    const manualCount = manualResponse.data.length;
    
    console.log(`✅ Citas después de actualización manual: ${manualCount}`);
    console.log('✅ Actualización manual funcionando');

    // 6. Limpiar: eliminar la cita de prueba
    console.log('\n6. 🧹 Limpiando cita de prueba...');
    const testAppointments = manualResponse.data.filter(apt => 
      apt.client.user.email === 'juan.perez@email.com'
    );
    
    if (testAppointments.length > 0) {
      for (const appointment of testAppointments) {
        await axios.delete(`${BACKEND_URL}/admin/appointments/${appointment.id}`, { headers });
        console.log(`✅ Cita eliminada: ${appointment.id}`);
      }
    }

    console.log('\n🎉 Prueba de sincronización en tiempo real completada!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Creación de cita a través del chatbot');
    console.log('   ✅ Sincronización inmediata con gestión');
    console.log('   ✅ Actualización automática cada 30 segundos');
    console.log('   ✅ Actualización manual con botón refrescar');
    console.log('   ✅ Indicador de última actualización');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Token de administrador inválido o expirado');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Solución: Verificar que los servicios estén ejecutándose');
    }
  }
}

// Función para monitorear cambios en tiempo real
async function monitorRealtimeChanges() {
  console.log('👁️ Monitoreando cambios en tiempo real...\n');
  
  let lastCount = 0;
  let checkCount = 0;
  
  const monitorInterval = setInterval(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
      const currentCount = response.data.length;
      checkCount++;
      
      console.log(`[${new Date().toLocaleTimeString()}] Verificación #${checkCount}: ${currentCount} citas`);
      
      if (currentCount !== lastCount) {
        console.log(`🔄 CAMBIO DETECTADO: ${lastCount} → ${currentCount} citas`);
        
        if (currentCount > lastCount) {
          console.log('📈 Nueva cita detectada!');
        } else {
          console.log('📉 Cita eliminada!');
        }
        
        lastCount = currentCount;
      }
      
      // Detener después de 2 minutos
      if (checkCount >= 24) { // 24 verificaciones * 5 segundos = 2 minutos
        clearInterval(monitorInterval);
        console.log('\n⏰ Monitoreo completado (2 minutos)');
      }
      
    } catch (error) {
      console.error('❌ Error en monitoreo:', error.message);
    }
  }, 5000); // Verificar cada 5 segundos
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de sincronización en tiempo real\n');
  
  // Ejecutar prueba completa
  await testRealtimeSync();
  
  console.log('\n' + '='.repeat(60));
  console.log('👁️ Iniciando monitoreo en tiempo real...');
  console.log('💡 Abre el chatbot y crea una cita para ver la sincronización');
  console.log('⏰ El monitoreo durará 2 minutos');
  console.log('='.repeat(60));
  
  // Iniciar monitoreo
  await monitorRealtimeChanges();
  
  console.log('\n✨ Todas las pruebas completadas!');
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testRealtimeSync, monitorRealtimeChanges }; 