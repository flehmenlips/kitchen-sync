import { Request, Response } from 'express';
import prisma from '../config/db';
import { getRestaurantFilter } from '../middleware/restaurantContext';

// @desc    Get all prep columns for the authenticated user
// @route   GET /api/prep-columns
// @access  Private
export const getPrepColumns = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
        return;
    }

    try {
        const columns = await prisma.prepColumn.findMany({
            where: { 
                userId: req.user.id,
                restaurantId: req.restaurantId // Filter by current restaurant
            },
            orderBy: { order: 'asc' },
            include: {
                tasks: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        res.status(200).json(columns);
    } catch (error) {
        console.error('Error fetching prep columns:', error);
        res.status(500).json({ message: 'Error fetching prep columns' });
    }
};

// @desc    Create a new prep column
// @route   POST /api/prep-columns
// @access  Private
export const createPrepColumn = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
        return;
    }

    try {
        const { name, color } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Column name is required' });
            return;
        }

        // Check for duplicate column name
        const existingColumn = await prisma.prepColumn.findFirst({
            where: {
                name,
                userId: req.user.id,
                restaurantId: req.restaurantId
            }
        });

        if (existingColumn) {
            res.status(400).json({ message: 'A column with this name already exists' });
            return;
        }

        // Get the highest order number and add 1
        const lastColumn = await prisma.prepColumn.findFirst({
            where: { 
                userId: req.user.id,
                restaurantId: req.restaurantId
            },
            orderBy: { order: 'desc' }
        });
        const newOrder = (lastColumn?.order ?? -1) + 1;

        const column = await prisma.prepColumn.create({
            data: {
                name,
                color: color || '#1976d2', // Default to Material-UI primary blue
                order: newOrder,
                userId: req.user.id,
                restaurantId: req.restaurantId // Use restaurant from context
            }
        });

        res.status(201).json(column);
    } catch (error) {
        console.error('Error creating prep column:', error);
        res.status(500).json({ message: 'Error creating prep column' });
    }
};

// @desc    Update a prep column
// @route   PUT /api/prep-columns/:id
// @access  Private
export const updatePrepColumn = async (req: Request, res: Response): Promise<void> => {
    console.log('updatePrepColumn called with:', {
        id: req.params.id,
        body: req.body,
        userId: req.user?.id
    });
    
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
        return;
    }

    try {
        const { id } = req.params;
        const { name, color } = req.body;
        
        console.log(`Updating column ${id} with:`, { name, color });

        // Check if column exists and belongs to user
        const existingColumn = await prisma.prepColumn.findUnique({
            where: { id }
        });

        if (!existingColumn) {
            console.log(`Column with id ${id} not found`);
            res.status(404).json({ message: 'Column not found' });
            return;
        }

        if (existingColumn.userId !== req.user.id || existingColumn.restaurantId !== req.restaurantId) {
            console.log(`User ${req.user.id} not authorized to update column ${id}`);
            res.status(403).json({ message: 'Not authorized to update this column' });
            return;
        }

        // If name is being changed, check for duplicates
        if (name && name !== existingColumn.name) {
            const duplicateColumn = await prisma.prepColumn.findFirst({
                where: {
                    name,
                    userId: req.user.id,
                    restaurantId: req.restaurantId,
                    id: { not: id }
                }
            });

            if (duplicateColumn) {
                console.log(`Duplicate column name "${name}" found for user ${req.user.id}`);
                res.status(400).json({ message: 'A column with this name already exists' });
                return;
            }
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (color) updateData.color = color;
        
        console.log(`Final update data for column ${id}:`, updateData);

        const column = await prisma.prepColumn.update({
            where: { id },
            data: updateData
        });

        console.log(`Column ${id} updated successfully:`, column);
        res.status(200).json(column);
    } catch (error) {
        console.error('Error updating prep column:', error);
        res.status(500).json({ message: 'Error updating prep column' });
    }
};

// @desc    Delete a prep column
// @route   DELETE /api/prep-columns/:id
// @access  Private
export const deletePrepColumn = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
        return;
    }

    try {
        const { id } = req.params;

        // Check if column exists and belongs to user
        const existingColumn = await prisma.prepColumn.findUnique({
            where: { id },
            include: { tasks: true }
        });

        if (!existingColumn) {
            res.status(404).json({ message: 'Column not found' });
            return;
        }

        if (existingColumn.userId !== req.user.id || existingColumn.restaurantId !== req.restaurantId) {
            res.status(403).json({ message: 'Not authorized to delete this column' });
            return;
        }

        // Don't allow deletion if there are tasks in the column
        if (existingColumn.tasks.length > 0) {
            res.status(400).json({ message: 'Cannot delete column with existing tasks. Move or delete tasks first.' });
            return;
        }

        await prisma.prepColumn.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Column deleted successfully' });
    } catch (error) {
        console.error('Error deleting prep column:', error);
        res.status(500).json({ message: 'Error deleting prep column' });
    }
};

// @desc    Reorder prep columns
// @route   PUT /api/prep-columns/reorder
// @access  Private
export const reorderPrepColumns = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
        return;
    }

    try {
        const { columnIds } = req.body;

        if (!Array.isArray(columnIds)) {
            res.status(400).json({ message: 'Column IDs must be an array' });
            return;
        }

        // Verify all columns exist and belong to the user
        const existingColumns = await prisma.prepColumn.findMany({
            where: {
                id: { in: columnIds },
                userId: req.user.id,
                restaurantId: req.restaurantId
            }
        });

        if (existingColumns.length !== columnIds.length) {
            res.status(400).json({ message: 'One or more columns not found or not authorized' });
            return;
        }

        // Update the order of all columns in a transaction
        await prisma.$transaction(
            columnIds.map((id, index) =>
                prisma.prepColumn.update({
                    where: { id },
                    data: { order: index }
                })
            )
        );

        // Return the updated columns
        const updatedColumns = await prisma.prepColumn.findMany({
            where: { 
                userId: req.user.id,
                restaurantId: req.restaurantId
            },
            orderBy: { order: 'asc' },
            include: {
                tasks: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        res.status(200).json(updatedColumns);
    } catch (error) {
        console.error('Error reordering prep columns:', error);
        res.status(500).json({ message: 'Error reordering prep columns' });
    }
}; 