const axios = require('axios');

// Configuración
const SERVICES = {
  backend: 'http://localhost:3000',
  chatbot: 'http://localhost:8000',
  frontend: 'http://localhost:5173'
};

async function checkService(name, url, endpoint = '/health') {
  try {
    console.log(`🔍 Verificando ${name}...`);
    const response = await axios.get(`${url}${endpoint}`, { timeout: 3000 });
    console.log(`✅ ${name}: ${response.status} - ${response.statusText}`);
    return true;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log(`   💡 ${name} no está ejecutándose`);
    }
    return false;
  }
}

async function checkBackendEndpoints() {
  console.log('\n🔍 Verificando endpoints del backend...');
  
  const endpoints = [
    '/api/health',
    '/api/admin/appointments',
    '/api/appointments/visitor',
    '/api/parametros/contact'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${SERVICES.backend}${endpoint}`, { timeout: 3000 });
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || error.message}`);
    }
  }
}

async function checkChatbotEndpoints() {
  console.log('\n🔍 Verificando endpoints del chatbot...');
  
  const endpoints = [
    '/health'
    // Removido '/chat' porque solo acepta POST, no GET
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${SERVICES.chatbot}${endpoint}`, { timeout: 3000 });
      console.log(`✅ ${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.response?.status || error.message}`);
    }
  }
  
  // Probar endpoint /chat con POST
  try {
    const response = await axios.post(`${SERVICES.chatbot}/chat`, {
      text: 'test',
      language: 'es',
      user_id: 'test'
    }, { timeout: 3000 });
    console.log(`✅ /chat (POST): ${response.status}`);
  } catch (error) {
    console.log(`❌ /chat (POST): ${error.response?.status || error.message}`);
  }
}

async function main() {
  console.log('🚀 Verificando estado de servicios...\n');
  
  // Verificar servicios principales
  const backendOk = await checkService('Backend', SERVICES.backend, '/api/parametros/contact');
  const chatbotOk = await checkService('Chatbot', SERVICES.chatbot, '/health');
  const frontendOk = await checkService('Frontend', SERVICES.frontend);
  
  // Verificar endpoints específicos
  if (backendOk) {
    await checkBackendEndpoints();
  }
  
  if (chatbotOk) {
    await checkChatbotEndpoints();
  }
  
  console.log('\n📋 Resumen:');
  console.log(`   Backend: ${backendOk ? '✅' : '❌'}`);
  console.log(`   Chatbot: ${chatbotOk ? '✅' : '❌'}`);
  console.log(`   Frontend: ${frontendOk ? '✅' : '❌'}`);
  
  if (!backendOk || !chatbotOk) {
    console.log('\n💡 Para iniciar los servicios:');
    console.log('   Backend: cd backend && npm run start:dev');
    console.log('   Chatbot: cd chatbot && python main_improved.py');
    console.log('   Frontend: cd frontend && npm run dev');
  }
}

main().catch(console.error); 