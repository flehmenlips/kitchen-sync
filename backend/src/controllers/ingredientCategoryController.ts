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
        if (isNaN(categoryId)) {
             res.status(400).json({ message: 'Invalid category ID format' });
             return;
        }
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }

        const updatedCategory = await prisma.ingredientCategory.update({
            where: { id: categoryId },
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
    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) { 
            res.status(400).json({ message: 'Invalid category ID format' });
            return;
         }
        await prisma.ingredientCategory.delete({ where: { id: categoryId } });
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
    try {
        const { id } = req.params;
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) {
             res.status(400).json({ message: 'Invalid category ID format' });
             return;
        }
        const category = await prisma.ingredientCategory.findUnique({
            where: { id: categoryId }
        });
        if (!category) {
            res.status(404).json({ message: 'Ingredient category not found' });
            return;
        }
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching ingredient category' });
    }
}; 