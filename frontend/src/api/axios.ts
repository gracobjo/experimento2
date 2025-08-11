import axios from 'axios';

const api = axios.create({
  baseURL: `${(window as any).APP_CONFIG?.API_URL || (import.meta as any).env.VITE_API_URL || 'https://experimento2-production.up.railway.app'}/api`,
});

// Log de configuración para debugging
console.log('🔧 Configuración de axios:');
console.log('🔧 APP_CONFIG:', (window as any).APP_CONFIG);
console.log('🔧 VITE_API_URL:', (import.meta as any).env.VITE_API_URL);
console.log('🔧 Base URL final:', api.defaults.baseURL);

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