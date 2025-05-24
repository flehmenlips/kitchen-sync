import express from 'express';
import { 
  getRestaurantSettings, 
  updateRestaurantSettings,
  uploadRestaurantImage,
  getPublicRestaurantSettings
} from '../controllers/restaurantSettingsController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();

// Configure multer for image uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Admin routes (protected)
router.get('/settings', protect, getRestaurantSettings);
router.put('/settings', protect, updateRestaurantSettings);
router.post('/settings/image/:field', protect, upload.single('image'), uploadRestaurantImage);

// Public routes
router.get('/public/settings', getPublicRestaurantSettings);

export default router; 