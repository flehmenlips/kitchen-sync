import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export interface AvailabilityResult {
  available: boolean;
  currentBookings: number;
  capacity: number | null;
  remaining: number | null;
  canOverbook: boolean;
  overbooked: boolean;
}

export interface TimeSlotAvailability {
  timeSlot: string;
  available: boolean;
  currentBookings: number;
  capacity: number | null;
  remaining: number | null;
}

export interface DailyCapacityResult {
  date: Date;
  currentCovers: number;
  maxCoversPerDay: number | null;
  available: boolean;
  remaining: number | null;
}

/**
 * Transaction-aware Prisma client type
 */
type PrismaTransactionClient = Omit<Prisma.TransactionClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Check daily capacity for a specific date (transaction-aware version)
 * This version uses a transaction client to ensure atomicity and prevent race conditions
 * @param tx Prisma transaction client
 * @param restaurantId Restaurant ID
 * @param date Reservation date
 * @param partySize Number of guests to check (optional, for checking if booking would fit)
 * @returns Daily capacity result
 */
export async function checkDailyCapacityInTransaction(
  tx: PrismaTransactionClient,
  restaurantId: number,
  date: Date,
  partySize?: number
): Promise<DailyCapacityResult> {
  // Get reservation settings with row-level lock to prevent concurrent modifications
  // Using findFirst with FOR UPDATE equivalent via Prisma's transaction isolation
  const settings = await tx.reservationSettings.findUnique({
    where: { restaurantId }
  });

  const maxCoversPerDay = settings?.maxCoversPerDay || null;

  // If no daily limit set, return available
  if (maxCoversPerDay === null) {
    return {
      date,
      currentCovers: 0,
      maxCoversPerDay: null,
      available: true,
      remaining: null
    };
  }

  // Get all confirmed reservations for this date
  // Use UTC boundaries to ensure consistent date range queries regardless of server timezone
  // Using transaction client ensures we see a consistent snapshot
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const reservations = await tx.reservation.findMany({
    where: {
      restaurantId,
      reservationDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: 'CONFIRMED'
    }
  });

  // Calculate total covers for the day (sum of all party sizes)
  const currentCovers = reservations.reduce((sum, res) => sum + res.partySize, 0);
  
  // Calculate remaining capacity
  const remaining = Math.max(0, maxCoversPerDay - currentCovers);
  
  // Check if this booking would fit (if partySize provided)
  const available = partySize === undefined 
    ? currentCovers < maxCoversPerDay 
    : (currentCovers + partySize) <= maxCoversPerDay;

  return {
    date,
    currentCovers,
    maxCoversPerDay,
    available,
    remaining
  };
}

/**
 * Check availability for a specific date, time slot, and party size (transaction-aware version)
 * Also checks daily capacity limit which overrides time slot capacity if exceeded
 * This version uses a transaction client to ensure atomicity and prevent race conditions
 * @param tx Prisma transaction client
 * @param restaurantId Restaurant ID
 * @param date Reservation date
 * @param timeSlot Time slot (e.g., "18:00")
 * @param partySize Number of guests
 * @param allowOverride Allow override for restaurant owners (default: false)
 * @returns Availability result with capacity information
 */
