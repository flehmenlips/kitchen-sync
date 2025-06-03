import express from 'express';
import { 
  getRestaurantSettings, 
  updateRestaurantSettings,
  uploadRestaurantImage,
  getPublicRestaurantSettings
} from '../controllers/restaurantSettingsController';
import { getPublicMenusBySlug } from '../controllers/menuController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';
const multer = require('multer');

const router = express.Router();

// Configure multer for image uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Admin routes (protected) - require restaurant context
router.get('/settings', protect, setRestaurantContext, requireRestaurantContext, getRestaurantSettings);
router.put('/settings', protect, setRestaurantContext, requireRestaurantContext, updateRestaurantSettings);
router.post('/settings/image/:field', protect, setRestaurantContext, requireRestaurantContext, upload.single('image'), uploadRestaurantImage);

// Public routes
router.get('/public/settings', getPublicRestaurantSettings);
router.get('/public/slug/:slug/settings', getPublicRestaurantSettings);
router.get('/public/slug/:slug/menus', getPublicMenusBySlug);

export default router; 