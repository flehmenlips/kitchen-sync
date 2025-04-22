import { Request, Response } from 'express';
// Using relative path now that we know alias might be tricky initially
import prisma from '../config/db'; 
import { Prisma, UnitType } from '@prisma/client'; // Re-import Prisma namespace

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
// Define this locally for clarity
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
  if (!req.user?.id) {
     res.status(401).json({ message: 'Not authorized, user ID missing' });
     return;
  }
  try {
    const recipes = await prisma.recipe.findMany({
      where: { userId: req.user.id }, // Filter by logged-in user
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
  if (!req.user?.id) {
     res.status(401).json({ message: 'Not authorized, user ID missing' });
     return;
  }
  try {
    const { id } = req.params;
    const recipeId = safeParseInt(id);
    if (recipeId === undefined) {
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
    // Ownership check
    if (recipe.userId !== req.user.id) {
        res.status(403).json({ message: 'Not authorized to view this recipe' });
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
  if (!req.user?.id) {
     res.status(401).json({ message: 'Not authorized, user ID missing' });
     return;
  }
  try {
    const {
      name, description, instructions, yieldQuantity, yieldUnitId,
      prepTimeMinutes, cookTimeMinutes, tags,
      categoryId,
      ingredients
    } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Missing required field: name' });
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

    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    const newRecipeWithIngredients = await prisma.$transaction(async (tx) => {
      const newRecipe = await tx.recipe.create({
        data: {
          name,
          description,
          instructions,
          yieldQuantity: yieldQty,
          yieldUnitId: yieldUnit,
          prepTimeMinutes: prepTime,
          cookTimeMinutes: cookTime,
          tags: tagsArray,
          categoryId: categoryIdNum,
          userId: req.user!.id, // Assign logged-in user's ID
        },
      });

      if (ingredients && ingredients.length > 0) {
        const recipeIngredientsData = ingredients.map((ing: IngredientInput, index: number) => {
            if ((!ing.ingredientId && !ing.subRecipeId) || !ing.quantity || !ing.unitId) {
                throw new Error(`Invalid data for ingredient: requires ingredientId or subRecipeId, quantity, and unitId.`);
            }
             if (ing.ingredientId && ing.subRecipeId) {
                throw new Error(`Invalid data for ingredient: cannot have both ingredientId and subRecipeId.`);
            }
            
            const quantityNum = safeParseFloat(ing.quantity);
            const unitIdNum = safeParseInt(ing.unitId);
            const ingredientIdNum = safeParseInt(ing.ingredientId);
            const subRecipeIdNum = safeParseInt(ing.subRecipeId);

            // Validate parsed numbers - ensure unit is always present
            if (quantityNum === undefined) {
                 throw new Error(`Invalid numeric quantity for ingredient.`);
            }
             if (!unitIdNum) {
                throw new Error(`Invalid or missing unitId for ingredient.`);
            }
            if (ing.type === 'ingredient' && !ingredientIdNum) {
                throw new Error(`Invalid or missing ingredientId for ingredient.`);
            }
            if (ing.type === 'sub-recipe' && !subRecipeIdNum) {
                 throw new Error(`Invalid or missing subRecipeId for ingredient.`);
            }

            const returnObj = {
                recipeId: newRecipe.id,
                ingredientId: ing.type === 'ingredient' ? ingredientIdNum : undefined,
                subRecipeId: ing.type === 'sub-recipe' ? subRecipeIdNum : undefined,
                quantity: quantityNum ?? 0, // Default to 0 if somehow still undefined
                unitId: unitIdNum, 
                order: index
            };
            return returnObj;
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
  if (!req.user?.id) {
     res.status(401).json({ message: 'Not authorized, user ID missing' });
     return;
  }
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
        ingredients
    } = req.body;

    if (ingredients && !Array.isArray(ingredients)) {
        res.status(400).json({ message: "'ingredients' field must be an array." });
        return;
    }
    if (!name) {
        res.status(400).json({ message: 'Missing required field: name' });
        return;
    }

    const prepTime = safeParseInt(prepTimeMinutes);
    const cookTime = safeParseInt(cookTimeMinutes);
    const yieldQty = safeParseFloat(yieldQuantity);
    const yieldUnit = safeParseInt(yieldUnitId);
    const categoryIdNum = safeParseInt(categoryId) ?? null;

    const tagsArray = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [];

    const updatedRecipeResult = await prisma.$transaction(async (tx) => {
        // Check if recipe exists before attempting update/delete
        const existingRecipe = await tx.recipe.findUnique({ where: { id: recipeId }});
        if (!existingRecipe) {
            throw new Error('P2025'); // Throw specific code/error Prisma uses
        }
        // Ownership check before update
        if (existingRecipe.userId !== req.user!.id) {
             throw new Error('AUTH_ERROR'); // Custom error code for ownership
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
                tags: tagsArray,
                categoryId: categoryIdNum,
            },
        });

        await tx.unitQuantity.deleteMany({ where: { recipeId: recipeId }});

        if (ingredients && ingredients.length > 0) {
            const recipeIngredientsData = ingredients.map((ing: IngredientInput, index: number) => {
                console.log(`[updateRecipe] Processing ing Input:`, JSON.stringify(ing, null, 2)); // Log raw input

                if ((!ing.ingredientId && !ing.subRecipeId) || !ing.quantity || !ing.unitId) {
                    throw new Error(`Invalid data for ingredient: requires ingredientId or subRecipeId, quantity, and unitId.`);
                }
                if (ing.ingredientId && ing.subRecipeId) {
                    throw new Error(`Invalid data for ingredient: cannot have both ingredientId and subRecipeId.`);
                }
                
                const quantityNum = safeParseFloat(ing.quantity);
                const unitIdNum = safeParseInt(ing.unitId);
                const ingredientIdNum = safeParseInt(ing.ingredientId);
                const subRecipeIdNum = safeParseInt(ing.subRecipeId);
                
                console.log(`[updateRecipe] Parsed values:`, { quantityNum, unitIdNum, ingredientIdNum, subRecipeIdNum, type: ing.type }); // Log parsed values + type

                if (quantityNum === undefined) {
                    throw new Error(`Invalid numeric quantity for ingredient.`);
                }
                 if (!unitIdNum) {
                    throw new Error(`Invalid or missing unitId for ingredient.`);
                }
                if (ing.type === 'ingredient' && !ingredientIdNum) {
                    throw new Error(`Invalid or missing ingredientId for ingredient.`);
                }
                if (ing.type === 'sub-recipe' && !subRecipeIdNum) {
                     throw new Error(`Invalid or missing subRecipeId for ingredient.`);
                }

                const returnObj = {
                    recipeId: updatedRecipe.id,
                    ingredientId: ing.type === 'ingredient' ? ingredientIdNum : undefined,
                    subRecipeId: ing.type === 'sub-recipe' ? subRecipeIdNum : undefined,
                    quantity: quantityNum ?? 0,
                    unitId: unitIdNum,
                    order: index
                };
                console.log(`[updateRecipe] Returning object before filter:`, JSON.stringify(returnObj, null, 2)); // Log object being returned

                return returnObj;
             }).filter((ing: MappedIngredientData) => ing.ingredientId || ing.subRecipeId);
             
             console.log(`[updateRecipe] Recipe ID: ${recipeId}, Filtered ingredients for createMany:`, JSON.stringify(recipeIngredientsData, null, 2));

             if (recipeIngredientsData.length > 0) {
                try {
                    await tx.unitQuantity.createMany({ data: recipeIngredientsData });
                 } catch (createError: any) {
                     console.error(`[updateRecipe] Error during createMany for Recipe ID: ${recipeId}`, createError);
                     // Check specifically for foreign key constraint errors during createMany
                     if (createError.code === 'P2003') {
                         throw new Error(`Invalid reference during ingredient update: Make sure the selected units, ingredients, or sub-recipes exist.`);
                     }
                     // Re-throw other errors to abort the transaction
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
     if (error.message === 'AUTH_ERROR') {
          res.status(403).json({ message: 'Not authorized to update this recipe' });
          return;
      }
    if (error.message?.includes('Invalid data') || error.message?.includes('Invalid or missing')) {
        res.status(400).json({ message: error.message });
        return;
    }
    if (error.message === 'P2025' || error.code === 'P2025') { // Catch our thrown error or Prisma's
        res.status(404).json({ message: 'Recipe not found during update.' });
        return;
    }
     // Catch specific P2003 error from the transaction
     if (error.message?.includes('Invalid reference during ingredient update')) {
        res.status(400).json({ message: error.message });
        return;
    }
    res.status(500).json({ message: 'Error updating recipe' });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private/Admin (eventually)
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
     res.status(401).json({ message: 'Not authorized, user ID missing' });
     return;
  }
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
    // Ownership check before delete
    if (existingRecipe.userId !== req.user!.id) {
         res.status(403).json({ message: 'Not authorized to delete this recipe' });
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

// @desc    Parse recipe text using AI
// @route   POST /api/recipes/parse
// @access  Private
export const parseRecipe = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
        res.status(401).json({ message: 'Not authorized, user ID missing' });
        return;
    }

    try {
        const { recipeText } = req.body;

        if (!recipeText) {
            res.status(400).json({ message: 'Recipe text is required' });
            return;
        }

        // Split the text into sections, handling multiple newlines
        const sections = recipeText.split(/\n\s*\n+/); // Split on one or more empty lines
        let name = "";
        let description = "";
        let ingredients: { type: string; name: string; quantity: number; unit: string; raw: string }[] = [];
        let instructions = "";
        let yieldQuantity = 1;
        let yieldUnit = "serving";

        // Helper function to normalize section headers
        const normalizeSectionHeader = (text: string): string => {
            return text.toLowerCase().replace(/[:\s-]+/g, '').trim();
        };

        // Helper function to parse quantities
        const parseQuantity = (quantityStr: string): number => {
            // Remove any trailing periods
            quantityStr = quantityStr.replace(/\.$/, '');
            
            // Handle fractions
            if (quantityStr.includes('/')) {
                const [num, denom] = quantityStr.split('/');
                return parseFloat(num) / parseFloat(denom);
            }
            // Handle ranges (take average)
            if (quantityStr.includes('-')) {
                const [min, max] = quantityStr.split('-').map(n => parseFloat(n));
                return (min + max) / 2;
            }
            // Handle decimal numbers
            return parseFloat(quantityStr) || 1;
        };

        // Helper function to normalize units
        const normalizeUnit = (unit: string): string => {
            // Remove any trailing periods
            unit = unit.replace(/\.$/, '');
            
            const unitMap: { [key: string]: string } = {
                'tbsp': 'tablespoon',
                'tbs': 'tablespoon',
                'tablespoons': 'tablespoon',
                'tablespoon': 'tablespoon',
                'tsp': 'teaspoon',
                'teaspoons': 'teaspoon',
                'teaspoon': 'teaspoon',
                'oz': 'ounce',
                'ounces': 'ounce',
                'ounce': 'ounce',
                'lb': 'pound',
                'lbs': 'pound',
                'pounds': 'pound',
                'pound': 'pound',
                'cup': 'cup',
                'cups': 'cup',
                'g': 'gram',
                'grams': 'gram',
                'gram': 'gram',
                'kg': 'kilogram',
                'kilograms': 'kilogram',
                'kilogram': 'kilogram',
                'ml': 'milliliter',
                'milliliters': 'milliliter',
                'milliliter': 'milliliter',
                'l': 'liter',
                'liters': 'liter',
                'liter': 'liter',
                'whole': 'piece',
                'wholes': 'piece',
                'piece': 'piece',
                'pieces': 'piece',
                'count': 'piece',
                'counts': 'piece',
                '#': 'pound', // Handle # symbol for pounds
                'serving': 'serving',
                'servings': 'serving',
                'portion': 'serving',
                'portions': 'serving',
                'batch': 'batch',
                'batches': 'batch'
            };
            return unitMap[unit.toLowerCase()] || unit.toLowerCase();
        };

        // Helper function to detect if a line is likely an ingredient
        const isLikelyIngredient = (line: string): boolean => {
            // Check for common ingredient patterns
            const patterns = [
                /^\d+\.?\d*\s*[a-zA-Z]+/, // Starts with number and unit
                /^\d+\.?\d*\s*#/, // Starts with number and #
                /^[a-zA-Z]+\s*$/, // Just a word (like "salt")
                /^[a-zA-Z]+\s+to\s+taste/, // "salt to taste"
                /^[a-zA-Z]+\s+as\s+needed/ // "water as needed"
            ];
            return patterns.some(pattern => pattern.test(line.trim()));
        };

        // Helper function to detect if a line is likely an instruction
        const isLikelyInstruction = (line: string): boolean => {
            // Check for common instruction patterns
            const patterns = [
                /^\d+\./, // Starts with number and period
                /^[A-Z]/, // Starts with capital letter
                /^(mix|combine|add|stir|heat|cook|bake|preheat|place|put|remove|serve)/i, // Common instruction verbs
                /^(until|while|when|if|then|and|or)/i // Common instruction conjunctions
            ];
            return patterns.some(pattern => pattern.test(line.trim()));
        };

        // Helper function to parse yield information from title
        const parseYieldFromTitle = (title: string): { name: string; yieldQuantity: number; yieldUnit: string } => {
            const yieldPattern = /yields?\s+(?:approximately\s+)?(\d+)\s*([a-zA-Z#]+)/i;
            const match = title.match(yieldPattern);
            
            if (match) {
                const [_, quantity, unit] = match;
                // Extract the recipe name by removing the yield information
                const name = title.replace(/\s*--\s*yields?\s+(?:approximately\s+)?\d+\s*[a-zA-Z#]+/i, '').trim();
                return {
                    name,
                    yieldQuantity: parseQuantity(quantity),
                    yieldUnit: normalizeUnit(unit)
                };
            }
            
            return {
                name: title,
                yieldQuantity: 1,
                yieldUnit: "serving"
            };
        };

        // Process each section
        sections.forEach((section: string) => {
            const trimmedSection = section.trim();
            if (!trimmedSection) return;

            const normalizedSection = normalizeSectionHeader(trimmedSection);
            const lines = trimmedSection.split('\n').filter(line => line.trim());

            // Check if this is the ingredients section
            if (normalizedSection.includes('ingredients') || lines.some(isLikelyIngredient)) {
                const ingredientLines = normalizedSection.includes('ingredients') 
                    ? lines.slice(1) // Skip the header if it exists
                    : lines; // Use all lines if no header

                const newIngredients = ingredientLines.map((line: string) => {
                    const raw = line.trim();
                    
                    // Try different patterns for ingredient parsing
                    
                    // Pattern 1: quantity unit ingredient (e.g., "2 cups flour", "1½ cups sugar", "4 lb. pork")
                    const standardPattern = /^([\d./½⅓⅔¼¾-]+)\s*([a-zA-Z#.]+)\s+(.+)$/;
                    
                    // Pattern 2: quantity ingredient (e.g., "2 eggs", "1½ lemons")
                    const noUnitPattern = /^([\d./½⅓⅔¼¾-]+)\s+(.+)$/;
                    
                    // Pattern 3: just ingredient (e.g., "salt to taste", "water as needed")
                    const noQuantityPattern = /^(.+)$/;

                    let match;
                    
                    // Try standard pattern first (quantity + unit + ingredient)
                    match = raw.match(standardPattern);
                    if (match) {
                        const [_, quantity, unit, name] = match;
                        return {
                            type: "ingredient",
                            name: name.trim(),
                            quantity: parseQuantity(quantity),
                            unit: normalizeUnit(unit),
                            raw
                        };
                    }

                    // Try pattern without unit (quantity + ingredient)
                    match = raw.match(noUnitPattern);
                    if (match) {
                        const [_, quantity, name] = match;
                        return {
                            type: "ingredient",
                            name: name.trim(),
                            quantity: parseQuantity(quantity),
                            unit: "piece", // Default unit for countable items
                            raw
                        };
                    }

                    // Fallback: treat entire line as ingredient name
                    match = raw.match(noQuantityPattern);
                    if (match) {
                        return {
                            type: "ingredient",
                            name: match[1].trim(),
                            quantity: 1,
                            unit: "piece",
                            raw
                        };
                    }

                    // Final fallback
                    return {
                        type: "ingredient",
                        name: raw,
                        quantity: 1,
                        unit: "piece",
                        raw
                    };
                });

                // Append new ingredients to existing ones
                ingredients = [...ingredients, ...newIngredients];
            }
            // Check if this is the instructions section
            else if (normalizedSection.includes('instructions') || lines.some(isLikelyInstruction)) {
                const instructionLines = normalizedSection.includes('instructions') 
                    ? lines.slice(1) // Skip header if it exists
                    : lines; // Use all lines if no header

                // If we already have instructions, append with a newline
                if (instructions) {
                    instructions += '\n\n';
                }
                instructions += instructionLines
                    .filter((line: string) => line.trim())
                    .map((line: string) => line.trim())
                    .join('\n');
            }
            // Check if this is the description section
            else if (normalizedSection.includes('description')) {
                description = lines
                    .slice(1) // Skip the header
                    .filter((line: string) => line.trim())
                    .join('\n')
                    .trim();
            }
            // If it's the first section and doesn't match other patterns, it's probably the name
            else if (!name) {
                // Parse yield information from the title
                const { name: parsedName, yieldQuantity: parsedYieldQuantity, yieldUnit: parsedYieldUnit } = parseYieldFromTitle(trimmedSection);
                name = parsedName;
                yieldQuantity = parsedYieldQuantity;
                yieldUnit = parsedYieldUnit;
            }
        });

        // Format instructions with rich text
        const formattedInstructions = instructions
            .split('\n')
            .map((line: string) => {
                // If line starts with a number and period (e.g., "1.", "2.", etc.)
                if (/^\d+\./.test(line)) {
                    return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
                }
                return line;
            })
            .join('\n');

        const parsedRecipe = {
            name,
            description,
            instructions: formattedInstructions ? `<ol>${formattedInstructions}</ol>` : "",
            ingredients,
            yieldQuantity,
            yieldUnit
        };

        res.status(200).json(parsedRecipe);
    } catch (error) {
        console.error('Error parsing recipe:', error);
        res.status(500).json({ message: 'Error parsing recipe' });
    }
}; 