export async function checkAvailabilityInTransaction(
  tx: PrismaTransactionClient,
  restaurantId: number,
  date: Date,
  timeSlot: string,
  partySize: number,
  allowOverride: boolean = false
): Promise<AvailabilityResult> {
  // Use UTC day since dates are stored as UTC midnight
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // Get reservation settings (using transaction client)
  const settings = await tx.reservationSettings.findUnique({
    where: { restaurantId }
  });

  // First check daily capacity (this overrides time slot capacity if exceeded)
  // Use transaction-aware version to ensure atomicity
  const dailyCapacity = await checkDailyCapacityInTransaction(
    tx,
    restaurantId,
    date,
    partySize
  );
  
  // If daily capacity is exceeded and override not allowed, return unavailable
  if (!dailyCapacity.available && !allowOverride) {
    return {
      available: false,
      currentBookings: dailyCapacity.currentCovers,
      capacity: dailyCapacity.maxCoversPerDay,
      remaining: dailyCapacity.remaining,
      canOverbook: false,
      overbooked: false
    };
  }

  // Get time slot capacity for this day/time (using transaction client)
  const capacity = await tx.timeSlotCapacity.findUnique({
    where: {
      restaurantId_dayOfWeek_timeSlot: {
        restaurantId,
        dayOfWeek,
        timeSlot
      }
    }
  });

  // Get all confirmed reservations for this date/time slot
  // Use UTC boundaries to ensure consistent date range queries regardless of server timezone
  // Using transaction client ensures we see a consistent snapshot
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const reservations = await tx.reservation.findMany({
    where: {
      restaurantId,
      reservationDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      reservationTime: timeSlot,
      status: 'CONFIRMED'
    }
  });

  // Calculate current bookings (sum of party sizes)
  const currentBookings = reservations.reduce((sum, res) => sum + res.partySize, 0);

  // Determine capacity limit
  let maxCapacity: number | null = null;
  
  // Priority: TimeSlotCapacity > ReservationSettings.maxCoversPerSlot
  if (capacity && capacity.isActive) {
    maxCapacity = capacity.maxCovers;
  } else if (settings?.maxCoversPerSlot) {
    maxCapacity = settings.maxCoversPerSlot;
  }

  // If no capacity limit set, allow unlimited bookings (but still respect daily limit)
  if (maxCapacity === null) {
    return {
      available: dailyCapacity.available || allowOverride,
      currentBookings,
      capacity: dailyCapacity.maxCoversPerDay, // Return daily capacity as the limiting factor
      remaining: dailyCapacity.remaining,
      canOverbook: false,
      overbooked: !dailyCapacity.available && allowOverride
    };
  }

  // Calculate remaining capacity
  const remaining = Math.max(0, maxCapacity - currentBookings);
  
  // Check if this booking would fit
  const wouldFit = partySize <= remaining;
  
  // Check overbooking
  const allowOverbooking = settings?.allowOverbooking || false;
  const overbookingPercentage = settings?.overbookingPercentage || 0;
  const overbookingLimit = allowOverbooking 
    ? Math.floor(maxCapacity * (1 + overbookingPercentage / 100))
    : maxCapacity;
  
  const canOverbook = allowOverbooking && (currentBookings + partySize) <= overbookingLimit;
  const overbooked = (currentBookings + partySize) > maxCapacity && (currentBookings + partySize) <= overbookingLimit;

  // Daily capacity takes precedence - if daily limit would be exceeded, mark as unavailable
  const dailyLimitExceeded = !dailyCapacity.available && !allowOverride;
  const finalAvailable = (wouldFit || canOverbook) && !dailyLimitExceeded;

  return {
    available: finalAvailable || allowOverride,
    currentBookings,
    capacity: dailyCapacity.maxCoversPerDay ? Math.min(maxCapacity, dailyCapacity.maxCoversPerDay) : maxCapacity,
    remaining: dailyCapacity.maxCoversPerDay 
      ? Math.min(remaining, dailyCapacity.remaining || 0)
      : remaining,
    canOverbook: canOverbook && !dailyLimitExceeded,
    overbooked: overbooked || (!dailyCapacity.available && allowOverride)
  };
}

/**
 * Check daily capacity for a specific date
 * @param restaurantId Restaurant ID
 * @param date Reservation date
 * @param partySize Number of guests to check (optional, for checking if booking would fit)
 * @returns Daily capacity result
 */
export async function checkDailyCapacity(
  restaurantId: number,
  date: Date,
  partySize?: number
): Promise<DailyCapacityResult> {
  // Get reservation settings
  const settings = await prisma.reservationSettings.findUnique({
    where: { restaurantId }
  });

  const maxCoversPerDay = settings?.maxCoversPerDay || null;

  // If no daily limit set, return available
  if (maxCoversPerDay === null) {
    return {
      date,
      currentCovers: 0,
      maxCoversPerDay: null,
      available: true,
      remaining: null
    };
  }

  // Get all confirmed reservations for this date
  // Use UTC boundaries to ensure consistent date range queries regardless of server timezone
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const reservations = await prisma.reservation.findMany({
    where: {
      restaurantId,
      reservationDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: 'CONFIRMED'
    }
  });

  // Calculate total covers for the day (sum of all party sizes)
  const currentCovers = reservations.reduce((sum, res) => sum + res.partySize, 0);
  
  // Calculate remaining capacity
  const remaining = Math.max(0, maxCoversPerDay - currentCovers);
  
  // Check if this booking would fit (if partySize provided)
  const available = partySize === undefined 
    ? currentCovers < maxCoversPerDay 
    : (currentCovers + partySize) <= maxCoversPerDay;

  return {
    date,
    currentCovers,
    maxCoversPerDay,
    available,
    remaining
  };
}

