import express from 'express';
import {
    getCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// Apply auth and restaurant context middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

router.route('/')
    .get(getCategories)
    .post(createCategory);

router.route('/:id')
    .get(getCategoryById)
    .put(updateCategory)
    .delete(deleteCategory);

export default router; 