import { Request, Response } from 'express';
import prisma from '../config/db';
import { OrderStatus, OrderType, OrderItemStatus } from '@prisma/client';

// Helper function for safe integer parsing
const safeParseInt = (val: unknown): number | undefined => {
    if (typeof val === 'number') return !isNaN(val) ? Math.floor(val) : undefined;
    if (typeof val === 'string' && val !== '') {
        const parsed = parseInt(val, 10);
        return !isNaN(parsed) ? parsed : undefined;
    }
    return undefined;
};

// Helper function for safe float parsing
const safeParseFloat = (val: unknown): number | undefined => {
    if (typeof val === 'number') return !isNaN(val) ? val : undefined;
    if (typeof val === 'string' && val !== '') {
        const parsed = parseFloat(val);
        return !isNaN(parsed) ? parsed : undefined;
    }
    return undefined;
};

// Generate order number
const generateOrderNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${year}${month}${day}-${random}`;
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { status, date, orderType } = req.query;
        
        const where: any = { userId: req.user.id };
        
        if (status && status !== 'all') {
            where.status = status as OrderStatus;
        }
        
        if (date) {
            const startDate = new Date(date as string);
            const endDate = new Date(date as string);
            endDate.setDate(endDate.getDate() + 1);
            
            where.createdAt = {
                gte: startDate,
                lt: endDate
            };
        }
        
        if (orderType && orderType !== 'all') {
            where.orderType = orderType as OrderType;
        }

        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                orderItems: {
                    include: {
                        menuItem: true
                    }
                },
                reservation: {
                    select: {
                        id: true,
                        customerName: true,
                        partySize: true
                    }
                }
            }
        });

        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { id } = req.params;
        const orderId = safeParseInt(id);
        
        if (!orderId) {
            res.status(400).json({ message: 'Invalid order ID format' });
            return;
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        menuItem: {
                            include: {
                                recipe: true
                            }
                        }
                    }
                },
                reservation: true
            }
        });

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.userId !== req.user.id) {
            res.status(403).json({ message: 'Not authorized to view this order' });
            return;
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order' });
    }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const {
            reservationId,
            customerName,
            orderType,
            notes,
            orderItems
        } = req.body;

        if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            res.status(400).json({ message: 'Order must have at least one item' });
            return;
        }

        // Validate order items
        for (const item of orderItems) {
            if (!item.menuItemId || !item.quantity || !item.price) {
                res.status(400).json({ message: 'Invalid order item data' });
                return;
            }
        }

        // Calculate total amount
        let totalAmount = 0;
        const processedItems = orderItems.map((item: any) => {
            const quantity = safeParseInt(item.quantity) || 1;
            const price = safeParseFloat(item.price) || 0;
            totalAmount += quantity * price;
            
            return {
                menuItemId: safeParseInt(item.menuItemId),
                quantity,
                price,
                modifiers: item.modifiers || null,
                notes: item.notes || null
            };
        });

        const orderNumber = generateOrderNumber();

        const newOrder = await prisma.order.create({
            data: {
                orderNumber,
                reservationId: reservationId ? safeParseInt(reservationId) : null,
                customerName: customerName || null,
                orderType: orderType || 'DINE_IN',
                notes: notes || null,
                totalAmount,
                userId: req.user.id,
                orderItems: {
                    create: processedItems
                }
            },
            include: {
                orderItems: {
                    include: {
                        menuItem: true
                    }
                }
            }
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { id } = req.params;
        const { status } = req.body;
        const orderId = safeParseInt(id);
        
        if (!orderId) {
            res.status(400).json({ message: 'Invalid order ID' });
            return;
        }

        if (!status || !Object.values(OrderStatus).includes(status)) {
            res.status(400).json({ message: 'Invalid order status' });
            return;
        }

        // Check if order exists and belongs to user
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!existingOrder) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (existingOrder.userId !== req.user.id) {
            res.status(403).json({ message: 'Not authorized to update this order' });
            return;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                orderItems: {
                    include: {
                        menuItem: true
                    }
                }
            }
        });

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
};

// @desc    Update order item status
// @route   PUT /api/orders/:orderId/items/:itemId/status
// @access  Private
export const updateOrderItemStatus = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { orderId, itemId } = req.params;
        const { status } = req.body;
        const orderIdNum = safeParseInt(orderId);
        const itemIdNum = safeParseInt(itemId);
        
        if (!orderIdNum || !itemIdNum) {
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }

        if (!status || !Object.values(OrderItemStatus).includes(status)) {
            res.status(400).json({ message: 'Invalid item status' });
            return;
        }

        // Check if order exists and belongs to user
        const order = await prisma.order.findUnique({
            where: { id: orderIdNum },
            include: {
                orderItems: {
                    where: { id: itemIdNum }
                }
            }
        });

        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (order.userId !== req.user.id) {
            res.status(403).json({ message: 'Not authorized to update this order' });
            return;
        }

        if (order.orderItems.length === 0) {
            res.status(404).json({ message: 'Order item not found' });
            return;
        }

        const updatedItem = await prisma.orderItem.update({
            where: { id: itemIdNum },
            data: { status },
            include: {
                menuItem: true
            }
        });

        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating order item status:', error);
        res.status(500).json({ message: 'Error updating order item status' });
    }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { id } = req.params;
        const orderId = safeParseInt(id);
        
        if (!orderId) {
            res.status(400).json({ message: 'Invalid order ID format' });
            return;
        }

        // Check if order exists and belongs to user
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!existingOrder) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }

        if (existingOrder.userId !== req.user.id) {
            res.status(403).json({ message: 'Not authorized to delete this order' });
            return;
        }

        // Only allow deletion of orders in certain states
        if (['IN_PROGRESS', 'READY'].includes(existingOrder.status)) {
            res.status(400).json({ message: 'Cannot delete an active order' });
            return;
        }

        await prisma.order.delete({
            where: { id: orderId }
        });

        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order' });
    }
}; 