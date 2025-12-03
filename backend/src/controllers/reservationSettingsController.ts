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
      
      // Validate that close time is after open time
      const [openHour, openMin] = dayHours.open.split(':').map(Number);
      const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;
      
      if (closeMinutes <= openMinutes) return false;
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
  } catch (error) {
    console.error('Error fetching reservation settings:', error);
    res.status(500).json({ message: 'Error fetching reservation settings' });
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
    if (maxCoversPerSlot !== undefined) updateData.maxCoversPerSlot = maxCoversPerSlot;
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

    const settings = await prisma.reservationSettings.upsert({
      where: { restaurantId: parseInt(restaurantId) },
      update: updateData,
      create: {
        restaurantId: parseInt(restaurantId),
        operatingHours: operatingHours || {
          sunday: { closed: true },
          monday: { open: '17:00', close: '22:00', closed: false },
          tuesday: { open: '17:00', close: '22:00', closed: false },
          wednesday: { open: '17:00', close: '22:00', closed: false },
          thursday: { open: '17:00', close: '22:00', closed: false },
          friday: { open: '17:00', close: '22:00', closed: false },
          saturday: { open: '17:00', close: '22:00', closed: false }
        },
        ...updateData
      }
    });

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error saving reservation settings:', error);
    res.status(500).json({ message: 'Error saving reservation settings' });
  }
};

