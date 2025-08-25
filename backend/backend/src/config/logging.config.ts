// Configuración de logging optimizada para Railway
export const LOG_CONFIG = {
  // Nivel de logging (error, warn, info, debug)
  level: process.env.LOG_LEVEL || 'info',
  
  // Habilitar logs de token solo en desarrollo
  enableTokenLogs: process.env.NODE_ENV === 'development',
  
  // Máximo de logs de token por sesión
  maxTokenLogsPerSession: 1,
  
  // Intervalo para logs de resumen (en ms)
  summaryInterval: 60000, // 1 minuto
  
  // Logs específicos por módulo
  modules: {
    auth: {
      level: 'warn', // Solo warnings y errores
      enableTokenLogs: false
    },
    documents: {
      level: 'info',
      enableTokenLogs: false
    },
    uploads: {
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
  
  const now = new Date();
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();
  const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
  
  // Solo logear si expira en menos de 1 hora o es un error
  if (minutesUntilExpiry < 60 || timeUntilExpiry < 0) {
    logIfEnabled('info', `🔑 Token validation: ${context} - Expira en ${minutesUntilExpiry} minutos`);
  }
}
