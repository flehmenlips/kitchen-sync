import express from 'express';
import {
    addComment,
    updateComment,
    deleteComment
} from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router({ mergeParams: true }); // Enable access to parent route parameters

// All routes are protected
router.use(protect);

// Comment routes
router.route('/')
    .post(addComment);

router.route('/:id')
    .put(updateComment)
    .delete(deleteComment);

export default router; 