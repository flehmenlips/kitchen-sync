import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    getPrepTasks,
    createPrepTask,
    updatePrepTask,
    deletePrepTask
} from '../controllers/prepTaskController';

const router = express.Router();

router.use(protect); // All prep task routes require authentication

router.route('/')
    .get(getPrepTasks)
    .post(createPrepTask);

router.route('/:id')
    .put(updatePrepTask)
    .delete(deletePrepTask);

export default router; 