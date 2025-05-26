import { Router } from 'express';
import { customerReservationController } from '../controllers/customerReservationController';
import { authenticateCustomer } from '../middleware/authenticateCustomer';

const router = Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// Get customer's reservations
router.get('/', customerReservationController.getMyReservations);

// Get a specific reservation
router.get('/:id', customerReservationController.getReservation);

// Create a new reservation
router.post('/', customerReservationController.createReservation);

// Update a reservation
router.put('/:id', customerReservationController.updateReservation);

// Cancel a reservation
router.put('/:id/cancel', customerReservationController.cancelReservation);

export default router; 