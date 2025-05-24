import express from 'express';
import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    updateOrderItemStatus,
    deleteOrder
} from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrderById)
    .delete(deleteOrder);

router.route('/:id/status')
    .put(updateOrderStatus);

router.route('/:orderId/items/:itemId/status')
    .put(updateOrderItemStatus);

export default router; 