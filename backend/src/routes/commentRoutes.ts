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

// Comment routes - now properly nested under :issueId/comments
router.route('/:issueId/comments')
    .post(addComment);

router.route('/:issueId/comments/:id')
    .put(updateComment)
    .delete(deleteComment);

export default router; 