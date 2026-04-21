import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Injection automatique du token JWT
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion d'erreur centralisée
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message: string; details?: string[] }>) => {
    const message = error.response?.data?.message || error.message || 'Erreur réseau.';
    const details = error.response?.data?.details;
    const status = error.response?.status;

    // Session expirée → déconnexion automatique
    if (status === 401) {
      await SecureStore.deleteItemAsync('auth_token');
      // Le store authStore réagira au prochain accès
    }

    return Promise.reject({ message, details, status });
  }
);

export default api;
