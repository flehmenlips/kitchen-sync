import { Request, Response } from 'express';
import prisma from '../config/db'; // Using relative path
import { getRestaurantFilter } from '../middleware/restaurantContext';

// @desc    Get all ingredients for the authenticated user
// @route   GET /api/ingredients
// @access  Private
export const getIngredients = async (req: Request, res: Response): Promise<void> => {
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
        const ingredients = await prisma.ingredient.findMany({
            where: { 
                userId: userId,
                restaurantId: req.restaurantId // Filter by current restaurant
            },
            include: { ingredientCategory: true }, // Include category
            orderBy: [ // Order by category, then name
                 { ingredientCategory: { name: 'asc' } },
                 { name: 'asc' }
            ]
        });
        res.status(200).json(ingredients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredients' });
    }
};

// @desc    Create a new ingredient for the authenticated user
// @route   POST /api/ingredients
// @access  Private
export const createIngredient = async (req: Request, res: Response): Promise<void> => {
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
        const { name, description, ingredientCategoryId } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }

        const categoryIdNum = ingredientCategoryId ? parseInt(ingredientCategoryId, 10) : null;

        const newIngredient = await prisma.ingredient.create({
            data: {
                name,
                description: description || null,
                ingredientCategoryId: categoryIdNum,
                userId: userId,
                restaurantId: req.restaurantId, // Use restaurant from context
            },
            include: { ingredientCategory: true }
        });
        res.status(201).json(newIngredient);
    } catch (error: any) {
        console.error(error);
        // Handle potential unique constraint violation
        if (error.code === 'P2002') {
            res.status(409).json({ message: `Ingredient with name '${req.body.name}' already exists.` });
            return;
        }
        res.status(500).json({ message: 'Error creating ingredient' });
    }
};

// @desc    Get single ingredient by ID (owned by the authenticated user)
// @route   GET /api/ingredients/:id
// @access  Private
export const getIngredientById = async (req: Request, res: Response): Promise<void> => {
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
        const ingredientId = parseInt(id, 10);
        if (isNaN(ingredientId)) {
            res.status(400).json({ message: 'Invalid ingredient ID format' });
            return;
        }

        const ingredient = await prisma.ingredient.findUnique({
            where: {
                id: ingredientId,
            },
            include: { ingredientCategory: true }
        });

        if (!ingredient) {
            res.status(404).json({ message: 'Ingredient not found' });
            return;
        }
        
        if (ingredient.userId !== userId || ingredient.restaurantId !== req.restaurantId) {
            res.status(403).json({ message: 'Not authorized to access this ingredient' });
            return;
        }
        
        res.status(200).json(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredient' });
    }
};

// @desc    Update an ingredient (owned by the authenticated user)
// @route   PUT /api/ingredients/:id
// @access  Private
export const updateIngredient = async (req: Request, res: Response): Promise<void> => {
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
        const ingredientId = parseInt(id, 10);
        if (isNaN(ingredientId)) {
            res.status(400).json({ message: 'Invalid ingredient ID format' });
            return;
        }

        const { name, description, ingredientCategoryId } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }

        const categoryIdNum = ingredientCategoryId ? parseInt(ingredientCategoryId, 10) : null;

        // First, check if the ingredient exists and belongs to the user
        const existingIngredient = await prisma.ingredient.findUnique({
            where: {
                id: ingredientId,
            },
        });

        if (!existingIngredient) {
            res.status(404).json({ message: 'Ingredient not found.' });
            return;
        }
        
        if (existingIngredient.userId !== userId || existingIngredient.restaurantId !== req.restaurantId) {
            res.status(403).json({ message: 'Not authorized to update this ingredient.' });
            return;
        }

        const updatedIngredient = await prisma.ingredient.update({
            where: {
                id: ingredientId,
            },
            data: {
                name,
                description: description || null,
                ingredientCategoryId: categoryIdNum
            },
            include: { ingredientCategory: true }
        });
        res.status(200).json(updatedIngredient);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') { // Unique constraint failed (likely name)
            res.status(409).json({ message: `Ingredient with name '${req.body.name}' might already exist.` });
            return;
        }
        if (error.code === 'P2025') { // Record to update not found
            res.status(404).json({ message: 'Ingredient not found' });
            return;
        }
        res.status(500).json({ message: 'Error updating ingredient' });
    }
};

// @desc    Delete an ingredient (owned by the authenticated user)
// @route   DELETE /api/ingredients/:id
// @access  Private
export const deleteIngredient = async (req: Request, res: Response): Promise<void> => {
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
        const ingredientId = parseInt(id, 10);
        if (isNaN(ingredientId)) {
            res.status(400).json({ message: 'Invalid ingredient ID format' });
            return;
        }

        // First, check if the ingredient exists and belongs to the user
        const existingIngredient = await prisma.ingredient.findUnique({
             where: {
                 id: ingredientId,
             },
         });

        if (!existingIngredient) {
             res.status(404).json({ message: 'Ingredient not found.' });
            return;
        }
        
        if (existingIngredient.userId !== userId || existingIngredient.restaurantId !== req.restaurantId) {
            res.status(403).json({ message: 'Not authorized to delete this ingredient.' });
            return;
        }

        await prisma.ingredient.delete({
            where: {
                id: ingredientId,
            },
        });

        res.status(200).json({ message: 'Ingredient deleted successfully' });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2025') { // Record not found
            res.status(404).json({ message: 'Ingredient not found' });
            return;
        }
         if (error.code === 'P2003') { // Foreign key constraint failed (ingredient is in use)
            res.status(409).json({ message: 'Cannot delete ingredient because it is currently used in recipes.' });
            return;
        }
        res.status(500).json({ message: 'Error deleting ingredient' });
    }
}; 