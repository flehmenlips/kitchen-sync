import prisma from '../config/db';
import { UnitType, ReservationStatus, SubscriptionPlan } from '@prisma/client';
import { addDays, addHours, format } from 'date-fns';

/**
 * Sets up sample data for a newly registered restaurant
 * @param restaurantId - The ID of the newly created restaurant
 * @param userId - The ID of the restaurant owner
 */
export const setupRestaurantDefaults = async (restaurantId: number, userId: number): Promise<void> => {
  try {
    console.log(`Setting up default data for restaurant ${restaurantId}`);
    
    // 1. Create default units
    const units = await createDefaultUnits(userId, restaurantId);
    
    // 2. Create default ingredient categories
    const ingredientCategories = await createDefaultIngredientCategories(userId, restaurantId);
    
    // 3. Create default ingredients
    const ingredients = await createDefaultIngredients(userId, restaurantId, ingredientCategories);
    
    // 4. Create default recipe categories
    const recipeCategories = await createDefaultRecipeCategories(userId, restaurantId);
    
    // 5. Create sample recipes
    const recipes = await createSampleRecipes(userId, restaurantId, recipeCategories, ingredients, units);
    
    // 6. Create sample menu
    const menu = await createSampleMenu(userId, restaurantId, recipes);
    
    // 7. Create sample reservations
    await createSampleReservations(restaurantId);
    
    // 8. Create sample content blocks
    await createSampleContentBlocks(restaurantId);
    
    console.log(`Successfully set up default data for restaurant ${restaurantId}`);
  } catch (error) {
    console.error(`Error setting up defaults for restaurant ${restaurantId}:`, error);
  }
};

async function createDefaultUnits(userId: number, restaurantId: number) {
  const basicUnits = [
    { name: 'tablespoon', abbreviation: 'tbsp', type: UnitType.VOLUME },
    { name: 'teaspoon', abbreviation: 'tsp', type: UnitType.VOLUME },
    { name: 'cup', abbreviation: 'cup', type: UnitType.VOLUME },
    { name: 'fluid ounce', abbreviation: 'fl oz', type: UnitType.VOLUME },
    { name: 'liter', abbreviation: 'L', type: UnitType.VOLUME },
    { name: 'milliliter', abbreviation: 'ml', type: UnitType.VOLUME },
    { name: 'ounce', abbreviation: 'oz', type: UnitType.WEIGHT },
    { name: 'pound', abbreviation: 'lb', type: UnitType.WEIGHT },
    { name: 'gram', abbreviation: 'g', type: UnitType.WEIGHT },
    { name: 'kilogram', abbreviation: 'kg', type: UnitType.WEIGHT },
    { name: 'piece', abbreviation: 'pc', type: UnitType.COUNT },
    { name: 'dozen', abbreviation: 'dz', type: UnitType.COUNT },
    { name: 'pinch', abbreviation: 'pinch', type: UnitType.OTHER },
    { name: 'dash', abbreviation: 'dash', type: UnitType.OTHER },
  ];
  
  const units = await Promise.all(
    basicUnits.map(unit => 
      prisma.unitOfMeasure.create({
        data: { ...unit, userId, restaurantId }
      })
    )
  );
  
  return units;
}

async function createDefaultIngredientCategories(userId: number, restaurantId: number) {
  const categories = [
    'Proteins',
    'Dairy',
    'Produce',
    'Grains & Starches',
    'Spices & Seasonings',
    'Oils & Vinegars',
    'Sauces & Condiments',
    'Baking'
  ];
  
  const created = await Promise.all(
    categories.map(name =>
      prisma.ingredientCategory.create({
        data: { name, userId, restaurantId }
      })
    )
  );
  
  return created;
}

async function createDefaultIngredients(userId: number, restaurantId: number, categories: any[]) {
  const ingredientsByCategory: Record<string, string[]> = {
    'Proteins': ['chicken breast', 'ground beef', 'salmon fillet', 'shrimp', 'bacon'],
    'Dairy': ['butter', 'milk', 'heavy cream', 'parmesan cheese', 'mozzarella cheese'],
    'Produce': ['garlic', 'onion', 'tomato', 'lettuce', 'bell pepper', 'carrot', 'potato'],
    'Grains & Starches': ['pasta', 'rice', 'flour', 'bread crumbs', 'quinoa'],
    'Spices & Seasonings': ['salt', 'black pepper', 'paprika', 'oregano', 'basil', 'thyme'],
    'Oils & Vinegars': ['olive oil', 'vegetable oil', 'balsamic vinegar', 'red wine vinegar'],
    'Sauces & Condiments': ['ketchup', 'mayonnaise', 'soy sauce', 'hot sauce', 'dijon mustard'],
    'Baking': ['sugar', 'brown sugar', 'baking powder', 'vanilla extract', 'chocolate chips']
  };
  
  const ingredients = [];
  
  for (const category of categories) {
    const ingredientNames = ingredientsByCategory[category.name] || [];
    for (const name of ingredientNames) {
      const ingredient = await prisma.ingredient.create({
        data: {
          name,
          ingredientCategoryId: category.id,
          userId,
          restaurantId
        }
      });
      ingredients.push(ingredient);
    }
  }
  
  return ingredients;
}

