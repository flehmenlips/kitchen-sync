import express from 'express';
import {
    getIngredients,
    createIngredient,
    getIngredientById,
    updateIngredient,
    deleteIngredient
} from '../controllers/ingredientController'; // Using relative path

const router = express.Router();

// Define routes
router.route('/')
    .get(getIngredients)
    .post(createIngredient);

router.route('/:id')
    .get(getIngredientById)
    .put(updateIngredient)
    .delete(deleteIngredient);

export default router; 