import express from 'express';
import { protect } from '../middleware/authMiddleware';
import * as menuController from '../controllers/menuController';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

// Get all menus
router.get('/', protect, menuController.getMenus);

// Get a menu by ID
router.get('/:id', protect, menuController.getMenuById);

// Create a new menu
router.post('/', protect, menuController.createMenu);

// Update a menu
router.put('/:id', protect, menuController.updateMenu);

// Delete a menu
router.delete('/:id', protect, menuController.deleteMenu);

// Archive a menu
router.put('/:id/archive', protect, menuController.archiveMenu);

// Duplicate a menu
router.post('/:id/duplicate', protect, menuController.duplicateMenu);

// Upload a logo for a menu
router.post('/:id/logo', protect, upload.single('logo'), menuController.uploadMenuLogo);

export default router; 