import { customerApi } from './customerApi';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    isCustomer: boolean;
    emailVerified?: boolean;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface CustomerProfile {
  id: number;
  email: string;
  name: string;
  phone?: string;
  isCustomer: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  marketingOptIn: boolean;
  dietaryRestrictions?: string;
  specialRequests?: string;
  vipStatus: boolean;
}

const CUSTOMER_AUTH_KEY = 'customerAuth';
const REFRESH_TOKEN_KEY = 'customerRefreshToken';

export const customerAuthService = {
  // Register a new customer
  async register(data: RegisterData): Promise<AuthResponse> {
    // Split the name into firstName and lastName for the backend
    const nameParts = data.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;
    
    const registrationData = {
      email: data.email,
      password: data.password,
      firstName,
      lastName,
      phone: data.phone
    };
    
    const response = await customerApi.post('/auth/customer/register', registrationData);
    this.setAuth(response.data);
    return response.data;
  },

  // Login customer
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await customerApi.post('/auth/customer/login', data);
    this.setAuth(response.data);
    return response.data;
  },

  // Verify email
  async verifyEmail(token: string): Promise<{ message: string; user: any }> {
    const response = await customerApi.post('/auth/customer/verify-email', { token });
    return response.data;
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await customerApi.post('/auth/customer/request-password-reset', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await customerApi.post('/auth/customer/reset-password', { token, newPassword });
    return response.data;
  },

  // Refresh access token
  async refreshToken(): Promise<AuthResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await customerApi.post('/auth/customer/refresh-token', { refreshToken });
      this.setAuth(response.data);
      return response.data;
    } catch (error) {
      this.logout();
      return null;
    }
  },

  // Logout
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      try {
        await customerApi.post('/auth/customer/logout', { refreshToken });
      } catch (error) {
        // Ignore errors during logout
      }
    }
    this.clearAuth();
  },

  // Get customer profile
  async getProfile(): Promise<{ user: CustomerProfile; recentReservations: any[] }> {
    const response = await customerApi.get('/auth/customer/profile');
    return response.data;
  },

  // Update customer profile
  async updateProfile(data: Partial<CustomerProfile>): Promise<{ message: string; user: any }> {
    const response = await customerApi.put('/auth/customer/profile', data);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  // Get access token
  getAccessToken(): string | null {
    const auth = this.getAuth();
    return auth?.accessToken || null;
  },

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Get current user
  getCurrentUser(): AuthResponse['user'] | null {
    const auth = this.getAuth();
    return auth?.user || null;
  },

  // Set authentication data
  setAuth(authData: AuthResponse): void {
    const { refreshToken, ...authWithoutRefresh } = authData;
    
    // Store auth data without refresh token in session storage
    sessionStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(authWithoutRefresh));
    
    // Store refresh token separately in localStorage if it exists
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    // No longer set the header on the shared api instance
    // The customerApi interceptor will handle this
  },

  // Get authentication data
  getAuth(): Omit<AuthResponse, 'refreshToken'> | null {
    const authStr = sessionStorage.getItem(CUSTOMER_AUTH_KEY);
    if (!authStr) return null;
    
    try {
      const parsed = JSON.parse(authStr);
      return parsed;
    } catch (e) {
      console.error('customerAuthService.getAuth - parse error:', e);
      return null;
    }
  },

  // Clear authentication data
  clearAuth(): void {
    sessionStorage.removeItem(CUSTOMER_AUTH_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // No need to clear headers as customerApi handles this
  },

  // Initialize auth from storage (call on app startup)
  initializeAuth(): void {
    // No need to set headers here as customerApi interceptor handles this
  }
}; 