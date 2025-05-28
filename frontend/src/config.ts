// Determine API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running in production (not localhost), use production API
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://api.kitchensync.restaurant';
  }
  
  // Default to localhost for development
  return 'http://localhost:3001';
};

export const API_BASE_URL = import.meta.env.MODE === 'production'
  ? (import.meta.env.VITE_API_URL || 'https://api.kitchensync.restaurant')
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

export const API_URL = `${API_BASE_URL}/api`; 