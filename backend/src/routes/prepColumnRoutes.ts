import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';
import {
    getPrepColumns,
    createPrepColumn,
    updatePrepColumn,
    deletePrepColumn,
    reorderPrepColumns,
} from '../controllers/prepColumnController';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log(`[PrepColumnRoutes] ${req.method} ${req.originalUrl}`, {
        params: req.params,
        query: req.query,
        body: req.body
    });
    next();
});

// Apply auth and restaurant context middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

router.route('/')
    .get(getPrepColumns)
    .post(createPrepColumn);

router.put('/reorder', reorderPrepColumns);

router.route('/:id')
    .put(updatePrepColumn)
    .delete(deletePrepColumn);

export default router; 