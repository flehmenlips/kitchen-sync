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
            include: {
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
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
        const { title, description, status, recipeId, order } = req.body;

        // Validate required fields
        if (!title) {
            res.status(400).json({ message: 'Title is required' });
            return;
        }

        const task = await prisma.prepTask.create({
            data: {
                title,
                description,
                status: status || 'TO_PREP',
                recipeId: recipeId || null,
                userId: req.user.id,
                order: order || 0
            },
            include: {
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
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
        const { title, description, status, recipeId, order } = req.body;

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
                status: status as PrepTaskStatus,
                recipeId,
                order
            },
            include: {
                recipe: {
                    select: {
                        id: true,
                        name: true,
                        description: true
                    }
                }
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