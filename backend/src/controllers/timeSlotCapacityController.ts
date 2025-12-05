import { Request, Response } from 'express';
import prisma from '../config/db';

// @desc    Get time slot capacities for a restaurant
// @route   GET /api/time-slot-capacity/:restaurantId
// @access  Private
export const getTimeSlotCapacities = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { dayOfWeek, timeSlot } = req.query;
    
    if (isNaN(restaurantId)) {
      res.status(400).json({ message: `Invalid restaurant ID: ${req.params.restaurantId}` });
      return;
    }

    // Verify user has access to this restaurant
    const userRestaurant = await prisma.restaurantStaff.findFirst({
      where: {
        userId: req.user.id,
        restaurantId: restaurantId,
        isActive: true
      }
    });

    if (!userRestaurant) {
      res.status(403).json({ message: 'You do not have access to this restaurant' });
      return;
    }

    // Build where clause - don't filter by isActive so we can show all capacities for management
    const where: any = {
      restaurantId
    };

    if (dayOfWeek !== undefined) {
      const day = parseInt(dayOfWeek as string);
      if (!isNaN(day) && day >= 0 && day <= 6) {
        where.dayOfWeek = day;
      }
    }

    if (timeSlot) {
      where.timeSlot = timeSlot as string;
    }

    const capacities = await prisma.timeSlotCapacity.findMany({
      where,
      orderBy: [
        { dayOfWeek: 'asc' },
        { timeSlot: 'asc' }
      ]
    });

    res.status(200).json(capacities);
  } catch (error: any) {
    console.error('Error fetching time slot capacities:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      meta: error?.meta,
      stack: error?.stack
    });
    
    // Check for common Prisma errors - use optional chaining for safety
    const errorCode = error?.code;
    const errorMessage = error?.message || '';
    
    // P2001: Record not found (but this shouldn't cause issues with findMany)
    // P1001: Can't reach database server
    // P1008: Operations timed out
    // P1017: Server has closed the connection
    if (errorCode === 'P1001' || errorCode === 'P1008' || errorCode === 'P1017') {
      res.status(503).json({ 
        message: 'Database connection error. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
      return;
    }
    
    // Check if table doesn't exist (various error messages)
    if (errorCode === 'P2001' || 
        errorMessage.includes('does not exist') || 
        errorMessage.includes('Unknown table') ||
        errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      res.status(500).json({ 
        message: 'Time slot capacity table does not exist. Please run database migrations.',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        hint: process.env.NODE_ENV === 'development' ? 'Run: npx prisma migrate deploy' : undefined
      });
      return;
    }
    
    // Generic error response
    res.status(500).json({ 
      message: 'Error fetching time slot capacities',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      errorCode: process.env.NODE_ENV === 'development' ? errorCode : undefined
    });
  }
};

// @desc    Get capacity for a specific date and time slot
// @route   GET /api/time-slot-capacity/:restaurantId/availability
// @access  Private
export const getAvailability = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date, timeSlot } = req.query;
    
    if (isNaN(restaurantId)) {
      res.status(400).json({ message: 'Invalid restaurant ID' });
      return;
    }

    if (!date || !timeSlot) {
      res.status(400).json({ message: 'Date and timeSlot are required' });
      return;
    }

    // Verify user has access to this restaurant
    const userRestaurant = await prisma.restaurantStaff.findFirst({
      where: {
        userId: req.user.id,
        restaurantId: restaurantId,
        isActive: true
      }
    });

    if (!userRestaurant) {
      res.status(403).json({ message: 'You do not have access to this restaurant' });
      return;
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Get capacity for this day/time slot
    const capacity = await prisma.timeSlotCapacity.findUnique({
      where: {
        restaurantId_dayOfWeek_timeSlot: {
          restaurantId,
          dayOfWeek,
          timeSlot: timeSlot as string
        }
      }
    });

    // Get all confirmed reservations for this date/time slot
    // FIXED: Use lte (less than or equal) to match reservationCapacityService behavior
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const reservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        reservationTime: timeSlot as string,
        status: 'CONFIRMED'
      }
    });

    const currentBookings = reservations.reduce((sum, res) => sum + res.partySize, 0);
    const maxCapacity = capacity?.maxCovers || null;
    const remaining = maxCapacity !== null ? Math.max(0, maxCapacity - currentBookings) : null;

    res.status(200).json({
      date: date,
      timeSlot: timeSlot,
      maxCapacity,
      currentBookings,
      remaining,
      available: remaining === null || remaining > 0
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Error fetching availability' });
  }
};

