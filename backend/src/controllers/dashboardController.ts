import { Request, Response } from 'express';
import prisma from '../config/db';

// @desc    Get dashboard statistics for the logged-in user
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
        const recipeCount = await prisma.recipe.count({
            where: { userId: userId },
        });
        const ingredientCount = await prisma.ingredient.count({
            where: { userId: userId },
        });
        const unitCount = await prisma.unitOfMeasure.count({
             where: { userId: userId },
        });
        const categoryCount = await prisma.category.count({
             where: { userId: userId },
        });
        const ingredientCategoryCount = await prisma.ingredientCategory.count({
             where: { userId: userId },
        });

        // We don't count users per user :)

        res.status(200).json({
            recipes: recipeCount,
            ingredients: ingredientCount,
            units: unitCount,
            recipeCategories: categoryCount,
            ingredientCategories: ingredientCategoryCount,
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
}; 