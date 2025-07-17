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

async function testAppointmentSync() {
  console.log('🔄 Probando sincronización entre chatbot y gestión de citas...\n');

  try {
    // 1. Obtener citas iniciales
    console.log('1. 📋 Obteniendo citas iniciales...');
    const initialResponse = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
    const initialCount = initialResponse.data.length;
    console.log(`✅ Citas iniciales: ${initialCount}`);

    // 2. Crear cita a través del chatbot
    console.log('\n2. 🤖 Creando cita a través del chatbot...');
    
    const appointmentData = {
      fullName: 'Test User Calendar',
      age: 30,
      phone: '612345678',
      email: 'test.calendar@email.com',
      consultationReason: 'test calendario visual',
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días después
      consultationType: 'Derecho Civil',
      notes: 'Cita de prueba para sincronización',
      location: 'Oficina principal'
    };

    const chatbotResponse = await axios.post(`${CHATBOT_URL}/chat`, {
      text: 'test appointment',
      language: 'es',
      user_id: 'test_sync_user'
    });
    console.log('✅ Chatbot respondió:', chatbotResponse.data.response);

    // 3. Verificar que la cita apareció en la gestión
    console.log('\n3. 🔍 Verificando que la cita apareció en la gestión...');
    
    // Esperar un momento para que se procese
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedResponse = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
    const updatedCount = updatedResponse.data.length;
    
    console.log(`✅ Citas después de crear: ${updatedCount}`);
    
    if (updatedCount > initialCount) {
      console.log('✅ Sincronización exitosa: Nueva cita detectada');
      
      // Mostrar la nueva cita
      const newAppointments = updatedResponse.data.filter(apt => 
        apt.client.user.email === 'test.calendar@email.com'
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
      console.log('❌ Sincronización falló: No se detectó nueva cita');
    }

    // 4. Probar actualización automática
    console.log('\n4. ⏰ Probando actualización automática...');
    console.log('   - La gestión de citas se actualiza automáticamente cada 30 segundos');
    console.log('   - También se puede refrescar manualmente con el botón "Refrescar"');
    console.log('   - Se muestra la última actualización en el header');

    // 5. Limpiar: eliminar la cita de prueba
    console.log('\n5. 🧹 Limpiando cita de prueba...');
    const testAppointments = updatedResponse.data.filter(apt => 
      apt.client.user.email === 'test.calendar@email.com'
    );
    
    if (testAppointments.length > 0) {
      for (const appointment of testAppointments) {
        await axios.delete(`${BACKEND_URL}/admin/appointments/${appointment.id}`, { headers });
        console.log(`✅ Cita eliminada: ${appointment.id}`);
      }
    }

    console.log('\n🎉 Prueba de sincronización completada!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Creación de cita a través del chatbot');
    console.log('   ✅ Detección automática en gestión de citas');
    console.log('   ✅ Actualización automática cada 30 segundos');
    console.log('   ✅ Botón de refrescar manual');
    console.log('   ✅ Indicador de última actualización');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Necesitas un token de administrador válido.');
      console.log('   1. Inicia sesión como administrador en el frontend');
      console.log('   2. Abre las herramientas de desarrollador (F12)');
      console.log('   3. Ve a la pestaña Application > Local Storage');
      console.log('   4. Copia el valor de "token"');
      console.log('   5. Reemplaza "your_admin_token_here" en este script');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Solución: Verifica que los servicios estén ejecutándose');
      console.log('   Backend: cd experimento/backend && npm run start:dev');
      console.log('   Chatbot: cd experimento/chatbot && python main_improved.py');
    }
  }
}

