import { Router } from 'express';
import { templateController } from '../controllers/templateController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = Router();

// All template routes require authentication and restaurant context
router.use(protect);
router.use(setRestaurantContext);

// Get all active templates
router.get('/active', templateController.getTemplates);

// Get all active templates
router.get('/', templateController.getTemplates);

// Get templates by category
router.get('/category/:category', templateController.getTemplatesByCategory);

// Get template by ID
router.get('/:id', templateController.getTemplate);

// Get template by name
router.get('/name/:name', templateController.getTemplateByName);

// Apply template to restaurant (requires restaurant context)
router.post('/:id/apply', requireRestaurantContext, templateController.applyTemplate);

// Preview template (requires restaurant context)
router.post('/:id/preview', requireRestaurantContext, templateController.previewTemplate);

export default router; 