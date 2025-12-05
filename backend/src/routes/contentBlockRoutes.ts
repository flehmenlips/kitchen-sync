import express from 'express';
import {
  getContentBlocks,
  getAllContentBlocks,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  reorderContentBlocks,
  uploadContentBlockImage,
  duplicateContentBlock,
  debugContentBlocks
} from '../controllers/contentBlockController';
import { protect } from '../middleware/authMiddleware';
import multer from 'multer';

const router = express.Router();

// Configure multer for image uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes
router.get('/public', getContentBlocks); // Get blocks for a specific page
router.get('/debug', debugContentBlocks); // Debug endpoint

// Protected routes (admin only)
router.get('/', protect, getAllContentBlocks); // Get all blocks for admin
router.post('/', protect, createContentBlock);
router.put('/:id', protect, updateContentBlock);
router.delete('/:id', protect, deleteContentBlock);
router.post('/reorder', protect, reorderContentBlocks);
router.post('/:id/upload', protect, upload.single('image'), uploadContentBlockImage);
router.post('/:id/duplicate', protect, duplicateContentBlock);

export default router; 