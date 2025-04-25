import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            // Clear local storage and redirect to login
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
); 