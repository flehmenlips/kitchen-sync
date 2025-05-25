import axios from 'axios';

// Create a separate axios instance for customer API calls
export const customerApi = axios.create({
    baseURL: import.meta.env.PROD 
        ? 'https://kitchen-sync-api.onrender.com/api'
        : (import.meta.env.VITE_API_URL || 'http://localhost:3001/api'),
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true
});

// Add a request interceptor for customer authentication
customerApi.interceptors.request.use(
    (config) => {
        // Get customer auth token from sessionStorage
        const authStr = sessionStorage.getItem('customerAuth');
        if (authStr) {
            try {
                const auth = JSON.parse(authStr);
                if (auth.accessToken) {
                    config.headers.Authorization = `Bearer ${auth.accessToken}`;
                }
            } catch (e) {
                console.error('Error parsing customer auth:', e);
            }
        }
        
        return config;
    },
    (error) => {
        console.error('Customer API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for customer-specific error handling
customerApi.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        console.error('Customer API Error Response:', {
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            data: error.response?.data
        });
        
        // Handle 401 Unauthorized errors for customers
        if (error.response?.status === 401) {
            // Only redirect if we're in the customer portal and not already on login page
            if (window.location.pathname.startsWith('/customer') && 
                !window.location.pathname.includes('/customer/login') &&
                !window.location.pathname.includes('/customer/register')) {
                // Clear customer auth and redirect to customer login
                sessionStorage.removeItem('customerAuth');
                localStorage.removeItem('customerRefreshToken');
                window.location.href = '/customer/login';
            }
        }
        return Promise.reject(error);
    }
); 