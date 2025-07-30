const axios = require('axios');

// Configuración
const BACKEND_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGRlc3BhY2hvLmNvbSIsInN1YiI6IjBkY2ZlYmVlLTc0MjAtNGM2MS1iYTE5LTM5ZGJjYWFiMmQ4NiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1MjYxNDE1OSwiZXhwIjoxNzUyNzAwNTU5fQ.KvJHxJJyLfcpaiTp4Bx_DQDU6s-roKrjqPSB_vADgbs';

// Headers para las peticiones
const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testManualAppointmentCreation() {
  console.log('🧪 Probando creación manual de cita...\n');

  try {
    // 1. Obtener citas iniciales
    console.log('1. 📋 Obteniendo citas iniciales...');
    const initialResponse = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
    const initialCount = initialResponse.data.length;
    console.log(`✅ Citas iniciales: ${initialCount}`);

    // 2. Crear cita manualmente
    console.log('\n2. 📝 Creando cita manualmente...');
    
    const appointmentData = {
      fullName: 'Test Manual User',
      age: 25,
      phone: '612345670',
      email: 'test.manual@email.com',
      consultationReason: 'test creación manual',
      preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días después
      consultationType: 'Derecho Civil',
      notes: 'Cita de prueba creación manual',
      location: 'Oficina principal'
    };

    console.log('📤 Datos a enviar:', appointmentData);

    const createResponse = await axios.post(`${BACKEND_URL}/appointments/visitor`, appointmentData, {
      headers: { 'Content-Type': 'application/json' } // Sin token para endpoint público
    });

    console.log('✅ Respuesta del backend:', createResponse.data);

    // 3. Verificar que la cita apareció
    console.log('\n3. 🔍 Verificando que la cita apareció...');
    
    // Esperar un momento para que se procese
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedResponse = await axios.get(`${BACKEND_URL}/admin/appointments`, { headers });
    const updatedCount = updatedResponse.data.length;
    
    console.log(`✅ Citas después de crear: ${updatedCount}`);
    
    if (updatedCount > initialCount) {
      console.log('✅ Creación manual exitosa!');
      
      // Mostrar la nueva cita
      const newAppointments = updatedResponse.data.filter(apt => 
        apt.client.user.email === 'test.manual@email.com'
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
      console.log('❌ Creación manual falló');
    }

    // 4. Limpiar: eliminar la cita de prueba
    console.log('\n4. 🧹 Limpiando cita de prueba...');
    const testAppointments = updatedResponse.data.filter(apt => 
      apt.client.user.email === 'test.manual@email.com'
    );
    
    if (testAppointments.length > 0) {
      for (const appointment of testAppointments) {
        await axios.delete(`${BACKEND_URL}/admin/appointments/${appointment.id}`, { headers });
        console.log(`✅ Cita eliminada: ${appointment.id}`);
      }
    }

    console.log('\n🎉 Prueba de creación manual completada!');

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Token de administrador inválido o expirado');
      console.log('   Renueva el token desde el frontend');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Solución: Endpoint no encontrado');
      console.log('   Verificar que el backend esté ejecutándose correctamente');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Solución: Datos inválidos');
      console.log('   Verificar el formato de los datos enviados');
    }
  }
}

// Función para verificar endpoints del backend
async function checkBackendEndpoints() {
  console.log('🔍 Verificando endpoints del backend...\n');
  
  const endpoints = [
    { path: '/api/parametros/contact', method: 'GET', auth: false },
    { path: '/api/admin/appointments', method: 'GET', auth: true },
    { path: '/api/appointments/visitor', method: 'POST', auth: false }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `http://localhost:3000${endpoint.path}`,
        headers: endpoint.auth ? headers : { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.method === 'POST') {
        config.data = { test: 'data' };
      }
      
      const response = await axios(config);
      console.log(`✅ ${endpoint.method} ${endpoint.path}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint.method} ${endpoint.path}: ${error.response?.status || error.message}`);
    }
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de creación manual\n');
  
  await checkBackendEndpoints();
  await testManualAppointmentCreation();
  
  console.log('\n✨ Todas las pruebas completadas!');
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testManualAppointmentCreation, checkBackendEndpoints }; 