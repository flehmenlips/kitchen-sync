import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Define dashboard routes
router.route('/stats').get(protect, getDashboardStats);

export default router; 