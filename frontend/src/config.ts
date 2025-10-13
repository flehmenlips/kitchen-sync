// Determine API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on Render preview (kitchen-sync-app-pr-*.onrender.com), use Render API
  if (window.location.hostname.includes('kitchen-sync-app-pr-') && window.location.hostname.includes('onrender.com')) {
    return 'https://kitchen-sync-api.onrender.com';
  }
  
  // If running in production (kitchensync.restaurant), use production API
  if (window.location.hostname === 'kitchensync.restaurant' || window.location.hostname === 'www.kitchensync.restaurant') {
    return 'https://api.kitchensync.restaurant';
  }
  
  // Default to localhost for development
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiUrl();

export const API_URL = `${API_BASE_URL}/api`; 