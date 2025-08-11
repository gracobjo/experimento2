// Configuración de la API para el frontend
// Este archivo se carga en tiempo de ejecución para configurar las URLs correctas

window.APP_CONFIG = {
  // URL de la API del backend
  API_URL: 'https://experimento2-production.up.railway.app',
  
  // URL del chatbot
  CHATBOT_URL: 'https://chatbot-legal-production-b91c.up.railway.app',
  
  // URL del frontend
  FRONTEND_URL: 'https://experimento2-fenm.vercel.app',
  
  // Configuración de endpoints
  ENDPOINTS: {
    CASES: '/api/cases',
    APPOINTMENTS: '/api/appointments',
    AUTH: '/api/auth',
    USERS: '/api/users',
    DOCUMENTS: '/api/documents',
    HEALTH: '/api/health'
  }
};

console.log('🔧 Configuración de la aplicación cargada:', window.APP_CONFIG);
