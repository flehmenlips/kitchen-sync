import { Router, Request, Response } from 'express';
import { customerReservationController } from '../controllers/customerReservationController';
import { authenticateCustomer } from '../middleware/authenticateCustomer';

const router = Router();

// All routes require customer authentication
router.use(authenticateCustomer);

// Get customer's reservations
router.get('/', async (req: Request, res: Response) => {
  await customerReservationController.getMyReservations(req as any, res);
});

// Get a specific reservation
router.get('/:id', async (req: Request, res: Response) => {
  await customerReservationController.getReservation(req as any, res);
});

// Create a new reservation
router.post('/', async (req: Request, res: Response) => {
  await customerReservationController.createReservation(req as any, res);
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