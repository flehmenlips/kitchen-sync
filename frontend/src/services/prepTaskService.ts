import { PrepTask, CreatePrepTaskInput, UpdatePrepTaskInput } from '../types/prep';
import { api } from './api';

const BASE_URL = '/api/prep-tasks';

export const prepTaskService = {
    // Get all prep tasks
    getAllTasks: async (): Promise<PrepTask[]> => {
        const response = await api.get(BASE_URL);
        return response.data;
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
        const response = await api.get(BASE_URL);
        return response.data;
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