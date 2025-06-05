import { PrepTask, CreatePrepTaskInput, UpdatePrepTaskInput } from '../types/prep';
import { api } from './api';
import axios from 'axios';

// Use a path relative to the api baseURL, which now already includes /api in production
const BASE_URL = '/prep-tasks';
// For direct API access as a workaround - Try these different options for the backend API
const API_URL_OPTIONS = [
    'https://api.kitchensync.restaurant/api',
    'https://api.kitchensync.restaurant',
    'https://kitchen-sync-api.onrender.com/api'
];

// Create a separate API instance for direct calls (will try multiple URLs)
const createDirectApi = (baseURL: string) => axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // Explicitly allow CORS
    withCredentials: false,
});

// Add auth token to direct API calls
const directApi = createDirectApi(API_URL_OPTIONS[0]);
directApi.interceptors.request.use(
    (config) => {
        let token = null;
        let restaurantId = null;
        try {
            const userInfo = localStorage.getItem('kitchenSyncUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                token = parsed.token;
            }
            
            // Get restaurant context
            const storedRestaurant = localStorage.getItem('kitchenSyncCurrentRestaurant');
            if (storedRestaurant) {
                const restaurant = JSON.parse(storedRestaurant);
                restaurantId = restaurant?.id;
            }
        } catch (e) {
            console.error('Error parsing auth/restaurant info:', e);
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (restaurantId) {
            config.headers['X-Restaurant-Id'] = restaurantId.toString();
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

export const prepTaskService = {
    // Get all prep tasks
    getAllTasks: async (): Promise<PrepTask[]> => {
        try {
            console.log(`Attempting to fetch prep tasks using regular API: ${BASE_URL}`);
            let finalError = null;
            
            // First try the regular API
            try {
        const response = await api.get(BASE_URL);
                console.log('Task response from regular API:', response);
                
                if (response && response.data) {
                    // Check if the response contains HTML
                    if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
                        console.warn('Regular API returned HTML instead of JSON');
                    } else if (Array.isArray(response.data)) {
                        console.log('Regular API returned valid array data');
                        return response.data;
                    }
                }
            } catch (error) {
                console.warn('Regular API call failed:', error);
                finalError = error;
            }
            
            // If we got here, the first attempt failed - try direct URLs
            console.log('Attempting direct API calls to backend');
            
            for (const apiUrl of API_URL_OPTIONS) {
                try {
                    console.log(`Trying direct API call to: ${apiUrl}`);
                    
                    // Add auth token
                    let token = null;
                    let restaurantId = null;
                    try {
                        const userInfo = localStorage.getItem('kitchenSyncUserInfo');
                        if (userInfo) {
                            const parsed = JSON.parse(userInfo);
                            token = parsed.token;
                            console.log('Found auth token:', !!token);
                        } else {
                            console.warn('No user info found in localStorage');
                        }
                        
                        // Get restaurant context
                        const storedRestaurant = localStorage.getItem('kitchenSyncCurrentRestaurant');
                        if (storedRestaurant) {
                            const restaurant = JSON.parse(storedRestaurant);
                            restaurantId = restaurant?.id;
                            console.log('Found restaurant context:', restaurantId);
                        }
                    } catch (e) {
                        console.error('Error parsing auth/restaurant info:', e);
                    }
                    
                    // Make the request with auth header if token exists
                    const requestConfig: any = { headers: {} };
                    if (token) {
                        requestConfig.headers.Authorization = `Bearer ${token}`;
                    }
                    if (restaurantId) {
                        requestConfig.headers['X-Restaurant-Id'] = restaurantId.toString();
                    }
                    const endpoint = `${apiUrl.endsWith('/api') ? '' : '/api'}/prep-tasks`;
                    console.log(`Making request to: ${endpoint}`);
                    
                    const response = await axios.get(endpoint, requestConfig);
                    console.log(`Direct API response from ${apiUrl}:`, response);
                    
                    if (response && response.data) {
                        // Check if this is HTML
                        if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
                            console.warn(`${apiUrl} returned HTML instead of JSON`);
                            continue; // Try next URL
                        }
                        
                        if (Array.isArray(response.data)) {
                            console.log(`${apiUrl} returned valid array data!`);
        return response.data;
                        }
                    }
                } catch (error) {
                    console.warn(`Direct API call to ${apiUrl} failed:`, error);
                    finalError = error;
                }
            }
            
            // If we get here, all attempts failed
            console.error('All API attempts failed:', finalError);
            return [];
        } catch (finalError) {
            console.error('Fatal error in getAllTasks:', finalError);
            return [];
        }
    },

    getTaskById: async (id: string): Promise<PrepTask> => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    // Create a new prep task
    createTask: async (task: CreatePrepTaskInput): Promise<PrepTask> => {
        const response = await api.post(BASE_URL, task);
        return response.data;
    },

    // Update a prep task
    updateTask: async (id: string, updates: UpdatePrepTaskInput): Promise<PrepTask> => {
        const response = await api.put(`${BASE_URL}/${id}`, updates);
        return response.data;
    },

    // Delete a prep task
    deleteTask: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    getTasks: async (): Promise<PrepTask[]> => {
        // Call our getAllTasks implementation for consistency
        return prepTaskService.getAllTasks();
    },

    // Reorder tasks
    reorderTasks: async (tasks: { id: string; order: number; columnId: string }[]): Promise<PrepTask[]> => {
        console.log('prepTaskService.reorderTasks called with:', tasks);
        try {
            const response = await api.put(`${BASE_URL}/reorder`, { tasks });
            console.log('reorderTasks received response:', response.data);
            return response.data;
        } catch (error) {
            console.error('reorderTasks error:', error);
            throw error;
        }
    }
}; 