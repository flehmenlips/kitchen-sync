import axios from 'axios';
import { ProcessedRecipeData } from '../components/forms/RecipeForm'; // Corrected relative path

// Get the base URL from environment variables, defaulting to localhost:3001
// Vite exposes env variables prefixed with VITE_
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Define a basic type for our Recipe (can be expanded)
// Match this structure with your backend response, especially for nested objects
export interface RecipeIngredient {
    id: number;
    quantity: number;
    order: number;
    unit: { id: number; name: string; abbreviation: string };
    ingredient?: { id: number; name: string }; // Optional: Might be a subRecipe instead
    subRecipe?: { id: number; name: string }; // Optional: Might be an ingredient instead
}

export interface Recipe {
  id: number;
  name: string;
  description: string | null;
  instructions: string;
  yieldQuantity: number | null;
  yieldUnit: { id: number; name: string; abbreviation: string } | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  tags: string[];
  createdAt: string; // Assuming ISO string format from backend
  updatedAt: string;
  recipeIngredients?: RecipeIngredient[]; // Optional based on fetch endpoint
}

// API functions
export const getRecipes = async (): Promise<Recipe[]> => {
  try {
    const response = await apiClient.get('/recipes');
    return response.data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    // Handle or throw error appropriately for UI
    throw error;
  }
};

export const getRecipeById = async (id: number): Promise<Recipe> => {
    try {
        const response = await apiClient.get(`/recipes/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching recipe ${id}:`, error);
        throw error;
    }
};

export const createRecipe = async (recipeData: ProcessedRecipeData): Promise<Recipe> => {
  try {
    // The backend expects the structure defined by ProcessedRecipeData
    const response = await apiClient.post('/recipes', recipeData);
    return response.data; // Assuming backend returns the full new recipe object
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error; // Re-throw for the component to handle
  }
};

// Add other functions (update, delete for recipes, units, ingredients) here later

export default apiClient; 