import axios from 'axios';
import { getBackendUrl, logEndpointsConfig } from '../config/endpoints';

const api = axios.create({
  baseURL: `${getBackendUrl()}/api`,
});

// Log de configuración para debugging
logEndpointsConfig();
console.log('🔧 Base URL final de axios:', api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        alert('Sesión expirada o no autorizada. Por favor, inicia sesión de nuevo.');
      } else if (error.response.status === 429) {
        alert('Demasiados intentos de autenticación. Espera unos minutos antes de volver a intentarlo.');
      }
    }
    return Promise.reject(error);
  }
);

export default api; 