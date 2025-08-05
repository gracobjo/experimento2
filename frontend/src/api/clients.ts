import api from './axios';

export async function getClients(token: string) {
  const res = await api.get('/users/clients');
  return res.data;
} 