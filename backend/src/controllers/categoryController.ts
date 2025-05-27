import { Request, Response } from 'express';
import prisma from '../config/db';
import { getRestaurantFilter } from '../middleware/restaurantContext';

// @desc    Get all categories for the authenticated user
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
        return;
    }
    
    const userId = req.user.id;

    try {
        const categories = await prisma.category.findMany({
            where: { 
                userId: userId,
                restaurantId: req.restaurantId // Filter by current restaurant
            },
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
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
        return;
    }
    
    const userId = req.user.id;

    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }
        
        // Check for duplicate in this restaurant
        const existingCategory = await prisma.category.findFirst({
            where: {
                name,
                userId: userId,
                restaurantId: req.restaurantId
            }
        });
        
        if (existingCategory) {
            res.status(409).json({ message: `Category with name '${name}' already exists in this restaurant.` });
            return;
        }
        
        const newCategory = await prisma.category.create({
            data: {
                name,
                description: description || null,
                userId: userId,
                restaurantId: req.restaurantId, // Use restaurant from context
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
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
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

        // First, check if the category exists and belongs to the user and restaurant
        const existingCategory = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        });

        if (!existingCategory) {
            res.status(404).json({ message: 'Category not found.' });
            return;
        }
        
        if (existingCategory.userId !== userId || existingCategory.restaurantId !== req.restaurantId) {
            res.status(403).json({ message: 'Not authorized to update this category.' });
            return;
        }

        const updatedCategory = await prisma.category.update({
            where: {
                id: categoryId,
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
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
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

         // First, check if the category exists and belongs to the user and restaurant
        const existingCategory = await prisma.category.findUnique({
             where: {
                 id: categoryId,
             },
         });

        if (!existingCategory) {
             res.status(404).json({ message: 'Category not found.' });
             return;
         }
         
         if (existingCategory.userId !== userId || existingCategory.restaurantId !== req.restaurantId) {
             res.status(403).json({ message: 'Not authorized to delete this category.' });
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
    
    if (!req.restaurantId) {
        res.status(400).json({ message: 'Restaurant context required' });
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
            }
        });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        
        if (category.userId !== userId || category.restaurantId !== req.restaurantId) {
            res.status(403).json({ message: 'Not authorized to access this category' });
            return;
        }
        
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching category' });
    }
}; 