import express from 'express';
import {
  getContentBlocks,
  getAllContentBlocks,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  reorderContentBlocks,
  uploadContentBlockImage,
  duplicateContentBlock
} from '../controllers/contentBlockController';
import { protect } from '../middleware/authMiddleware';
const multer = require('multer');

const router = express.Router();

// Configure multer for image uploads
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

// Protected routes (admin only)
router.get('/', protect, getAllContentBlocks); // Get all blocks for admin
router.post('/', protect, createContentBlock);
router.put('/:id', protect, updateContentBlock);
router.delete('/:id', protect, deleteContentBlock);
router.post('/reorder', protect, reorderContentBlocks);
router.post('/:id/upload', protect, upload.single('image'), uploadContentBlockImage);
router.post('/:id/duplicate', protect, duplicateContentBlock);

export default router; 