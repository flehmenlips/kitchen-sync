import express from 'express';
import { restaurantTemplateController } from '../controllers/restaurantTemplateController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// Get all active restaurant templates (public)
router.get('/', restaurantTemplateController.getActiveTemplates);

// Get template categories
router.get('/categories', restaurantTemplateController.getTemplateCategories);

// Get templates by category
router.get('/category/:category', restaurantTemplateController.getTemplatesByCategory);

// Get template recommendations for restaurant (requires auth)
router.get('/recommendations', 
  protect, 
  setRestaurantContext, 
  requireRestaurantContext, 
  restaurantTemplateController.getRecommendedTemplates
);

// Get single template by ID
router.get('/:id', restaurantTemplateController.getTemplate);

// Apply template to restaurant (requires auth)
router.post('/:id/apply', 
  protect, 
  setRestaurantContext, 
  requireRestaurantContext, 
  restaurantTemplateController.applyTemplate
);

// Generate template preview URL (requires auth)
router.post('/:id/preview', 
  protect, 
  setRestaurantContext, 
  requireRestaurantContext, 
  restaurantTemplateController.previewTemplate
);

// Admin endpoint to seed templates
router.post('/admin/seed', 
  protect, 
  restaurantTemplateController.seedTemplates
);

export default router; 