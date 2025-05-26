import axios from 'axios';

// In production, use the production backend URL
// In development, use the environment variable or localhost
const API_URL = import.meta.env.PROD 
  ? 'https://kitchen-sync-api.onrender.com/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Customer API
export const customerApi = {
  getCustomers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    emailVerified?: boolean;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const response = await api.get('/admin/customers', { params });
    return response.data;
  },

  getCustomerById: async (id: number) => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },

  updateCustomer: async (id: number, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    emailVerified?: boolean;
    notes?: string;
    tags?: string[];
    vipStatus?: boolean;
  }) => {
    const response = await api.put(`/admin/customers/${id}`, data);
    return response.data;
  },

  addCustomerNote: async (id: number, note: string) => {
    const response = await api.post(`/admin/customers/${id}/notes`, { note });
    return response.data;
  },

  resetCustomerPassword: async (id: number, sendEmail: boolean = true) => {
    const response = await api.post(`/admin/customers/${id}/reset-password`, { sendEmail });
    return response.data;
  },

  getCustomerAnalytics: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/admin/customers/analytics', { params });
    return response.data;
  }
};

// Staff API
export const staffApi = {
  getStaffUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const response = await api.get('/admin/staff', { params });
    return response.data;
  },

  getStaffById: async (id: number) => {
    const response = await api.get(`/admin/staff/${id}`);
    return response.data;
  },

  createStaffUser: async (data: {
    email: string;
    name: string;
    password: string;
    role: string;
    phone?: string;
  }) => {
    const response = await api.post('/admin/staff', data);
    return response.data;
  },

  updateStaffUser: async (id: number, data: {
    email?: string;
    name?: string;
    role?: string;
    phone?: string;
  }) => {
    const response = await api.put(`/admin/staff/${id}`, data);
    return response.data;
  },

  resetStaffPassword: async (id: number, sendEmail: boolean = true) => {
    const response = await api.post(`/admin/staff/${id}/reset-password`, { sendEmail });
    return response.data;
  },

  toggleStaffStatus: async (id: number, active: boolean) => {
    const response = await api.delete(`/admin/staff/${id}`, { data: { active } });
    return response.data;
  },

  getStaffAnalytics: async () => {
    const response = await api.get('/admin/staff/analytics');
    return response.data;
  }
}; 