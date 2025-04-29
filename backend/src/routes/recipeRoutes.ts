import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  parseRecipe,
  uploadRecipePhoto
} from '../controllers/recipeController'; // Using relative path
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Define routes
router.route('/')
  .get(getRecipes)       // GET /api/recipes
  .post(createRecipe);    // POST /api/recipes

router.route('/parse')
  .post(parseRecipe);     // POST /api/recipes/parse

router.route('/:id')
  .get(getRecipeById)    // GET /api/recipes/:id
  .put(updateRecipe)     // PUT /api/recipes/:id
  .delete(deleteRecipe);  // DELETE /api/recipes/:id

// Route for uploading recipe photo - include multer middleware
router.route('/:id/photo').post(upload.single('photo'), uploadRecipePhoto);

export default router; 