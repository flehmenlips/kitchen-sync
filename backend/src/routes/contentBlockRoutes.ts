import express from 'express';
import {
  getContentBlocksByPage,
  getContentBlockById,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  reorderContentBlocks,
  publishContentBlock,
  unpublishContentBlock,
  getPublicContentBlocks
} from '../controllers/contentBlockController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/:restaurantSlug/:page', getPublicContentBlocks);

// Protected routes (require authentication)
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Content block CRUD operations
router.get('/page/:page', getContentBlocksByPage);
router.get('/:id', getContentBlockById);
router.post('/', createContentBlock);
router.put('/:id', updateContentBlock);
router.delete('/:id', deleteContentBlock);

// Special operations
router.put('/reorder', reorderContentBlocks);
router.put('/:id/publish', publishContentBlock);
router.put('/:id/unpublish', unpublishContentBlock);

export default router; 