import express from 'express';
import {
  getPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  duplicatePage,
  getPublicPageBySlug
} from '../controllers/pageController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/:restaurantSlug/:pageSlug', getPublicPageBySlug);

// Apply auth and restaurant context middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Protected routes (admin only)
router.get('/', getPages);
router.get('/:id', getPageById);
router.post('/', createPage);
router.put('/:id', updatePage);
router.delete('/:id', deletePage);
router.post('/reorder', reorderPages);
router.post('/:id/duplicate', duplicatePage);

export default router; 