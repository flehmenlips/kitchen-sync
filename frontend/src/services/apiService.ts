import axios from 'axios';
import { RecipeFormData } from '../components/forms/RecipeForm';
import { UserProfile, UserCredentials, AuthResponse } from '../types/user';

// Determine API URL based on environment
const getApiUrl = () => {
  // If VITE_API_BASE_URL is explicitly set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // If running on Render preview (kitchen-sync-app-pr-*.onrender.com), use Render API
  if (window.location.hostname.includes('kitchen-sync-app-pr-') && window.location.hostname.includes('onrender.com')) {
    return 'https://kitchen-sync-api.onrender.com/api';
  }
  
  // If running in production (kitchensync.restaurant or any subdomain), use production API
  const hostname = window.location.hostname;
  if (hostname === 'kitchensync.restaurant' || 
      hostname === 'www.kitchensync.restaurant' ||
      hostname.endsWith('.kitchensync.restaurant')) {
    return 'https://api.kitchensync.restaurant/api';
  }
  
  // Default to localhost for development
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiUrl();

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
            // First try to get token from kitchenSyncUserInfo (preferred)
            const storedUserInfo = localStorage.getItem('kitchenSyncUserInfo');
            if (storedUserInfo) {
                const parsed = JSON.parse(storedUserInfo);
                token = parsed.token;
            }
            // Fallback to 'token' key for backward compatibility
            if (!token) {
                token = localStorage.getItem('token');
            }
        } catch (error) {
            console.error("Error reading token from localStorage:", error);
            // Fallback to 'token' key if parsing fails
            token = localStorage.getItem('token');
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
    description?: string;
    instructions: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    yieldQuantity?: number;
    yieldUnit?: UnitOfMeasure;
    yieldUnitId?: number;
    tags?: string[];
    photoUrl?: string | null;
    photoPublicId?: string | null;
    menuTitle?: string | null;
    menuDescription?: string | null;
    userId?: number;
    categoryId?: number;
    category?: Category;
    recipeIngredients?: RecipeIngredient[];
    ingredients?: RecipeIngredient[];
    createdAt?: string;
    updatedAt?: string;
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
    const response = await apiService.get('/recipes');
    return response.data.map((recipe: any) => ({
        ...recipe,
        recipeIngredients: recipe.recipeIngredients || []
    }));
  } catch (error) {
    console.error('Error fetching recipes:', error);
    // Handle or throw error appropriately for UI
    throw error;
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
        const response = await apiService.get('/dashboard/stats');
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error; // Re-throw for the component to handle
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
        const response = await apiService.post('/users/login', credentials);
        // Don't store token here - AuthContext handles storage in kitchenSyncUserInfo
        // The interceptor will pick it up from there
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

export const parseRecipe = async (recipeText: string, forceAI?: boolean): Promise<any> => {
    try {
        const response = await apiService.post('/recipes/parse', { recipeText, forceAI });
        return response.data;
    } catch (error) {
        console.error('Error parsing recipe:', error);
        // Surface server-provided message if available
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message || 'Failed to parse recipe';
            throw new Error(message);
        }
        throw error;
    }
};

export const generateRecipeAI = async (prompt: string): Promise<any> => {
    try {
        const response = await apiService.post('/recipes/generate', { prompt });
        return response.data;
    } catch (error) {
        console.error('Error generating recipe with AI:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message || 'Failed to generate recipe';
            throw new Error(message);
        }
        throw error;
    }
};

export const scaleRecipeAI = async (payload: {
    parsedRecipe?: any;
    recipeText?: string;
    scaleMultiplier?: number;
    targetYieldQuantity?: number;
    targetYieldUnit?: string;
}): Promise<any> => {
    try {
        const response = await apiService.post('/recipes/scale', payload);
        return response.data;
    } catch (error) {
        console.error('Error scaling recipe with AI:', error);
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || error.message || 'Failed to scale recipe';
            throw new Error(message);
        }
        throw error;
    }
};

