// Configuración centralizada de endpoints del backend
// Este archivo centraliza todas las URLs para evitar código hardcodeado

export interface BackendEndpointsConfig {
  // URLs del sistema
  FRONTEND_URL: string;
  CHATBOT_URL: string;
  
  // CORS origins permitidos
  ALLOWED_ORIGINS: string[];
  
  // Endpoints internos
  INTERNAL_ENDPOINTS: {
    HEALTH: string;
    DOCS: string;
    API_BASE: string;
  };
}

// Función para obtener la configuración basada en el entorno
export const getBackendEndpointsConfig = (): BackendEndpointsConfig => {
  // Variables de entorno
  const frontendUrl = process.env.FRONTEND_URL || 'https://experimento2-fenm.vercel.app';
  const chatbotUrl = process.env.CHATBOT_URL || 'https://chatbot-legal-production-b91c.up.railway.app';
  
  // CORS origins permitidos
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://experimento2-fenm.vercel.app',
        'https://experimento2-production-54c0.up.railway.app'
      ];
  
  return {
    FRONTEND_URL: frontendUrl,
    CHATBOT_URL: chatbotUrl,
    ALLOWED_ORIGINS: allowedOrigins,
    INTERNAL_ENDPOINTS: {
      HEALTH: '/health',
      DOCS: '/docs',
      API_BASE: '/api'
    }
  };
};

// Función para obtener la URL del frontend
export const getFrontendUrl = (): string => {
  return getBackendEndpointsConfig().FRONTEND_URL;
};

// Función para obtener la URL del chatbot
export const getChatbotUrl = (): string => {
  return getBackendEndpointsConfig().CHATBOT_URL;
};

// Función para obtener los origins permitidos para CORS
export const getAllowedOrigins = (): string[] => {
  return getBackendEndpointsConfig().ALLOWED_ORIGINS;
};

// Función para verificar si un origin está permitido
export const isOriginAllowed = (origin: string): boolean => {
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin) || 
         origin.includes('vercel.app') || 
         origin.includes('railway.app');
};

// Función para debugging de configuración
export const logBackendEndpointsConfig = (): void => {
  const config = getBackendEndpointsConfig();
  console.log('🔧 Configuración de Backend Endpoints:');
  console.log('🔧 FRONTEND_URL:', config.FRONTEND_URL);
  console.log('🔧 CHATBOT_URL:', config.CHATBOT_URL);
  console.log('🔧 ALLOWED_ORIGINS:', config.ALLOWED_ORIGINS);
  console.log('🔧 INTERNAL_ENDPOINTS:', config.INTERNAL_ENDPOINTS);
};

// Exportar configuración por defecto para uso directo
export default getBackendEndpointsConfig();


