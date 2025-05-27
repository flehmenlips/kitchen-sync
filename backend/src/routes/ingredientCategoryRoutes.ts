import express from 'express';
import {
    getIngredientCategories,
    createIngredientCategory,
    getIngredientCategoryById,
    updateIngredientCategory,
    deleteIngredientCategory
} from '../controllers/ingredientCategoryController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// Apply auth and restaurant context middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

router.route('/')
    .get(getIngredientCategories)
    .post(createIngredientCategory);

router.route('/:id')
    .get(getIngredientCategoryById)
    .put(updateIngredientCategory)
    .delete(deleteIngredientCategory);

export default router; 