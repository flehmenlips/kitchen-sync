import axios from 'axios';

// In production, use the production backend URL
// In development, use the environment variable or localhost
const API_URL = import.meta.env.PROD 
  ? 'https://api.kitchensync.restaurant/api'
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
                    // Only skip if this is explicitly a customer user AND we're not in admin context
                    if (parsed.user?.isCustomer && !window.location.pathname.includes('/admin')) {
                        token = null;
                    } else {
                        token = parsed.token;
                    }
                }
            } catch (e) {
                console.error('Error parsing user info:', e);
            }
        }
        
        // Only skip customer auth interference for admin/website-builder routes
        const isAdminRoute = config.url?.includes('/website-builder') || 
                           config.url?.includes('/admin') || 
                           window.location.pathname.includes('/admin');
        
        if (!isAdminRoute) {
            // Check if there's a customer auth in session storage - if so, skip this request
            const customerAuth = sessionStorage.getItem('customerAuth');
            if (customerAuth) {
                // Don't set any auth header if customer is logged in
                token = null;
            }
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add restaurant context header
        try {
            const storedRestaurant = localStorage.getItem('kitchenSyncCurrentRestaurant');
            if (storedRestaurant) {
                const restaurant = JSON.parse(storedRestaurant);
                if (restaurant?.id) {
                    config.headers['X-Restaurant-Id'] = restaurant.id.toString();
                }
            }
        } catch (e) {
            console.error('Error parsing restaurant context:', e);
        }
        
        // Log the outgoing request for debugging
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
            headers: config.headers
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

// Export the api instance
export { api }; 