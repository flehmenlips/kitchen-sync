import { PrepTask, CreatePrepTaskInput, UpdatePrepTaskInput } from '../types/prep';
import { api } from './api';

// Use a path relative to the api baseURL, which now already includes /api in production
const BASE_URL = '/prep-tasks';

export const prepTaskService = {
    // Get all prep tasks
    getAllTasks: async (): Promise<PrepTask[]> => {
        try {
            const response = await api.get(BASE_URL);
            console.log('Task response data:', response.data);
            
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
            const response = await api.get(BASE_URL);
            console.log('Task response data:', response.data);
            
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