import axios from 'axios';
import { PrepColumn } from '../types/prep';

// Create an axios instance with auth interceptor
const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
    (config) => {
        let token = null;
        try {
            const storedUserInfo = localStorage.getItem('kitchenSyncUserInfo');
            if (storedUserInfo) {
                token = JSON.parse(storedUserInfo).token;
            }
        } catch (error) {
            console.error("Error reading token from localStorage:", error);
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const API_URL = '/prep-columns';

// Get all prep columns
export const getPrepColumns = async (): Promise<PrepColumn[]> => {
    const response = await apiClient.get(API_URL);
    return response.data;
};

// Create a new prep column
export const createPrepColumn = async (columnData: { name: string; color?: string }): Promise<PrepColumn> => {
    const response = await apiClient.post(API_URL, columnData);
    return response.data;
};

// Update a prep column
export const updatePrepColumn = async (id: string, columnData: { name?: string; color?: string }): Promise<PrepColumn> => {
    const response = await apiClient.put(`${API_URL}/${id}`, columnData);
    return response.data;
};

// Delete a prep column
export const deletePrepColumn = async (id: string): Promise<void> => {
    await apiClient.delete(`${API_URL}/${id}`);
};

// Reorder prep columns
export const reorderPrepColumns = async (columnIds: string[]): Promise<PrepColumn[]> => {
    const response = await apiClient.put(`${API_URL}/reorder`, { columnIds });
    return response.data;
}; 