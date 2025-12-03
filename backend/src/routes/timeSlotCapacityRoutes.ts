import express from 'express';
import {
  getTimeSlotCapacities,
  getAvailability,
  upsertTimeSlotCapacity,
  bulkUpsertTimeSlotCapacities,
  deleteTimeSlotCapacity
} from '../controllers/timeSlotCapacityController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/:restaurantId')
  .get(getTimeSlotCapacities);

router.route('/:restaurantId/availability')
  .get(getAvailability);

router.route('/')
  .post(upsertTimeSlotCapacity);

router.route('/bulk')
  .post(bulkUpsertTimeSlotCapacities);

router.route('/:id')
  .delete(deleteTimeSlotCapacity);

export default router;