async function createDefaultRecipeCategories(userId: number, restaurantId: number) {
  const categories = [
    'Appetizers',
    'Salads',
    'Soups',
    'Main Courses',
    'Pasta',
    'Desserts',
    'Beverages'
  ];
  
  const created = await Promise.all(
    categories.map(name =>
      prisma.category.create({
        data: { name, userId, restaurantId }
      })
    )
  );
  
  return created;
}

async function createSampleRecipes(userId: number, restaurantId: number, categories: any[], ingredients: any[], units: any[]) {
  const recipes = [];
  
  // Helper to find ingredient and unit
  const findIngredient = (name: string) => ingredients.find(i => i.name.includes(name));
  const findUnit = (abbr: string) => units.find(u => u.abbreviation === abbr);
  
  // Sample Recipe 1: Caesar Salad
  const caesarSalad = await prisma.recipe.create({
    data: {
      name: 'Classic Caesar Salad',
      description: 'Crisp romaine lettuce tossed with our house-made Caesar dressing, parmesan cheese, and croutons',
      yieldQuantity: 2,
      yieldUnitId: findUnit('pc')?.id!,
      prepTimeMinutes: 15,
      cookTimeMinutes: 0,
      instructions: JSON.stringify([
        'Wash and chop romaine lettuce',
        'Prepare Caesar dressing',
        'Toss lettuce with dressing',
        'Top with parmesan and croutons'
      ]),
      tags: ['salad', 'vegetarian'],
      userId,
      restaurantId,
      categoryId: categories.find(c => c.name === 'Salads')?.id,
      recipeIngredients: {
        create: [
          {
            ingredientId: findIngredient('lettuce')?.id!,
            quantity: 1,
            unitId: findUnit('pc')?.id!
          },
          {
            ingredientId: findIngredient('parmesan')?.id!,
            quantity: 0.5,
            unitId: findUnit('cup')?.id!
          }
        ]
      }
    }
  });
  recipes.push(caesarSalad);
  
  // Sample Recipe 2: Grilled Chicken
  const grilledChicken = await prisma.recipe.create({
    data: {
      name: 'Herb-Grilled Chicken Breast',
      description: 'Juicy grilled chicken breast marinated in herbs and olive oil',
      yieldQuantity: 1,
      yieldUnitId: findUnit('pc')?.id!,
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      instructions: JSON.stringify([
        'Marinate chicken in herbs and olive oil for 30 minutes',
        'Preheat grill to medium-high',
        'Grill chicken 6-7 minutes per side',
        'Let rest 5 minutes before serving'
      ]),
      tags: ['main', 'protein', 'gluten-free'],
      userId,
      restaurantId,
      categoryId: categories.find(c => c.name === 'Main Courses')?.id,
      recipeIngredients: {
        create: [
          {
            ingredientId: findIngredient('chicken breast')?.id!,
            quantity: 8,
            unitId: findUnit('oz')?.id!
          },
          {
            ingredientId: findIngredient('olive oil')?.id!,
            quantity: 2,
            unitId: findUnit('tbsp')?.id!
          },
          {
            ingredientId: findIngredient('thyme')?.id!,
            quantity: 1,
            unitId: findUnit('tsp')?.id!
          }
        ]
      }
    }
  });
  recipes.push(grilledChicken);
  
  // Sample Recipe 3: Chocolate Cake
  const chocolateCake = await prisma.recipe.create({
    data: {
      name: 'Decadent Chocolate Cake',
      description: 'Rich, moist chocolate cake with chocolate ganache',
      yieldQuantity: 8,
      yieldUnitId: findUnit('pc')?.id!,
      prepTimeMinutes: 20,
      cookTimeMinutes: 30,
      instructions: JSON.stringify([
        'Preheat oven to 350°F',
        'Mix dry ingredients',
        'Combine wet ingredients',
        'Fold together and bake for 30 minutes',
        'Cool and frost with ganache'
      ]),
      tags: ['dessert', 'chocolate'],
      userId,
      restaurantId,
      categoryId: categories.find(c => c.name === 'Desserts')?.id,
      recipeIngredients: {
        create: [
          {
            ingredientId: findIngredient('flour')?.id!,
            quantity: 2,
            unitId: findUnit('cup')?.id!
          },
          {
            ingredientId: findIngredient('sugar')?.id!,
            quantity: 1.5,
            unitId: findUnit('cup')?.id!
          },
          {
            ingredientId: findIngredient('chocolate chips')?.id!,
            quantity: 1,
            unitId: findUnit('cup')?.id!
          }
        ]
      }
    }
  });
  recipes.push(chocolateCake);
  
  return recipes;
}

