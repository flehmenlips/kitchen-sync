import express from 'express';
import { 
  getAssets, 
  uploadAsset, 
  deleteAsset, 
  updateAsset,
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  trackAssetUsage,
  getAssetAnalytics,
  upload,
  importAllCloudinaryAssets
} from '../controllers/assetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Main asset routes
router.get('/restaurants/:restaurantId/assets', getAssets);
router.post('/restaurants/:restaurantId/assets/upload', upload.single('file'), uploadAsset);
router.put('/restaurants/:restaurantId/assets/:id', updateAsset);
router.delete('/restaurants/:restaurantId/assets/:id', deleteAsset);

// Import ALL Cloudinary assets (historical/full import)
router.post('/restaurants/:restaurantId/import', importAllCloudinaryAssets);
router.post('/restaurants/:restaurantId/import-all', importAllCloudinaryAssets);

// Folder management routes
router.get('/restaurants/:restaurantId/folders', getFolders);
router.post('/restaurants/:restaurantId/folders', createFolder);
router.put('/restaurants/:restaurantId/folders/:id', updateFolder);
router.delete('/restaurants/:restaurantId/folders/:id', deleteFolder);

// Usage tracking routes
router.post('/restaurants/:restaurantId/assets/:id/track-usage', trackAssetUsage);

// Analytics routes
router.get('/restaurants/:restaurantId/assets/analytics', getAssetAnalytics);

export default router; 