export const uploadRecipePhoto = async (recipeId: number, photoFile: File): Promise<{photoUrl: string}> => {
    try {
        const formData = new FormData();
        formData.append('photo', photoFile);
        
        console.log(`Uploading photo for recipe ${recipeId}, file:`, photoFile.name, photoFile.size);
        
        // Make sure we have auth token
        let token = null;
        try {
            const storedUserInfo = localStorage.getItem('kitchenSyncUserInfo');
            if (storedUserInfo) {
                token = JSON.parse(storedUserInfo).token;
                console.log("Found auth token in localStorage");
            } else {
                console.warn("No auth token found in localStorage");
                // Try to get token from another source
                const tokenOnlyItem = localStorage.getItem('token');
                if (tokenOnlyItem) {
                    token = tokenOnlyItem;
                    console.log("Found token from token-only localStorage item");
                }
            }
        } catch (error) {
            console.error("Error reading token from localStorage:", error);
        }

        // Create headers with Auth token
        const headers: Record<string, string> = {
            // Don't set Content-Type - let the browser set it with the boundary
        };
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        console.log("Request headers:", headers);

        // Create full API URL explicitly to avoid using relative URLs that might be misinterpreted
        const uploadUrl = `${API_BASE_URL}/recipes/${recipeId}/photo`;
        console.log("Using full upload URL:", uploadUrl);

        // Don't set Content-Type header; browser will set it with boundary for multipart/form-data
        // Use the axios imported directly
        const response = await axios({
            method: 'post',
            url: uploadUrl,
            data: formData,
            headers: headers
        });
        
        console.log(`Photo upload response for recipe ${recipeId}:`, response.data);
        return response.data;
    } catch (error) {
        console.error(`Error uploading photo for recipe ${recipeId}:`, error);
        throw error;
    }
};

// Add Menu-related interfaces after other interfaces
// --- Menu Types ---
export interface MenuItem {
  id?: number;
  name: string;
  description?: string | null;
  price?: string | null;
  position?: number;
  active?: boolean;
  recipeId?: number | null;
  recipe?: {
    id: number;
    name: string;
    photoUrl?: string | null;
  } | null;
  deleted?: boolean;
}

export interface MenuSection {
  id?: number;
  name: string;
  position?: number;
  active?: boolean;
  items: MenuItem[];
  deleted?: boolean;
}

export interface Menu {
  id: number;
  name: string;
  title?: string | null;
  subtitle?: string | null;
  font?: string | null;
  fontSize?: string | null;
  layout?: string | null;
  showDollarSign: boolean;
  showDecimals: boolean;
  showSectionDividers: boolean;
  logoPath?: string | null;
  logoPosition?: string | null;
  logoSize?: string | null;
  logoOffset?: string | null;
  backgroundColor?: string | null;
  textColor?: string | null;
  accentColor?: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  sections?: MenuSection[];
}

export interface MenuFormData {
  name: string;
  title?: string;
  subtitle?: string;
  font?: string;
  fontSize?: string;
  layout?: string;
  showDollarSign?: boolean;
  showDecimals?: boolean;
  showSectionDividers?: boolean;
  logoPath?: string | null;
  logoPosition?: string;
  logoSize?: string;
  logoOffset?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  sections?: MenuSection[];
}

// === Menu API Functions ===
export const getMenus = async (): Promise<Menu[]> => {
  try {
    const response = await apiService.get('/menus?include=sections,items');
    return response.data;
  } catch (error) {
    console.error('Error fetching menus:', error);
    throw error;
  }
};

export const getMenuById = async (id: number): Promise<Menu> => {
  try {
    const response = await apiService.get(`/menus/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching menu ${id}:`, error);
    throw error;
  }
};

export const createMenu = async (menuData: MenuFormData): Promise<Menu> => {
  try {
    const response = await apiService.post('/menus', menuData);
    return response.data;
  } catch (error) {
    console.error('Error creating menu:', error);
    throw error;
  }
};

export const updateMenu = async (id: number, menuData: Partial<MenuFormData>): Promise<Menu> => {
  try {
    const response = await apiService.put(`/menus/${id}`, menuData);
    return response.data;
  } catch (error) {
    console.error(`Error updating menu ${id}:`, error);
    throw error;
  }
};

export const deleteMenu = async (id: number): Promise<void> => {
  try {
    await apiService.delete(`/menus/${id}`);
  } catch (error) {
    console.error(`Error deleting menu ${id}:`, error);
    throw error;
  }
};

export const archiveMenu = async (id: number): Promise<Menu> => {
  try {
    const response = await apiService.put(`/menus/${id}/archive`, {});
    return response.data;
  } catch (error) {
    console.error(`Error archiving menu ${id}:`, error);
    throw error;
  }
};

export const duplicateMenu = async (id: number): Promise<Menu> => {
  try {
    const response = await apiService.post(`/menus/${id}/duplicate`, {});
    return response.data;
  } catch (error) {
    console.error(`Error duplicating menu ${id}:`, error);
    throw error;
  }
};

export const uploadMenuLogo = async (menuId: number, logoFile: File): Promise<{logoUrl: string, menu: Menu}> => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const response = await apiService.post(`/menus/${menuId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error(`Error uploading menu logo for menu ${menuId}:`, error);
    throw error;
  }
};

export default apiService; 