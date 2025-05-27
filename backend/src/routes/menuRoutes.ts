import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';
import * as menuController from '../controllers/menuController';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Apply auth and restaurant context middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Get all menus
router.get('/', menuController.getMenus);

// Get a menu by ID
router.get('/:id', menuController.getMenuById);

// Create a new menu
router.post('/', menuController.createMenu);

// Update a menu
router.put('/:id', menuController.updateMenu);

// Delete a menu
router.delete('/:id', menuController.deleteMenu);

// Archive a menu
router.put('/:id/archive', menuController.archiveMenu);

// Duplicate a menu
router.post('/:id/duplicate', menuController.duplicateMenu);

// Upload a logo for a menu
router.post('/:id/logo', upload.single('logo'), menuController.uploadMenuLogo);

export default router; 