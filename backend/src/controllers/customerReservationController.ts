import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomerAuthRequest } from '../middleware/authenticateCustomer';
import { ReservationStatus } from '@prisma/client';
import { emailService } from '../services/emailService';
import { format } from 'date-fns';
import { validateAndParseUTCDate } from '../utils/dateValidation';

const prisma = new PrismaClient();

// @desc    Get daily capacity for date range (public, for date picker)
// @route   GET /api/customer/reservations/daily-capacity
// @access  Public
export const getPublicDailyCapacity = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate, restaurantSlug, partySize } = req.query;

        // Helper function to parse YYYY-MM-DD string as UTC date
        // This ensures consistent date parsing regardless of server timezone
        const parseUTCDate = (dateStr: string): Date => {
            // Parse as UTC to avoid timezone shifts
            return new Date(dateStr + 'T00:00:00.000Z');
        };

        // Helper function to get today's date in UTC (at 00:00:00 UTC)
        // This ensures consistency with parseUTCDate when no date is provided
        const getTodayUTC = (): Date => {
            const now = new Date();
            const year = now.getUTCFullYear();
            const month = String(now.getUTCMonth() + 1).padStart(2, '0');
            const day = String(now.getUTCDate()).padStart(2, '0');
            return parseUTCDate(`${year}-${month}-${day}`);
        };

        // Default to next 90 days if no dates provided
        // Use UTC consistently to avoid timezone boundary issues
        const start = startDate ? parseUTCDate(startDate as string) : getTodayUTC();
        const end = endDate ? parseUTCDate(endDate as string) : (() => {
            const todayUTC = getTodayUTC();
            const futureDate = new Date(todayUTC);
            futureDate.setUTCDate(futureDate.getUTCDate() + 90);
            return futureDate;
        })();

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            res.status(400).json({ message: 'Invalid date format. Use YYYY-MM-DD format.' });
            return;
        }

        // Parse party size if provided
        const partySizeNum = partySize ? parseInt(partySize as string) : undefined;
        if (partySize && (isNaN(partySizeNum!) || partySizeNum! < 1)) {
            res.status(400).json({ message: 'Invalid party size. Must be a positive number.' });
            return;
        }

        // Get restaurant ID from slug
        let restaurantId: number;
        if (restaurantSlug) {
            const restaurant = await prisma.restaurant.findUnique({
                where: { slug: restaurantSlug as string },
                select: { id: true }
            });
            if (!restaurant) {
                res.status(404).json({ message: `Restaurant with slug "${restaurantSlug}" not found` });
                return;
            }
            restaurantId = restaurant.id;
        } else {
            // Default to restaurant ID 1 for MVP when no slug provided
            restaurantId = 1;
        }

        // Get reservation settings to check if maxCoversPerDay is set
        const settings = await prisma.reservationSettings.findUnique({
            where: { restaurantId }
        });

        if (!settings?.maxCoversPerDay) {
            // No daily limit set, return all dates as available
            res.status(200).json({
                dailyCapacities: [],
                message: 'No daily capacity limit configured'
            });
            return;
        }

        // Get all confirmed reservations in date range
        // Use UTC boundaries to ensure consistent date range queries
        const startOfRange = new Date(start);
        startOfRange.setUTCHours(0, 0, 0, 0);
        const endOfRange = new Date(end);
        endOfRange.setUTCHours(23, 59, 59, 999);

        const reservations = await prisma.reservation.findMany({
            where: {
                restaurantId,
                reservationDate: {
                    gte: startOfRange,
                    lte: endOfRange
                },
                status: 'CONFIRMED'
            },
            select: {
                reservationDate: true,
                partySize: true
            }
        });

        // Helper function to format date as YYYY-MM-DD using UTC date components
        // This ensures consistent date formatting regardless of server timezone
        // Database dates are stored as UTC timestamps, so we use UTC components
        const formatDateString = (date: Date): string => {
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Group reservations by date and calculate total covers per day
        // Use local date components to match frontend formatting
        const coversByDate = new Map<string, number>();
        reservations.forEach(res => {
            const dateStr = formatDateString(res.reservationDate);
            const current = coversByDate.get(dateStr) || 0;
            coversByDate.set(dateStr, current + res.partySize);
        });

        // Build response with capacity info for each date
        // Use UTC date components to ensure consistent date boundaries
        const startUTC = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
        const endUTC = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
        const dailyCapacities = [];
        const currentDate = new Date(startUTC);
        while (currentDate <= endUTC) {
            const dateStr = formatDateString(currentDate);
            const currentCovers = coversByDate.get(dateStr) || 0;
            const remaining = Math.max(0, settings.maxCoversPerDay! - currentCovers);
            
            // If party size is provided, check if that specific party size would fit
            // Otherwise, check if there's any remaining capacity (at least 1 cover)
            const available = partySizeNum !== undefined
                ? (currentCovers + partySizeNum) <= settings.maxCoversPerDay!
                : remaining > 0;
            
            dailyCapacities.push({
                date: dateStr,
                currentCovers,
                maxCoversPerDay: settings.maxCoversPerDay,
                available,
                remaining
            });

            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        res.status(200).json({
            dailyCapacities
        });
    } catch (error: any) {
        console.error('Error fetching public daily capacity:', error);
        res.status(500).json({ 
            message: 'Error fetching daily capacity',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to generate confirmation number
const generateConfirmationNumber = (id: number): string => {
    const prefix = 'SBK'; // Seabreeze Kitchen
    const paddedId = id.toString().padStart(6, '0');
    return `${prefix}${paddedId}`;
};

// @desc    Get customer's reservations
// @route   GET /api/customer/reservations
// @access  Private (Customer)
export const getCustomerReservations = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    if (!req.customerUser?.userId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    try {
        const { status, upcoming } = req.query;
        
        const where: any = { customerId: req.customerUser.userId };
        
        if (status && status !== 'all') {
            where.status = status as ReservationStatus;
        }

        if (upcoming === 'true') {
            where.reservationDate = {
                gte: new Date()
            };
            where.status = {
                notIn: [ReservationStatus.CANCELLED, ReservationStatus.NO_SHOW]
            };
        }

        const reservations = await prisma.reservation.findMany({
            where,
            orderBy: [
                { reservationDate: 'asc' },
                { reservationTime: 'asc' }
            ]
        });

        res.status(200).json(reservations);
    } catch (error) {
        console.error('Error fetching customer reservations:', error);
        res.status(500).json({ message: 'Error fetching reservations' });
    }
};

// @desc    Get single reservation by ID
// @route   GET /api/customer/reservations/:id
// @access  Private (Customer)
export const getCustomerReservationById = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    if (!req.customerUser?.userId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    try {
        const { id } = req.params;
        const reservationId = parseInt(id, 10);

        const reservation = await prisma.reservation.findFirst({
            where: {
                id: reservationId,
                customerId: req.customerUser.userId
            }
        });

        if (!reservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        res.status(200).json(reservation);
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({ message: 'Error fetching reservation' });
    }
};

// @desc    Create a new reservation
// @route   POST /api/customer/reservations
// @access  Private (Customer)
export const createCustomerReservation = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    if (!req.customerUser?.userId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    try {
        const {
            customerName,
            customerPhone,
            customerEmail,
            partySize,
            reservationDate,
            reservationTime,
            notes,
            specialRequests
        } = req.body;

        if (!partySize || !reservationDate || !reservationTime) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Get customer profile with user details
        const customerProfile = await prisma.customerProfile.findUnique({
            where: { userId: req.customerUser.userId },
            include: { user: true }
        });

        if (!customerProfile) {
            res.status(404).json({ message: 'Customer profile not found' });
            return;
        }

        // CRITICAL FIX: Get restaurantId from request body or slug - never default to 1
        // This prevents data leakage between restaurants
        let restaurantId: number | undefined;
        
        // First try to get restaurant from slug
        const restaurantSlug = req.body.restaurantSlug || req.query.slug || req.params.slug;
        if (restaurantSlug) {
            const restaurant = await prisma.restaurant.findUnique({
                where: { slug: restaurantSlug },
                select: { id: true }
            });
            
            if (restaurant) {
                restaurantId = restaurant.id;
            } else {
                // CRITICAL FIX: If slug is provided but restaurant not found, return 404 immediately
                // This prevents silently falling through to use a different restaurantId from body
                res.status(404).json({ 
                    error: 'Restaurant not found',
                    message: `Restaurant not found for slug: ${restaurantSlug}`
                });
                return;
            }
        }
        
        // Fall back to restaurantId from body only if no slug was provided
        // CRITICAL FIX: Use explicit conditional checks instead of truthy checks to handle 0 values correctly
        if (restaurantId === undefined && req.body.restaurantId !== undefined && req.body.restaurantId !== null) {
            restaurantId = parseInt(req.body.restaurantId);
            // Validate that the parsed value is a valid number
            if (isNaN(restaurantId)) {
                res.status(400).json({ 
                    error: 'Invalid restaurant ID',
                    message: 'The provided restaurant ID is not a valid number'
                });
                return;
            }
        }
        
        // Fail if no restaurantId found
        // CRITICAL FIX: Check for undefined separately from NaN to provide appropriate error messages
        if (restaurantId === undefined) {
            res.status(400).json({ 
                message: 'Restaurant ID or slug is required',
                error: 'Please provide a restaurant slug or restaurant ID'
            });
            return;
        }
        
        // Validate date format and parse correctly to avoid timezone issues
        // Parse YYYY-MM-DD format as UTC midnight to ensure consistent date storage
        const dateValidation = validateAndParseUTCDate(reservationDate);
        if (!dateValidation.valid) {
            res.status(400).json({ message: dateValidation.error || 'Invalid date format. Use YYYY-MM-DD format.' });
            return;
        }
        const reservationDateObj = dateValidation.date!;

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(reservationTime)) {
            res.status(400).json({ message: 'Invalid time format. Use HH:MM format (e.g., 18:00).' });
            return;
        }

        // Validate date is not in the past
        const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
        if (isNaN(reservationDateTime.getTime())) {
            res.status(400).json({ message: 'Invalid date and time combination' });
            return;
        }
        if (reservationDateTime < new Date()) {
            res.status(400).json({ message: 'Cannot create reservations in the past' });
            return;
        }

        const partySizeNum = parseInt(partySize);
        const customerUserId = req.customerUser.userId; // Store for use in transaction

        // Validate party size is a valid number
        if (isNaN(partySizeNum) || partySizeNum < 1) {
            res.status(400).json({ message: 'Party size must be a valid number greater than 0' });
            return;
        }

        // Use transaction to ensure atomicity and prevent race conditions
        // Capacity check is performed INSIDE the transaction to prevent TOCTOU vulnerability
        const { checkAvailabilityInTransaction } = await import('../services/reservationCapacityService');
        const newReservation = await prisma.$transaction(async (tx) => {
            // Check availability INSIDE transaction (checks both time slot capacity and daily capacity)
            // Customers cannot override capacity limits
            // This ensures no concurrent requests can both pass the capacity check
            const availability = await checkAvailabilityInTransaction(
                tx,
                restaurantId,
                reservationDateObj,
                reservationTime,
                partySizeNum,
                false // allowOverride = false for customers
            );
            
            if (!availability.available) {
                const capacityMsg = availability.capacity 
                    ? `Capacity limit of ${availability.capacity} reached. Current bookings: ${availability.currentBookings}`
                    : 'This time slot is not available';
                
                throw new Error(`CAPACITY_EXCEEDED:${JSON.stringify({
                    message: capacityMsg,
                    availability: {
                        currentBookings: availability.currentBookings,
                        capacity: availability.capacity,
                        remaining: availability.remaining
                    }
                })}`);
            }

            // Create the reservation within the same transaction
            return await tx.reservation.create({
                data: {
                    customerName: customerName || customerProfile.user.name || 'Guest',
                    customerPhone: customerPhone || customerProfile.user.phone || undefined,
                    customerEmail: customerEmail || customerProfile.user.email,
                    customerId: customerUserId,
                    partySize: partySizeNum,
                    reservationDate: reservationDateObj,
                    reservationTime,
                    notes,
                    specialRequests,
                    userId: 1, // Default staff user for now
                    restaurantId
                }
            });
        });

        // Get restaurant info for confirmation email
        let restaurantInfo = null;
        try {
            const restaurant = await prisma.restaurant.findUnique({
                where: { id: restaurantId },
                select: {
                    name: true,
                    phone: true,
                    address: true,
                    city: true,
                    state: true,
                    zipCode: true,
                    website: true,
                    email: true,
                }
            });

            if (restaurant) {
                const restaurantSettings = await prisma.restaurantSettings.findUnique({
                    where: { restaurantId },
                    select: {
                        contactPhone: true,
                        contactEmail: true,
                        contactAddress: true,
                        contactCity: true,
                        contactState: true,
                        contactZip: true,
                        websiteName: true,
                    }
                });

                restaurantInfo = {
                    name: restaurantSettings?.websiteName || restaurant.name,
                    phone: restaurantSettings?.contactPhone || restaurant.phone,
                    address: restaurantSettings?.contactAddress || restaurant.address,
                    city: restaurantSettings?.contactCity || restaurant.city,
                    state: restaurantSettings?.contactState || restaurant.state,
                    zipCode: restaurantSettings?.contactZip || restaurant.zipCode,
                    website: restaurant.website,
                    email: restaurantSettings?.contactEmail || restaurant.email,
                };
            }
        } catch (error) {
            console.error('Error fetching restaurant info for email:', error);
        }

        // Send confirmation email
        const emailToUse = customerEmail || customerProfile.user.email;
        if (emailToUse) {
            try {
                // Format date using UTC components to ensure correct date display
                // Extract UTC components to avoid timezone issues
                const resDate = new Date(reservationDateObj);
                // Create a local date with UTC components to display correctly
                const displayDate = new Date(
                    resDate.getUTCFullYear(),
                    resDate.getUTCMonth(),
                    resDate.getUTCDate()
                );
                const formattedDate = format(displayDate, 'EEEE, MMMM d, yyyy');
                await emailService.sendReservationConfirmation(
                    emailToUse,
                    customerName || customerProfile.user.name || 'Guest',
                    {
                        date: formattedDate,
                        time: reservationTime,
                        partySize: partySizeNum,
                        specialRequests: notes || specialRequests,
                        confirmationNumber: generateConfirmationNumber(newReservation.id)
                    },
                    restaurantInfo
                );
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
                // Don't fail the reservation creation if email fails
            }
        }

        // Add confirmation number to response
        const reservationWithConfirmation = {
            ...newReservation,
            confirmationNumber: generateConfirmationNumber(newReservation.id)
        };

        res.status(201).json(reservationWithConfirmation);
    } catch (error: any) {
        // Handle capacity exceeded error from transaction
        if (error?.message && error.message.startsWith('CAPACITY_EXCEEDED:')) {
            try {
                const capacityError = JSON.parse(error.message.replace('CAPACITY_EXCEEDED:', ''));
                res.status(400).json(capacityError);
                return;
            } catch (parseError) {
                // Fall through to generic error handling if parsing fails
            }
        }
        console.error('Error creating reservation:', error);
        res.status(500).json({ message: 'Error creating reservation' });
    }
};

// @desc    Cancel a reservation
// @route   POST /api/customer/reservations/:id/cancel
// @access  Private (Customer)
export const cancelCustomerReservation = async (req: CustomerAuthRequest, res: Response): Promise<void> => {
    if (!req.customerUser?.userId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    try {
        const { id } = req.params;
        const reservationId = parseInt(id, 10);

        const reservation = await prisma.reservation.findFirst({
            where: {
                id: reservationId,
                customerId: req.customerUser.userId
            }
        });

        if (!reservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        if (reservation.status === ReservationStatus.CANCELLED) {
            res.status(400).json({ message: 'Reservation is already cancelled' });
            return;
        }

        const updatedReservation = await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: ReservationStatus.CANCELLED }
        });

        res.status(200).json(updatedReservation);
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        res.status(500).json({ message: 'Error cancelling reservation' });
    }
};

export const customerReservationController = {
  // Get all reservations for the authenticated customer
  async getMyReservations(req: CustomerAuthRequest, res: Response) {
    try {
      const customerId = req.customer?.id || req.customerUser!.userId;

      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      console.log('Customer email for reservation lookup:', customer?.email);

      const reservations = await prisma.reservation.findMany({
        where: {
          customerEmail: customer?.email,
          // Don't show very old completed reservations
          OR: [
            { status: { in: ['CONFIRMED', 'NO_SHOW'] } },
            {
              AND: [
                { status: { in: ['COMPLETED', 'CANCELLED'] } },
                { reservationDate: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } } // Last 90 days
              ]
            }
          ]
        },
        orderBy: [
          { reservationDate: 'desc' },
          { reservationTime: 'desc' }
        ],
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true
            }
          }
        }
      });

      console.log('Found reservations:', reservations.length);
      // Add confirmation numbers to reservations
      const reservationsWithConfirmation = reservations.map(res => ({
        ...res,
        confirmationNumber: generateConfirmationNumber(res.id)
      }));
      res.json(reservationsWithConfirmation);
    } catch (error) {
      console.error('Get reservations error:', error);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  },

  // Get a specific reservation
  async getReservation(req: CustomerAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const customerId = req.customer?.id || req.customerUser!.userId;

      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      const reservation = await prisma.reservation.findFirst({
        where: {
          id: parseInt(id),
          customerEmail: customer?.email
        },
        include: {
          restaurant: true,
          orders: {
            include: {
              orderItems: {
                include: {
                  menuItem: true
                }
              }
            }
          }
        }
      });

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json(reservation);
    } catch (error) {
      console.error('Get reservation error:', error);
      res.status(500).json({ error: 'Failed to fetch reservation' });
    }
  },

  // Create a new reservation
  async createReservation(req: CustomerAuthRequest, res: Response) {
    try {
      // REQUIRE AUTHENTICATION - No more public reservations
      if (!req.customer?.id && !req.customerUser?.userId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please sign in or create an account to make a reservation'
        });
      }

      // Get restaurant from slug or ID
      let restaurantId: number | undefined;
      
      // First try to get restaurant from slug
      const restaurantSlug = req.body.restaurantSlug || req.query.slug || req.params.slug;
      console.log('[createReservation] restaurantSlug from request:', restaurantSlug);
      // Log sanitized request body (exclude PII: customerPhone, notes, specialRequests, customerEmail, customerName)
      const sanitizedBody = {
        restaurantSlug: req.body.restaurantSlug,
        restaurantId: req.body.restaurantId,
        reservationDate: req.body.reservationDate,
        reservationTime: req.body.reservationTime,
        partySize: req.body.partySize,
        // Explicitly exclude sensitive fields: customerPhone, notes, specialRequests, customerEmail, customerName
      };
      console.log('[createReservation] req.body (sanitized):', JSON.stringify(sanitizedBody, null, 2));
      
      if (restaurantSlug) {
        // Try exact match first
        let restaurant = await prisma.restaurant.findUnique({
          where: { slug: restaurantSlug },
          select: { id: true }
        });
        
        // If not found, try case-insensitive search and handle hyphen variations
        if (!restaurant) {
          console.log('[createReservation] Exact slug match failed, trying case-insensitive search');
          const allRestaurants = await prisma.restaurant.findMany({
            where: { isActive: true },
            select: { id: true, slug: true }
          });
          
          // Try case-insensitive match
          const normalizedSlug = restaurantSlug.toLowerCase().trim();
          const matchedRestaurant = allRestaurants.find(r => 
            r.slug.toLowerCase() === normalizedSlug ||
            r.slug.toLowerCase().replace(/-/g, '') === normalizedSlug.replace(/-/g, '') ||
            r.slug.toLowerCase().replace(/_/g, '-') === normalizedSlug.replace(/_/g, '-')
          );
          
          if (matchedRestaurant) {
            restaurant = { id: matchedRestaurant.id };
            console.log('[createReservation] Found restaurant with normalized slug match:', restaurantSlug, '->', matchedRestaurant.slug, '-> restaurantId:', matchedRestaurant.id);
          }
        }
        
        if (restaurant) {
          restaurantId = restaurant.id;
          console.log('[createReservation] Found restaurant by slug:', restaurantSlug, '-> restaurantId:', restaurantId);
        } else {
          console.error('[createReservation] Restaurant not found for slug:', restaurantSlug);
          // Log available slugs for debugging
          const availableSlugs = await prisma.restaurant.findMany({
            where: { isActive: true },
            select: { slug: true },
            take: 10
          });
          console.error('[createReservation] Available restaurant slugs:', availableSlugs.map(r => r.slug));
        }
      }
      
      // Fall back to restaurantId from body (but never default to 1 - that's dangerous)
      if (!restaurantId) {
        restaurantId = req.body.restaurantId;
        if (restaurantId) {
          console.log('[createReservation] Using restaurantId from body:', restaurantId);
        }
      }
      
      // Fix Bug B: Ensure restaurantId is set - fail if not provided (never default to 1)
      if (!restaurantId) {
        console.error('[createReservation] No restaurantId found - restaurantSlug:', restaurantSlug, 'body.restaurantId:', req.body.restaurantId);
        return res.status(400).json({
          error: 'Restaurant ID or slug is required',
          message: 'Please provide a restaurant slug or restaurant ID'
        });
      }
      
      console.log('[createReservation] Final restaurantId:', restaurantId);

      // Get authenticated customer
      // Fix Bug A: Remove non-null assertion and add defensive check
      const customerIdFromAuth = req.customer?.id || req.customerUser?.userId;
      if (!customerIdFromAuth) {
        // This should never happen due to check above, but be defensive
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please sign in or create an account to make a reservation'
        });
      }
      
      // Fetch customer with email verification status
      const customer = await prisma.customer.findUnique({
        where: { id: customerIdFromAuth },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          restaurantId: true,
          emailVerified: true
        }
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // REQUIRE EMAIL VERIFICATION
      if (!customer.emailVerified) {
        return res.status(403).json({
          error: 'Email verification required',
          message: 'Please verify your email address before making a reservation. Check your inbox for the verification email.',
          requiresVerification: true
        });
      }

      // Fix Bug C: Wrap customerRestaurant upsert and reservation creation in transaction
      // This ensures atomicity - if reservation creation fails, customerRestaurant upsert is rolled back
      const customerId = customer.id;
      const customerName = `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email;
      const customerEmail = customer.email;
      // Use phone from request body if provided, otherwise fall back to customer profile phone
      const customerPhone = req.body.customerPhone?.trim() || customer.phone || undefined;

      const {
        reservationDate,
        reservationTime,
        partySize,
        notes,
        specialRequests
      } = req.body;

      // Validate required fields
      if (!reservationDate || !reservationTime || !partySize) {
        return res.status(400).json({
          error: 'Reservation date, time, and party size are required'
        });
      }

      // Parse and validate party size (must be done before validation to catch NaN)
      const partySizeNum = parseInt(partySize);
      if (isNaN(partySizeNum) || partySizeNum < 1 || partySizeNum > 20) {
        return res.status(400).json({
          error: 'Party size must be a valid number between 1 and 20'
        });
      }

      // Validate phone number if provided (prevent email addresses)
      if (req.body.customerPhone && typeof req.body.customerPhone === 'string') {
        const phoneValue = req.body.customerPhone.trim();
        if (phoneValue.includes('@')) {
          return res.status(400).json({
            error: 'Invalid phone number',
            message: 'Please enter a valid phone number, not an email address'
          });
        }
        // Basic phone validation - should contain digits
        if (phoneValue && !/[\d]/.test(phoneValue)) {
          return res.status(400).json({
            error: 'Invalid phone number',
            message: 'Phone number must contain at least one digit'
          });
        }
      }

      // Validate date format and parse correctly to avoid timezone issues
      // Parse YYYY-MM-DD format as UTC midnight to ensure consistent date storage
      const dateValidation = validateAndParseUTCDate(reservationDate);
      if (!dateValidation.valid) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: dateValidation.error || 'Invalid date format. Use YYYY-MM-DD format.'
        });
      }
      const reservationDateObj = dateValidation.date!;

      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(reservationTime)) {
        return res.status(400).json({
          error: 'Invalid time format',
          message: 'Invalid time format. Use HH:MM format (e.g., 18:00).'
        });
      }

      // Validate date is not in the past
      const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
      if (isNaN(reservationDateTime.getTime())) {
        return res.status(400).json({
          error: 'Invalid date/time combination',
          message: 'Invalid date and time combination'
        });
      }
      if (reservationDateTime < new Date()) {
        return res.status(400).json({
          error: 'Cannot create reservations in the past'
        });
      }

      // Use transaction to ensure atomicity and prevent race conditions
      // Capacity check is performed INSIDE the transaction to prevent TOCTOU vulnerability
      const { checkAvailabilityInTransaction } = await import('../services/reservationCapacityService');
      const reservation = await prisma.$transaction(async (tx) => {
        // Check availability INSIDE transaction (checks both time slot capacity and daily capacity)
        // Customers cannot override capacity limits
        // This ensures no concurrent requests can both pass the capacity check
        const availability = await checkAvailabilityInTransaction(
          tx,
          restaurantId,
          reservationDateObj,
          reservationTime,
          partySizeNum,
          false // allowOverride = false for customers
        );
        
        if (!availability.available) {
          const capacityMsg = availability.capacity 
            ? `Capacity limit of ${availability.capacity} reached. Current bookings: ${availability.currentBookings}`
            : 'This time slot is not available';
          
          throw new Error(`CAPACITY_EXCEEDED:${JSON.stringify({
            error: 'Capacity exceeded',
            message: capacityMsg,
            availability: {
              currentBookings: availability.currentBookings,
              capacity: availability.capacity,
              remaining: availability.remaining
            }
          })}`);
        }

        // Ensure customer-restaurant link exists (create if needed)
        // Use upsert to prevent race condition from concurrent requests
        await tx.customerRestaurant.upsert({
          where: {
            customerId_restaurantId: {
              customerId: customer.id,
              restaurantId: restaurantId
            }
          },
          create: {
            customerId: customer.id,
            restaurantId: restaurantId,
            firstVisit: new Date()
          },
          update: {
            // No-op: don't update existing records, just ensure they exist
          }
        });

        // Create the reservation within the same transaction
        console.log('[createReservation] Creating reservation with restaurantId:', restaurantId);
        const newReservation = await tx.reservation.create({
          data: {
            customerId: customerId || null,
            customerName,
            customerEmail,
            customerPhone,
            restaurantId,
            reservationDate: reservationDateObj, // Use properly parsed UTC date
            reservationTime,
            partySize: parseInt(partySize),
            status: 'CONFIRMED',
            notes,
            specialRequests,
            source: 'customer_portal'
          },
          include: {
            restaurant: true
          }
        });
        console.log('[createReservation] Reservation created successfully:', newReservation.id, 'restaurantId:', newReservation.restaurantId);
        return newReservation;
      });

      // Get restaurant info for confirmation email
      let restaurantInfo = null;
      if (reservation.restaurant) {
        const restaurantSettings = await prisma.restaurantSettings.findUnique({
          where: { restaurantId: reservation.restaurantId },
          select: {
            contactPhone: true,
            contactEmail: true,
            contactAddress: true,
            contactCity: true,
            contactState: true,
            contactZip: true,
            websiteName: true,
          }
        });

        restaurantInfo = {
          name: restaurantSettings?.websiteName || reservation.restaurant.name,
          phone: restaurantSettings?.contactPhone || reservation.restaurant.phone,
          address: restaurantSettings?.contactAddress || reservation.restaurant.address,
          city: restaurantSettings?.contactCity || reservation.restaurant.city,
          state: restaurantSettings?.contactState || reservation.restaurant.state,
          zipCode: restaurantSettings?.contactZip || reservation.restaurant.zipCode,
          website: reservation.restaurant.website,
          email: restaurantSettings?.contactEmail || reservation.restaurant.email,
        };
      }

      // Send confirmation email
      try {
        // Format date using UTC components to ensure correct date display
        // Reservation dates are stored as UTC midnight, so we extract UTC components
        const resDate = new Date(reservation.reservationDate);
        // Create a local date with UTC components to display correctly
        const displayDate = new Date(
          resDate.getUTCFullYear(),
          resDate.getUTCMonth(),
          resDate.getUTCDate()
        );
        const formattedDate = format(displayDate, 'EEEE, MMMM d, yyyy');
        await emailService.sendReservationConfirmation(
          customer.email,
          customerName,
          {
            date: formattedDate,
            time: reservation.reservationTime,
            partySize: reservation.partySize,
            specialRequests: reservation.specialRequests || reservation.notes || undefined,
            confirmationNumber: generateConfirmationNumber(reservation.id)
          },
          restaurantInfo
        );
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the reservation creation if email fails
      }

      // Add confirmation number to response
      const reservationWithConfirmation = {
        ...reservation,
        confirmationNumber: generateConfirmationNumber(reservation.id)
      };

      res.status(201).json({
        message: 'Reservation created successfully',
        reservation: reservationWithConfirmation
      });
    } catch (error: any) {
      // Handle capacity exceeded error from transaction
      if (error?.message && error.message.startsWith('CAPACITY_EXCEEDED:')) {
        try {
          const capacityError = JSON.parse(error.message.replace('CAPACITY_EXCEEDED:', ''));
          return res.status(400).json(capacityError);
        } catch (parseError) {
          // Fall through to generic error handling if parsing fails
        }
      }
      console.error('Create reservation error:', error);
      res.status(500).json({ 
        error: 'Failed to create reservation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update a reservation
  async updateReservation(req: CustomerAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const customerId = req.customer?.id || req.customerUser!.userId;
      const {
        reservationDate,
        reservationTime,
        partySize,
        notes,
        specialRequests
      } = req.body;

      // Get customer email for lookup
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      // Check if reservation exists and belongs to customer
      const existingReservation = await prisma.reservation.findFirst({
        where: {
          id: parseInt(id),
          customerEmail: customer?.email
        }
      });

      if (!existingReservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Don't allow updates to past or completed reservations
      if (existingReservation.status !== 'CONFIRMED') {
        return res.status(400).json({
          error: 'Can only update confirmed reservations'
        });
      }

      // Build update data
      const updateData: any = {};
      
      let parsedReservationDate: Date | undefined;
      if (reservationDate) {
        // Validate date format and parse correctly to avoid timezone issues
        // Parse YYYY-MM-DD format as UTC midnight to ensure consistent date storage
        const dateValidation = validateAndParseUTCDate(reservationDate);
        if (!dateValidation.valid) {
          return res.status(400).json({
            error: 'Invalid date format',
            message: dateValidation.error || 'Invalid date format. Use YYYY-MM-DD format.'
          });
        }
        parsedReservationDate = dateValidation.date!;
        updateData.reservationDate = parsedReservationDate;
      }
      if (reservationTime) {
        updateData.reservationTime = reservationTime;
      }
      if (partySize) {
        updateData.partySize = parseInt(partySize);
      }
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      if (specialRequests !== undefined) {
        updateData.specialRequests = specialRequests;
      }

      // Validate new date/time if provided
      if (reservationDate || reservationTime) {
        // Use parsed date if new date was provided, otherwise use existing reservation date
        const dateToUse = parsedReservationDate || existingReservation.reservationDate;
        const timeToUse = reservationTime || existingReservation.reservationTime;
        
        // Reservation dates are stored as UTC midnight, so extract UTC date components
        // But reservation times are in local time, so we need to create a local date-time
        const dateToUseUTC = dateToUse instanceof Date ? dateToUse : new Date(dateToUse);
        const [hours, minutes] = timeToUse.split(':').map(Number);
        
        // Create a local date-time for comparison
        // Extract UTC date components and create a local date with those components
        // Then set the local time to the reservation time (which is in local time)
        const newDateTime = new Date(
          dateToUseUTC.getUTCFullYear(),
          dateToUseUTC.getUTCMonth(),
          dateToUseUTC.getUTCDate(),
          hours,
          minutes
        );
        
        // Compare with current local time (consistent with create reservation validation)
        const now = new Date();
        if (newDateTime < now) {
          return res.status(400).json({
            error: 'Cannot update reservation to a past date/time'
          });
        }
      }

      // Update the reservation
      const updatedReservation = await prisma.reservation.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          restaurant: true
        }
      });

      res.json({
        message: 'Reservation updated successfully',
        reservation: updatedReservation
      });
    } catch (error) {
      console.error('Update reservation error:', error);
      res.status(500).json({ error: 'Failed to update reservation' });
    }
  },

  // Cancel a reservation
  async cancelReservation(req: CustomerAuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const customerId = req.customer?.id || req.customerUser!.userId;

      // Get customer email for lookup
      const customer = await prisma.customer.findUnique({
        where: { id: customerId }
      });

      // Check if reservation exists and belongs to customer
      const reservation = await prisma.reservation.findFirst({
        where: {
          id: parseInt(id),
          customerEmail: customer?.email
        }
      });

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      // Don't allow canceling past reservations
      const reservationDateTime = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`);
      if (reservationDateTime < new Date()) {
        return res.status(400).json({
          error: 'Cannot cancel past reservations'
        });
      }

      // Don't allow canceling non-confirmed reservations
      if (reservation.status !== 'CONFIRMED') {
        return res.status(400).json({
          error: 'Reservation is not in a cancellable state'
        });
      }

      // Cancel the reservation
      const cancelledReservation = await prisma.reservation.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'CANCELLED',
          updatedAt: new Date()
        },
        include: {
          restaurant: true
        }
      });

      // TODO: Send cancellation email
      // await emailService.sendReservationCancellation(customer.email, cancelledReservation);

      res.json({
        message: 'Reservation cancelled successfully',
        reservation: cancelledReservation
      });
    } catch (error) {
      console.error('Cancel reservation error:', error);
      res.status(500).json({ error: 'Failed to cancel reservation' });
    }
  }
}; 