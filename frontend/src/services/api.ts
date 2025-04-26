import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
    // In production, use the production API URL with '/api' path
    // In development, use the full base URL with '/api' included
    baseURL: import.meta.env.PROD 
        ? 'https://kitchen-sync-api.onrender.com/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Explicitly request JSON
    },
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
                    token = parsed.token;
                }
            } catch (e) {
                console.error('Error parsing user info:', e);
            }
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
            // Clear local storage and redirect to login
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
); 