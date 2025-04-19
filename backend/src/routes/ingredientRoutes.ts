import express from 'express';
import {
    getIngredients,
    createIngredient,
    getIngredientById,
    updateIngredient,
    deleteIngredient
} from '../controllers/ingredientController'; // Using relative path
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Define routes
router.route('/')
    .get(protect, getIngredients)
    .post(protect, createIngredient);

router.route('/:id')
    .get(protect, getIngredientById)
    .put(protect, updateIngredient)
    .delete(protect, deleteIngredient);

export default router; 