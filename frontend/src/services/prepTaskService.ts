import { PrepTask, CreatePrepTaskInput, UpdatePrepTaskInput } from '../types/prep';
import { api } from './api';
import axios from 'axios';

// Use a path relative to the api baseURL, which now already includes /api in production
const BASE_URL = '/prep-tasks';
// For direct API access as a workaround
const API_URL = 'https://kitchen-sync-api.onrender.com/api';

// Create a separate API instance for direct calls
const directApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add auth token to direct API calls
directApi.interceptors.request.use(
    (config) => {
        let token = null;
        try {
            const userInfo = localStorage.getItem('kitchenSyncUserInfo');
            if (userInfo) {
                const parsed = JSON.parse(userInfo);
                token = parsed.token;
            }
        } catch (e) {
            console.error('Error parsing user info:', e);
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

export const prepTaskService = {
    // Get all prep tasks
    getAllTasks: async (): Promise<PrepTask[]> => {
        try {
            let response;
            // Try the regular API first
            try {
                response = await api.get(BASE_URL);
                console.log('Task response data from regular API:', response.data);
            } catch (error) {
                console.log('Regular API failed, trying direct API:', error);
                // If that fails, try the direct API
                response = await directApi.get('/prep-tasks');
                console.log('Task response data from direct API:', response.data);
            }
            
            // Ensure the response is an array
            if (!response.data) {
                console.warn('Empty response from tasks API');
                return [];
            }
            
            // Check if the response contains HTML (indicates a routing issue)
            if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
                console.error('Received HTML instead of JSON. API routing issue detected!');
                console.error('Please check server configuration and CORS settings');
                // Log the first 100 characters to see what kind of HTML we're getting
                console.error('HTML preview:', response.data.substring(0, 100) + '...');
                return [];
            }
            
            // Handle case where response.data is not an array
            if (!Array.isArray(response.data)) {
                console.error('Task data is not an array:', 
                    typeof response.data === 'string' 
                        ? response.data.substring(0, 50) + '...' 
                        : response.data);
                return [];
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return []; // Return empty array instead of throwing
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
        try {
            let response;
            // Try the regular API first
            try {
                response = await api.get(BASE_URL);
                console.log('Task response data from regular API:', response.data);
            } catch (error) {
                console.log('Regular API failed, trying direct API:', error);
                // If that fails, try the direct API
                response = await directApi.get('/prep-tasks');
                console.log('Task response data from direct API:', response.data);
            }
            
            // Ensure the response is an array
            if (!response.data) {
                console.warn('Empty response from tasks API');
                return [];
            }
            
            // Check if the response contains HTML (indicates a routing issue)
            if (typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
                console.error('Received HTML instead of JSON. API routing issue detected!');
                console.error('Please check server configuration and CORS settings');
                // Log the first 100 characters to see what kind of HTML we're getting
                console.error('HTML preview:', response.data.substring(0, 100) + '...');
                return [];
            }
            
            // Handle case where response.data is not an array
            if (!Array.isArray(response.data)) {
                console.error('Task data is not an array:', 
                    typeof response.data === 'string' 
                        ? response.data.substring(0, 50) + '...' 
                        : response.data);
                return [];
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            return []; // Return empty array instead of throwing
        }
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