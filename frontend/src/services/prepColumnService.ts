import { PrepColumn, CreatePrepColumnInput, UpdatePrepColumnInput } from '../types/prep';
import { api } from './api';

const BASE_URL = '/api/prep-columns';

export const prepColumnService = {
    getColumns: async (): Promise<PrepColumn[]> => {
        const response = await api.get(BASE_URL);
        return response.data;
    },

    getColumnById: async (id: string): Promise<PrepColumn> => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    createColumn: async (column: CreatePrepColumnInput): Promise<PrepColumn> => {
        const response = await api.post(BASE_URL, column);
        return response.data;
    },

    updateColumn: async (id: string, updates: UpdatePrepColumnInput): Promise<PrepColumn> => {
        console.log(`prepColumnService.updateColumn called with id=${id}`, updates);
        try {
            const response = await api.put(`${BASE_URL}/${id}`, updates);
            console.log('updateColumn API response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in prepColumnService.updateColumn:', error);
            throw error;
        }
    },

    deleteColumn: async (id: string): Promise<void> => {
        await api.delete(`${BASE_URL}/${id}`);
    },

    reorderColumns: async (columnIds: string[]): Promise<PrepColumn[]> => {
        const response = await api.put(`${BASE_URL}/reorder`, { columnIds });
        return response.data;
    }
}; 