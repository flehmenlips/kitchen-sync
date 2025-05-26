export const API_URL = import.meta.env.PROD 
  ? 'https://kitchen-sync-api.onrender.com'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001'); 