import { Request, Response } from 'express';
// Using relative path now that we know alias might be tricky initially
import prisma from '../config/db'; 
import { Prisma, UnitType } from '@prisma/client'; // Re-import Prisma namespace
import aiParserService from '../services/aiParserService';
import { parseRecipeWithAI } from '../services/aiParserService';

// Define the ParsedRecipe interface
interface ParsedRecipe {
  name: string;
  description: string;
  ingredients: {
    quantity: number;
    unit: string;
    name: string;
    notes?: string;
  }[];
  instructions: string[];
  notes?: string;
  yieldQuantity?: number;
  yieldUnit?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
}

// Add interface for Request with file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

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
    
    // Debug: Log the photoUrl to check if it's correctly included
    console.log(`Recipe ${recipeId} photoUrl:`, recipe.photoUrl);
    
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
            categoryId, photoUrl,
            ingredients
        } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }

        // Check for duplicate recipe name for this user
        const existingRecipe = await prisma.recipe.findFirst({
            where: {
                name,
                userId: req.user.id
            }
        });

        if (existingRecipe) {
            res.status(400).json({ message: 'A recipe with this name already exists' });
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
                    photoUrl,
                    userId: req.user!.id,
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
                    data: recipeIngredientsData
                });
            }

            return newRecipe;
        });

        res.status(201).json(newRecipeWithIngredients);
    } catch (error) {
        console.error('Error creating recipe:', error);
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
        const {
            name, description, instructions, yieldQuantity, yieldUnitId,
            prepTimeMinutes, cookTimeMinutes, tags,
            categoryId, photoUrl,
            ingredients
        } = req.body;

        const recipeId = safeParseInt(id);
        if (!recipeId) {
            res.status(400).json({ message: 'Invalid recipe ID' });
            return;
        }

        // Check if recipe exists and belongs to user
        const existingRecipe = await prisma.recipe.findUnique({
            where: { id: recipeId }
        });

        if (!existingRecipe) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }

        if (existingRecipe.userId !== req.user.id) {
            res.status(403).json({ message: 'Not authorized to update this recipe' });
            return;
        }

        // If name is being changed, check for duplicates
        if (name && name !== existingRecipe.name) {
            const duplicateRecipe = await prisma.recipe.findFirst({
                where: {
                    name,
                    userId: req.user.id,
                    id: { not: recipeId } // Exclude current recipe
                }
            });

            if (duplicateRecipe) {
                res.status(400).json({ message: 'A recipe with this name already exists' });
                return;
            }
        }

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
                    photoUrl,
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

/**
 * Parses recipe text into structured recipe data
 * @param recipeText The raw recipe text to parse
 * @param forceAI Optional flag to force using AI parsing
 * @returns The parsed recipe data
 */
