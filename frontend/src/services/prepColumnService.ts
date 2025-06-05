import { PrepColumn, CreatePrepColumnInput, UpdatePrepColumnInput } from '../types/prep';
import { api } from './api';
import axios from 'axios';

// Use a path relative to the api baseURL, which now already includes /api in production
const BASE_URL = '/prep-columns';
// For direct API access as a workaround - Try these different options for the backend API
const API_URL_OPTIONS = [
    'https://kitchensync.restaurant/api',
    'https://kitchensync.restaurant',
    'https://kitchen-sync-app.onrender.com/api'
];

// Log the environment mode
console.log(`Running in ${import.meta.env.PROD ? 'production' : 'development'} mode`);
console.log(`Base URL configuration: ${BASE_URL}`);
console.log(`API URLs to try: ${JSON.stringify(API_URL_OPTIONS)}`);

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

export const prepColumnService = {
    getColumns: async (): Promise<PrepColumn[]> => {
        try {
            console.log(`Attempting to fetch prep columns using regular API: ${BASE_URL}`);
            let finalResponse = null;
            let finalError = null;
            
            // First try the regular API
            try {
        const response = await api.get(BASE_URL);
                console.log('Column response from regular API:', response);
                
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
                    
                    // Create a fresh instance for this attempt
                    const directApi = createDirectApi(apiUrl);
                    
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
                    const endpoint = `${apiUrl.endsWith('/api') ? '' : '/api'}/prep-columns`;
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
            console.error('Fatal error in getColumns:', finalError);
            return [];
        }
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