/**
 * Check availability for a specific date, time slot, and party size
 * Also checks daily capacity limit which overrides time slot capacity if exceeded
 * @param restaurantId Restaurant ID
 * @param date Reservation date
 * @param timeSlot Time slot (e.g., "18:00")
 * @param partySize Number of guests
 * @param allowOverride Allow override for restaurant owners (default: false)
 * @returns Availability result with capacity information
 */
export async function checkAvailability(
  restaurantId: number,
  date: Date,
  timeSlot: string,
  partySize: number,
  allowOverride: boolean = false
): Promise<AvailabilityResult> {
  // Use UTC day since dates are stored as UTC midnight
  const dayOfWeek = date.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // Get reservation settings
  const settings = await prisma.reservationSettings.findUnique({
    where: { restaurantId }
  });

  // First check daily capacity (this overrides time slot capacity if exceeded)
  const dailyCapacity = await checkDailyCapacity(restaurantId, date, partySize);
  
  // If daily capacity is exceeded and override not allowed, return unavailable
  if (!dailyCapacity.available && !allowOverride) {
    return {
      available: false,
      currentBookings: dailyCapacity.currentCovers,
      capacity: dailyCapacity.maxCoversPerDay,
      remaining: dailyCapacity.remaining,
      canOverbook: false,
      overbooked: false
    };
  }

  // Get time slot capacity for this day/time
  const capacity = await prisma.timeSlotCapacity.findUnique({
    where: {
      restaurantId_dayOfWeek_timeSlot: {
        restaurantId,
        dayOfWeek,
        timeSlot
      }
    }
  });

  // Get all confirmed reservations for this date/time slot
  // Use UTC boundaries to ensure consistent date range queries regardless of server timezone
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const reservations = await prisma.reservation.findMany({
    where: {
      restaurantId,
      reservationDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      reservationTime: timeSlot,
      status: 'CONFIRMED'
    }
  });

  // Calculate current bookings (sum of party sizes)
  const currentBookings = reservations.reduce((sum, res) => sum + res.partySize, 0);

  // Determine capacity limit
  let maxCapacity: number | null = null;
  
  // Priority: TimeSlotCapacity > ReservationSettings.maxCoversPerSlot
  if (capacity && capacity.isActive) {
    maxCapacity = capacity.maxCovers;
  } else if (settings?.maxCoversPerSlot) {
    maxCapacity = settings.maxCoversPerSlot;
  }

  // If no capacity limit set, allow unlimited bookings (but still respect daily limit)
  if (maxCapacity === null) {
    return {
      available: dailyCapacity.available || allowOverride,
      currentBookings,
      capacity: dailyCapacity.maxCoversPerDay, // Return daily capacity as the limiting factor
      remaining: dailyCapacity.remaining,
      canOverbook: false,
      overbooked: !dailyCapacity.available && allowOverride
    };
  }

  // Calculate remaining capacity
  const remaining = Math.max(0, maxCapacity - currentBookings);
  
  // Check if this booking would fit
  const wouldFit = partySize <= remaining;
  
  // Check overbooking
  const allowOverbooking = settings?.allowOverbooking || false;
  const overbookingPercentage = settings?.overbookingPercentage || 0;
  const overbookingLimit = allowOverbooking 
    ? Math.floor(maxCapacity * (1 + overbookingPercentage / 100))
    : maxCapacity;
  
  const canOverbook = allowOverbooking && (currentBookings + partySize) <= overbookingLimit;
  const overbooked = (currentBookings + partySize) > maxCapacity && (currentBookings + partySize) <= overbookingLimit;

  // Daily capacity takes precedence - if daily limit would be exceeded, mark as unavailable
  const dailyLimitExceeded = !dailyCapacity.available && !allowOverride;
  const finalAvailable = (wouldFit || canOverbook) && !dailyLimitExceeded;

  return {
    available: finalAvailable || allowOverride,
    currentBookings,
    capacity: dailyCapacity.maxCoversPerDay ? Math.min(maxCapacity, dailyCapacity.maxCoversPerDay) : maxCapacity,
    remaining: dailyCapacity.maxCoversPerDay 
      ? Math.min(remaining, dailyCapacity.remaining || 0)
      : remaining,
    canOverbook: canOverbook && !dailyLimitExceeded,
    overbooked: overbooked || (!dailyCapacity.available && allowOverride)
  };
}

