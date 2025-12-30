import express from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  parseRecipe,
  generateRecipe,
  scaleRecipeAI,
  uploadRecipePhoto
} from '../controllers/recipeController'; // Using relative path
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Define routes
router.route('/')
  .get(getRecipes)       // GET /api/recipes
  .post(createRecipe);    // POST /api/recipes

router.route('/parse')
  .post(parseRecipe);     // POST /api/recipes/parse

router.route('/generate')
  .post(generateRecipe);   // POST /api/recipes/generate

router.route('/scale')
  .post(scaleRecipeAI);    // POST /api/recipes/scale

router.route('/:id')
  .get(getRecipeById)    // GET /api/recipes/:id
  .put(updateRecipe)     // PUT /api/recipes/:id
  .delete(deleteRecipe);  // DELETE /api/recipes/:id

// Route for uploading recipe photo - include multer middleware
router.route('/:id/photo').post(upload.single('photo'), uploadRecipePhoto);

export default router; 