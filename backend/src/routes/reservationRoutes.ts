import express from 'express';
import {
    getReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    getAvailability,
    getDailyCapacity,
    getReservationStats
} from '../controllers/reservationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getReservations)
    .post(createReservation);

router.route('/stats')
    .get(getReservationStats);

router.route('/availability/:restaurantId')
    .get(getAvailability);

router.route('/daily-capacity/:restaurantId')
    .get(getDailyCapacity);

router.route('/:id')
    .get(getReservationById)
    .put(updateReservation)
    .delete(deleteReservation);

export default router; 