import { Prisma } from '@prisma/client';

// Common units with proper types
export const defaultUnits: Omit<Prisma.UnitOfMeasureCreateInput, 'author'>[] = [
  { name: 'tablespoon', abbreviation: 'tbsp', type: 'VOLUME' },
  { name: 'teaspoon', abbreviation: 'tsp', type: 'VOLUME' },
  { name: 'cup', abbreviation: 'cup', type: 'VOLUME' },
  { name: 'fluid ounce', abbreviation: 'fl oz', type: 'VOLUME' },
  { name: 'pint', abbreviation: 'pt', type: 'VOLUME' },
  { name: 'quart', abbreviation: 'qt', type: 'VOLUME' },
  { name: 'gallon', abbreviation: 'gal', type: 'VOLUME' },
  { name: 'milliliter', abbreviation: 'ml', type: 'VOLUME' },
  { name: 'liter', abbreviation: 'L', type: 'VOLUME' },
  
  { name: 'ounce', abbreviation: 'oz', type: 'WEIGHT' },
  { name: 'pound', abbreviation: 'lb', type: 'WEIGHT' },
  { name: 'gram', abbreviation: 'g', type: 'WEIGHT' },
  { name: 'kilogram', abbreviation: 'kg', type: 'WEIGHT' },
  
  { name: 'piece', abbreviation: 'pc', type: 'COUNT' },
  { name: 'slice', abbreviation: 'slice', type: 'COUNT' },
  { name: 'clove', abbreviation: 'clove', type: 'COUNT' },
  { name: 'whole', abbreviation: 'whole', type: 'COUNT' },

  { name: 'pinch', abbreviation: 'pinch', type: 'OTHER' },
  { name: 'dash', abbreviation: 'dash', type: 'OTHER' },
  { name: 'to taste', abbreviation: 'to taste', type: 'OTHER' },
  { name: 'serving', abbreviation: 'serving', type: 'OTHER' },
];

// Common pantry ingredients
export const defaultIngredients: Omit<Prisma.IngredientCreateInput, 'author'>[] = [
  // Baking ingredients
  { name: 'all-purpose flour', description: 'Standard wheat flour used for general baking' },
  { name: 'granulated sugar', description: 'Regular white sugar' },
  { name: 'brown sugar', description: 'Sugar with molasses added for flavor and moisture' },
  { name: 'baking powder', description: 'Leavening agent for baking' },
  { name: 'baking soda', description: 'Sodium bicarbonate, used as a leavening agent' },
  { name: 'vanilla extract', description: 'Flavoring derived from vanilla beans' },
  
  // Spices & Seasonings
  { name: 'salt', description: 'Basic seasoning for enhancing flavor' },
  { name: 'black pepper', description: 'Ground black peppercorns' },
  { name: 'ground cinnamon', description: 'Aromatic spice from tree bark' },
  { name: 'garlic powder', description: 'Dried, ground garlic' },
  { name: 'onion powder', description: 'Dried, ground onion' },
  { name: 'dried oregano', description: 'Aromatic herb commonly used in Italian and Mediterranean cooking' },
  { name: 'dried basil', description: 'Sweet aromatic herb used in Italian cooking' },
  { name: 'paprika', description: 'Ground dried red peppers' },
  { name: 'red pepper flakes', description: 'Crushed dried hot red peppers' },
  
  // Dairy & Refrigerated
  { name: 'butter', description: 'Dairy product made from cream' },
  { name: 'milk', description: 'Dairy liquid' },
  { name: 'large egg', description: 'Chicken egg' },
  { name: 'Parmesan cheese', description: 'Hard, aged Italian cheese' },
  { name: 'cheddar cheese', description: 'Sharp, firm cow\'s milk cheese' },
  
  // Oils & Vinegars
  { name: 'olive oil', description: 'Oil pressed from olives' },
  { name: 'vegetable oil', description: 'Neutral flavored cooking oil' },
  { name: 'white vinegar', description: 'Clear, acidic liquid used for cooking and cleaning' },
  { name: 'apple cider vinegar', description: 'Vinegar made from fermented apple juice' },
  
  // Produce
  { name: 'garlic', description: 'Aromatic bulb used for flavoring' },
  { name: 'yellow onion', description: 'All-purpose cooking onion' },
  { name: 'lemon', description: 'Citrus fruit with sour juice' },
  { name: 'lime', description: 'Small green citrus fruit' },
  
  // Canned & Jarred Goods
  { name: 'chicken broth', description: 'Savory liquid made by simmering chicken' },
  { name: 'diced tomatoes', description: 'Tomatoes cut into small cubes and canned' },
  { name: 'tomato paste', description: 'Concentrated tomato sauce' },
];

// Define categories too
export const defaultCategories: Omit<Prisma.CategoryCreateInput, 'author' | 'restaurant'>[] = [
  { name: 'Breakfast', description: 'Morning meals and breakfast recipes' },
  { name: 'Lunch', description: 'Midday meals and lunch recipes' },
  { name: 'Dinner', description: 'Evening meals and dinner recipes' },
  { name: 'Dessert', description: 'Sweet treats and dessert recipes' },
  { name: 'Appetizer', description: 'Starters and appetizers' },
  { name: 'Snack', description: 'Quick bites and snack recipes' },
  { name: 'Side Dish', description: 'Accompaniments to main courses' },
  { name: 'Sauce', description: 'Sauces, dips and condiments' },
];

// Define ingredient categories
export const defaultIngredientCategories: Omit<Prisma.IngredientCategoryCreateInput, 'author'>[] = [
  { name: 'Produce', description: 'Fresh fruits and vegetables' },
  { name: 'Meat', description: 'Beef, chicken, pork, etc.' },
  { name: 'Seafood', description: 'Fish, shellfish, etc.' },
  { name: 'Dairy', description: 'Milk, cheese, yogurt, etc.' },
  { name: 'Baking', description: 'Flour, sugar, baking powder, etc.' },
  { name: 'Spices', description: 'Herbs, spices, and seasonings' },
  { name: 'Canned Goods', description: 'Canned vegetables, beans, soups, etc.' },
  { name: 'Grains', description: 'Rice, pasta, bread, cereal, etc.' },
  { name: 'Oils & Vinegars', description: 'Cooking oils and vinegars' },
  { name: 'Condiments', description: 'Sauces, spreads, and dressings' },
]; 