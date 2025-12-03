import express from 'express';
import {
  getReservationSettings,
  upsertReservationSettings
} from '../controllers/reservationSettingsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/:restaurantId')
  .get(getReservationSettings);

router.route('/')
  .post(upsertReservationSettings);

export default router;

