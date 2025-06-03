import express from 'express';
import {
    getIssues,
    getIssueById,
    createIssue,
    updateIssue,
    deleteIssue
} from '../controllers/issueController';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext } from '../middleware/restaurantContext';
import commentRoutes from './commentRoutes';

const router = express.Router();

// Apply restaurant context to all issue routes
router.use(setRestaurantContext);

// All routes are protected
router.use(protect);

// Base routes
router.route('/')
    .get(getIssues)
    .post(createIssue);

// Individual issue routes
router.route('/:id')
    .get(getIssueById)
    .put(updateIssue)
    .delete(deleteIssue);

// Mount comment routes under /:issueId/comments
router.use('/:issueId/comments', commentRoutes);

export default router; 