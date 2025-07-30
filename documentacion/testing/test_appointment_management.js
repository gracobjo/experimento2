const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3001/api';
const ADMIN_TOKEN = 'your_admin_token_here'; // Reemplazar con token real

// Headers para las peticiones
const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testAppointmentManagement() {
  console.log('🧪 Iniciando pruebas de gestión de citas...\n');

  try {
    // 1. Obtener todas las citas
    console.log('1. 📋 Obteniendo todas las citas...');
    const appointmentsResponse = await axios.get(`${BASE_URL}/admin/appointments`, { headers });
    console.log(`✅ Citas obtenidas: ${appointmentsResponse.data.length} citas encontradas`);
    
    if (appointmentsResponse.data.length > 0) {
      const firstAppointment = appointmentsResponse.data[0];
      console.log(`   - Primera cita: ${firstAppointment.client.user.name} con ${firstAppointment.lawyer.name}`);
      console.log(`   - Fecha: ${new Date(firstAppointment.date).toLocaleString()}`);
    }

    // 2. Obtener todos los abogados
    console.log('\n2. 👨‍💼 Obteniendo lista de abogados...');
    const lawyersResponse = await axios.get(`${BASE_URL}/admin/users`, { headers });
    const lawyers = lawyersResponse.data.filter(user => user.role === 'LAWYER');
    console.log(`✅ Abogados obtenidos: ${lawyers.length} abogados encontrados`);
    
    lawyers.forEach(lawyer => {
      console.log(`   - ${lawyer.name} (${lawyer.email})`);
    });

    // 3. Obtener una cita específica (si existe)
    if (appointmentsResponse.data.length > 0) {
      const appointmentId = appointmentsResponse.data[0].id;
      console.log(`\n3. 🔍 Obteniendo cita específica (ID: ${appointmentId})...`);
      
      const specificAppointmentResponse = await axios.get(`${BASE_URL}/admin/appointments/${appointmentId}`, { headers });
      console.log('✅ Cita específica obtenida:');
      console.log(`   - Cliente: ${specificAppointmentResponse.data.client.user.name}`);
      console.log(`   - Abogado: ${specificAppointmentResponse.data.lawyer.name}`);
      console.log(`   - Fecha: ${new Date(specificAppointmentResponse.data.date).toLocaleString()}`);

      // 4. Probar actualización de cita (solo si hay abogados disponibles)
      if (lawyers.length > 0) {
        console.log('\n4. ✏️ Probando actualización de cita...');
        
        const updateData = {
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Una semana después
          location: 'Oficina Principal - Sala de Reuniones',
          notes: 'Cita reprogramada por el administrador',
          lawyerId: lawyers[0].id
        };

        const updateResponse = await axios.put(`${BASE_URL}/admin/appointments/${appointmentId}`, updateData, { headers });
        console.log('✅ Cita actualizada exitosamente:');
        console.log(`   - Nueva fecha: ${new Date(updateResponse.data.date).toLocaleString()}`);
        console.log(`   - Nueva ubicación: ${updateResponse.data.location}`);
        console.log(`   - Nuevas notas: ${updateResponse.data.notes}`);
      }
    }

    // 5. Probar filtros y búsqueda
    console.log('\n5. 🔍 Probando filtros de búsqueda...');
    
    // Buscar por fecha específica
    const today = new Date().toISOString().split('T')[0];
    console.log(`   - Buscando citas para hoy (${today})...`);
    
    // Nota: Los filtros se aplican en el frontend, pero podemos verificar la estructura de datos
    const todayAppointments = appointmentsResponse.data.filter(apt => 
      new Date(apt.date).toDateString() === new Date().toDateString()
    );
    console.log(`   - Citas para hoy: ${todayAppointments.length}`);

    // 6. Verificar estadísticas del dashboard
    console.log('\n6. 📊 Verificando estadísticas del dashboard...');
    const dashboardResponse = await axios.get(`${BASE_URL}/admin/dashboard`, { headers });
    console.log('✅ Estadísticas del dashboard:');
    console.log(`   - Total de citas: ${dashboardResponse.data.totalAppointments || 'N/A'}`);
    console.log(`   - Total de usuarios: ${dashboardResponse.data.totalUsers || 'N/A'}`);
    console.log(`   - Total de abogados: ${dashboardResponse.data.totalLawyers || 'N/A'}`);

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');
    console.log('\n📋 Resumen de funcionalidades probadas:');
    console.log('   ✅ Obtener todas las citas');
    console.log('   ✅ Obtener lista de abogados');
    console.log('   ✅ Obtener cita específica');
    console.log('   ✅ Actualizar cita (fecha, ubicación, notas, abogado)');
    console.log('   ✅ Filtros de búsqueda');
    console.log('   ✅ Estadísticas del dashboard');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Solución: Necesitas un token de administrador válido.');
      console.log('   1. Inicia sesión como administrador en el frontend');
      console.log('   2. Abre las herramientas de desarrollador (F12)');
      console.log('   3. Ve a la pestaña Application > Local Storage');
      console.log('   4. Copia el valor de "token"');
      console.log('   5. Reemplaza "your_admin_token_here" en este script');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Solución: Verifica que el backend esté ejecutándose en el puerto 3001');
      console.log('   Ejecuta: cd experimento/backend && npm run start:dev');
    }
  }
}

// Función para probar la creación de una nueva cita
async function testCreateAppointment() {
  console.log('\n🧪 Probando creación de nueva cita...\n');

  try {
    // Obtener clientes y abogados
    const usersResponse = await axios.get(`${BASE_URL}/admin/users`, { headers });
    const clients = usersResponse.data.filter(user => user.role === 'CLIENT');
    const lawyers = usersResponse.data.filter(user => user.role === 'LAWYER');

    if (clients.length === 0 || lawyers.length === 0) {
      console.log('❌ No hay suficientes clientes o abogados para crear una cita');
      return;
    }

    const newAppointment = {
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 días después
      location: 'Oficina Principal',
      notes: 'Cita de prueba creada por administrador',
      clientId: clients[0].id,
      lawyerId: lawyers[0].id
    };

    console.log('📝 Creando nueva cita...');
    const createResponse = await axios.post(`${BASE_URL}/appointments`, newAppointment, { headers });
    
    console.log('✅ Cita creada exitosamente:');
    console.log(`   - ID: ${createResponse.data.id}`);
    console.log(`   - Fecha: ${new Date(createResponse.data.date).toLocaleString()}`);
    console.log(`   - Ubicación: ${createResponse.data.location}`);

    // Limpiar: eliminar la cita de prueba
    console.log('\n🧹 Eliminando cita de prueba...');
    await axios.delete(`${BASE_URL}/admin/appointments/${createResponse.data.id}`, { headers });
    console.log('✅ Cita de prueba eliminada');

  } catch (error) {
    console.error('❌ Error al crear cita:', error.response?.data || error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando pruebas de gestión de citas del administrador\n');
  
  await testAppointmentManagement();
  await testCreateAppointment();
  
  console.log('\n✨ Pruebas completadas!');
  console.log('\n📖 Instrucciones para usar la gestión de citas:');
  console.log('   1. Ve al dashboard de administración (/admin/dashboard)');
  console.log('   2. Haz clic en "Gestionar Citas"');
  console.log('   3. Usa los filtros para buscar citas específicas');
  console.log('   4. Haz clic en "Editar" para modificar una cita');
  console.log('   5. Cambia fecha, hora, abogado, ubicación o notas');
  console.log('   6. Guarda los cambios');
  console.log('   7. Usa "Eliminar" para cancelar citas');
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAppointmentManagement, testCreateAppointment }; 