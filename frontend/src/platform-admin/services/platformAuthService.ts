import axios from 'axios';

// Determine API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on Render preview (kitchen-sync-app-pr-*.onrender.com), use Render API
  if (window.location.hostname.includes('kitchen-sync-app-pr-') && window.location.hostname.includes('onrender.com')) {
    return 'https://kitchen-sync-api.onrender.com/api';
  }
  
  // If running in production (kitchensync.restaurant), use production API
  if (window.location.hostname === 'kitchensync.restaurant' || window.location.hostname === 'www.kitchensync.restaurant') {
    return 'https://api.kitchensync.restaurant/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:3001/api';
};

const API_URL = getApiUrl();

// Create a separate axios instance for platform admin
const platformApi = axios.create({
  baseURL: `${API_URL}/platform`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
platformApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('platformToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
platformApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('platformToken');
      window.location.href = '/platform-admin/login';
    }
    return Promise.reject(error);
  }
);

export interface PlatformAdmin {
  id: number;
  email: string;
  name: string;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: PlatformAdmin;
}

const platformAuthService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await platformApi.post<LoginResponse>('/auth/login', credentials);
    const { token, admin } = response.data;
    
    // Store token
    localStorage.setItem('platformToken', token);
    
    return { token, admin };
  },

  async logout(): Promise<void> {
    try {
      await platformApi.post('/auth/logout');
    } finally {
      localStorage.removeItem('platformToken');
    }
  },

  async getCurrentAdmin(): Promise<PlatformAdmin> {
    const response = await platformApi.get<PlatformAdmin>('/auth/me');
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await platformApi.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('platformToken');
  },

  getToken(): string | null {
    return localStorage.getItem('platformToken');
  },
};

export { platformApi };
export default platformAuthService; 