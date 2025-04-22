import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  parseRecipe,
} from '../controllers/recipeController'; // Using relative path
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Define routes
router.route('/')
  .get(protect, getRecipes)       // GET /api/recipes
  .post(protect, createRecipe);    // POST /api/recipes

router.route('/parse')
  .post(protect, parseRecipe);     // POST /api/recipes/parse

router.route('/:id')
  .get(protect, getRecipeById)    // GET /api/recipes/:id
  .put(protect, updateRecipe)     // PUT /api/recipes/:id
  .delete(protect, deleteRecipe);  // DELETE /api/recipes/:id

export default router; 