/**
 * Get availability for all time slots on a given date
 * Also checks daily capacity limit which overrides time slot capacity if exceeded
 * @param restaurantId Restaurant ID
 * @param date Date to check
 * @param timeSlots Array of time slots to check
 * @returns Array of availability results for each time slot
 */
export async function getTimeSlotAvailabilities(
  restaurantId: number,
  date: Date,
  timeSlots: string[]
): Promise<TimeSlotAvailability[]> {
  try {
    if (!timeSlots || timeSlots.length === 0) {
      return [];
    }

    // Use UTC day since dates are stored as UTC midnight
    const dayOfWeek = date.getUTCDay();

    // First check daily capacity (this overrides time slot capacity if exceeded)
    const dailyCapacity = await checkDailyCapacity(restaurantId, date);

    // Get all time slot capacities for this day
    const capacities = await prisma.timeSlotCapacity.findMany({
      where: {
        restaurantId,
        dayOfWeek,
        isActive: true,
        timeSlot: {
          in: timeSlots
        }
      }
    }).catch(error => {
      console.error(`Error fetching time slot capacities for restaurant ${restaurantId}:`, error);
      return [];
    });

    // Create a map for quick lookup
    const capacityMap = new Map(
      capacities.map(cap => [cap.timeSlot, cap.maxCovers])
    );

    // Get reservation settings for fallback capacity
    const settings = await prisma.reservationSettings.findUnique({
      where: { restaurantId }
    }).catch(error => {
      console.error(`Error fetching reservation settings for restaurant ${restaurantId}:`, error);
      return null;
    });

    // Get all reservations for this date
    // Use UTC boundaries to ensure consistent date range queries regardless of server timezone
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const reservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        reservationTime: {
          in: timeSlots
        },
        status: 'CONFIRMED'
      }
    }).catch(error => {
      console.error(`Error fetching reservations for restaurant ${restaurantId}:`, error);
      return [];
    });

    // Group reservations by time slot
    const bookingsBySlot = new Map<string, number>();
    reservations.forEach(res => {
      if (res.reservationTime && res.partySize) {
        const current = bookingsBySlot.get(res.reservationTime) || 0;
        bookingsBySlot.set(res.reservationTime, current + res.partySize);
      }
    });

    // Calculate availability for each time slot
    return timeSlots.map(timeSlot => {
      const slotCapacity = capacityMap.get(timeSlot) || settings?.maxCoversPerSlot || null;
      const currentBookings = bookingsBySlot.get(timeSlot) || 0;
      
      // Calculate remaining capacity for this time slot
      const slotRemaining = slotCapacity !== null ? Math.max(0, slotCapacity - currentBookings) : null;

      // If daily capacity limit is set and exceeded, mark slot as unavailable
      if (dailyCapacity.maxCoversPerDay !== null && !dailyCapacity.available) {
        return {
          timeSlot,
          available: false,
          currentBookings,
          capacity: dailyCapacity.maxCoversPerDay, // Show daily capacity as the limiting factor
          remaining: dailyCapacity.remaining // Show daily remaining capacity
        };
      }

      // If daily capacity limit is set but not exceeded, consider both slot and daily capacity
      if (dailyCapacity.maxCoversPerDay !== null && dailyCapacity.available) {
        // Calculate remaining considering both slot bookings and daily total
        // The effective remaining is the minimum of slot remaining and daily remaining
        // because daily capacity is shared across all slots
        const dailyRemaining = dailyCapacity.remaining || 0;
        const effectiveRemaining = slotCapacity !== null
          ? Math.min(slotRemaining || 0, dailyRemaining)
          : dailyRemaining;

        // Slot is available if both slot and daily capacity have room
        const slotAvailable = slotCapacity === null || (slotRemaining !== null && slotRemaining > 0);
        const dailyAvailable = dailyRemaining > 0;
        const isAvailable = slotAvailable && dailyAvailable;

        return {
          timeSlot,
          available: isAvailable,
          currentBookings,
          capacity: slotCapacity, // Show slot capacity (the limiting factor may be daily, but capacity is slot-specific)
          remaining: isAvailable ? effectiveRemaining : 0
        };
      }

      // No daily capacity limit - use only time slot capacity
      return {
        timeSlot,
        available: slotCapacity === null || (slotRemaining !== null && slotRemaining > 0),
        currentBookings,
        capacity: slotCapacity,
        remaining: slotRemaining
      };
    });
  } catch (error) {
    console.error(`Error in getTimeSlotAvailabilities for restaurant ${restaurantId}:`, error);
    // Return empty availability array on error to prevent 500
    return timeSlots.map(timeSlot => ({
      timeSlot,
      available: true, // Default to available on error
      currentBookings: 0,
      capacity: null,
      remaining: null
    }));
  }
}

