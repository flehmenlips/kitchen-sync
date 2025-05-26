import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomerAuthRequest } from '../middleware/authenticateCustomer';
import { ReservationStatus } from '@prisma/client';
import { emailService } from '../services/emailService';
import { format } from 'date-fns';

const prisma = new PrismaClient();

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

        const newReservation = await prisma.reservation.create({
            data: {
                customerName: customerName || customerProfile.user.name || 'Guest',
                customerPhone: customerPhone || customerProfile.user.phone || undefined,
                customerEmail: customerEmail || customerProfile.user.email,
                customerId: req.customerUser.userId,
                partySize,
                reservationDate: new Date(reservationDate),
                reservationTime,
                notes,
                specialRequests,
                userId: 1, // Default staff user for now
                restaurantId: 1 // Single restaurant MVP
            }
        });

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
                    }
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
      const customerId = req.customer?.id || req.customerUser!.userId;
      const customer = req.customer || (await prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          restaurantId: true
        }
      }));

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const {
        restaurantId = 1, // Default to restaurant 1 for MVP
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

      // Validate date is not in the past
      const reservationDateTime = new Date(`${reservationDate}T${reservationTime}`);
      if (reservationDateTime < new Date()) {
        return res.status(400).json({
          error: 'Cannot create reservations in the past'
        });
      }

      // Create the reservation
      const reservation = await prisma.reservation.create({
        data: {
          // customerId, // Commenting out due to schema mismatch - expects User not Customer
          customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          restaurantId,
          reservationDate: new Date(reservationDate),
          reservationTime,
          partySize: parseInt(partySize),
          status: 'CONFIRMED',
          notes,
          specialRequests,
          userId: 1, // Using default user ID for customer reservations
          source: 'customer_portal'
        },
        include: {
          restaurant: true
        }
      });

      // TODO: Send confirmation email
      // await emailService.sendReservationConfirmation(customer.email, reservation);

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