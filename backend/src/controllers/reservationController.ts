import { Request, Response } from 'express';
import prisma from '../config/db';
import { ReservationStatus } from '@prisma/client';
import { emailService } from '../services/emailService';
import { format } from 'date-fns';

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

        // Admin/staff can view any reservation
        // Remove user check since staff should see all reservations

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

        const newReservation = await prisma.reservation.create({
            data: {
                customerName,
                customerPhone,
                customerEmail,
                partySize: partySizeNum,
                reservationDate: new Date(reservationDate),
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

        // Check if reservation exists and belongs to user
        const existingReservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        if (!existingReservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        // Admin/staff can update any reservation

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

        // Check if reservation exists and belongs to user
        const existingReservation = await prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        if (!existingReservation) {
            res.status(404).json({ message: 'Reservation not found' });
            return;
        }

        // Admin/staff can delete any reservation

        await prisma.reservation.delete({
            where: { id: reservationId }
        });

        res.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ message: 'Error deleting reservation' });
    }
}; 