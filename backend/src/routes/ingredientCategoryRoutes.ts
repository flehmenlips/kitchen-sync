import express from 'express';
import {
    getIngredientCategories,
    createIngredientCategory,
    getIngredientCategoryById,
    updateIngredientCategory,
    deleteIngredientCategory
} from '../controllers/ingredientCategoryController';

const router = express.Router();

router.route('/')
    .get(getIngredientCategories)
    .post(createIngredientCategory);

router.route('/:id')
    .get(getIngredientCategoryById)
    .put(updateIngredientCategory)
    .delete(deleteIngredientCategory);

export default router; 