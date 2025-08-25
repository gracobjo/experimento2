// Configuración centralizada para el frontend
export const config = {
  // URL del backend
  backendUrl: import.meta.env.VITE_API_URL || 'https://experimento2-production-54c0.up.railway.app',
  
  // Configuración de la aplicación
  appName: 'Sistema de Gestión Legal',
  appVersion: '1.0.0',
  
  // Configuración de archivos
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ],
  
  // Configuración de paginación
  defaultPageSize: 10,
  maxPageSize: 100,
  
  // Configuración de timeout
  requestTimeout: 30000, // 30 segundos
  
  // Configuración de cache
  cacheExpiration: 5 * 60 * 1000, // 5 minutos
};

// Función helper para obtener la URL del backend
export const getBackendUrl = (): string => {
  return config.backendUrl;
};

// Función helper para construir URLs de la API
export const buildApiUrl = (endpoint: string): string => {
  return `${config.backendUrl}${endpoint}`;
};


