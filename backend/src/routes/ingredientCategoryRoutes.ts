import express from 'express';
import {
    getIngredientCategories,
    createIngredientCategory,
    getIngredientCategoryById,
    updateIngredientCategory,
    deleteIngredientCategory
} from '../controllers/ingredientCategoryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(protect, getIngredientCategories)
    .post(protect, createIngredientCategory);

router.route('/:id')
    // .get(protect, getIngredientCategoryById) // Optional: Protect if needed
    .put(protect, updateIngredientCategory)
    .delete(protect, deleteIngredientCategory);

export default router; 