import { Request, Response } from 'express';
import prisma from '../config/db';
import { ReservationStatus } from '@prisma/client';
import { emailService } from '../services/emailService';
import { format } from 'date-fns';
import { checkAvailability, getTimeSlotAvailabilities, generateTimeSlots } from '../services/reservationCapacityService';

// Helper function for safe integer parsing
const safeParseInt = (val: unknown): number | undefined => {
    if (typeof val === 'number') return !isNaN(val) ? Math.floor(val) : undefined;
    if (typeof val === 'string' && val !== '') {
        const parsed = parseInt(val, 10);
        return !isNaN(parsed) ? parsed : undefined;
    }
    return undefined;
};

// Helper function to generate confirmation number
const generateConfirmationNumber = (id: number): string => {
    const prefix = 'SBK'; // Seabreeze Kitchen
    const paddedId = id.toString().padStart(6, '0');
    return `${prefix}${paddedId}`;
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
export const getReservations = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { date, status } = req.query;
        
        // Get the restaurants this user has access to
        const userRestaurants = await prisma.restaurantStaff.findMany({
            where: { 
                userId: req.user.id,
                isActive: true
            },
            select: { restaurantId: true }
        });

        // If user has no restaurant associations, they shouldn't see any reservations
        if (userRestaurants.length === 0) {
            res.status(200).json([]);
            return;
        }

        const restaurantIds = userRestaurants.map(r => r.restaurantId);
        
        // Build where clause with restaurant filtering
        const where: any = {
            restaurantId: { in: restaurantIds }
        };
        
        if (date) {
            const startDate = new Date(date as string);
            const endDate = new Date(date as string);
            endDate.setDate(endDate.getDate() + 1);
            
            where.reservationDate = {
                gte: startDate,
                lt: endDate
            };
        }
        
        if (status && status !== 'all') {
            where.status = status as ReservationStatus;
        }

        const reservations = await prisma.reservation.findMany({
            where,
            orderBy: [
                { reservationDate: 'asc' },
                { reservationTime: 'asc' }
            ],
            include: {
                orders: {
                    select: {
                        id: true,
                        orderNumber: true,
                        status: true
                    }
                }
            }
        });

        res.status(200).json(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Error fetching reservations' });
    }
};

