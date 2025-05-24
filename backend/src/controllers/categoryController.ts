import { Request, Response } from 'express';
import prisma from '../config/db';

// @desc    Get all categories for the authenticated user
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
        const categories = await prisma.category.findMany({
            where: { userId: userId }, // Filter by user ID
            orderBy: { name: 'asc' } // Order alphabetically
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

// @desc    Create a new category for the authenticated user
// @route   POST /api/categories
// @access  Private
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }
        const newCategory = await prisma.category.create({
            data: {
                name,
                description: description || null,
                userId: userId, // Associate with the logged-in user
                restaurantId: 1, // Single restaurant MVP
            },
        });
        res.status(201).json(newCategory);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: `Category with name '${req.body.name}' already exists.` });
            return;
        }
        res.status(500).json({ message: 'Error creating category' });
    }
};

// @desc    Update a category (owned by the authenticated user)
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) {
             res.status(400).json({ message: 'Invalid category ID format' });
             return;
        }
        const { name, description } = req.body;
         if (!name) { // Name is required for update too
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }

        // First, check if the category exists and belongs to the user
        const existingCategory = await prisma.category.findUnique({
            where: {
                id: categoryId,
                userId: userId, // Check ownership
            },
        });

        if (!existingCategory) {
            res.status(404).json({ message: 'Category not found or you do not have permission to update it.' });
            return;
        }

        const updatedCategory = await prisma.category.update({
            where: {
                id: categoryId,
                // No need for userId here again as we checked ownership above
            },
            data: {
                name,
                description: description || null,
            },
        });
        res.status(200).json(updatedCategory);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: `Category with name '${req.body.name}' might already exist.` });
            return;
        }
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.status(500).json({ message: 'Error updating category' });
    }
};

// @desc    Delete a category (owned by the authenticated user)
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
         const { id } = req.params;
         const categoryId = parseInt(id, 10);
         if (isNaN(categoryId)) {
             res.status(400).json({ message: 'Invalid category ID format' });
             return;
         }
         // Note: Because we used onDelete: SetNull, deleting a category will set
         // the categoryId to NULL for any recipes using it. It won't prevent deletion.

         // First, check if the category exists and belongs to the user
        const existingCategory = await prisma.category.findUnique({
             where: {
                 id: categoryId,
                 userId: userId, // Check ownership
             },
         });

        if (!existingCategory) {
             res.status(404).json({ message: 'Category not found or you do not have permission to delete it.' });
             return;
         }

         await prisma.category.delete({
             where: { id: categoryId },
         });
         res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        // P2003 (Foreign Key Constraint) shouldn't happen here due to SetNull
        res.status(500).json({ message: 'Error deleting category' });
    }
};

// Optional: Get category by ID (owned by the authenticated user)
export const getCategoryById = async (req: Request, res: Response): Promise<void> => { 
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) {
             res.status(400).json({ message: 'Invalid category ID format' });
             return;
        }
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
                userId: userId // Check ownership
            }
        });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching category' });
    }
}; 