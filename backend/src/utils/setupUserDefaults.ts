import prisma from '../config/db';
import { UnitType } from '@prisma/client';

/**
 * Adds default items to a newly registered user's account
 * @param userId - The ID of the newly registered user
 * @param restaurantId - The ID of the restaurant to associate the items with
 */
export const setupUserDefaults = async (userId: number, restaurantId: number): Promise<void> => {
  try {
    console.log(`Setting up default items for user ${userId} in restaurant ${restaurantId}`);
    
    // Common unit definitions
    const basicUnits = [
      { name: 'tablespoon', abbreviation: 'tbsp', type: UnitType.VOLUME },
      { name: 'teaspoon', abbreviation: 'tsp', type: UnitType.VOLUME },
      { name: 'cup', abbreviation: 'cup', type: UnitType.VOLUME },
      { name: 'ounce', abbreviation: 'oz', type: UnitType.WEIGHT },
      { name: 'pound', abbreviation: 'lb', type: UnitType.WEIGHT },
      { name: 'gram', abbreviation: 'g', type: UnitType.WEIGHT },
      { name: 'piece', abbreviation: 'pc', type: UnitType.COUNT },
      { name: 'whole', abbreviation: 'whole', type: UnitType.COUNT },
      { name: 'pinch', abbreviation: 'pinch', type: UnitType.OTHER },
      { name: 'serving', abbreviation: 'serving', type: UnitType.OTHER },
    ];
    
    // Add recipe categories
    await Promise.all([
      prisma.category.create({ data: { name: 'Breakfast', userId, restaurantId } }),
      prisma.category.create({ data: { name: 'Lunch', userId, restaurantId } }),
      prisma.category.create({ data: { name: 'Dinner', userId, restaurantId } }),
      prisma.category.create({ data: { name: 'Dessert', userId, restaurantId } }),
      prisma.category.create({ data: { name: 'Appetizer', userId, restaurantId } }),
    ]);
    
    // Add ingredient categories
    const bakingCategory = await prisma.ingredientCategory.create({ 
      data: { name: 'Baking', userId, restaurantId } 
    });
    
    const spicesCategory = await prisma.ingredientCategory.create({ 
      data: { name: 'Spices', userId, restaurantId } 
    });
    
    const dairyCategory = await prisma.ingredientCategory.create({ 
      data: { name: 'Dairy', userId, restaurantId } 
    });
    
    const produceCategory = await prisma.ingredientCategory.create({ 
      data: { name: 'Produce', userId, restaurantId } 
    });
    
    const oilsCategory = await prisma.ingredientCategory.create({ 
      data: { name: 'Oils & Vinegars', userId, restaurantId } 
    });
    
    // Add default units
    await Promise.all(
      basicUnits.map(unit => 
        prisma.unitOfMeasure.create({
          data: {
            name: unit.name,
            abbreviation: unit.abbreviation,
            type: unit.type,
            userId,
            restaurantId
          }
        })
      )
    );
    
    // Add common ingredients in batches by category
    
    // Baking ingredients
    await Promise.all([
      prisma.ingredient.create({ data: { name: 'all-purpose flour', ingredientCategoryId: bakingCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'granulated sugar', ingredientCategoryId: bakingCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'brown sugar', ingredientCategoryId: bakingCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'baking powder', ingredientCategoryId: bakingCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'baking soda', ingredientCategoryId: bakingCategory.id, userId, restaurantId }}),
    ]);
    
    // Spices
    await Promise.all([
      prisma.ingredient.create({ data: { name: 'salt', ingredientCategoryId: spicesCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'black pepper', ingredientCategoryId: spicesCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'ground cinnamon', ingredientCategoryId: spicesCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'garlic powder', ingredientCategoryId: spicesCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'dried oregano', ingredientCategoryId: spicesCategory.id, userId, restaurantId }}),
    ]);
    
    // Dairy
    await Promise.all([
      prisma.ingredient.create({ data: { name: 'butter', ingredientCategoryId: dairyCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'milk', ingredientCategoryId: dairyCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'large egg', ingredientCategoryId: dairyCategory.id, userId, restaurantId }}),
    ]);
    
    // Produce
    await Promise.all([
      prisma.ingredient.create({ data: { name: 'garlic', ingredientCategoryId: produceCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'yellow onion', ingredientCategoryId: produceCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'lemon', ingredientCategoryId: produceCategory.id, userId, restaurantId }}),
    ]);
    
    // Oils & vinegars
    await Promise.all([
      prisma.ingredient.create({ data: { name: 'olive oil', ingredientCategoryId: oilsCategory.id, userId, restaurantId }}),
      prisma.ingredient.create({ data: { name: 'vegetable oil', ingredientCategoryId: oilsCategory.id, userId, restaurantId }}),
    ]);
    
    console.log(`Successfully set up default items for user ${userId} in restaurant ${restaurantId}`);
  } catch (error) {
    // Just log the error but don't fail user creation
    console.error(`Error setting up default items for user ${userId}:`, error);
  }
}; 