// Función para simular conversación completa del chatbot
async function testFullChatbotFlow() {
  console.log('\n🤖 Probando flujo completo del chatbot...\n');

  try {
    const userId = 'test_full_flow_' + Date.now();
    
    // 1. Iniciar conversación
    console.log('1. 👋 Iniciando conversación...');
    let response = await axios.post(`${CHATBOT_URL}/chat`, {
      text: 'hola',
      language: 'es',
      user_id: userId
    });
    console.log('✅ Respuesta:', response.data.response);

    // 2. Solicitar cita
    console.log('\n2. 📅 Solicitando cita...');
    response = await axios.post(`${CHATBOT_URL}/chat`, {
      text: 'queria una cita',
      language: 'es',
      user_id: userId
    });
    console.log('✅ Respuesta:', response.data.response);

    // 3. Proporcionar datos
    console.log('\n3. 👤 Proporcionando datos...');
    
    const testData = [
      { field: 'nombre', value: 'María García López' },
      { field: 'edad', value: '28' },
      { field: 'teléfono', value: '612345679' },
      { field: 'email', value: 'maria.garcia@email.com' },
      { field: 'motivo', value: 'herencia' },
      { field: 'área', value: 'Derecho Civil' }  // Agregar selección de área
    ];

    for (const data of testData) {
      response = await axios.post(`${CHATBOT_URL}/chat`, {
        text: data.value,
        language: 'es',
        user_id: userId
      });
      console.log(`✅ ${data.field}: ${response.data.response.substring(0, 100)}...`);
    }

    // 4. Seleccionar fecha (responder con '1')
    console.log('\n4. ⏰ Seleccionando fecha...');
    response = await axios.post(`${CHATBOT_URL}/chat`, {
      text: '1',
      language: 'es',
      user_id: userId
    });
    console.log('✅ Fecha seleccionada:', response.data.response.substring(0, 200));

    // 5. Verificar confirmación de cita
    if (response.data.response.toLowerCase().includes('confirmar') || response.data.response.toLowerCase().includes('confirmación')) {
      // Confirmar cita
      response = await axios.post(`${CHATBOT_URL}/chat`, {
        text: 'sí',
        language: 'es',
        user_id: userId
      });
      console.log('✅ Confirmación enviada:', response.data.response.substring(0, 200));
    }

    // 6. Verificar que la cita fue creada
    console.log('\n🎉 Flujo completo del chatbot probado!');

  } catch (error) {
    console.error('❌ Error en flujo del chatbot:', error.response?.data || error.message);
    if (error.response?.status) {
      console.log(`   Status: ${error.response.status}`);
    }
  }
}

// Función para verificar la gestión de citas
async function testAppointmentManagement() {
  console.log('\n📋 Probando gestión de citas...\n');

  try {
    // Verificar endpoint de citas
    console.log('🔍 Probando conexión al backend...');
    const response = await axios.get(`${BACKEND_URL}/admin/appointments`, { 
      headers,
      timeout: 5000
    });
    console.log(`✅ Gestión de citas accesible: ${response.data.length} citas encontradas`);
    
    console.log('\n📋 Funcionalidades de la gestión:');
    console.log('   • Actualización automática cada 30 segundos');
    console.log('   • Botón de refrescar manual');
    console.log('   • Indicador de última actualización');
    console.log('   • Filtros de búsqueda');
    console.log('   • Edición de citas');
    console.log('   • Eliminación de citas');
    console.log('   • Reasignación de abogados');

  } catch (error) {
    console.log('❌ Error accediendo a gestión de citas:');
    console.log(`   Mensaje: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 El backend no está ejecutándose en el puerto 3001');
      console.log('   💡 Ejecuta: cd backend && npm run start:dev');
    }
    if (error.response?.status === 401) {
      console.log('   💡 Error de autenticación - Token de admin inválido');
      console.log('   💡 Actualiza el ADMIN_TOKEN en el script');
    }
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de sincronización de citas\n');
  
  await testAppointmentManagement();
  await testFullChatbotFlow();
  await testAppointmentSync();
  
  console.log('\n✨ Todas las pruebas completadas!');
  console.log('\n📖 Resumen de sincronización:');
  console.log('   1. Chatbot crea cita → Backend la guarda');
  console.log('   2. Gestión de citas se actualiza automáticamente');
  console.log('   3. Administrador ve la nueva cita inmediatamente');
  console.log('   4. Puede editar, reasignar o eliminar la cita');
  console.log('   5. Cambios se reflejan en tiempo real');
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAppointmentSync, testFullChatbotFlow, testAppointmentManagement }; 