// @desc    Create or update time slot capacity
// @route   POST /api/time-slot-capacity
// @access  Private
export const upsertTimeSlotCapacity = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const {
      restaurantId,
      dayOfWeek,
      timeSlot,
      maxCovers,
      isActive
    } = req.body;

    if (!restaurantId || dayOfWeek === undefined || !timeSlot || maxCovers === undefined) {
      res.status(400).json({ message: 'Missing required fields: restaurantId, dayOfWeek, timeSlot, maxCovers' });
      return;
    }

    // FIXED: Parse and validate numeric inputs to catch NaN values
    const dayOfWeekNum = parseInt(dayOfWeek);
    const maxCoversNum = parseInt(maxCovers);

    // Validate dayOfWeek (0-6) and check for NaN
    if (isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6) {
      res.status(400).json({ message: 'dayOfWeek must be a valid number between 0 (Sunday) and 6 (Saturday)' });
      return;
    }

    // Validate timeSlot format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeSlot)) {
      res.status(400).json({ message: 'timeSlot must be in HH:MM format (e.g., "18:00")' });
      return;
    }

    // Validate maxCovers and check for NaN
    if (isNaN(maxCoversNum) || maxCoversNum < 1) {
      res.status(400).json({ message: 'maxCovers must be a valid number greater than 0' });
      return;
    }

    // Verify user has access to this restaurant
    const userRestaurant = await prisma.restaurantStaff.findFirst({
      where: {
        userId: req.user.id,
        restaurantId: parseInt(restaurantId),
        isActive: true
      }
    });

    if (!userRestaurant) {
      res.status(403).json({ message: 'You do not have access to this restaurant' });
      return;
    }

    const capacity = await prisma.timeSlotCapacity.upsert({
      where: {
        restaurantId_dayOfWeek_timeSlot: {
          restaurantId: parseInt(restaurantId),
          dayOfWeek: dayOfWeekNum,
          timeSlot: timeSlot
        }
      },
      update: {
        maxCovers: maxCoversNum,
        isActive: isActive !== undefined ? isActive : true
      },
      create: {
        restaurantId: parseInt(restaurantId),
        dayOfWeek: dayOfWeekNum,
        timeSlot: timeSlot,
        maxCovers: maxCoversNum,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      }
    });

    res.status(200).json(capacity);
  } catch (error) {
    console.error('Error saving time slot capacity:', error);
    res.status(500).json({ message: 'Error saving time slot capacity' });
  }
};

