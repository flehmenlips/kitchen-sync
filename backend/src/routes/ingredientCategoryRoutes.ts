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
    .get(getIngredientCategories)
    .post(protect, createIngredientCategory);

router.route('/:id')
    // .get(getIngredientCategoryById) // Keep optional GET public for now?
    .put(protect, updateIngredientCategory)
    .delete(protect, deleteIngredientCategory);

export default router; 