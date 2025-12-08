import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomerAuthRequest } from '../middleware/authenticateCustomer';
import { ReservationStatus } from '@prisma/client';
import { emailService } from '../services/emailService';
import { format } from 'date-fns';

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

        // Default to next 90 days if no dates provided
        const start = startDate ? parseUTCDate(startDate as string) : new Date();
        const end = endDate ? parseUTCDate(endDate as string) : (() => {
            const futureDate = new Date();
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

        // Get restaurant ID from slug (default to restaurant ID 1 for MVP)
        let restaurantId = 1;
        if (restaurantSlug) {
            const restaurant = await prisma.restaurant.findUnique({
                where: { slug: restaurantSlug as string },
                select: { id: true }
            });
            if (restaurant) {
                restaurantId = restaurant.id;
            }
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

        const restaurantId = 1; // Single restaurant MVP
        const reservationDateObj = new Date(reservationDate);
        const partySizeNum = parseInt(partySize);

        // Validate party size is a valid number
        if (isNaN(partySizeNum) || partySizeNum < 1) {
            res.status(400).json({ message: 'Party size must be a valid number greater than 0' });
            return;
        }

        // Check daily capacity (customers cannot override)
        const { checkDailyCapacity } = await import('../services/reservationCapacityService');
        const dailyCapacity = await checkDailyCapacity(restaurantId, reservationDateObj, partySizeNum);
        
        if (!dailyCapacity.available) {
            res.status(400).json({ 
                message: `Sorry, this date is fully booked. Daily capacity limit of ${dailyCapacity.maxCoversPerDay} covers has been reached (current: ${dailyCapacity.currentCovers} covers).`,
                dailyCapacity: {
                    currentCovers: dailyCapacity.currentCovers,
                    maxCoversPerDay: dailyCapacity.maxCoversPerDay,
                    remaining: dailyCapacity.remaining
                }
            });
            return;
        }

        const newReservation = await prisma.reservation.create({
            data: {
                customerName: customerName || customerProfile.user.name || 'Guest',
                customerPhone: customerPhone || customerProfile.user.phone || undefined,
                customerEmail: customerEmail || customerProfile.user.email,
                customerId: req.customerUser.userId,
                partySize: partySizeNum,
                reservationDate: new Date(reservationDate),
                reservationTime,
                notes,
                specialRequests,
                userId: 1, // Default staff user for now
                restaurantId
            }
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
                const formattedDate = format(new Date(reservationDate), 'EEEE, MMMM d, yyyy');
                await emailService.sendReservationConfirmation(
                    emailToUse,
                    customerName || customerProfile.user.name || 'Guest',
                    {
                        date: formattedDate,
                        time: reservationTime,
                        partySize,
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

        res.status(201).json(newReservation);
    } catch (error) {
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
      res.json(reservations);
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
      if (restaurantSlug) {
        const restaurant = await prisma.restaurant.findUnique({
          where: { slug: restaurantSlug },
          select: { id: true }
        });
        if (restaurant) {
          restaurantId = restaurant.id;
        }
      }
      
      // Fall back to restaurantId from body (but never default to 1 - that's dangerous)
      if (!restaurantId) {
        restaurantId = req.body.restaurantId;
      }
      
      // Fix Bug B: Ensure restaurantId is set - fail if not provided (never default to 1)
      if (!restaurantId) {
        return res.status(400).json({
          error: 'Restaurant ID or slug is required',
          message: 'Please provide a restaurant slug or restaurant ID'
        });
      }

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

      // Validate party size
      if (partySize < 1 || partySize > 20) {
        return res.status(400).json({
          error: 'Party size must be between 1 and 20'
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

      // Validate date is not in the past
      const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
      if (reservationDateTime < new Date()) {
        return res.status(400).json({
          error: 'Cannot create reservations in the past'
        });
      }

      // Use transaction to ensure atomicity
      const reservation = await prisma.$transaction(async (tx) => {
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

        // Create the reservation
        return await tx.reservation.create({
          data: {
            customerId: customerId || null,
            customerName,
            customerEmail,
            customerPhone,
            restaurantId,
            reservationDate: new Date(reservationDate),
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
        const formattedDate = format(reservation.reservationDate, 'EEEE, MMMM d, yyyy');
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

      res.status(201).json({
        message: 'Reservation created successfully',
        reservation
      });
    } catch (error: any) {
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
      
      if (reservationDate) {
        updateData.reservationDate = new Date(reservationDate);
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
        const newDate = reservationDate || existingReservation.reservationDate;
        const newTime = reservationTime || existingReservation.reservationTime;
        const newDateTime = new Date(`${newDate}T${newTime}`);
        
        if (newDateTime < new Date()) {
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