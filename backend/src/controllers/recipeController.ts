import { Request, Response } from 'express';
// Using relative path now that we know alias might be tricky initially
import prisma from '../config/db'; 

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public (for now)
export const getRecipes = async (req: Request, res: Response): Promise<void> => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: { // Include category
        category: true,
        yieldUnit: true // Keep including yield unit too
      },
      orderBy: [ // Example: order by category name, then recipe name
        { category: { name: 'asc' } },
        { name: 'asc' },
      ]
    });
    res.status(200).json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching recipes' });
  }
};

// @desc    Get single recipe by ID
// @route   GET /api/recipes/:id
// @access  Public (for now)
export const getRecipeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      res.status(400).json({ message: 'Invalid recipe ID format' });
      return;
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: { 
        category: true, // Include category
        yieldUnit: true, 
        recipeIngredients: { // Include the list of ingredients/sub-recipes
          orderBy: { order: 'asc' }, // Order them consistently
          include: {
            unit: true, // Include details for the ingredient's unit
            ingredient: true, // Include details for base ingredients
            subRecipe: { // Include minimal details for sub-recipes
              select: { id: true, name: true }
            }
          }
        }
      }
    });

    if (!recipe) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
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
export const createRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, description, instructions, yieldQuantity, yieldUnitId,
      prepTimeMinutes, cookTimeMinutes, tags,
      categoryId,
      ingredients // Expect an array: [{ ingredientId?, subRecipeId?, quantity, unitId }, ...]
    } = req.body;

    // Basic validation
    if (!name || !instructions) {
      res.status(400).json({ message: 'Missing required fields: name, instructions' });
      return;
    }
    if (ingredients && !Array.isArray(ingredients)) {
        res.status(400).json({ message: "'ingredients' field must be an array." });
        return;
    }

    // Basic type coercion/checking
    const prepTime = prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : undefined;
    const cookTime = cookTimeMinutes ? parseInt(cookTimeMinutes, 10) : undefined;
    const yieldQty = yieldQuantity ? parseFloat(yieldQuantity) : undefined;
    const yieldUnit = yieldUnitId ? parseInt(yieldUnitId, 10) : undefined;
    const categoryIdNum = categoryId ? parseInt(categoryId, 10) : null;

    // Use Prisma transaction
    const newRecipeWithIngredients = await prisma.$transaction(async (tx) => {
      // 1. Create the recipe
      const newRecipe = await tx.recipe.create({
        data: {
          name,
          description,
          instructions,
          yieldQuantity: yieldQty,
          yieldUnitId: yieldUnit,
          prepTimeMinutes: prepTime,
          cookTimeMinutes: cookTime,
          tags: tags || [],
          categoryId: categoryIdNum,
        },
      });

      // 2. Create RecipeIngredient entries if ingredients array is provided
      if (ingredients && ingredients.length > 0) {
        // Define expected type for items in the input array
        type IngredientInput = { 
            type: 'ingredient' | 'sub-recipe' | ''; 
            ingredientId?: number | string; 
            subRecipeId?: number | string; 
            quantity: number | string; 
            unitId: number | string; 
        };
        
        const recipeIngredientsData = ingredients.map((ing: IngredientInput, index: number) => {
            // Validation for each ingredient entry
            if ((!ing.ingredientId && !ing.subRecipeId) || !ing.quantity || !ing.unitId) {
                throw new Error(`Invalid data for ingredient at index ${index}: requires ingredientId or subRecipeId, quantity, and unitId.`);
            }
            if (ing.ingredientId && ing.subRecipeId) {
                throw new Error(`Invalid data for ingredient at index ${index}: cannot have both ingredientId and subRecipeId.`);
            }

            const quantityNum = parseFloat(ing.quantity);
            const unitIdNum = parseInt(ing.unitId, 10);
            const ingredientIdNum = ing.ingredientId ? parseInt(ing.ingredientId, 10) : undefined;
            const subRecipeIdNum = ing.subRecipeId ? parseInt(ing.subRecipeId, 10) : undefined;

            if (isNaN(quantityNum) || isNaN(unitIdNum)) {
                throw new Error(`Invalid numeric quantity or unitId for ingredient at index ${index}.`);
            }
             if (ing.ingredientId && (ingredientIdNum === undefined || isNaN(ingredientIdNum))) {
                throw new Error(`Invalid numeric ingredientId for ingredient at index ${index}.`);
            }
             if (ing.subRecipeId && (subRecipeIdNum === undefined || isNaN(subRecipeIdNum))) {
                throw new Error(`Invalid numeric subRecipeId for ingredient at index ${index}.`);
            }

            return {
                recipeId: newRecipe.id,
                ingredientId: ingredientIdNum,
                subRecipeId: subRecipeIdNum,
                quantity: quantityNum,
                unitId: unitIdNum,
                order: index
            };
        });

        await tx.unitQuantity.createMany({
          data: recipeIngredientsData,
        });
      }

      // 3. Return the created recipe (ingredients won't be included by default)
      // We could potentially re-fetch it here with includes if needed immediately
      return newRecipe;
    });

    // Re-fetch the recipe with its ingredients to return the full object
    const finalRecipe = await prisma.recipe.findUnique({
        where: { id: newRecipeWithIngredients.id },
        include: {
            yieldUnit: true, // Include the yield unit details
            recipeIngredients: {
                orderBy: { order: 'asc' }, // Order ingredients as they were provided
                include: {
                    unit: true, // Include details for the ingredient's unit
                    ingredient: true, // Include details for base ingredients
                    subRecipe: { // Include minimal details for sub-recipes
                        select: { id: true, name: true }
                    }
                }
            }
        }
    });

    res.status(201).json(finalRecipe);

  } catch (error: any) {
    console.error('Error creating recipe:', error);
    // Check for specific transaction-related errors or validation errors
    if (error.message.includes('Invalid data for ingredient') || error.message.includes('Invalid numeric data for ingredient')) {
        res.status(400).json({ message: error.message });
        return;
    }
    // TODO: Add more specific error handling (Prisma errors like P2003 foreign key constraint)
    res.status(500).json({ message: 'Error creating recipe' });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin (eventually)
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      res.status(400).json({ message: 'Invalid recipe ID format' });
      return;
    }

    const {
        name, description, instructions, yieldQuantity, yieldUnitId,
        prepTimeMinutes, cookTimeMinutes, tags,
        categoryId,
        ingredients // Expect an array: [{ ingredientId?, subRecipeId?, quantity, unitId }, ...]
    } = req.body;

     // Basic validation
    if (ingredients && !Array.isArray(ingredients)) {
        res.status(400).json({ message: "'ingredients' field must be an array." });
        return;
    }
    // Cannot update if essential fields are missing (could refine this)
    if (!name || !instructions) {
        res.status(400).json({ message: 'Missing required fields: name, instructions' });
        return;
    }

    // Basic type coercion/checking
    const prepTime = prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : undefined;
    const cookTime = cookTimeMinutes ? parseInt(cookTimeMinutes, 10) : undefined;
    const yieldQty = yieldQuantity ? parseFloat(yieldQuantity) : undefined;
    const yieldUnit = yieldUnitId ? parseInt(yieldUnitId, 10) : undefined;
    const categoryIdNum = categoryId ? parseInt(categoryId, 10) : null;

    // Use Prisma transaction
    const updatedRecipeResult = await prisma.$transaction(async (tx) => {
        // 1. Update the recipe itself
        const updatedRecipe = await tx.recipe.update({
            where: { id: recipeId },
            data: {
                name,
                description,
                instructions,
                yieldQuantity: yieldQty,
                yieldUnitId: yieldUnit,
                prepTimeMinutes: prepTime,
                cookTimeMinutes: cookTime,
                tags: tags,
                categoryId: categoryIdNum,
            },
        });

        // 2. Delete existing ingredients for this recipe
        await tx.unitQuantity.deleteMany({ 
            where: { recipeId: recipeId }
        });

        // 3. Create new RecipeIngredient entries if ingredients array is provided
        if (ingredients && ingredients.length > 0) {
            const recipeIngredientsData = ingredients.map((ing: any, index: number) => {
                // Validation for each ingredient entry
                if ((!ing.ingredientId && !ing.subRecipeId) || !ing.quantity || !ing.unitId) {
                    throw new Error(`Invalid data for ingredient at index ${index}: requires ingredientId or subRecipeId, quantity, and unitId.`);
                }
                if (ing.ingredientId && ing.subRecipeId) {
                    throw new Error(`Invalid data for ingredient at index ${index}: cannot have both ingredientId and subRecipeId.`);
                }

                const quantityNum = parseFloat(ing.quantity);
                const unitIdNum = parseInt(ing.unitId, 10);
                const ingredientIdNum = ing.ingredientId ? parseInt(ing.ingredientId, 10) : undefined;
                const subRecipeIdNum = ing.subRecipeId ? parseInt(ing.subRecipeId, 10) : undefined;

                if (isNaN(quantityNum) || isNaN(unitIdNum)) {
                    throw new Error(`Invalid numeric quantity or unitId for ingredient at index ${index}.`);
                }
                 if (ing.ingredientId && (ingredientIdNum === undefined || isNaN(ingredientIdNum))) {
                    throw new Error(`Invalid numeric ingredientId for ingredient at index ${index}.`);
                }
                 if (ing.subRecipeId && (subRecipeIdNum === undefined || isNaN(subRecipeIdNum))) {
                    throw new Error(`Invalid numeric subRecipeId for ingredient at index ${index}.`);
                }

                return {
                    recipeId: updatedRecipe.id, // Use the ID from the updated recipe
                    ingredientId: ingredientIdNum,
                    subRecipeId: subRecipeIdNum,
                    quantity: quantityNum,
                    unitId: unitIdNum,
                    order: index
                };
            });

            await tx.unitQuantity.createMany({
                data: recipeIngredientsData,
            });
        }
        
        // Return the updated recipe ID for re-fetching
        return updatedRecipe.id;
    });

    // Re-fetch the updated recipe with its ingredients
    const finalRecipe = await prisma.recipe.findUnique({
        where: { id: updatedRecipeResult },
        include: {
            yieldUnit: true,
            recipeIngredients: {
                orderBy: { order: 'asc' },
                include: {
                    unit: true,
                    ingredient: true,
                    subRecipe: { select: { id: true, name: true } }
                }
            }
        }
    });

    res.status(200).json(finalRecipe);

  } catch (error: any) {
    console.error('Error updating recipe:', error);
     if (error.message.includes('Invalid data for ingredient') || error.message.includes('Invalid numeric data for ingredient')) {
        res.status(400).json({ message: error.message });
        return;
    }
    // Handle potential Prisma errors (e.g., record not found P2025 on the initial update)
    if (error.code === 'P2025') {
        res.status(404).json({ message: 'Recipe not found during update.' });
        return;
    }
    // Add other specific error handling (e.g., P2003 Foreign Key on ingredient/unit/subRecipe creation)
    res.status(500).json({ message: 'Error updating recipe' });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin (eventually)
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);
    if (isNaN(recipeId)) {
      res.status(400).json({ message: 'Invalid recipe ID format' });
      return;
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error(error);
    // Handle potential Prisma errors (e.g., record not found)
    if ((error as any).code === 'P2025') { // Prisma code for RecordNotFound
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }
    res.status(500).json({ message: 'Error deleting recipe' });
  }
}; 