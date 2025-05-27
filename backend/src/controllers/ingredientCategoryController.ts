import { Request, Response } from 'express';
import prisma from '../config/db';
import { getRestaurantFilter } from '../middleware/restaurantContext';

// Controller functions mirroring CategoryController

export const getIngredientCategories = async (req: Request, res: Response): Promise<void> => {
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
        const categories = await prisma.ingredientCategory.findMany({
            where: { 
                userId: userId,
                restaurantId: req.restaurantId // Filter by current restaurant
            },
            orderBy: { name: 'asc' }
        });
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredient categories' });
    }
};

export const createIngredientCategory = async (req: Request, res: Response): Promise<void> => {
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
        const newCategory = await prisma.ingredientCategory.create({
            data: {
                name,
                description: description || null,
                userId: userId,
                restaurantId: req.restaurantId // Use restaurant from context
            },
        });
        res.status(201).json(newCategory);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: `Ingredient category name '${req.body.name}' already exists.` });
            return;
        }
        res.status(500).json({ message: 'Error creating ingredient category' });
    }
};

export const updateIngredientCategory = async (req: Request, res: Response): Promise<void> => {
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
        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }

        // First, check if the category exists and belongs to the user
        const existingCategory = await prisma.ingredientCategory.findUnique({
            where: {
                id: categoryId,
            },
        });

        if (!existingCategory) {
            res.status(404).json({ message: 'Ingredient category not found.' });
            return;
        }
        
        if (existingCategory.userId !== userId || existingCategory.restaurantId !== req.restaurantId) {
            res.status(403).json({ message: 'Not authorized to update this ingredient category.' });
            return;
        }

        const updatedCategory = await prisma.ingredientCategory.update({
            where: {
                id: categoryId,
            },
            data: { name, description: description || null },
        });
        res.status(200).json(updatedCategory);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') { 
            res.status(409).json({ message: `Ingredient category name '${req.body.name}' might already exist.` });
            return;
         }
        if (error.code === 'P2025') { 
            res.status(404).json({ message: 'Ingredient category not found' });
            return;
        }
        res.status(500).json({ message: 'Error updating ingredient category' });
    }
};

export const deleteIngredientCategory = async (req: Request, res: Response): Promise<void> => {
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

         // First, check if the category exists and belongs to the user
        const existingCategory = await prisma.ingredientCategory.findUnique({
             where: {
                 id: categoryId,
             },
         });

        if (!existingCategory) {
             res.status(404).json({ message: 'Ingredient category not found.' });
             return;
         }
         
         if (existingCategory.userId !== userId || existingCategory.restaurantId !== req.restaurantId) {
             res.status(403).json({ message: 'Not authorized to delete this ingredient category.' });
             return;
         }

        await prisma.ingredientCategory.delete({
            where: {
                id: categoryId,
            }
        });
        res.status(200).json({ message: 'Ingredient category deleted successfully' });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2025') { 
             res.status(404).json({ message: 'Ingredient category not found' });
             return;
        }
        res.status(500).json({ message: 'Error deleting ingredient category' });
    }
};

export const getIngredientCategoryById = async (req: Request, res: Response): Promise<void> => {
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
        const category = await prisma.ingredientCategory.findUnique({
            where: {
                id: categoryId,
            }
        });
        if (!category) {
            res.status(404).json({ message: 'Ingredient category not found' });
            return;
        }
        
        if (category.userId !== userId || category.restaurantId !== req.restaurantId) {
            res.status(403).json({ message: 'Not authorized to access this ingredient category' });
            return;
        }
        
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredient category' });
    }
}; 