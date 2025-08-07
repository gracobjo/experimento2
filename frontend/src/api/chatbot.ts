import axios from 'axios';

const chatbotApi = axios.create({
  baseURL: import.meta.env.VITE_CHATBOT_URL || 'https://chatbot-legal-production-b91c.up.railway.app',
});

chatbotApi.interceptors.request.use((config) => {
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
    return Promise.reject(error);
  }
);

export default chatbotApi; 