export const parseRecipeText = async (recipeText: string, forceAI: boolean = false): Promise<ParsedRecipe> => {
  // Try AI parsing first if enabled or forced
  if (process.env.USE_AI_PARSER === 'true' || forceAI) {
    try {
      console.log('Using AI parser for recipe...');
      const aiParsedRecipe = await parseRecipeWithAI(recipeText);
      console.log('Successfully parsed recipe with AI');
      return aiParsedRecipe;
    } catch (error) {
      console.log(`AI parsing failed, falling back to algorithmic parser: ${error}`);
      if (forceAI) {
        throw new Error(`AI parser was forced, but failed: ${error}`);
      }
      // If not forced, fall back to algorithmic parser
    }
  }

  // Fall back to algorithmic parser
  let lines = recipeText.split('\n').map(line => line.trim()).filter(line => line !== '');
  
  // Define common recipe section headers
  const commonSectionHeaders = {
    name: ['name', 'title', 'recipe name', 'recipe title'],
    description: ['description', 'summary', 'about', 'notes', 'recipe description'],
    ingredients: ['ingredients', 'ingredient list', 'what you need', 'you will need', 'shopping list'],
    instructions: ['instructions', 'directions', 'method', 'preparation', 'steps', 'how to cook', 'how to make'],
    notes: ['notes', 'tips', 'serving suggestions', 'variations'],
    yield: ['yield', 'servings', 'serves', 'makes'],
    prepTime: ['prep time', 'preparation time'],
    cookTime: ['cook time', 'cooking time', 'bake time', 'baking time']
  };

  // Initialize recipe data structure
  const recipe: ParsedRecipe = {
    name: '',
    description: '',
    ingredients: [],
    instructions: [],
    notes: '',
    yieldQuantity: undefined,
    yieldUnit: undefined,
    prepTimeMinutes: undefined,
    cookTimeMinutes: undefined
  };

  // Helper functions
  const normalizeSectionHeader = (header: string): string => {
    return header.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
  };

  const isSectionHeader = (line: string): boolean => {
    // Check if line is a section header (e.g., all caps, ends with colon, etc.)
    return (
      /^[A-Z\s]+:?$/.test(line) || // ALL CAPS with optional colon
      /^#+\s+\w+/.test(line) || // Markdown style headers (#, ##, etc.)
      /^[A-Z][a-z]+:$/.test(line) || // Title Case with colon
      /^\d+\.\s+[A-Z]/.test(line) // Numbered section (e.g., "1. INGREDIENTS")
    );
  };

  const extractTimeMinutes = (text: string): number | undefined => {
    // Match patterns like "30 minutes", "1 hour and 15 minutes", "1 hr 30 min", etc.
    const hourPattern = /(\d+)\s*(?:hours?|hrs?|h)\b/i;
    const minutePattern = /(\d+)\s*(?:minutes?|mins?|m)\b/i;
    
    let totalMinutes = 0;
    let foundTime = false;
    
    const hourMatch = text.match(hourPattern);
    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1]) * 60;
      foundTime = true;
    }
    
    const minuteMatch = text.match(minutePattern);
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1]);
      foundTime = true;
    }
    
    return foundTime ? totalMinutes : undefined;
  };

  const parseQuantity = (quantityStr: string): number => {
    // Handle fractions like "1/2", "1 1/2", etc.
    const wholeFractionPattern = /^(\d+)\s+(\d+)\/(\d+)$/;
    const fractionPattern = /^(\d+)\/(\d+)$/;
    
    if (wholeFractionPattern.test(quantityStr)) {
      const match = quantityStr.match(wholeFractionPattern);
      if (match) {
        const whole = parseInt(match[1]);
        const numerator = parseInt(match[2]);
        const denominator = parseInt(match[3]);
        return whole + (numerator / denominator);
      }
    } else if (fractionPattern.test(quantityStr)) {
      const match = quantityStr.match(fractionPattern);
      if (match) {
        const numerator = parseInt(match[1]);
        const denominator = parseInt(match[2]);
        return numerator / denominator;
      }
    }
    
    // For decimal numbers or integers
    return parseFloat(quantityStr);
  };

  const normalizeUnit = (unit: string): string => {
    const unitMap: Record<string, string> = {
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'tbsp': 'tbsp',
      'tbsps': 'tbsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp',
      'tsp': 'tsp',
      'tsps': 'tsp',
      'cup': 'cup',
      'cups': 'cup',
      'ounce': 'oz',
      'ounces': 'oz',
      'oz': 'oz',
      'pound': 'lb',
      'pounds': 'lb',
      'lb': 'lb',
      'lbs': 'lb',
      'gram': 'g',
      'grams': 'g',
      'g': 'g',
      'kilogram': 'kg',
      'kilograms': 'kg',
      'kg': 'kg',
      'milliliter': 'ml',
      'milliliters': 'ml',
      'ml': 'ml',
      'liter': 'l',
      'liters': 'l',
      'l': 'l',
      'inch': 'inch',
      'inches': 'inch',
      'piece': 'piece',
      'pieces': 'piece',
    };
    
    unit = unit.toLowerCase().trim();
    return unitMap[unit] || unit;
  };

  const isLikelyIngredient = (line: string): boolean => {
    // Patterns that suggest a line is an ingredient
    const ingredientPatterns = [
      /^\d+/, // Starts with a number
      /^(?:\d+\/\d+)/, // Starts with a fraction
      /^(?:\d+\s+\d+\/\d+)/, // Starts with a mixed number (e.g., "1 1/2")
      /^([a-zA-Z]+\s+)?(of|a|an)\s+/, // Starts with "a", "an", or similar
      /^(?:[a-zA-Z]+\s+)?(to taste|as needed)/ // Contains "to taste" or "as needed"
    ];
    
    return ingredientPatterns.some(pattern => pattern.test(line));
  };

  const isLikelyInstruction = (line: string): boolean => {
    // Patterns that suggest a line is an instruction
    const instructionPatterns = [
      /^(?:\d+\.)/, // Starts with a number and period (e.g., "1.")
      /^(?:step\s+\d+)/i, // Starts with "Step" followed by a number
      /^\*/, // Starts with an asterisk (bullet point)
      /^-/, // Starts with a dash/hyphen (bullet point)
      /^(?:[A-Za-z]+\s+the)/, // Starts with a verb followed by "the"
      /^(?:first|second|third|fourth|next|finally)/i // Starts with a sequence word
    ];
    
    return instructionPatterns.some(pattern => pattern.test(line));
  };

  // Process recipe text line by line
  let currentSection: 'name' | 'description' | 'ingredients' | 'instructions' | 'notes' | 'other' = 'other';
  let detectedSections = new Set<string>();
  
  // First pass: identify the recipe name if it appears to be a title at the start
  if (lines.length > 0 && !isSectionHeader(lines[0])) {
    recipe.name = lines[0];
    lines.shift(); // Remove the name from the lines
    detectedSections.add('name');
  }
  
  // Second pass: process sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if this line is a section header
    if (isSectionHeader(line)) {
      const normalizedHeader = normalizeSectionHeader(line);
      
      // Determine which section this header belongs to
      if (commonSectionHeaders.ingredients.some(h => normalizedHeader.includes(h))) {
        currentSection = 'ingredients';
        detectedSections.add('ingredients');
      } else if (commonSectionHeaders.instructions.some(h => normalizedHeader.includes(h))) {
        currentSection = 'instructions';
        detectedSections.add('instructions');
      } else if (commonSectionHeaders.description.some(h => normalizedHeader.includes(h))) {
        currentSection = 'description';
        detectedSections.add('description');
      } else if (commonSectionHeaders.notes.some(h => normalizedHeader.includes(h))) {
        currentSection = 'notes';
        detectedSections.add('notes');
      } else if (commonSectionHeaders.yield.some(h => normalizedHeader.includes(h))) {
        // Extract yield information directly from the header or the next line
        const yieldLine = i + 1 < lines.length ? lines[i + 1] : line;
        const yieldMatch = yieldLine.match(/(\d+)\s*(?:servings|serves|pieces)/i);
        if (yieldMatch) {
          recipe.yieldQuantity = parseInt(yieldMatch[1]);
          recipe.yieldUnit = 'servings';
          if (yieldLine !== line) i++; // Skip the next line if we used it
        }
        currentSection = 'other';
      } else if (commonSectionHeaders.prepTime.some(h => normalizedHeader.includes(h))) {
        // Extract prep time
        const timeLine = i + 1 < lines.length ? lines[i + 1] : line;
        recipe.prepTimeMinutes = extractTimeMinutes(timeLine);
        if (timeLine !== line) i++; // Skip the next line if we used it
        currentSection = 'other';
      } else if (commonSectionHeaders.cookTime.some(h => normalizedHeader.includes(h))) {
        // Extract cook time
        const timeLine = i + 1 < lines.length ? lines[i + 1] : line;
        recipe.cookTimeMinutes = extractTimeMinutes(timeLine);
        if (timeLine !== line) i++; // Skip the next line if we used it
        currentSection = 'other';
      } else if (!recipe.name && commonSectionHeaders.name.some(h => normalizedHeader.includes(h))) {
        // Only set name if we haven't already
        const nameLine = i + 1 < lines.length ? lines[i + 1] : '';
        if (nameLine && !isSectionHeader(nameLine)) {
          recipe.name = nameLine;
          detectedSections.add('name');
          i++; // Skip the next line
        }
        currentSection = 'other';
      } else {
        currentSection = 'other';
      }
      
      continue; // Skip processing the section header line
    }
    
    // Process line based on current section
    switch (currentSection) {
      case 'ingredients':
        // Parse as an ingredient
        recipe.ingredients.push({
          quantity: 1, // Default
          unit: 'piece', // Default
          name: line
        });
        break;
        
      case 'instructions':
        // Add as an instruction
        recipe.instructions.push(line);
        break;
        
      case 'description':
        // Append to description
        recipe.description += (recipe.description ? '\n' : '') + line;
        break;
        
      case 'notes':
        // Append to notes
        recipe.notes += (recipe.notes ? '\n' : '') + line;
        break;
        
      case 'other':
        // Try to determine what this line might be based on its structure
        if (isLikelyIngredient(line)) {
          recipe.ingredients.push({
            quantity: 1, // Default
            unit: 'piece', // Default
            name: line
          });
          if (!detectedSections.has('ingredients')) {
            detectedSections.add('ingredients');
          }
        } else if (isLikelyInstruction(line)) {
          recipe.instructions.push(line);
          if (!detectedSections.has('instructions')) {
            detectedSections.add('instructions');
          }
        } else if (!recipe.description) {
          // If we don't have a description yet, use this as the description
          recipe.description = line;
          detectedSections.add('description');
        } else {
          // Default: add to description
          recipe.description += '\n' + line;
        }
        break;
    }
  }
  
  // If we haven't detected a recipe name, use the first non-empty line of description
  if (!recipe.name && recipe.description) {
    const firstLine = recipe.description.split('\n')[0];
    recipe.name = firstLine;
    recipe.description = recipe.description.replace(firstLine, '').trim();
  }
  
  // If we still don't have a name, use a default
  if (!recipe.name) {
    recipe.name = "Untitled Recipe";
  }
  
  // Final cleanup: ensure we have at least basic information in each required field
  if (!recipe.description) recipe.description = '';
  if (recipe.ingredients.length === 0) {
    // Default ingredient if none were found
    recipe.ingredients.push({
      quantity: 1,
      unit: 'piece',
      name: 'Ingredients not specified'
    });
  }
  if (recipe.instructions.length === 0) {
    recipe.instructions.push('Instructions not specified');
  }
  
  return recipe;
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
        const { recipeText, forceAI } = req.body;

        if (!recipeText) {
            res.status(400).json({ message: 'Recipe text is required' });
            return;
        }

        // Force AI parsing if requested, otherwise use env var setting
        const useAlgorithmicParser = forceAI === true ? false : process.env.USE_ALGORITHMIC_PARSER === 'true';
        
        console.log(`Recipe parsing: ${forceAI ? 'Forcing AI parser' : (useAlgorithmicParser ? 'Using algorithmic parser' : 'Using AI parser')}`);
        
        if (useAlgorithmicParser) {
            // Use the existing algorithmic parser
            const parsedRecipe = await parseRecipeText(recipeText);
            
            // Format the response as before
            // ... existing code to format the response ...
            
            // Format instructions with rich text
            const formattedInstructions = parsedRecipe.instructions
                .map((line: string) => {
                    // If line starts with a number and period (e.g., "1.", "2.", etc.)
                    if (/^\d+\./.test(line)) {
                        return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
                    }
                    return `<li>${line}</li>`;
                })
                .join('\n');

            // If we have notes, append them to the description
            let description = parsedRecipe.description;
            if (parsedRecipe.notes) {
                if (description) {
                    description += '\n\n';
                }
                description += parsedRecipe.notes;
            }

            // Format ingredients as objects that match the frontend's expected structure
            const formattedIngredients = parsedRecipe.ingredients.map((ingredient) => {
                // Check if ingredient is a string or already an object
                if (typeof ingredient === 'string') {
                    try {
                        // For string ingredients (from algorithmic parser)
                        return {
                            type: "ingredient",
                            quantity: 1,
                            unit: "piece",
                            unitId: "",
                            name: ingredient,
                            raw: ingredient,
                            skipDatabase: true
                        };
                    } catch (error) {
                        // Default fallback if parsing fails
                        return {
                            type: "ingredient",
                            quantity: 1,
                            unit: "piece",
                            unitId: "",
                            name: ingredient,
                            raw: ingredient,
                            skipDatabase: true
                        };
                    }
                } else {
                    // For object ingredients (already structured)
                    const ing = ingredient as { quantity: number; unit: string; name: string; notes?: string };
                    let rawText = `${ing.quantity} ${ing.unit} ${ing.name}`;
                    if (ing.notes) {
                        rawText += ` (${ing.notes})`;
                    }
                    return {
                        type: "ingredient",
                        quantity: ing.quantity,
                        unit: ing.unit,
                        unitId: "",
                        name: ing.name,
                        raw: rawText,
                        notes: ing.notes,
                        skipDatabase: true
                    };
                }
            });

            // ... existing algorithmic response format ...
            const response = {
                name: parsedRecipe.name,
                description: description,
                instructions: formattedInstructions ? `<ol>${formattedInstructions}</ol>` : "",
                ingredients: formattedIngredients.length > 0 ? formattedIngredients : [{ 
                    type: "ingredient", 
                    quantity: 1, 
                    unit: "piece", 
                    unitId: "", 
                    name: "No ingredients identified",
                    raw: "No ingredients identified" 
                }],
                yieldQuantity: parsedRecipe.yieldQuantity,
                yieldUnit: parsedRecipe.yieldUnit,
                prepTimeMinutes: parsedRecipe.prepTimeMinutes,
                cookTimeMinutes: parsedRecipe.cookTimeMinutes
            };

            res.status(200).json(response);
        } else {
            // Use the new AI-powered parser
            try {
                const aiParsedRecipe = await aiParserService.parseRecipeWithAI(recipeText);
                
                // Format the response for the frontend
                const formattedInstructions = aiParsedRecipe.instructions
                    .map((instruction: string) => `<li>${instruction}</li>`)
                    .join('\n');
                
                // Format the ingredients for the frontend, with improved handling for simple quantities
                const formattedIngredients = aiParsedRecipe.ingredients.map(ing => {
                    // Improve display text generation
                    let rawText = '';
                    if (ing.unit === 'piece' && ing.name.match(/s$/)) {
                        // For plural ingredients with 'piece' unit (like '2 carrots')
                        // Don't show the unit in display
                        rawText = `${ing.quantity} ${ing.name}`;
                    } else if (ing.unit === 'g' || ing.unit === 'ml') {
                        // For metric units, combine the number and unit
                        rawText = `${ing.quantity}${ing.unit} ${ing.name}`;
                    } else {
                        // Default format
                        rawText = `${ing.quantity} ${ing.unit} ${ing.name}`;
                    }
                    
                    // Add notes if any
                    if (ing.notes) {
                        rawText += ` (${ing.notes})`;
                    }
                    
                    return {
                        type: "ingredient",
                        quantity: ing.quantity,
                        unit: ing.unit,
                        unitId: "",
                        name: ing.name,
                        raw: rawText,
                        notes: ing.notes
                    };
                });
                
                // Build the full response
                const response = {
                    name: aiParsedRecipe.name,
                    description: aiParsedRecipe.description + (aiParsedRecipe.notes ? `\n\n${aiParsedRecipe.notes}` : ''),
                    instructions: formattedInstructions ? `<ol>${formattedInstructions}</ol>` : "",
                    ingredients: formattedIngredients,
                    yieldQuantity: aiParsedRecipe.yieldQuantity,
                    yieldUnit: aiParsedRecipe.yieldUnit,
                    prepTimeMinutes: aiParsedRecipe.prepTimeMinutes,
                    cookTimeMinutes: aiParsedRecipe.cookTimeMinutes
                };
                
                res.status(200).json(response);
            } catch (aiError) {
                console.error('AI parsing failed, falling back to algorithmic parser:', aiError);
                
                // If AI parsing fails, fall back to the algorithmic parser
                const parsedRecipe = await parseRecipeText(recipeText);
                
                // ... rest of the algorithmic response formatting ...
                // (same code as in the useAlgorithmicParser branch)
                
                // Format instructions with rich text
                const formattedInstructions = parsedRecipe.instructions
                    .map((line: string) => {
                        // If line starts with a number and period (e.g., "1.", "2.", etc.)
                        if (/^\d+\./.test(line)) {
                            return `<li>${line.replace(/^\d+\.\s*/, '')}</li>`;
                        }
                        return `<li>${line}</li>`;
                    })
                    .join('\n');

                // If we have notes, append them to the description
                let description = parsedRecipe.description;
                if (parsedRecipe.notes) {
                    if (description) {
                        description += '\n\n';
                    }
                    description += parsedRecipe.notes;
                }

                // Format ingredients as objects that match the frontend's expected structure
                const formattedIngredients = parsedRecipe.ingredients.map((ingredient) => {
                    // Check if ingredient is a string or already an object
                    if (typeof ingredient === 'string') {
                        try {
                            // For string ingredients (from algorithmic parser)
                            return {
                                type: "ingredient",
                                quantity: 1,
                                unit: "piece",
                                unitId: "",
                                name: ingredient,
                                raw: ingredient,
                                skipDatabase: true
                            };
                        } catch (error) {
                            return {
                                type: "ingredient",
                                quantity: 1,
                                unit: "piece",
                                unitId: "",
                                name: ingredient,
                                raw: ingredient,
                                skipDatabase: true
                            };
                        }
                    } else {
                        // For object ingredients (already structured)
                        const ing = ingredient as { quantity: number; unit: string; name: string; notes?: string };
                        let rawText = `${ing.quantity} ${ing.unit} ${ing.name}`;
                        if (ing.notes) {
                            rawText += ` (${ing.notes})`;
                        }
                        return {
                            type: "ingredient",
                            quantity: ing.quantity,
                            unit: ing.unit,
                            unitId: "",
                            name: ing.name,
                            raw: rawText,
                            notes: ing.notes,
                            skipDatabase: true
                        };
                    }
                });

                const response = {
                    name: parsedRecipe.name,
                    description: description,
                    instructions: formattedInstructions ? `<ol>${formattedInstructions}</ol>` : "",
                    ingredients: formattedIngredients.length > 0 ? formattedIngredients : [{ 
                        type: "ingredient", 
                        quantity: 1, 
                        unit: "piece", 
                        unitId: "", 
                        name: "No ingredients identified",
                        raw: "No ingredients identified" 
                    }],
                    yieldQuantity: parsedRecipe.yieldQuantity,
                    yieldUnit: parsedRecipe.yieldUnit,
                    prepTimeMinutes: parsedRecipe.prepTimeMinutes,
                    cookTimeMinutes: parsedRecipe.cookTimeMinutes
                };

                res.status(200).json(response);
            }
        }
    } catch (error) {
        console.error('Error parsing recipe:', error);
        res.status(500).json({ message: 'Error parsing recipe' });
    }
};

// @desc    Upload a photo for a recipe
// @route   POST /api/recipes/:id/photo
// @access  Private
export const uploadRecipePhoto = async (req: MulterRequest, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Not authorized, user ID missing' });
    return;
  }

  try {
    const { id } = req.params;
    const recipeId = parseInt(id, 10);

    if (isNaN(recipeId)) {
      res.status(400).json({ message: 'Invalid recipe ID format' });
      return;
    }

    // Check if recipe exists and belongs to user
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    });

    if (!existingRecipe) {
      res.status(404).json({ message: 'Recipe not found' });
      return;
    }

    if (existingRecipe.userId !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to update this recipe' });
      return;
    }

    // If no file was uploaded
    if (!req.file) {
      res.status(400).json({ message: 'Please upload an image file' });
      return;
    }

    // Create the URL for the uploaded photo
    const photoUrl = `/uploads/${req.file.filename}`;

    // Update the recipe with the new photo URL
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        photoUrl: photoUrl,
      },
    });

    res.status(200).json({
      message: 'Recipe photo uploaded successfully',
      photoUrl: photoUrl,
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Error uploading recipe photo:', error);
    res.status(500).json({ message: 'Error uploading recipe photo' });
  }
}; 