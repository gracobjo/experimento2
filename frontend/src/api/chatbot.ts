import axios from 'axios';

const chatbotApi = axios.create({
  baseURL: 'http://localhost:8000',
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