// @desc    Bulk create/update time slot capacities
// @route   POST /api/time-slot-capacity/bulk
// @access  Private
export const bulkUpsertTimeSlotCapacities = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const { restaurantId, capacities } = req.body;

    if (!restaurantId || !Array.isArray(capacities)) {
      res.status(400).json({ message: 'restaurantId and capacities array are required' });
      return;
    }

    // Verify user has access to this restaurant
    const userRestaurant = await prisma.restaurantStaff.findFirst({
      where: {
        userId: req.user.id,
        restaurantId: parseInt(restaurantId),
        isActive: true
      }
    });

    if (!userRestaurant) {
      res.status(403).json({ message: 'You do not have access to this restaurant' });
      return;
    }

    // FIXED: Validate all items first before any database writes to prevent partial updates
    // This ensures atomicity - either all items are valid and saved, or none are saved
    const validatedCapacities = capacities.map((cap: any, index: number) => {
      const { dayOfWeek, timeSlot, maxCovers, isActive } = cap;

      if (dayOfWeek === undefined || !timeSlot || maxCovers === undefined) {
        throw new Error(`Item ${index + 1}: Missing required fields (dayOfWeek, timeSlot, maxCovers)`);
      }

      // Validate dayOfWeek (0-6)
      const dayOfWeekNum = parseInt(dayOfWeek);
      if (isNaN(dayOfWeekNum) || dayOfWeekNum < 0 || dayOfWeekNum > 6) {
        throw new Error(`Item ${index + 1}: Invalid dayOfWeek: ${dayOfWeek}. Must be between 0 (Sunday) and 6 (Saturday)`);
      }

      // Validate timeSlot format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(timeSlot)) {
        throw new Error(`Item ${index + 1}: Invalid timeSlot format: ${timeSlot}. Must be in HH:MM format (e.g., "18:00")`);
      }

      // Validate maxCovers
      const maxCoversNum = parseInt(maxCovers);
      if (isNaN(maxCoversNum) || maxCoversNum < 1) {
        throw new Error(`Item ${index + 1}: Invalid maxCovers: ${maxCovers}. Must be at least 1`);
      }

      return {
        dayOfWeekNum,
        timeSlot,
        maxCoversNum,
        isActive: isActive !== undefined ? isActive : true
      };
    });

    // Only proceed with database writes if all validations pass
    const results = await Promise.all(
      validatedCapacities.map((cap) =>
        prisma.timeSlotCapacity.upsert({
          where: {
            restaurantId_dayOfWeek_timeSlot: {
              restaurantId: parseInt(restaurantId),
              dayOfWeek: cap.dayOfWeekNum,
              timeSlot: cap.timeSlot
            }
          },
          update: {
            maxCovers: cap.maxCoversNum,
            isActive: cap.isActive
          },
          create: {
            restaurantId: parseInt(restaurantId),
            dayOfWeek: cap.dayOfWeekNum,
            timeSlot: cap.timeSlot,
            maxCovers: cap.maxCoversNum,
            isActive: cap.isActive,
            updatedAt: new Date()
          }
        })
      )
    );

    res.status(200).json({ 
      message: `Successfully updated ${results.length} time slot capacities`,
      capacities: results
    });
  } catch (error: any) {
    console.error('Error bulk updating time slot capacities:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      meta: error?.meta,
      stack: error?.stack,
      body: req.body
    });
    
    // FIXED: Return 400 for validation errors with descriptive messages
    if (error.message && (
      error.message.includes('Missing required fields') ||
      error.message.includes('Invalid dayOfWeek') ||
      error.message.includes('Invalid timeSlot') ||
      error.message.includes('Invalid maxCovers')
    )) {
      res.status(400).json({ 
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
      return;
    }
    
    // Check for Prisma unique constraint violations
    if (error?.code === 'P2002') {
      res.status(400).json({ 
        message: 'Duplicate time slot capacity entry. Each restaurant can only have one capacity setting per day/time slot.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
      return;
    }
    
    // Check for foreign key violations
    if (error?.code === 'P2003') {
      res.status(400).json({ 
        message: 'Invalid restaurant ID. The restaurant does not exist.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
      return;
    }
    
    res.status(500).json({ 
      message: 'Error bulk updating time slot capacities',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      errorCode: process.env.NODE_ENV === 'development' ? error?.code : undefined
    });
  }
};

// @desc    Delete time slot capacity
// @route   DELETE /api/time-slot-capacity/:id
// @access  Private
export const deleteTimeSlotCapacity = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid capacity ID' });
      return;
    }

    // Get the capacity to verify restaurant access
    const capacity = await prisma.timeSlotCapacity.findUnique({
      where: { id }
    });

    if (!capacity) {
      res.status(404).json({ message: 'Time slot capacity not found' });
      return;
    }

    // Verify user has access to this restaurant
    const userRestaurant = await prisma.restaurantStaff.findFirst({
      where: {
        userId: req.user.id,
        restaurantId: capacity.restaurantId,
        isActive: true
      }
    });

    if (!userRestaurant) {
      res.status(403).json({ message: 'You do not have access to this restaurant' });
      return;
    }

    await prisma.timeSlotCapacity.delete({
      where: { id }
    });

    res.status(200).json({ message: 'Time slot capacity deleted successfully' });
  } catch (error) {
    console.error('Error deleting time slot capacity:', error);
    res.status(500).json({ message: 'Error deleting time slot capacity' });
  }
};

