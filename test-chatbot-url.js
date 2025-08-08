// Script para verificar la URL del chatbot
console.log('=== TEST CHATBOT URL ===');

// Simular el entorno de Vite
const env = {
  VITE_CHATBOT_URL: 'https://chatbot-legal-production-b91c.up.railway.app'
};

// Simular import.meta.env
const importMetaEnv = {
  VITE_CHATBOT_URL: env.VITE_CHATBOT_URL
};

console.log('VITE_CHATBOT_URL:', importMetaEnv.VITE_CHATBOT_URL);

// Simular la configuración del chatbot API
const chatbotUrl = importMetaEnv.VITE_CHATBOT_URL || 'https://chatbot-legal-production-b91c.up.railway.app';
console.log('Chatbot URL configurada:', chatbotUrl);

// Simular una petición de prueba
const testUrl = `${chatbotUrl}/chat`;
console.log('URL de petición de prueba:', testUrl);

console.log('=== FIN TEST ===');
