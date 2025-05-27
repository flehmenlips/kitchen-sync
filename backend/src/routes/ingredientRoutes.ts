import express from 'express';
import {
    getIngredients,
    createIngredient,
    getIngredientById,
    updateIngredient,
    deleteIngredient
} from '../controllers/ingredientController'; // Using relative path
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// Apply auth and restaurant context middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Define routes
router.route('/')
    .get(getIngredients)
    .post(createIngredient);

router.route('/:id')
    .get(getIngredientById)
    .put(updateIngredient)
    .delete(deleteIngredient);

export default router; 