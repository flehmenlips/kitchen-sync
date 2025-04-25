import axios from 'axios';
import { RecipeFormData } from '../components/forms/RecipeForm';
import { UserProfile, UserCredentials, AuthResponse } from '../types/user';
import { Recipe as RecipeType, RecipeApiData } from '../types/recipe';

// Get the base URL from environment variables, defaulting to localhost:3001
// Vite exposes env variables prefixed with VITE_
const API_BASE_URL = import.meta.env.PROD
    ? '/api' // Use relative URL in production
    : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

// Create an axios instance with auth interceptor
const apiService = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token
apiService.interceptors.request.use(
    (config) => {
        let token = null;
        try {
            const storedUserInfo = localStorage.getItem('kitchenSyncUserInfo');
            console.log("localStorage token retrieval for API call:", !!storedUserInfo);
            if (storedUserInfo) {
                const parsedInfo = JSON.parse(storedUserInfo);
                token = parsedInfo.token;
                console.log("Token found:", !!token);
            }
        } catch (error) {
            console.error("Error reading token from localStorage:", error);
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log("Authorization header set for API request");
        } else {
            console.warn("No authorization token available for request");
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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
  categoryId: number | null; // Added categoryId from backend
  category: Category | null; // Added OPTIONAL nested category object
  createdAt: string; // Assuming ISO string format from backend
  updatedAt: string;
  recipeIngredients?: RecipeIngredient[]; // Optional based on fetch endpoint
}

// Interface for Unit data from form
export interface UnitFormData {
    name: string;
    abbreviation?: string | null;
    type?: string | null; // Match backend enum keys (WEIGHT, VOLUME, etc.)
}

// Interface for Unit returned by API (match prisma model)
export interface UnitOfMeasure {
    id: number;
    name: string;
    abbreviation: string | null;
    type: string | null; // Consider using the enum type if shared
    createdAt: string;
    updatedAt: string;
}

// Interface for Ingredient data from form
export interface IngredientFormData {
    name: string;
    description?: string | null;
    ingredientCategoryId?: number | null; // Add category ID here
}

// Interface for Ingredient returned by API (match prisma model)
export interface Ingredient {
    id: number;
    name: string;
    description: string | null;
    ingredientCategoryId: number | null; // Added ID
    ingredientCategory: IngredientCategory | null; // Added optional nested object
    createdAt: string;
    updatedAt: string;
}

// --- Category Types ---
export interface CategoryFormData {
    name: string;
    description?: string | null;
}

export interface Category {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

// --- Category Types (Recipe) ---
// ...

// --- Ingredient Category Types ---
export interface IngredientCategoryFormData {
    name: string;
    description?: string | null;
}

export interface IngredientCategory {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

// --- Dashboard Stats Types ---
export interface DashboardStats {
    recipes: number;
    ingredients: number;
    units: number;
    recipeCategories: number;
    ingredientCategories: number;
}

// Issue Types
export interface Issue {
    id: number;
    title: string;
    description: string;
    type: 'FEATURE' | 'BUG' | 'ENHANCEMENT';
    status: 'OPEN' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    isPublic: boolean;
    createdBy: {
        id: number;
        name: string;
        email: string;
    };
    assignedTo?: {
        id: number;
        name: string;
        email: string;
    };
    labels: {
        label: {
            id: number;
            name: string;
            color: string;
        };
    }[];
    _count: {
        comments: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateIssueData {
    title: string;
    description: string;
    type: Issue['type'];
    priority: Issue['priority'];
    isPublic: boolean;
    assignedToId?: number;
    labelIds?: number[];
}

// API functions
export const getRecipes = async (): Promise<Recipe[]> => {
  try {
    console.log("Fetching recipes from:", `${API_BASE_URL}/recipes`);
    const response = await apiService.get('/recipes');
    console.log("Recipes response:", response);
    
    // Add defensive checks for the response data
    if (!response || !response.data) {
      console.error('No data in recipe response:', response);
      return [];
    }
    
    // Check if data is an array before trying to map it
    if (!Array.isArray(response.data)) {
      console.error('Recipe data is not an array:', response.data);
      return [];
    }
    
    return response.data.map((recipe: any) => ({
        ...recipe,
        recipeIngredients: recipe.recipeIngredients || []
    }));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
};

export const getRecipeById = async (id: number): Promise<Recipe> => {
    try {
        const response = await apiService.get(`/recipes/${id}`);
        return {
            ...response.data,
            recipeIngredients: response.data.recipeIngredients || []
        };
    } catch (error) {
        console.error(`Error fetching recipe ${id}:`, error);
        throw error;
    }
};

export const createRecipe = async (recipeData: RecipeFormData): Promise<Recipe> => {
  try {
    // Send the raw form data (or minimally processed)
    const response = await apiService.post('/recipes', recipeData);
    return response.data; 
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error; // Re-throw for the component to handle
  }
};

export const updateRecipe = async (id: number, recipeData: RecipeFormData): Promise<Recipe> => {
    try {
        // Send the raw form data (or minimally processed)
        const response = await apiService.put(`/recipes/${id}`, recipeData);
        return response.data; 
    } catch (error) {
        console.error(`Error updating recipe ${id}:`, error);
        throw error;
    }
};

export const deleteRecipe = async (id: number): Promise<void> => {
    try {
        await apiService.delete(`/recipes/${id}`);
    } catch (error) {
        console.error(`Error deleting recipe ${id}:`, error);
        throw error;
    }
};

// Units
export const getUnits = async (): Promise<UnitOfMeasure[]> => {
    try {
        const response = await apiService.get('/units');
        return response.data;
    } catch (error) {
        console.error('Error fetching units:', error);
        throw error;
    }
};

export const getUnitById = async (id: number): Promise<UnitOfMeasure> => {
    try {
        const response = await apiService.get(`/units/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching unit ${id}:`, error);
        throw error;
    }
};

export const createUnit = async (unitData: UnitFormData): Promise<UnitOfMeasure> => {
    try {
        const response = await apiService.post('/units', unitData);
        return response.data;
    } catch (error) {
        console.error('Error creating unit:', error);
        throw error;
    }
};

export const updateUnit = async (id: number, unitData: UnitFormData): Promise<UnitOfMeasure> => {
    try {
        // Ensure empty type/abbreviation are sent as null if needed by backend
        const payload = {
             ...unitData,
             type: unitData.type || null,
             abbreviation: unitData.abbreviation || null,
         };
        const response = await apiService.put(`/units/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating unit ${id}:`, error);
        throw error;
    }
};

export const deleteUnit = async (id: number): Promise<void> => {
    try {
        await apiService.delete(`/units/${id}`);
    } catch (error) {
        console.error(`Error deleting unit ${id}:`, error);
        throw error;
    }
};

// Ingredients
export const getIngredients = async (): Promise<Ingredient[]> => {
    try {
        const response = await apiService.get('/ingredients');
        return response.data;
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        throw error;
    }
};

export const getIngredientById = async (id: number): Promise<Ingredient> => {
    try {
        const response = await apiService.get(`/ingredients/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ingredient ${id}:`, error);
        throw error;
    }
};

export const createIngredient = async (ingredientData: IngredientFormData): Promise<Ingredient> => {
    try {
        // Ensure payload includes ingredientCategoryId (null if not provided/invalid)
        const payload = { 
            ...ingredientData,
            description: ingredientData.description || null,
            ingredientCategoryId: ingredientData.ingredientCategoryId || null
        };
        const response = await apiService.post('/ingredients', payload); // Send processed payload
        return response.data;
    } catch (error) {
        console.error('Error creating ingredient:', error);
        throw error;
    }
};

export const updateIngredient = async (id: number, ingredientData: IngredientFormData): Promise<Ingredient> => {
    try {
         // Ensure payload includes description and ingredientCategoryId (null if needed)
        const payload = {
             ...ingredientData,
             description: ingredientData.description || null,
             ingredientCategoryId: ingredientData.ingredientCategoryId || null
         };
        const response = await apiService.put(`/ingredients/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating ingredient ${id}:`, error);
        throw error;
    }
};

export const deleteIngredient = async (id: number): Promise<void> => {
    try {
        await apiService.delete(`/ingredients/${id}`);
    } catch (error) {
        console.error(`Error deleting ingredient ${id}:`, error);
        throw error;
    }
};

// == Categories ==
export const getCategories = async (): Promise<Category[]> => {
    try {
        const response = await apiService.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const getCategoryById = async (id: number): Promise<Category> => {
    try {
        const response = await apiService.get(`/categories/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching category ${id}:`, error);
        throw error;
    }
};

export const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
    try {
         const payload = { ...categoryData, description: categoryData.description || null };
        const response = await apiService.post('/categories', payload);
        return response.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

export const updateCategory = async (id: number, categoryData: CategoryFormData): Promise<Category> => {
    try {
        const payload = { ...categoryData, description: categoryData.description || null };
        const response = await apiService.put(`/categories/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating category ${id}:`, error);
        throw error;
    }
};

export const deleteCategory = async (id: number): Promise<void> => {
    try {
        await apiService.delete(`/categories/${id}`);
    } catch (error) {
        console.error(`Error deleting category ${id}:`, error);
        throw error;
    }
};

// == Ingredient Categories ==
export const getIngredientCategories = async (): Promise<IngredientCategory[]> => {
    try {
        const response = await apiService.get('/ingredient-categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching ingredient categories:', error);
        throw error;
    }
};

export const createIngredientCategory = async (categoryData: IngredientCategoryFormData): Promise<IngredientCategory> => {
    try {
        const payload = { ...categoryData, description: categoryData.description || null };
        const response = await apiService.post('/ingredient-categories', payload);
        return response.data;
    } catch (error) {
        console.error('Error creating ingredient category:', error);
        throw error;
    }
};

export const updateIngredientCategory = async (id: number, categoryData: IngredientCategoryFormData): Promise<IngredientCategory> => {
    try {
        const payload = { ...categoryData, description: categoryData.description || null };
        const response = await apiService.put(`/ingredient-categories/${id}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating ingredient category ${id}:`, error);
        throw error;
    }
};

export const deleteIngredientCategory = async (id: number): Promise<void> => {
    try {
        await apiService.delete(`/ingredient-categories/${id}`);
    } catch (error) {
        console.error(`Error deleting ingredient category ${id}:`, error);
        throw error;
    }
};

// Optional Get By ID
export const getIngredientCategoryById = async (id: number): Promise<IngredientCategory> => {
     try {
        const response = await apiService.get(`/ingredient-categories/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ingredient category ${id}:`, error);
        throw error;
    }
};

// == Dashboard ==
export const getDashboardStats = async (): Promise<DashboardStats> => {
    try {
        console.log("Fetching dashboard stats from:", `${API_BASE_URL}/dashboard/stats`);
        const response = await apiService.get('/dashboard/stats');
        console.log("Dashboard stats response:", response);
        
        // Add validation and default values for safer access
        const data = response.data || {};
        const safeStats: DashboardStats = {
            recipes: typeof data.recipes === 'number' ? data.recipes : 0,
            ingredients: typeof data.ingredients === 'number' ? data.ingredients : 0,
            units: typeof data.units === 'number' ? data.units : 0,
            recipeCategories: typeof data.recipeCategories === 'number' ? data.recipeCategories : 0,
            ingredientCategories: typeof data.ingredientCategories === 'number' ? data.ingredientCategories : 0
        };
        
        return safeStats;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        
        // Return safe default values instead of throwing
        const defaultStats: DashboardStats = {
            recipes: 0,
            ingredients: 0,
            units: 0,
            recipeCategories: 0,
            ingredientCategories: 0
        };
        
        return defaultStats;
    }
};

// == Auth / User ==
export const register = async (userData: UserCredentials): Promise<AuthResponse> => {
    try {
        const response = await apiService.post('/users/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error during registration:', error);
        throw error;
    }
};

export const login = async (credentials: UserCredentials): Promise<AuthResponse> => {
    try {
        console.log("Login request with credentials:", { email: credentials.email, passwordProvided: !!credentials.password });
        const response = await apiService.post('/users/login', credentials);
        console.log("Login response received:", response.status);
        
        const { token, user } = response.data;
        // Store the token in localStorage
        if (token) {
            console.log("Saving token to localStorage");
            localStorage.setItem('kitchenSyncUserInfo', JSON.stringify({ user, token }));
            // Update default headers for future requests
            apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            console.error("No token received in login response");
        }
        
        return response.data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    try {
        // Interceptor might add token, backend ignores it for logout
        await apiService.post('/users/logout'); 
        localStorage.removeItem('token');
        delete apiService.defaults.headers.common['Authorization'];
    } catch (error) {
        console.error('Error during logout:', error);
        throw error;
    }
};

export const getProfile = async (): Promise<UserProfile> => {
    try {
        // Interceptor adds Authorization header
        const response = await apiService.get('/users/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        // Don't throw for profile fetch, just return null or handle differently?
        // Depending on how we use this, throwing might be okay.
        throw error; 
    }
};

// Issue API functions
export const getIssues = async (): Promise<Issue[]> => {
    try {
        const response = await apiService.get('/issues');
        return response.data;
    } catch (error) {
        console.error('Error fetching issues:', error);
        throw error;
    }
};

export const getIssueById = async (id: number): Promise<Issue> => {
    try {
        const response = await apiService.get(`/issues/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching issue ${id}:`, error);
        throw error;
    }
};

export const createIssue = async (issueData: CreateIssueData): Promise<Issue> => {
    try {
        const response = await apiService.post('/issues', issueData);
        return response.data;
    } catch (error) {
        console.error('Error creating issue:', error);
        throw error;
    }
};

export const updateIssue = async (id: number, issueData: Partial<CreateIssueData>): Promise<Issue> => {
    try {
        const response = await apiService.put(`/issues/${id}`, issueData);
        return response.data;
    } catch (error) {
        console.error(`Error updating issue ${id}:`, error);
        throw error;
    }
};

export const deleteIssue = async (id: number): Promise<void> => {
    try {
        await apiService.delete(`/issues/${id}`);
    } catch (error) {
        console.error(`Error deleting issue ${id}:`, error);
        throw error;
    }
};

export const parseRecipe = async (recipeText: string): Promise<any> => {
    try {
        const response = await apiService.post('/recipes/parse', { recipeText });
        return response.data;
    } catch (error) {
        console.error('Error parsing recipe:', error);
        throw error;
    }
};

export default apiService; 