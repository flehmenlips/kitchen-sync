import axios from 'axios';

// In production, use the production backend URL
// In development, use the environment variable or localhost
const API_URL = import.meta.env.PROD 
  ? 'https://kitchen-sync-api.onrender.com/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Log environment and full URL for debugging
        const fullUrl = (config.baseURL || '') + (config.url || '');
        console.log(`API Request to ${fullUrl} in ${import.meta.env.PROD ? 'production' : 'development'} mode`);
        
        // Log environment for debugging
        if (import.meta.env.DEV) {
            console.log('API running in development mode, using baseURL:', config.baseURL);
        }
        
        // Get the token from localStorage - check both keys for backward compatibility
        let token = localStorage.getItem('token');
        if (!token) {
            // Try to get from kitchenSyncUserInfo
            try {
                const userInfo = localStorage.getItem('kitchenSyncUserInfo');
                if (userInfo) {
                    const parsed = JSON.parse(userInfo);
                    // Skip if this is a customer user
                    if (parsed.user?.isCustomer) {
                        token = null;
                    } else {
                        token = parsed.token;
                    }
                }
            } catch (e) {
                console.error('Error parsing user info:', e);
            }
        }
        
        // Also check if there's a customer auth in session storage - if so, skip this request
        const customerAuth = sessionStorage.getItem('customerAuth');
        if (customerAuth) {
            // Don't set any auth header if customer is logged in
            token = null;
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Log the outgoing request for debugging
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params
        });
        
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        // Log the response for debugging
        console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            data: response.data
        });
        return response;
    },
    async (error) => {
        // Log the error response
        console.error('API Error Response:', {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            data: error.response?.data
        });
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            console.warn('401 Unauthorized - User may need to log in');
            // Don't auto-redirect if we're already on login page
            if (!window.location.pathname.includes('/login')) {
                // Clear local storage and redirect to login
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
); 