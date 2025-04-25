import { Request, Response } from 'express';
import prisma from '../config/db';
import { PrepTaskStatus } from '@prisma/client';

// @desc    Get all prep tasks for the authenticated user
// @route   GET /api/prep-tasks
// @access  Private
export const getPrepTasks = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        const tasks = await prisma.prepTask.findMany({
            where: { userId: req.user.id },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ],
            include: {
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                column: true
            }
        });
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching prep tasks:', error);
        res.status(500).json({ message: 'Error fetching prep tasks' });
    }
};

// @desc    Create a new prep task
// @route   POST /api/prep-tasks
// @access  Private
export const createPrepTask = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        const { title, description, recipeId, columnId, order = 0 } = req.body;

        if (!title) {
            res.status(400).json({ message: 'Title is required' });
            return;
        }

        if (!columnId) {
            res.status(400).json({ message: 'Column ID is required' });
            return;
        }

        const task = await prisma.prepTask.create({
            data: {
                title,
                description,
                columnId,
                order,
                userId: req.user.id,
                recipeId: recipeId || null
            },
            include: {
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                column: true
            }
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating prep task:', error);
        res.status(500).json({ message: 'Error creating prep task' });
    }
};

// @desc    Update a prep task
// @route   PUT /api/prep-tasks/:id
// @access  Private
export const updatePrepTask = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        const { id } = req.params;
        const { title, description, order, recipeId, columnId } = req.body;

        // Check if task exists and belongs to user
        const existingTask = await prisma.prepTask.findUnique({
            where: { id }
        });

        if (!existingTask) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        if (existingTask.userId !== req.user.id) {
            res.status(403).json({ message: 'Not authorized to update this task' });
            return;
        }

        const updatedTask = await prisma.prepTask.update({
            where: { id },
            data: {
                title,
                description,
                columnId,
                order,
                recipeId: recipeId || null
            },
            include: {
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                column: true
            }
        });

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error('Error updating prep task:', error);
        res.status(500).json({ message: 'Error updating prep task' });
    }
};

// @desc    Delete a prep task
// @route   DELETE /api/prep-tasks/:id
// @access  Private
export const deletePrepTask = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        const { id } = req.params;

        // Check if task exists and belongs to user
        const existingTask = await prisma.prepTask.findUnique({
            where: { id }
        });

        if (!existingTask) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        if (existingTask.userId !== req.user.id) {
            res.status(403).json({ message: 'Not authorized to delete this task' });
            return;
        }

        await prisma.prepTask.delete({
            where: { id }
        });

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting prep task:', error);
        res.status(500).json({ message: 'Error deleting prep task' });
    }
};

// @desc    Reorder prep tasks
// @route   PUT /api/prep-tasks/reorder
// @access  Private
export const reorderPrepTasks = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        const { tasks } = req.body;

        if (!Array.isArray(tasks)) {
            res.status(400).json({ message: 'Tasks must be an array of {id, order, columnId}' });
            return;
        }

        // Verify all tasks exist and belong to the user
        const taskIds = tasks.map(t => t.id);
        const existingTasks = await prisma.prepTask.findMany({
            where: {
                id: { in: taskIds },
                userId: req.user.id
            }
        });

        if (existingTasks.length !== taskIds.length) {
            res.status(400).json({ message: 'One or more tasks not found or not authorized' });
            return;
        }

        // Update all tasks in a transaction
        await prisma.$transaction(
            tasks.map(({ id, order, columnId }) =>
                prisma.prepTask.update({
                    where: { id },
                    data: { order, columnId }
                })
            )
        );

        // Return the updated tasks
        const updatedTasks = await prisma.prepTask.findMany({
            where: { userId: req.user.id },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ],
            include: {
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                },
                column: true
            }
        });

        res.status(200).json(updatedTasks);
    } catch (error) {
        console.error('Error reordering prep tasks:', error);
        res.status(500).json({ message: 'Error reordering prep tasks' });
    }
}; 