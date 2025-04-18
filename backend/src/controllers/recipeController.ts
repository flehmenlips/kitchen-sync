import { Request, Response } from 'express';
// Using relative path now that we know alias might be tricky initially
import prisma from '../config/db'; 
import { Prisma } from '@prisma/client'; // Import Prisma namespace

// Helper function for safe integer parsing
const safeParseInt = (val: unknown): number | undefined => {
  if (typeof val === 'number') return !isNaN(val) ? Math.floor(val) : undefined;
  if (typeof val === 'string' && val !== '') {
    const parsed = parseInt(val, 10);
    return !isNaN(parsed) ? parsed : undefined;
  }
  return undefined;
};

// Helper function for safe float parsing
const safeParseFloat = (val: unknown): number | undefined => {
  if (typeof val === 'number') return !isNaN(val) ? val : undefined;
  if (typeof val === 'string' && val !== '') {
    const parsed = parseFloat(val);
    return !isNaN(parsed) ? parsed : undefined;
  }
  return undefined;
};

// Type for the object returned by the ingredient map function
type MappedIngredientData = {
    recipeId: number;
    ingredientId: number | undefined;
    subRecipeId: number | undefined;
    quantity: number;
    unitId: number;
    order: number;
};

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

// Type for ingredient input from request body
type IngredientInput = { 
    type: 'ingredient' | 'sub-recipe' | ''; 
    ingredientId?: number | string; 
    subRecipeId?: number | string; 
    quantity: number | string; 
    unitId: number | string; 
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

    if (!name || !instructions) {
      res.status(400).json({ message: 'Missing required fields: name, instructions' });
      return;
    }
    if (ingredients && !Array.isArray(ingredients)) {
        res.status(400).json({ message: "'ingredients' field must be an array." });
        return;
    }

    const prepTime = safeParseInt(prepTimeMinutes);
    const cookTime = safeParseInt(cookTimeMinutes);
    const yieldQty = safeParseFloat(yieldQuantity);
    const yieldUnit = safeParseInt(yieldUnitId);
    const categoryIdNum = safeParseInt(categoryId) ?? null;

    const newRecipeWithIngredients = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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

      if (ingredients && ingredients.length > 0) {
        const recipeIngredientsData = ingredients.map((ing: {
            type: 'ingredient' | 'sub-recipe' | '';
            ingredientId?: number | string;
            subRecipeId?: number | string;
            quantity: number | string;
            unitId: number | string;
        }, index: number) => {
            if ((!ing.ingredientId && !ing.subRecipeId) || !ing.quantity || !ing.unitId) {
                throw new Error(`Invalid data for ingredient at index ${index}: requires ingredientId or subRecipeId, quantity, and unitId.`);
            }
             if (ing.ingredientId && ing.subRecipeId) {
                throw new Error(`Invalid data for ingredient at index ${index}: cannot have both ingredientId and subRecipeId.`);
            }
            
            const quantityNum = safeParseFloat(ing.quantity);
            const unitIdNum = safeParseInt(ing.unitId);
            const ingredientIdNum = safeParseInt(ing.ingredientId);
            const subRecipeIdNum = safeParseInt(ing.subRecipeId);

            // Validate parsed numbers - ensure unit is always present
            if (quantityNum === undefined) {
                 throw new Error(`Invalid numeric quantity for ingredient at index ${index}.`);
            }
             if (!unitIdNum) {
                throw new Error(`Invalid or missing unitId for ingredient at index ${index}.`);
            }
            if (ing.type === 'ingredient' && !ingredientIdNum) {
                throw new Error(`Invalid or missing ingredientId for ingredient at index ${index}.`);
            }
            if (ing.type === 'sub-recipe' && !subRecipeIdNum) {
                 throw new Error(`Invalid or missing subRecipeId for ingredient at index ${index}.`);
            }

            return {
                recipeId: newRecipe.id,
                ingredientId: ing.type === 'ingredient' ? ingredientIdNum : undefined,
                subRecipeId: ing.type === 'sub-recipe' ? subRecipeIdNum : undefined,
                quantity: quantityNum ?? 0, // Default to 0 if somehow still undefined
                unitId: unitIdNum, 
                order: index
            } as MappedIngredientData;
        }).filter((ing: MappedIngredientData) => ing.ingredientId || ing.subRecipeId);

        if (recipeIngredientsData.length > 0) {
            await tx.unitQuantity.createMany({
              data: recipeIngredientsData,
            });
        }
      }
      return newRecipe;
    });

    const finalRecipe = await prisma.recipe.findUnique({
        where: { id: newRecipeWithIngredients.id },
        include: { category: true, yieldUnit: true, recipeIngredients: { orderBy: { order: 'asc' }, include: { unit: true, ingredient: true, subRecipe: { select: { id: true, name: true } } } } }
    });
    res.status(201).json(finalRecipe);

  } catch (error: any) {
    console.error('Error creating recipe:', error);
    if (error.message.includes('Invalid data') || error.message.includes('Invalid or missing')) {
        res.status(400).json({ message: error.message });
        return;
    }
    // Handle Prisma errors P2003 (Foreign key constraint) e.g. if unitId or ingredientId doesn't exist
     if (error.code === 'P2003') {
        res.status(400).json({ message: `Invalid reference: Make sure the selected category, units, ingredients, or sub-recipes exist.` });
        return;
    }
    res.status(500).json({ message: 'Error creating recipe' });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private/Admin (eventually)
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipeId = safeParseInt(id);
    if (recipeId === undefined) {
       res.status(400).json({ message: 'Invalid recipe ID format' });
       return;
    }

    const {
        name, description, instructions, yieldQuantity, yieldUnitId,
        prepTimeMinutes, cookTimeMinutes, tags,
        categoryId,
        ingredients // Expect an array: [{ ingredientId?, subRecipeId?, quantity, unitId }, ...]
    } = req.body;

    if (ingredients && !Array.isArray(ingredients)) {
        res.status(400).json({ message: "'ingredients' field must be an array." });
        return;
    }
    if (!name || !instructions) {
        res.status(400).json({ message: 'Missing required fields: name, instructions' });
        return;
    }

    const prepTime = safeParseInt(prepTimeMinutes);
    const cookTime = safeParseInt(cookTimeMinutes);
    const yieldQty = safeParseFloat(yieldQuantity);
    const yieldUnit = safeParseInt(yieldUnitId);
    const categoryIdNum = safeParseInt(categoryId) ?? null;

    const updatedRecipeResult = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Check if recipe exists before attempting update/delete
        const existingRecipe = await tx.recipe.findUnique({ where: { id: recipeId }});
        if (!existingRecipe) {
            throw new Error('P2025'); // Throw specific code/error Prisma uses
        }

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

        await tx.unitQuantity.deleteMany({ where: { recipeId: recipeId }});

        if (ingredients && ingredients.length > 0) {
            const recipeIngredientsData = ingredients.map((ing: IngredientInput, index: number) => { 
                console.log(`[updateRecipe] Processing ing[${index}] Input:`, JSON.stringify(ing, null, 2)); // Log raw input

                if ((!ing.ingredientId && !ing.subRecipeId) || !ing.quantity || !ing.unitId) {
                    throw new Error(`Invalid data for ingredient at index ${index}: requires ingredientId or subRecipeId, quantity, and unitId.`);
                }
                if (ing.ingredientId && ing.subRecipeId) {
                    throw new Error(`Invalid data for ingredient at index ${index}: cannot have both ingredientId and subRecipeId.`);
                }
                
                const quantityNum = safeParseFloat(ing.quantity);
                const unitIdNum = safeParseInt(ing.unitId);
                const ingredientIdNum = safeParseInt(ing.ingredientId);
                const subRecipeIdNum = safeParseInt(ing.subRecipeId);
                
                console.log(`[updateRecipe] Parsed values[${index}]:`, { quantityNum, unitIdNum, ingredientIdNum, subRecipeIdNum, type: ing.type }); // Log parsed values + type

                if (quantityNum === undefined) {
                    throw new Error(`Invalid numeric quantity for ingredient at index ${index}.`);
                }
                 if (!unitIdNum) {
                    throw new Error(`Invalid or missing unitId for ingredient at index ${index}.`);
                }
                if (ing.type === 'ingredient' && !ingredientIdNum) {
                    throw new Error(`Invalid or missing ingredientId for ingredient at index ${index}.`);
                }
                if (ing.type === 'sub-recipe' && !subRecipeIdNum) {
                     throw new Error(`Invalid or missing subRecipeId for ingredient at index ${index}.`);
                }

                const returnObj = {
                    recipeId: updatedRecipe.id,
                    ingredientId: ing.type === 'ingredient' ? ingredientIdNum : undefined,
                    subRecipeId: ing.type === 'sub-recipe' ? subRecipeIdNum : undefined,
                    quantity: quantityNum ?? 0,
                    unitId: unitIdNum,
                    order: index
                };
                console.log(`[updateRecipe] Returning object[${index}] before filter:`, JSON.stringify(returnObj, null, 2)); // Log object being returned

                return returnObj as MappedIngredientData;
             }).filter((ing: MappedIngredientData) => ing.ingredientId || ing.subRecipeId);
             
             console.log(`[updateRecipe] Recipe ID: ${recipeId}, Filtered ingredients for createMany:`, JSON.stringify(recipeIngredientsData, null, 2)); // Renamed log

             if (recipeIngredientsData.length > 0) {
                try {
                    await tx.unitQuantity.createMany({ data: recipeIngredientsData });
                 } catch (createError) {
                     // Log specific createMany error
                     console.error(`[updateRecipe] Error during createMany for Recipe ID: ${recipeId}`, createError);
                     // Re-throw the error to abort the transaction
                     throw createError; 
                 }
             }
        }
        return updatedRecipe.id;
    });

     const finalRecipe = await prisma.recipe.findUnique({ 
         where: { id: updatedRecipeResult },
         include: { category: true, yieldUnit: true, recipeIngredients: { orderBy: { order: 'asc' }, include: { unit: true, ingredient: true, subRecipe: { select: { id: true, name: true } } } } }
      });
    res.status(200).json(finalRecipe);

  } catch (error: any) {
    console.error('Error updating recipe:', error);
     if (error.message?.includes('Invalid data') || error.message?.includes('Invalid or missing')) {
        res.status(400).json({ message: error.message });
        return;
    }
    if (error.message === 'P2025' || error.code === 'P2025') { // Catch our thrown error or Prisma's
        res.status(404).json({ message: 'Recipe not found during update.' });
        return;
    }
     if (error.code === 'P2003') {
        res.status(400).json({ message: `Invalid reference: Make sure the selected category, units, ingredients, or sub-recipes exist.` });
        return;
    }
    res.status(500).json({ message: 'Error updating recipe' });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin (eventually)
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipeId = safeParseInt(id);
    if (recipeId === undefined) {
        res.status(400).json({ message: 'Invalid recipe ID format' });
        return;
    }
    // DeleteMany will not throw if not found, so we check first for 404
    const existingRecipe = await prisma.recipe.findUnique({ where: { id: recipeId }});
    if (!existingRecipe) {
         res.status(404).json({ message: 'Recipe not found' });
         return;
    }
    // Transaction to delete recipe and its ingredients (though cascade should handle ingredients)
    await prisma.$transaction([ 
        prisma.unitQuantity.deleteMany({ where: { recipeId: recipeId }}), 
        prisma.recipe.delete({ where: { id: recipeId }}) 
    ]);
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting recipe' });
  }
}; 