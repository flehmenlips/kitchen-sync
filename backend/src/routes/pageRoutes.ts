import express from 'express';
import {
  getPages,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  duplicatePage
} from '../controllers/pageController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes (admin only)
router.get('/', protect, getPages);
router.post('/', protect, createPage);
router.put('/:id', protect, updatePage);
router.delete('/:id', protect, deletePage);
router.post('/reorder', protect, reorderPages);
router.post('/:id/duplicate', protect, duplicatePage);

export default router; 