import express from 'express';
import { protect } from '../middleware/authMiddleware';
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

router.use(protect);

router.route('/')
    .get(getPrepColumns)
    .post(createPrepColumn);

router.put('/reorder', reorderPrepColumns);

router.route('/:id')
    .put(updatePrepColumn)
    .delete(deletePrepColumn);

export default router; 