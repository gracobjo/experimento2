// Configuración centralizada de endpoints del sistema
// Este archivo centraliza todas las URLs para evitar código hardcodeado

interface EndpointsConfig {
  // Backend principal
  BACKEND_API: string;
  
  // Chatbot
  CHATBOT_API: string;
  
  // Frontend
  FRONTEND_URL: string;
  
  // Endpoints específicos
  ENDPOINTS: {
    AUTH: string;
    USERS: string;
    CASES: string;
    TASKS: string;
    INVOICES: string;
    APPOINTMENTS: string;
    DOCUMENTS: string;
    PARAMETROS: string;
    SITE_CONFIG: string;
    HEALTH: string;
  };
}

// Función para obtener la configuración basada en el entorno
export const getEndpointsConfig = (): EndpointsConfig => {
  // Prioridad 1: Variables de entorno de Vite
  const viteApiUrl = import.meta.env.VITE_API_URL;
  const viteChatbotUrl = import.meta.env.VITE_CHATBOT_URL;
  
  // Prioridad 2: Configuración en tiempo de ejecución (window.APP_CONFIG)
  const appConfig = (window as any).APP_CONFIG;
  
  // Prioridad 3: Valores por defecto
  const defaultBackend = 'https://experimento2-production-54c0.up.railway.app';
  const defaultChatbot = 'https://chatbot-legal-production-b91c.up.railway.app';
  const defaultFrontend = 'https://experimento2-fenm.vercel.app';
  
  // Determinar URLs finales
  const backendApi = appConfig?.API_URL || viteApiUrl || defaultBackend;
  const chatbotApi = appConfig?.CHATBOT_URL || viteChatbotUrl || defaultChatbot;
  const frontendUrl = appConfig?.FRONTEND_URL || defaultFrontend;
  
  return {
    BACKEND_API: backendApi,
    CHATBOT_API: chatbotApi,
    FRONTEND_URL: frontendUrl,
    ENDPOINTS: {
      AUTH: `${backendApi}/api/auth`,
      USERS: `${backendApi}/api/users`,
      CASES: `${backendApi}/api/cases`,
      TASKS: `${backendApi}/api/tasks`,
      INVOICES: `${backendApi}/api/invoices`,
      APPOINTMENTS: `${backendApi}/api/appointments`,
      DOCUMENTS: `${backendApi}/api/documents`,
      PARAMETROS: `${backendApi}/api/parametros`,
      SITE_CONFIG: `${backendApi}/api/site-config`,
      HEALTH: `${backendApi}/api/health`,
    }
  };
};

// Función para obtener un endpoint específico
export const getEndpoint = (endpointName: keyof EndpointsConfig['ENDPOINTS']): string => {
  const config = getEndpointsConfig();
  return config.ENDPOINTS[endpointName];
};

// Función para obtener la URL base del backend
export const getBackendUrl = (): string => {
  return getEndpointsConfig().BACKEND_API;
};

// Función para obtener la URL del chatbot
export const getChatbotUrl = (): string => {
  return getEndpointsConfig().CHATBOT_API;
};

// Función para obtener la URL del frontend
export const getFrontendUrl = (): string => {
  return getEndpointsConfig().FRONTEND_URL;
};

// Función para construir URLs completas
export const buildUrl = (endpoint: string, path: string = ''): string => {
  const baseUrl = getBackendUrl();
  return `${baseUrl}/api${path}`;
};

// Función para debugging de configuración
export const logEndpointsConfig = (): void => {
  const config = getEndpointsConfig();
  console.log('🔧 Configuración de Endpoints:');
  console.log('🔧 BACKEND_API:', config.BACKEND_API);
  console.log('🔧 CHATBOT_API:', config.CHATBOT_API);
  console.log('🔧 FRONTEND_URL:', config.FRONTEND_URL);
  console.log('🔧 ENDPOINTS:', config.ENDPOINTS);
};

// Exportar configuración por defecto para uso directo
export default getEndpointsConfig();











