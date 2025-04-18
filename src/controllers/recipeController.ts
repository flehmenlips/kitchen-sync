import express, { Request, Response } from 'express'; // Import express itself
import prisma from '@/config/db'; // Import Prisma client

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public (for now)
export const getRecipes = async (req: Request, res: Response) => {
  try {
    // TODO: Add pagination, filtering, sorting
    const recipes = await prisma.recipe.findMany();
    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching recipes' });
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
// @access  Public (for now)
export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id, 10) },
      // TODO: Include ingredients/sub-recipes?
      // include: {
      //   recipeIngredients: {
      //     include: {
      //       ingredient: true,
      //       subRecipe: true,
      //       unit: true
      //     }
      //   }
      // }
    });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching recipe' });
  }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private/Admin (eventually)
export const createRecipe = async (req: Request, res: Response) => {
  try {
    // TODO: Add validation for required fields
    const { name, description, instructions, yieldQuantity, yieldUnitId, prepTimeMinutes, cookTimeMinutes, tags /*, ingredients */ } = req.body;

    // Basic check for required fields
    if (!name || !instructions) {
      return res.status(400).json({ message: 'Missing required fields: name, instructions' });
    }

    const newRecipe = await prisma.recipe.create({
      data: {
        name,
        description,
        instructions,
        yieldQuantity: yieldQuantity ? parseFloat(yieldQuantity) : undefined,
        yieldUnitId: yieldUnitId ? parseInt(yieldUnitId, 10) : undefined,
        prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : undefined,
        cookTimeMinutes: cookTimeMinutes ? parseInt(cookTimeMinutes, 10) : undefined,
        tags: tags || [], // Default to empty array if not provided
        // TODO: Handle creation of RecipeIngredients link table entries
      },
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error(error);
    // Handle potential Prisma errors (e.g., unique constraints)
    res.status(500).json({ message: 'Error creating recipe' });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin (eventually)
export const updateRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // TODO: Add validation
    const { name, description, instructions, yieldQuantity, yieldUnitId, prepTimeMinutes, cookTimeMinutes, tags /*, ingredients */ } = req.body;

    const updatedRecipe = await prisma.recipe.update({
      where: { id: parseInt(id, 10) },
      data: {
        name,
        description,
        instructions,
        yieldQuantity: yieldQuantity ? parseFloat(yieldQuantity) : undefined,
        yieldUnitId: yieldUnitId ? parseInt(yieldUnitId, 10) : undefined,
        prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : undefined,
        cookTimeMinutes: cookTimeMinutes ? parseInt(cookTimeMinutes, 10) : undefined,
        tags: tags,
        // TODO: Handle updates to RecipeIngredients (delete old, add new?)
      },
    });

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error(error);
    // Handle potential Prisma errors (e.g., record not found)
    if ((error as any).code === 'P2025') { // Prisma code for RecordNotFound
        return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Error updating recipe' });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin (eventually)
export const deleteRecipe = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.recipe.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error(error);
    // Handle potential Prisma errors (e.g., record not found)
     if ((error as any).code === 'P2025') { // Prisma code for RecordNotFound
        return res.status(404).json({ message: 'Recipe not found' });
    }
    res.status(500).json({ message: 'Error deleting recipe' });
  }
}; 