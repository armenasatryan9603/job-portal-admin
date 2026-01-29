import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { User, UsersResponse, Stats, LoginResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('admin_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    if (response.data.access_token) {
      localStorage.setItem('admin_token', response.data.access_token);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('admin_token');
  }

  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  // Admin endpoints
  async getUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    deleted?: string
  ): Promise<UsersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (deleted) params.append('deleted', deleted);

    const response = await this.api.get<UsersResponse>(`/admin/users?${params}`);
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await this.api.get<User>(`/admin/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const response = await this.api.patch<User>(`/admin/users/${id}`, data);
    return response.data;
  }

  async sendNotification(
    userId: number,
    title: string,
    message: string,
    type?: string
  ) {
    const response = await this.api.post(`/admin/users/${userId}/notifications`, {
      title,
      message,
      type,
    });
    return response.data;
  }

  async sendMessage(userId: number, content: string) {
    const response = await this.api.post(`/admin/users/${userId}/messages`, {
      content,
    });
    return response.data;
  }

  async getStats(): Promise<Stats> {
    const response = await this.api.get<Stats>('/admin/stats');
    return response.data;
  }

  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete<{ success: boolean; message: string }>(`/admin/users/${id}`);
    return response.data;
  }

  // Subscription Plans
  async getSubscriptionPlans() {
    const response = await this.api.get('/subscriptions/plans');
    return response.data;
  }

  async createSubscriptionPlan(data: any) {
    const response = await this.api.post('/subscriptions/plans', data);
    return response.data;
  }

  async updateSubscriptionPlan(id: number, data: any) {
    const response = await this.api.post(`/subscriptions/plans/${id}`, data);
    return response.data;
  }

  // User Subscriptions
  async getAllSubscriptions(page: number = 1, limit: number = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await this.api.get(`/subscriptions/all?${params}`);
    return response.data;
  }

  // Admin endpoints
  async getAllPlansAdmin() {
    const response = await this.api.get('/subscriptions/admin/plans');
    return response.data;
  }

  async getAllMarketSubscriptions(page: number = 1, limit: number = 20) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await this.api.get(`/subscriptions/admin/market-subscriptions?${params}`);
    return response.data;
  }

  async cancelUserSubscription(subscriptionId: number) {
    const response = await this.api.post(`/subscriptions/admin/user-subscriptions/${subscriptionId}/cancel`);
    return response.data;
  }

  async extendUserSubscription(subscriptionId: number, additionalDays: number) {
    const response = await this.api.post(`/subscriptions/admin/user-subscriptions/${subscriptionId}/extend`, {
      additionalDays,
    });
    return response.data;
  }

  async cancelMarketSubscription(subscriptionId: number) {
    const response = await this.api.post(`/subscriptions/admin/market-subscriptions/${subscriptionId}/cancel`);
    return response.data;
  }

  async extendMarketSubscription(subscriptionId: number, additionalDays: number) {
    const response = await this.api.post(`/subscriptions/admin/market-subscriptions/${subscriptionId}/extend`, {
      additionalDays,
    });
    return response.data;
  }

  async markExpiredSubscriptions() {
    const response = await this.api.post('/subscriptions/admin/mark-expired');
    return response.data;
  }
}

export const apiService = new ApiService();