// @desc    Get single reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
export const getReservationById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { id } = req.params;
        const reservationId = safeParseInt(id);
        
        if (!reservationId) {
            res.status(400).json({ message: 'Invalid reservation ID format' });
            return;
        }

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                orders: true
            }
        });

        if (!reservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        // Check if user has access to the restaurant
        const hasAccess = await prisma.restaurantStaff.findFirst({
            where: {
                userId: req.user.id,
                restaurantId: reservation.restaurantId,
                isActive: true
            }
        });

        if (!hasAccess) {
            res.status(403).json({ message: 'Not authorized to view this reservation' });
            return;
        }

        res.status(200).json(reservation);
    } catch (error) {
        console.error('Error fetching reservation:', error);
        res.status(500).json({ message: 'Error fetching reservation' });
    }
};

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private
export const createReservation = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
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
            notes
        } = req.body;

        if (!customerName || !partySize || !reservationDate || !reservationTime) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        const partySizeNum = safeParseInt(partySize);
        if (!partySizeNum || partySizeNum < 1) {
            res.status(400).json({ message: 'Invalid party size' });
            return;
        }

        // Get user's primary restaurant
        const userRestaurant = await prisma.restaurantStaff.findFirst({
            where: { 
                userId: req.user.id,
                isActive: true
            },
            orderBy: { createdAt: 'asc' } // Use their first/primary restaurant
        });

        if (!userRestaurant) {
            res.status(403).json({ message: 'You must be associated with a restaurant to create reservations' });
            return;
        }

        const reservationDateObj = new Date(reservationDate);
        
        // Check capacity before creating reservation
        const availability = await checkAvailability(
            userRestaurant.restaurantId,
            reservationDateObj,
            reservationTime,
            partySizeNum
        );

        if (!availability.available) {
            const capacityMsg = availability.capacity 
                ? `Capacity limit of ${availability.capacity} reached. Current bookings: ${availability.currentBookings}`
                : 'This time slot is not available';
            res.status(400).json({ 
                message: capacityMsg,
                availability: {
                    currentBookings: availability.currentBookings,
                    capacity: availability.capacity,
                    remaining: availability.remaining
                }
            });
            return;
        }

        // Warn if overbooking (but still allow it)
        if (availability.overbooked) {
            console.warn(`Overbooking reservation: ${partySizeNum} guests at ${reservationTime} on ${reservationDate}. Capacity: ${availability.capacity}, Current: ${availability.currentBookings}`);
        }

        const newReservation = await prisma.reservation.create({
            data: {
                customerName,
                customerPhone,
                customerEmail,
                partySize: partySizeNum,
                reservationDate: reservationDateObj,
                reservationTime,
                notes,
                userId: req.user.id,
                restaurantId: userRestaurant.restaurantId
            }
        });

        // Send confirmation email if customer email is provided
        if (customerEmail) {
            try {
                const formattedDate = format(new Date(reservationDate), 'EEEE, MMMM d, yyyy');
                await emailService.sendReservationConfirmation(
                    customerEmail,
                    customerName,
                    {
                        date: formattedDate,
                        time: reservationTime,
                        partySize: partySizeNum,
                        specialRequests: notes,
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

// @desc    Update a reservation
// @route   PUT /api/reservations/:id
// @access  Private
export const updateReservation = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { id } = req.params;
        const reservationId = safeParseInt(id);
        
        if (!reservationId) {
            res.status(400).json({ message: 'Invalid reservation ID' });
            return;
        }

        // Check if reservation exists
        const existingReservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        if (!existingReservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        // Check if user has access to the restaurant
        const hasAccess = await prisma.restaurantStaff.findFirst({
            where: {
                userId: req.user.id,
                restaurantId: existingReservation.restaurantId,
                isActive: true
            }
        });

        if (!hasAccess) {
            res.status(403).json({ message: 'Not authorized to update this reservation' });
            return;
        }

        const {
            customerName,
            customerPhone,
            customerEmail,
            partySize,
            reservationDate,
            reservationTime,
            status,
            notes
        } = req.body;

        const updateData: any = {};
        
        if (customerName) updateData.customerName = customerName;
        if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
        if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
        if (partySize) {
            const partySizeNum = safeParseInt(partySize);
            if (partySizeNum && partySizeNum > 0) {
                updateData.partySize = partySizeNum;
            }
        }
        if (reservationDate) updateData.reservationDate = new Date(reservationDate);
        if (reservationTime) updateData.reservationTime = reservationTime;
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const updatedReservation = await prisma.reservation.update({
            where: { id: reservationId },
            data: updateData
        });

        res.status(200).json(updatedReservation);
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({ message: 'Error updating reservation' });
    }
};

// @desc    Delete a reservation
// @route   DELETE /api/reservations/:id
// @access  Private
export const deleteReservation = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { id } = req.params;
        const reservationId = safeParseInt(id);
        
        if (!reservationId) {
            res.status(400).json({ message: 'Invalid reservation ID format' });
            return;
        }

        // Check if reservation exists
        const existingReservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        if (!existingReservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        // Check if user has access to the restaurant
        const hasAccess = await prisma.restaurantStaff.findFirst({
            where: {
                userId: req.user.id,
                restaurantId: existingReservation.restaurantId,
                isActive: true
            }
        });

        if (!hasAccess) {
            res.status(403).json({ message: 'Not authorized to delete this reservation' });
            return;
        }

        await prisma.reservation.delete({
            where: { id: reservationId }
        });

        res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Error deleting reservation' });
    }
};

// @desc    Get available time slots for a date
// @route   GET /api/reservations/availability/:restaurantId
// @access  Private
export const getAvailability = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const restaurantId = parseInt(req.params.restaurantId);
        const { date, partySize } = req.query;

        if (isNaN(restaurantId)) {
            res.status(400).json({ message: 'Invalid restaurant ID' });
            return;
        }

        if (!date) {
            res.status(400).json({ message: 'Date parameter is required' });
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
        const requestedPartySize = partySize ? parseInt(partySize as string) : 1;

        // Generate time slots based on reservation settings
        const timeSlots = await generateTimeSlots(restaurantId, targetDate);

        if (timeSlots.length === 0) {
            res.status(200).json({
                date: date,
                timeSlots: [],
                message: 'Restaurant is closed on this date'
            });
            return;
        }

        // Get availability for all time slots
        const availabilities = await getTimeSlotAvailabilities(
            restaurantId,
            targetDate,
            timeSlots
        );

        // Filter and format results
        const availableSlots = availabilities
            .filter(avail => {
                // If party size specified, check if slot can accommodate it
                if (requestedPartySize > 0) {
                    if (avail.capacity === null) return true; // Unlimited capacity
                    return avail.remaining === null || avail.remaining >= requestedPartySize;
                }
                return avail.available;
            })
            .map(avail => ({
                timeSlot: avail.timeSlot,
                available: avail.available,
                currentBookings: avail.currentBookings,
                capacity: avail.capacity,
                remaining: avail.remaining,
                canAccommodate: avail.capacity === null || (avail.remaining !== null && avail.remaining >= requestedPartySize)
            }));

        res.status(200).json({
            date: date,
            partySize: requestedPartySize,
            timeSlots: availableSlots,
            allSlots: availabilities
        });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Error fetching availability' });
    }
}; 