import express from 'express';
import {
    getCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(protect, createCategory);

router.route('/:id')
    .get(getCategoryById) // Optional but included
    .put(protect, updateCategory)
    .delete(protect, deleteCategory);

export default router; 