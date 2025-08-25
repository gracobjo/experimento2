// Configuración de logging para el frontend
export const LOG_CONFIG = {
  // Nivel de logging (error, warn, info, debug)
  level: process.env.NODE_ENV === 'production' ? 'error' : 'info',
  
  // Habilitar logs de token solo en desarrollo
  enableTokenLogs: process.env.NODE_ENV === 'development',
  
  // Máximo de logs de token por sesión
  maxTokenLogsPerSession: 1,
  
  // Contador de logs de token por sesión
  tokenLogCount: 0,
  
  // Intervalo para logs de resumen (en ms)
  summaryInterval: 60000, // 1 minuto
  
  // Logs específicos por módulo
  modules: {
    auth: {
      level: 'warn', // Solo warnings y errores en producción
      enableTokenLogs: false
    },
    api: {
      level: 'info',
      enableTokenLogs: false
    },
    documents: {
      level: 'info',
      enableTokenLogs: false
    }
  }
};

// Función helper para logging condicional
export function logIfEnabled(level: string, message: string, data?: any) {
  const config = LOG_CONFIG;
  const shouldLog = config.level === 'debug' || 
                   (level === 'error') || 
                   (level === 'warn' && ['warn', 'info', 'debug'].includes(config.level)) ||
                   (level === 'info' && ['info', 'debug'].includes(config.level));
  
  if (shouldLog) {
    switch (level) {
      case 'error':
        console.error(message, data);
        break;
      case 'warn':
        console.warn(message, data);
        break;
      case 'info':
        console.log(message, data);
        break;
      case 'debug':
        console.debug(message, data);
        break;
    }
  }
}

// Función para logging de token optimizado
export function logTokenValidation(token: string, expiresAt: Date, context: string = '') {
  if (!LOG_CONFIG.enableTokenLogs) return;
  
  // Incrementar contador de logs de token
  LOG_CONFIG.tokenLogCount++;
  
  // Solo logear si es el primer log de la sesión o si hay un problema
  if (LOG_CONFIG.tokenLogCount <= LOG_CONFIG.maxTokenLogsPerSession) {
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
    
    // Solo logear si expira en menos de 1 hora o es un error
    if (minutesUntilExpiry < 60 || timeUntilExpiry < 0) {
      logIfEnabled('info', `🔑 Token validation: ${context} - Expira en ${minutesUntilExpiry} minutos`);
    }
  }
}

// Función para logging de API optimizado
export function logApiRequest(method: string, url: string, context: string = '') {
  if (LOG_CONFIG.modules.api.level === 'debug') {
    logIfEnabled('debug', `📡 API Request: ${method} ${url} - ${context}`);
  }
}

// Función para logging de documentos optimizado
export function logDocumentAction(action: string, documentId: string, context: string = '') {
  if (LOG_CONFIG.modules.documents.level === 'debug') {
    logIfEnabled('debug', `📄 Document ${action}: ${documentId} - ${context}`);
  }
}

// Función para resetear contadores de logging
export function resetLogCounters() {
  LOG_CONFIG.tokenLogCount = 0;
}

// Función para configurar logging basado en variables de entorno
export function configureLogging() {
  // Configurar desde variables de entorno si están disponibles
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const logLevel = urlParams.get('log') || process.env.REACT_APP_LOG_LEVEL;
    
    if (logLevel) {
      LOG_CONFIG.level = logLevel as any;
      LOG_CONFIG.enableTokenLogs = logLevel === 'debug';
    }
  }
  
  // Configurar para producción
  if (process.env.NODE_ENV === 'production') {
    LOG_CONFIG.level = 'error';
    LOG_CONFIG.enableTokenLogs = false;
    LOG_CONFIG.modules.auth.level = 'warn';
    LOG_CONFIG.modules.api.level = 'warn';
    LOG_CONFIG.modules.documents.level = 'warn';
  }
  
  console.log(`🔧 Logging configurado: Nivel=${LOG_CONFIG.level}, TokenLogs=${LOG_CONFIG.enableTokenLogs}`);
}

// Configurar logging al importar el módulo
configureLogging();
