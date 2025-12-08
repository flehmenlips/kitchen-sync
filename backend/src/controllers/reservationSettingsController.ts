import { Request, Response } from 'express';
import prisma from '../config/db';

// Helper function to validate operating hours JSON structure
const validateOperatingHours = (hours: any): boolean => {
  if (!hours || typeof hours !== 'object') return false;
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  for (const day of days) {
    if (hours[day]) {
      const dayHours = hours[day];
      if (dayHours.closed === true) continue;
      
      if (!dayHours.open || !dayHours.close) return false;
      if (!timeRegex.test(dayHours.open) || !timeRegex.test(dayHours.close)) return false;
      
      // Validate that close time is after open time (handles midnight crossing)
      const [openHour, openMin] = dayHours.open.split(':').map(Number);
      const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
      const openMinutes = openHour * 60 + openMin;
      let closeMinutes = closeHour * 60 + closeMin;
      
      // FIXED: Handle midnight crossing - if close time is earlier than open time,
      // it means the close time is the next day (e.g., 20:00 to 02:00)
      // Add 24 hours (1440 minutes) to close time for comparison
      if (closeMinutes <= openMinutes) {
        closeMinutes += 1440; // Add 24 hours for midnight crossing
      }
      
      // Validate that the duration is reasonable (not more than 24 hours)
      if (closeMinutes - openMinutes > 1440) {
        return false; // More than 24 hours is invalid
      }
    }
  }
  
  return true;
};

