import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '@/controllers/recipeController'; // Use path alias

const router = express.Router();

// Define routes
router.route('/')
  .get(getRecipes)
  .post(createRecipe);

router.route('/:id')
  .get(getRecipeById)
  .put(updateRecipe)
  .delete(deleteRecipe);

export default router; 