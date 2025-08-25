import axios from 'axios';
import { getBackendUrl, logEndpointsConfig } from '../config/endpoints';
import { isTokenValid, clearAuthData } from '../utils/authUtils';
import { logIfEnabled, logApiRequest } from '../config/logging.config';

const api = axios.create({
  baseURL: `${getBackendUrl()}/api`,
});

// Log de configuración para debugging
logEndpointsConfig();
console.log('🔧 Base URL final de axios:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // Verificar que el token sea válido antes de enviarlo
  if (token && isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`;
    logIfEnabled('debug', '🔑 Token válido enviado en request');
  } else if (token) {
    logIfEnabled('warn', '🔑 Token inválido detectado, limpiando datos de autenticación');
    clearAuthData();
    // No incluir el token en el request
  }
  
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        logIfEnabled('warn', '🔑 Error 401: Token no autorizado');
        clearAuthData();
        window.location.href = '/login';
        alert('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else if (error.response.status === 429) {
        logIfEnabled('warn', '🔑 Error 429: Demasiados intentos');
        alert('Demasiados intentos de autenticación. Espera unos minutos antes de volver a intentarlo.');
      } else if (error.response.status === 500) {
        logIfEnabled('error', '🔑 Error 500: Error interno del servidor');
        // Para errores 500, verificar si es un problema de autenticación
        if (error.response.data?.message?.includes('Unauthorized') || 
            error.response.data?.message?.includes('invalid token')) {
          clearAuthData();
          window.location.href = '/login';
          alert('Problema de autenticación detectado. Por favor, inicia sesión de nuevo.');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api; 