async function createSampleMenu(userId: number, restaurantId: number, recipes: any[]) {
  const menu = await prisma.menu.create({
    data: {
      name: 'Main Menu',
      title: 'Our Signature Dishes',
      subtitle: 'Fresh, Local, Delicious',
      userId,
      restaurantId,
      sections: {
        create: [
          {
            name: 'Salads',
            position: 1,
            items: {
              create: [
                {
                  name: recipes[0].name,
                  description: recipes[0].description,
                  price: '12.95',
                  position: 1,
                  recipeId: recipes[0].id
                }
              ]
            }
          },
          {
            name: 'Main Courses',
            position: 2,
            items: {
              create: [
                {
                  name: recipes[1].name,
                  description: recipes[1].description,
                  price: '24.95',
                  position: 1,
                  recipeId: recipes[1].id
                }
              ]
            }
          },
          {
            name: 'Desserts',
            position: 3,
            items: {
              create: [
                {
                  name: recipes[2].name,
                  description: recipes[2].description,
                  price: '8.95',
                  position: 1,
                  recipeId: recipes[2].id
                }
              ]
            }
          }
        ]
      }
    }
  });
  
  return menu;
}

async function createSampleReservations(restaurantId: number) {
  const today = new Date();
  const reservations = [];
  
  // Create reservations for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    
    // Lunch reservations
    reservations.push({
      customerName: `Sample Guest ${i * 3 + 1}`,
      customerEmail: `guest${i * 3 + 1}@example.com`,
      customerPhone: '555-0100',
      restaurantId,
      partySize: 2,
      reservationDate: date,
      reservationTime: '12:00',
      status: i < 2 ? ReservationStatus.COMPLETED : ReservationStatus.CONFIRMED,
      notes: 'Window table preferred'
    });
    
    // Dinner reservations
    reservations.push({
      customerName: `Sample Guest ${i * 3 + 2}`,
      customerEmail: `guest${i * 3 + 2}@example.com`,
      customerPhone: '555-0101',
      restaurantId,
      partySize: 4,
      reservationDate: date,
      reservationTime: '18:30',
      status: i < 2 ? ReservationStatus.COMPLETED : ReservationStatus.CONFIRMED,
      specialRequests: 'Birthday celebration'
    });
    
    reservations.push({
      customerName: `Sample Guest ${i * 3 + 3}`,
      customerEmail: `guest${i * 3 + 3}@example.com`,
      customerPhone: '555-0102',
      restaurantId,
      partySize: 2,
      reservationDate: date,
      reservationTime: '19:30',
      status: i < 2 ? ReservationStatus.COMPLETED : ReservationStatus.CONFIRMED
    });
  }
  
  await prisma.reservation.createMany({
    data: reservations
  });
}

async function createSampleContentBlocks(restaurantId: number) {
  await prisma.contentBlock.createMany({
    data: [
      {
        restaurantId,
        page: 'home',
        blockType: 'welcome',
        title: 'Welcome to Your Restaurant',
        subtitle: 'Experience culinary excellence',
        content: 'We are delighted to have you join us for an unforgettable dining experience.',
        displayOrder: 1,
        isActive: true
      },
      {
        restaurantId,
        page: 'home',
        blockType: 'features',
        title: 'Why Choose Us',
        content: JSON.stringify([
          'Fresh, locally-sourced ingredients',
          'Award-winning chef',
          'Exceptional service',
          'Beautiful ambiance'
        ]),
        displayOrder: 2,
        isActive: true
      },
      {
        restaurantId,
        page: 'home',
        blockType: 'cta',
        title: 'Make a Reservation',
        subtitle: 'Join us for an unforgettable experience',
        buttonText: 'Book Now',
        buttonLink: '/reservations/new',
        displayOrder: 3,
        isActive: true
      }
    ]
  });
} 