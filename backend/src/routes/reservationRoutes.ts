import express from 'express';
import {
    getReservations,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation
} from '../controllers/reservationController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getReservations)
    .post(createReservation);

router.route('/:id')
    .get(getReservationById)
    .put(updateReservation)
    .delete(deleteReservation);

export default router; 