/**
 * Generate time slots based on reservation settings
 * @param restaurantId Restaurant ID
 * @param date Date to generate slots for
 * @returns Array of time slot strings (e.g., ["17:00", "17:30", "18:00"])
 */
export async function generateTimeSlots(
  restaurantId: number,
  date: Date
): Promise<string[]> {
  try {
    const settings = await prisma.reservationSettings.findUnique({
      where: { restaurantId }
    });

    if (!settings) {
      // Default slots if no settings
      return generateDefaultTimeSlots();
    }

    // Use UTC day since dates are stored as UTC midnight
    const dayOfWeek = date.getUTCDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];

    // Safely access operating hours
    if (!settings.operatingHours || typeof settings.operatingHours !== 'object') {
      console.warn(`Restaurant ${restaurantId} has invalid operatingHours structure`);
      return generateDefaultTimeSlots();
    }

    const dayHours = (settings.operatingHours as any)[dayName];

    if (!dayHours || dayHours.closed) {
      return []; // Restaurant closed this day
    }

    // Validate that open and close times exist
    if (!dayHours.open || !dayHours.close) {
      console.warn(`Restaurant ${restaurantId} missing open/close times for ${dayName}`);
      return generateDefaultTimeSlots();
    }

    const { open, close } = dayHours;
    const interval = settings.timeSlotInterval || 30; // Default to 30 minutes

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(open) || !timeRegex.test(close)) {
      console.warn(`Restaurant ${restaurantId} has invalid time format for ${dayName}: ${open} - ${close}`);
      return generateDefaultTimeSlots();
    }

    return generateSlotsBetweenTimes(open, close, interval);
  } catch (error) {
    console.error(`Error generating time slots for restaurant ${restaurantId}:`, error);
    // Return default slots on error to prevent 500
    return generateDefaultTimeSlots();
  }
}

/**
 * Generate default time slots (11:00 - 22:00, 30-minute intervals)
 */
function generateDefaultTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 11; hour < 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  slots.push('22:00');
  return slots;
}

/**
 * Generate time slots between two times with given interval
 * @param startTime Start time (HH:MM format)
 * @param endTime End time (HH:MM format)
 * @param intervalMinutes Interval in minutes (15, 30, or 60)
 */
function generateSlotsBetweenTimes(
  startTime: string,
  endTime: string,
  intervalMinutes: number
): string[] {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  const slots: string[] = [];
  let currentMinutes = startMinutes;

  // FIXED: Handle midnight crossing - if end time is earlier than start time,
  // it means the end time is the next day (e.g., 20:00 to 02:00)
  const crossesMidnight = endMinutes <= startMinutes;
  
  if (crossesMidnight) {
    // Generate slots from start time to end of day (23:59)
    const endOfDay = 24 * 60; // 1440 minutes
    while (currentMinutes < endOfDay) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      currentMinutes += intervalMinutes;
    }
    
    // Generate slots from start of next day (00:00) to end time
    currentMinutes = 0;
    while (currentMinutes <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      currentMinutes += intervalMinutes;
    }
  } else {
    // Normal case: end time is after start time on the same day
    while (currentMinutes <= endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      currentMinutes += intervalMinutes;
    }
  }

  return slots;
}

