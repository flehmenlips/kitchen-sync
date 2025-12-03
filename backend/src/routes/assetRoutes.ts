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
  importAllCloudinaryAssets,
  testAssetApi,
  bulkDelete,
  bulkMove,
  bulkTag,
  migrateAssetsToStandardStructure
} from '../controllers/assetController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Test endpoint (should be first for debugging)
router.get('/restaurants/:restaurantId/test', testAssetApi);

// Main asset routes
router.get('/restaurants/:restaurantId/assets', getAssets);
router.post('/restaurants/:restaurantId/assets', upload.single('file'), uploadAsset);
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

// Bulk operations routes
router.post('/restaurants/:restaurantId/bulk/delete', bulkDelete);
router.post('/restaurants/:restaurantId/bulk/move', bulkMove);
router.post('/restaurants/:restaurantId/bulk/tag', bulkTag);

// Migration route
router.post('/restaurants/:restaurantId/migrate-folder-structure', migrateAssetsToStandardStructure);

export default router; 