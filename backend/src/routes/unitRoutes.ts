import express from 'express';
import {
    getUnits,
    createUnit,
    getUnitById,
    updateUnit,
    deleteUnit
} from '../controllers/unitController'; // Using relative path
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';

const router = express.Router();

// Apply auth and restaurant context middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

// Define routes
router.route('/')
    .get(getUnits)
    .post(createUnit);

router.route('/:id')
    .get(getUnitById)
    .put(updateUnit)
    .delete(deleteUnit);

export default router; 