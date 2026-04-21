import api from './api';
import { Order, Payment, Fitting, PaginatedResponse, ApiResponse, OrderStatus } from '../types';

export const orderService = {
  async list(params?: { status?: OrderStatus; clientId?: string; page?: number; limit?: number }) {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders', { params });
    return data;
  },

  async create(payload: Partial<Order>): Promise<Order> {
    const { data } = await api.post<ApiResponse<Order>>('/orders', payload);
    return data.data;
  },

  async getOne(id: string): Promise<Order> {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return data.data;
  },

  async update(id: string, payload: Partial<Order>): Promise<Order> {
    const { data } = await api.put<ApiResponse<Order>>(`/orders/${id}`, payload);
    return data.data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return data.data;
  },

  async addPayment(orderId: string, payload: Partial<Payment>): Promise<{ payment: Payment; balance: any }> {
    const { data } = await api.post(`/orders/${orderId}/payments`, payload);
    return { payment: data.data, balance: data.balance };
  },

  async addFitting(orderId: string, payload: Partial<Fitting>): Promise<Fitting> {
    const { data } = await api.post<ApiResponse<Fitting>>(`/orders/${orderId}/fittings`, payload);
    return data.data;
  },

  async listFittings(orderId: string): Promise<Fitting[]> {
    const { data } = await api.get<ApiResponse<Fitting[]>>(`/orders/${orderId}/fittings`);
    return data.data;
  },
};
