import express from 'express';
import {
    getUnits,
    createUnit,
    getUnitById,
    updateUnit,
    deleteUnit
} from '../controllers/unitController'; // Using relative path
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Define routes
router.route('/')
    .get(getUnits)
    .post(protect, createUnit);

router.route('/:id')
    .get(getUnitById)
    .put(protect, updateUnit)
    .delete(protect, deleteUnit);

export default router; 