import { Request, Response } from 'express';
import prisma from '../config/db';

// Controller functions mirroring CategoryController

export const getIngredientCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await prisma.ingredientCategory.findMany({ orderBy: { name: 'asc' } });
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredient categories' });
    }
};

export const createIngredientCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }
        const newCategory = await prisma.ingredientCategory.create({
            data: { name, description: description || null },
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
   try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) { /* ... ID format error ... */ }
        const { name, description } = req.body;
        if (!name) { /* ... Name required error ... */ }

        const updatedCategory = await prisma.ingredientCategory.update({
            where: { id: categoryId },
            data: { name, description: description || null },
        });
        res.status(200).json(updatedCategory);
    } catch (error: any) {
         // Handle P2002 (unique name constraint) and P2025 (not found) errors
        console.error(error);
        if (error.code === 'P2002') { /* ... Conflict error ... */ }
        if (error.code === 'P2025') { /* ... Not found error ... */ }
        res.status(500).json({ message: 'Error updating ingredient category' });
    }
};

export const deleteIngredientCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) { /* ... ID format error ... */ }

        // Note: Deleting category sets ingredientCategoryId to NULL on ingredients
        await prisma.ingredientCategory.delete({ where: { id: categoryId } });
        res.status(200).json({ message: 'Ingredient category deleted successfully' });
    } catch (error: any) {
         // Handle P2025 (not found) error
        console.error(error);
        if (error.code === 'P2025') { /* ... Not found error ... */ }
        res.status(500).json({ message: 'Error deleting ingredient category' });
    }
};

// Optional Get by ID - might be less useful for categories
export const getIngredientCategoryById = async (req: Request, res: Response): Promise<void> => {
    // ... Implementation similar to getCategoryById ...
}; 