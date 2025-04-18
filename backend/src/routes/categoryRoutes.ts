import express from 'express';
import {
    getCategories,
    createCategory,
    getCategoryById,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController';

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(createCategory);

router.route('/:id')
    .get(getCategoryById) // Optional but included
    .put(updateCategory)
    .delete(deleteCategory);

export default router; 