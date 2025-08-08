import axios from 'axios';

// Debug: Log the environment variable
console.log('VITE_CHATBOT_URL:', (import.meta as any).env?.VITE_CHATBOT_URL);

// Force correct URL temporarily
const chatbotUrl = 'https://chatbot-legal-production-b91c.up.railway.app';

// Debug: Log the final URL
console.log('Chatbot URL configurada:', chatbotUrl);

// Force new deployment - Updated 2025-01-27
const chatbotApi = axios.create({
  baseURL: chatbotUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

chatbotApi.interceptors.request.use((config) => {
  // Debug: Log the request URL
  console.log('Request URL:', (config.baseURL || '') + (config.url || ''));
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

chatbotApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Chatbot API Error:', error);
    console.error('Request URL:', (error.config?.baseURL || '') + (error.config?.url || ''));
    return Promise.reject(error);
  }
);

export default chatbotApi; 