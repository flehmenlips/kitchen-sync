import { 
  IngredientCategory, 
  IngredientCategoryFormData,
  getIngredientCategories,
  createIngredientCategory,
  updateIngredientCategory,
  deleteIngredientCategory,
  getIngredientCategoryById
} from './apiService';

export const ingredientCategoryService = {
  getAll: getIngredientCategories,
  getById: getIngredientCategoryById,
  create: createIngredientCategory,
  update: updateIngredientCategory,
  delete: deleteIngredientCategory
};

export type { IngredientCategory, IngredientCategoryFormData }; 