// @desc    Get reservation settings for a restaurant
// @route   GET /api/reservation-settings/:restaurantId
// @access  Private
export const getReservationSettings = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    if (isNaN(restaurantId)) {
      res.status(400).json({ message: 'Invalid restaurant ID' });
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

    let settings = await prisma.reservationSettings.findUnique({
      where: { restaurantId }
    });

    // If no settings exist, create default settings
    if (!settings) {
      const defaultOperatingHours = {
        sunday: { closed: true },
        monday: { open: '17:00', close: '22:00', closed: false },
        tuesday: { open: '17:00', close: '22:00', closed: false },
        wednesday: { open: '17:00', close: '22:00', closed: false },
        thursday: { open: '17:00', close: '22:00', closed: false },
        friday: { open: '17:00', close: '22:00', closed: false },
        saturday: { open: '17:00', close: '22:00', closed: false }
      };

      settings = await prisma.reservationSettings.create({
        data: {
          restaurantId,
          operatingHours: defaultOperatingHours
        }
      });
    }

    res.status(200).json(settings);
  } catch (error: any) {
    console.error('Error fetching reservation settings:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error fetching reservation settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create or update reservation settings
// @route   POST /api/reservation-settings
// @access  Private
export const upsertReservationSettings = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const {
      restaurantId,
      operatingHours,
      minPartySize,
      maxPartySize,
      defaultDuration,
      advanceBookingDays,
      minAdvanceHours,
      timeSlotInterval,
      seatingIntervals,
      maxCoversPerSlot,
      maxCoversPerDay,
      allowOverbooking,
      overbookingPercentage,
      cancellationPolicy,
      cancellationHours,
      requireCreditCard,
      requireDeposit,
      depositAmount,
      autoConfirm,
      sendConfirmation,
      sendReminder,
      reminderHours
    } = req.body;

    if (!restaurantId) {
      res.status(400).json({ message: 'Restaurant ID is required' });
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

    // Validate operating hours if provided
    if (operatingHours && !validateOperatingHours(operatingHours)) {
      res.status(400).json({ message: 'Invalid operating hours format' });
      return;
    }

    // Validate time slot interval
    if (timeSlotInterval !== undefined && ![15, 30, 60].includes(timeSlotInterval)) {
      res.status(400).json({ message: 'Time slot interval must be 15, 30, or 60 minutes' });
      return;
    }

    // FIXED: Validate party size limits against existing settings for partial updates
    // Get existing settings to validate against current values
    const existingSettings = await prisma.reservationSettings.findUnique({
      where: { restaurantId: parseInt(restaurantId) }
    });

    // Parse provided values and validate they are numbers
    const parsedMinPartySize = minPartySize !== undefined ? parseInt(minPartySize) : undefined;
    const parsedMaxPartySize = maxPartySize !== undefined ? parseInt(maxPartySize) : undefined;

    // Validate that parsed values are valid numbers (not NaN and > 0)
    if (minPartySize !== undefined) {
      if (isNaN(parsedMinPartySize!) || parsedMinPartySize! < 1) {
        res.status(400).json({ message: 'Minimum party size must be a valid number greater than 0' });
        return;
      }
    }

    if (maxPartySize !== undefined) {
      if (isNaN(parsedMaxPartySize!) || parsedMaxPartySize! < 1) {
        res.status(400).json({ message: 'Maximum party size must be a valid number greater than 0' });
        return;
      }
    }

    // Validate party size constraints (check against final values: provided or existing)
    const finalMinPartySize = parsedMinPartySize !== undefined ? parsedMinPartySize : existingSettings?.minPartySize;
    const finalMaxPartySize = parsedMaxPartySize !== undefined ? parsedMaxPartySize : existingSettings?.maxPartySize;

    if (finalMinPartySize !== undefined && finalMaxPartySize !== undefined && finalMinPartySize > finalMaxPartySize) {
      res.status(400).json({ 
        message: `Minimum party size (${finalMinPartySize}) cannot be greater than maximum party size (${finalMaxPartySize})` 
      });
      return;
    }

    // Build update data object
    const updateData: any = {};
    
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
    if (parsedMinPartySize !== undefined) updateData.minPartySize = parsedMinPartySize;
    if (parsedMaxPartySize !== undefined) updateData.maxPartySize = parsedMaxPartySize;
    if (defaultDuration !== undefined) updateData.defaultDuration = defaultDuration;
    if (advanceBookingDays !== undefined) updateData.advanceBookingDays = advanceBookingDays;
    if (minAdvanceHours !== undefined) updateData.minAdvanceHours = minAdvanceHours;
    if (timeSlotInterval !== undefined) updateData.timeSlotInterval = timeSlotInterval;
    if (seatingIntervals !== undefined) updateData.seatingIntervals = seatingIntervals;
    if (maxCoversPerSlot !== undefined) {
      // Allow null, empty string, or 0 to clear the value
      if (maxCoversPerSlot === null || maxCoversPerSlot === '' || maxCoversPerSlot === 0) {
        updateData.maxCoversPerSlot = null;
      } else {
        // Validate positive values
        const parsedMaxCoversPerSlot = parseInt(maxCoversPerSlot);
        if (isNaN(parsedMaxCoversPerSlot) || parsedMaxCoversPerSlot < 1) {
          res.status(400).json({ message: 'Max covers per slot must be a valid number greater than 0' });
          return;
        }
        updateData.maxCoversPerSlot = parsedMaxCoversPerSlot;
      }
    }
    if (maxCoversPerDay !== undefined) {
      // Allow null, empty string, or 0 to clear the value
      if (maxCoversPerDay === null || maxCoversPerDay === '' || maxCoversPerDay === 0) {
        updateData.maxCoversPerDay = null;
      } else {
        // Validate positive values
        const parsedMaxCoversPerDay = parseInt(maxCoversPerDay);
        if (isNaN(parsedMaxCoversPerDay) || parsedMaxCoversPerDay < 1) {
          res.status(400).json({ message: 'Max covers per day must be a valid number greater than 0' });
          return;
        }
        updateData.maxCoversPerDay = parsedMaxCoversPerDay;
      }
    }
    if (allowOverbooking !== undefined) updateData.allowOverbooking = allowOverbooking;
    if (overbookingPercentage !== undefined) updateData.overbookingPercentage = overbookingPercentage;
    if (cancellationPolicy !== undefined) updateData.cancellationPolicy = cancellationPolicy;
    if (cancellationHours !== undefined) updateData.cancellationHours = cancellationHours;
    if (requireCreditCard !== undefined) updateData.requireCreditCard = requireCreditCard;
    if (requireDeposit !== undefined) updateData.requireDeposit = requireDeposit;
    if (depositAmount !== undefined) updateData.depositAmount = depositAmount;
    if (autoConfirm !== undefined) updateData.autoConfirm = autoConfirm;
    if (sendConfirmation !== undefined) updateData.sendConfirmation = sendConfirmation;
    if (sendReminder !== undefined) updateData.sendReminder = sendReminder;
    if (reminderHours !== undefined) updateData.reminderHours = reminderHours;

    // Filter out undefined values from updateData for create operation
    const createData: any = {
      restaurantId: parseInt(restaurantId),
      operatingHours: operatingHours || {
        sunday: { closed: true },
        monday: { open: '17:00', close: '22:00', closed: false },
        tuesday: { open: '17:00', close: '22:00', closed: false },
        wednesday: { open: '17:00', close: '22:00', closed: false },
        thursday: { open: '17:00', close: '22:00', closed: false },
        friday: { open: '17:00', close: '22:00', closed: false },
        saturday: { open: '17:00', close: '22:00', closed: false }
      }
    };
    
    // Only include defined values in createData
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        createData[key] = updateData[key];
      }
    });

    const settings = await prisma.reservationSettings.upsert({
      where: { restaurantId: parseInt(restaurantId) },
      update: updateData,
      create: createData
    });

    res.status(200).json(settings);
  } catch (error: any) {
    console.error('Error saving reservation settings:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error saving reservation settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

