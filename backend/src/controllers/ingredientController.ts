import { Request, Response } from 'express';
import prisma from '../config/db'; // Using relative path

// @desc    Get all ingredients
// @route   GET /api/ingredients
// @access  Public (for now)
export const getIngredients = async (req: Request, res: Response): Promise<void> => {
    try {
        // TODO: Add searching/filtering (e.g., by name)
        const ingredients = await prisma.ingredient.findMany();
        res.status(200).json(ingredients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredients' });
    }
};

// @desc    Create a new ingredient
// @route   POST /api/ingredients
// @access  Private/Admin (eventually)
export const createIngredient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }

        const newIngredient = await prisma.ingredient.create({
            data: {
                name,
                description,
            },
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

// @desc    Get single ingredient by ID
// @route   GET /api/ingredients/:id
// @access  Public (for now)
export const getIngredientById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const ingredientId = parseInt(id, 10);
        if (isNaN(ingredientId)) {
            res.status(400).json({ message: 'Invalid ingredient ID format' });
            return;
        }

        const ingredient = await prisma.ingredient.findUnique({
            where: { id: ingredientId },
        });

        if (!ingredient) {
            res.status(404).json({ message: 'Ingredient not found' });
            return;
        }
        res.status(200).json(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredient' });
    }
};

// @desc    Update an ingredient
// @route   PUT /api/ingredients/:id
// @access  Private/Admin (eventually)
export const updateIngredient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const ingredientId = parseInt(id, 10);
        if (isNaN(ingredientId)) {
            res.status(400).json({ message: 'Invalid ingredient ID format' });
            return;
        }

        const { name, description } = req.body;

        const updatedIngredient = await prisma.ingredient.update({
            where: { id: ingredientId },
            data: {
                name, // Allow updating name, handle potential P2002 conflict below
                description,
            },
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

// @desc    Delete an ingredient
// @route   DELETE /api/ingredients/:id
// @access  Private/Admin (eventually)
export const deleteIngredient = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const ingredientId = parseInt(id, 10);
        if (isNaN(ingredientId)) {
            res.status(400).json({ message: 'Invalid ingredient ID format' });
            return;
        }

        await prisma.ingredient.delete({
            where: { id: ingredientId },
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