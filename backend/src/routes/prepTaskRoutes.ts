import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { setRestaurantContext, requireRestaurantContext } from '../middleware/restaurantContext';
import {
    getPrepTasks,
    createPrepTask,
    updatePrepTask,
    deletePrepTask,
    reorderPrepTasks
} from '../controllers/prepTaskController';

const router = express.Router();

// Apply auth and restaurant context middleware to all routes
router.use(protect);
router.use(setRestaurantContext);
router.use(requireRestaurantContext);

router.route('/')
    .get(getPrepTasks)
    .post(createPrepTask);

router.put('/reorder', reorderPrepTasks);

router.route('/:id')
    .put(updatePrepTask)
    .delete(deletePrepTask);

export default router; 