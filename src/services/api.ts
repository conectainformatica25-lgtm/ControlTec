import { storage } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

class ApiService {
  private token: string | null = null;

  async init() {
    this.token = await storage.getItem('token');
  }

  async setToken(token: string) {
    this.token = token;
    await storage.setItem('token', token);
  }

  async clearToken() {
    this.token = null;
    await storage.removeItem('token');
  }

  private async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/api${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { name: string; email: string; password: string; companyName: string; cnpj: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // CRUD genérico
  async getAll(resource: string) {
    return this.request(`/${resource}`);
  }

  async create(resource: string, data: any) {
    return this.request(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(resource: string, id: string, data: any) {
    return this.request(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async remove(resource: string, id: string) {
    return this.request(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  // Específicos
  async getFinanceSummary() {
    return this.request('/finance/summary');
  }

  async getScheduleByDate(date: string) {
    return this.request(`/schedules/date/${date}`);
  }

  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiService();
