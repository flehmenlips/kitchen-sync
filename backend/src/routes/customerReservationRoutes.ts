import { Router, Request, Response } from 'express';
import { customerReservationController, getPublicDailyCapacity } from '../controllers/customerReservationController';
import { authenticateCustomer } from '../middleware/authenticateCustomer';
import { reservationLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public route - get daily capacity (no auth required)
router.get('/daily-capacity', getPublicDailyCapacity);

// All routes below require customer authentication
router.use(authenticateCustomer);

// Create a new reservation (requires authentication + email verification + rate limiting)
router.post('/', reservationLimiter, async (req: Request, res: Response) => {
  await customerReservationController.createReservation(req as any, res);
});

// Get customer's reservations
router.get('/', async (req: Request, res: Response) => {
  await customerReservationController.getMyReservations(req as any, res);
});

// Get a specific reservation
router.get('/:id', async (req: Request, res: Response) => {
  await customerReservationController.getReservation(req as any, res);
});

// Update a reservation
router.put('/:id', async (req: Request, res: Response) => {
  await customerReservationController.updateReservation(req as any, res);
});

// Cancel a reservation
router.put('/:id/cancel', async (req: Request, res: Response) => {
  await customerReservationController.cancelReservation(req as any, res);
});

export default router; 