import api from './api';
import { Client, Measurement, PaginatedResponse, ApiResponse } from '../types';

export const clientService = {
  async list(params?: { search?: string; page?: number; limit?: number }) {
    const { data } = await api.get<PaginatedResponse<Client>>('/clients', { params });
    return data;
  },

  async create(payload: Partial<Client>): Promise<Client> {
    const { data } = await api.post<ApiResponse<Client>>('/clients', payload);
    return data.data;
  },

  async getOne(id: string): Promise<Client & { orderCount: number; lastMeasurement: Measurement | null }> {
    const { data } = await api.get(`/clients/${id}`);
    return data.data;
  },

  async update(id: string, payload: Partial<Client>): Promise<Client> {
    const { data } = await api.put<ApiResponse<Client>>(`/clients/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  async getMeasurements(clientId: string): Promise<Measurement[]> {
    const { data } = await api.get<ApiResponse<Measurement[]>>(`/clients/${clientId}/measurements`);
    return data.data;
  },

  async addMeasurement(clientId: string, payload: Partial<Measurement>): Promise<Measurement> {
    const { data } = await api.post<ApiResponse<Measurement>>(`/clients/${clientId}/measurements`, payload);
    return data.data;
  },

  async updateMeasurement(clientId: string, measurementId: string, payload: Partial<Measurement>): Promise<Measurement> {
    const { data } = await api.put<ApiResponse<Measurement>>(`/clients/${clientId}/measurements/${measurementId}`, payload);
    return data.data;
  },
};
