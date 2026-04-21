import api from './api';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { name: string; email: string; password: string; phone?: string; atelierName?: string; }
export interface AuthResponse { token: string; user: User; }

const TOKEN_KEY = 'auth_token';

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.put<{ user: User }>('/auth/me', payload);
    return data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/me/password', { currentPassword, newPassword });
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
};
