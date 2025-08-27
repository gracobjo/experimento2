// Configuración de fallback para el sistema
// Permite cambiar fácilmente entre diferentes backends

const FALLBACK_CONFIGS = {
  // Configuración principal (Railway)
  primary: {
    API_URL: 'https://experimento2-production-54c0.up.railway.app',
    CHATBOT_URL: 'https://chatbot-legal-production-b91c.up.railway.app',
    FRONTEND_URL: 'https://experimento2-fenm.vercel.app'
  },
  
  // Configuración de respaldo (local)
  fallback: {
    API_URL: 'http://localhost:3000',
    CHATBOT_URL: 'http://localhost:3001',
    FRONTEND_URL: 'http://localhost:5173'
  },
  
  // Configuración de proxy (usando Vite proxy)
  proxy: {
    API_URL: '/railway-api',
    CHATBOT_URL: '/railway-api',
    FRONTEND_URL: 'http://localhost:5173'
  }
};

// Función para detectar el entorno
function detectEnvironment() {
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    if (port === '5173') {
      return 'development';
    }
    return 'local';
  }
  
  if (hostname.includes('vercel.app')) {
    return 'production';
  }
  
  return 'production';
}

// Función para obtener la configuración apropiada
function getFallbackConfig() {
  const env = detectEnvironment();
  
  switch (env) {
    case 'development':
      return FALLBACK_CONFIGS.proxy;
    case 'local':
      return FALLBACK_CONFIGS.fallback;
    case 'production':
    default:
      return FALLBACK_CONFIGS.primary;
  }
}

// Función para aplicar la configuración
function applyFallbackConfig() {
  const config = getFallbackConfig();
  
  // Aplicar configuración global
  window.APP_CONFIG = {
    ...window.APP_CONFIG,
    ...config
  };
  
  console.log('🔧 Configuración de fallback aplicada:', config);
  console.log('🔧 Entorno detectado:', detectEnvironment());
  
  return config;
}

// Función para cambiar configuración manualmente
function switchConfig(configName) {
  if (FALLBACK_CONFIGS[configName]) {
    window.APP_CONFIG = {
      ...window.APP_CONFIG,
      ...FALLBACK_CONFIGS[configName]
    };
    
    console.log(`🔧 Configuración cambiada a: ${configName}`, FALLBACK_CONFIGS[configName]);
    
    // Recargar la página para aplicar cambios
    window.location.reload();
    
    return true;
  }
  
  console.error(`❌ Configuración no encontrada: ${configName}`);
  return false;
}

// Función para obtener configuración actual
function getCurrentConfig() {
  return window.APP_CONFIG || getFallbackConfig();
}

// Función para listar configuraciones disponibles
function listAvailableConfigs() {
  return Object.keys(FALLBACK_CONFIGS);
}

// Aplicar configuración automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  applyFallbackConfig();
});

// Exportar funciones para uso global
window.FALLBACK_CONFIGS = FALLBACK_CONFIGS;
window.detectEnvironment = detectEnvironment;
window.getFallbackConfig = getFallbackConfig;
window.applyFallbackConfig = applyFallbackConfig;
window.switchConfig = switchConfig;
window.getCurrentConfig = getCurrentConfig;
window.listAvailableConfigs = listAvailableConfigs;








