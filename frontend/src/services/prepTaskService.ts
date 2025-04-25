import { apiClient } from './apiClient';
import { PrepTask } from '../components/prep/types';

const BASE_URL = '/api/prep-tasks';

export const prepTaskService = {
    // Get all prep tasks
    getAllTasks: async (): Promise<PrepTask[]> => {
        const response = await apiClient.get(BASE_URL);
        return response.data;
    },

    // Create a new prep task
    createTask: async (task: Omit<PrepTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<PrepTask> => {
        const response = await apiClient.post(BASE_URL, task);
        return response.data;
    },

    // Update a prep task
    updateTask: async (id: string, task: Partial<PrepTask>): Promise<PrepTask> => {
        const response = await apiClient.put(`${BASE_URL}/${id}`, task);
        return response.data;
    },

    // Delete a prep task
    deleteTask: async (id: string): Promise<void> => {
        await apiClient.delete(`${BASE_URL}/${id}`);
    }
}; 