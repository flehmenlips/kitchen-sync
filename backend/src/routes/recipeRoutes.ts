import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipeController'; // Using relative path

const router = express.Router();

// Define routes
router.route('/')
  .get(getRecipes)       // GET /api/recipes
  .post(createRecipe);    // POST /api/recipes

router.route('/:id')
  .get(getRecipeById)    // GET /api/recipes/:id
  .put(updateRecipe)     // PUT /api/recipes/:id
  .delete(deleteRecipe);  // DELETE /api/recipes/:id

export default router; 