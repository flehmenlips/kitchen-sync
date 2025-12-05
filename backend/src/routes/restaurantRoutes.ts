import express from 'express';
import { createRestaurant } from '../controllers/restaurantController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Create restaurant for logged-in user
router.post('/', protect, createRestaurant);

export default router;

