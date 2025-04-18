import { Request, Response } from 'express';
import prisma from '../config/db';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public (for now)
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' } // Order alphabetically
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin (eventually)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
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

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin (eventually)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
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
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
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

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin (eventually)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
         const { id } = req.params;
         const categoryId = parseInt(id, 10);
         if (isNaN(categoryId)) {
             res.status(400).json({ message: 'Invalid category ID format' });
             return;
         }
         // Note: Because we used onDelete: SetNull, deleting a category will set
         // the categoryId to NULL for any recipes using it. It won't prevent deletion.
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

// Optional: Get category by ID (might not be needed often)
export const getCategoryById = async (req: Request, res: Response): Promise<void> => { 
    // Implementation similar to getUnitById 
    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) {
             res.status(400).json({ message: 'Invalid category ID format' });
             return;
        }
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
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