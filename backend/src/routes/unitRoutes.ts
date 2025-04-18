import express from 'express';
import {
    getUnits,
    createUnit,
    getUnitById,
    updateUnit,
    deleteUnit
} from '../controllers/unitController'; // Using relative path

const router = express.Router();

// Define routes
router.route('/')
    .get(getUnits)
    .post(createUnit);

router.route('/:id')
    .get(getUnitById)
    .put(updateUnit)
    .delete(deleteUnit);

export default router; 