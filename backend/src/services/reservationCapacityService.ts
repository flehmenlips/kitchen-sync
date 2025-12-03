import prisma from '../config/db';

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

/**
 * Check availability for a specific date, time slot, and party size
 * @param restaurantId Restaurant ID
 * @param date Reservation date
 * @param timeSlot Time slot (e.g., "18:00")
 * @param partySize Number of guests
 * @returns Availability result with capacity information
 */
export async function checkAvailability(
  restaurantId: number,
  date: Date,
  timeSlot: string,
  partySize: number
): Promise<AvailabilityResult> {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Get reservation settings
  const settings = await prisma.reservationSettings.findUnique({
    where: { restaurantId }
  });

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
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

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

  // If no capacity limit set, allow unlimited bookings
  if (maxCapacity === null) {
    return {
      available: true,
      currentBookings,
      capacity: null,
      remaining: null,
      canOverbook: false,
      overbooked: false
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

  return {
    available: wouldFit || canOverbook,
    currentBookings,
    capacity: maxCapacity,
    remaining,
    canOverbook,
    overbooked
  };
}

/**
 * Get availability for all time slots on a given date
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
  const dayOfWeek = date.getDay();

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
  });

  // Create a map for quick lookup
  const capacityMap = new Map(
    capacities.map(cap => [cap.timeSlot, cap.maxCovers])
  );

  // Get reservation settings for fallback capacity
  const settings = await prisma.reservationSettings.findUnique({
    where: { restaurantId }
  });

  // Get all reservations for this date
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

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
  });

  // Group reservations by time slot
  const bookingsBySlot = new Map<string, number>();
  reservations.forEach(res => {
    const current = bookingsBySlot.get(res.reservationTime) || 0;
    bookingsBySlot.set(res.reservationTime, current + res.partySize);
  });

  // Calculate availability for each time slot
  return timeSlots.map(timeSlot => {
    const capacity = capacityMap.get(timeSlot) || settings?.maxCoversPerSlot || null;
    const currentBookings = bookingsBySlot.get(timeSlot) || 0;
    const remaining = capacity !== null ? Math.max(0, capacity - currentBookings) : null;

    return {
      timeSlot,
      available: capacity === null || (remaining !== null && remaining > 0),
      currentBookings,
      capacity,
      remaining
    };
  });
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
  const settings = await prisma.reservationSettings.findUnique({
    where: { restaurantId }
  });

  if (!settings) {
    // Default slots if no settings
    return generateDefaultTimeSlots();
  }

  const dayOfWeek = date.getDay();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[dayOfWeek];

  const dayHours = (settings.operatingHours as any)[dayName];

  if (!dayHours || dayHours.closed) {
    return []; // Restaurant closed this day
  }

  const { open, close } = dayHours;
  const interval = settings.timeSlotInterval || 30; // Default to 30 minutes

  return generateSlotsBetweenTimes(open, close, interval);
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
  const endMinutes = endHour * 60 + endMin;

  const slots: string[] = [];
  let currentMinutes = startMinutes;

  // FIXED: Use <= to include closing time, matching generateDefaultTimeSlots behavior
  while (currentMinutes <= endMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const minute = currentMinutes % 60;
    slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }

  return slots;
}

