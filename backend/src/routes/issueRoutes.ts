import express from 'express';
import {
    getIssues,
    getIssueById,
    createIssue,
    updateIssue,
    deleteIssue
} from '../controllers/issueController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

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

export default router; 