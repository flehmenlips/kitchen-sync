import dotenv from 'dotenv';
import { parseRecipeText } from '../controllers/recipeController';
import { parseRecipeWithAI } from '../services/aiParserService';

// Load environment variables
dotenv.config();

// Test recipe examples with various formats
const testRecipes = {
  simple: `Chocolate Chip Cookies

Ingredients:
2 1/4 cups all-purpose flour
1 tsp baking soda
1 tsp salt
1 cup unsalted butter
3/4 cup granulated sugar
3/4 cup brown sugar
2 large eggs
2 tsp vanilla extract
2 cups chocolate chips

Instructions:
1. Preheat oven to 375°F
2. Mix dry ingredients in a bowl
3. Cream butter and sugars until fluffy
4. Beat in eggs and vanilla
5. Gradually add dry ingredients
6. Stir in chocolate chips
7. Drop by tablespoons onto baking sheets
8. Bake for 9-11 minutes or until golden
`,

  complex: `ULTIMATE BEEF LASAGNA

Description:
Layers of rich meat sauce, creamy béchamel, and tender pasta make this classic Italian dish absolutely irresistible.

YIELD: 8 servings

PREP TIME: 45 minutes
COOK TIME: 1 hour 30 minutes

INGREDIENTS:

For the Meat Sauce:
2 tbsp olive oil
1 large onion, finely chopped
2 carrots, diced
2 celery stalks, diced
4 cloves garlic, minced
1 lb (500g) ground beef
1/2 lb (250g) Italian sausage, casings removed
1 cup dry red wine
2 cans (28 oz each) crushed tomatoes
2 tbsp tomato paste
2 tsp dried oregano
2 bay leaves
1/4 cup fresh basil, chopped
Salt and pepper to taste

For the Béchamel:
4 tbsp butter
1/4 cup all-purpose flour
3 cups milk, warmed
1/4 tsp ground nutmeg
Salt and white pepper to taste

For Assembly:
12 lasagna noodles, cooked according to package (or no-boil)
3 cups mozzarella cheese, shredded
1 cup Parmesan cheese, grated
Fresh basil for garnish

DIRECTIONS:

For the Meat Sauce:
1. Heat olive oil in a large pot over medium heat. Add onions, carrots, and celery, and sauté for 5-7 minutes until softened.
2. Add garlic and cook for another minute until fragrant.
3. Increase heat to medium-high and add ground beef and sausage. Cook until browned, breaking up the meat with a wooden spoon.
4. Pour in the red wine and simmer until reduced by half, about 5 minutes.
5. Add crushed tomatoes, tomato paste, oregano, and bay leaves. 
6. Reduce heat to low and simmer uncovered for at least 30 minutes (or up to 2 hours for deeper flavor), stirring occasionally.
7. Remove bay leaves, stir in fresh basil, and season with salt and pepper.

For the Béchamel:
1. Melt butter in a saucepan over medium heat.
2. Whisk in flour and cook for 1-2 minutes until pale and bubbly.
3. Gradually add warm milk, whisking constantly to prevent lumps.
4. Bring to a gentle simmer and cook for 5-8 minutes until thickened.
5. Season with nutmeg, salt, and white pepper.

Assembly:
1. Preheat oven to 375°F (190°C).
2. Spread a thin layer of meat sauce on the bottom of a 9x13 inch baking dish.
3. Arrange a layer of lasagna noodles over the sauce.
4. Spread 1/3 of the remaining meat sauce over the noodles.
5. Pour 1/3 of the béchamel sauce over the meat sauce.
6. Sprinkle with 1/3 of the mozzarella and Parmesan cheeses.
7. Repeat layers two more times, ending with cheese on top.
8. Cover with foil and bake for 25 minutes.
9. Remove foil and bake for an additional 15-20 minutes until bubbling and golden.
10. Let rest for 15 minutes before serving. Garnish with fresh basil.

NOTES:
- Make ahead: Assemble lasagna, cover, and refrigerate for up to 24 hours before baking.
- Freezing instructions: Freeze unbaked lasagna for up to 3 months. Thaw overnight in refrigerator before baking.
- Substitute ground turkey for a lighter version.
`,

  unconventional: `GRANDMA'S SECRET APPLE PIE

My grandmother's recipe that's been in our family for generations.

Crust:
2 1/2 cups flour
1 tsp salt
1 tsp sugar
1 cup cold butter, cubed
1/4 to 1/2 cup ice water

For the filling:
8 Granny Smith apples
3/4 cup sugar
2 tbsp flour
1 tsp cinnamon
1/4 tsp nutmeg
2 tbsp lemon juice
2 tbsp butter, diced

First, make the crust by mixing the dry ingredients. Cut in the cold butter until crumbly. Add ice water gradually until dough forms. Divide in half, chill 1 hour.

Peel and slice apples thinly. Toss with sugar, flour, spices, and lemon juice.

Roll out one dough half and line a 9-inch pie dish. Add filling. Dot with butter.

Roll remaining dough for top crust. Seal edges and cut vents.

Bake at 425°F for 15 minutes, then reduce to 350°F and bake 40-45 minutes more.

Cool before serving. Best with vanilla ice cream!
`
};

async function runParserTests() {
  console.log('🧪 RECIPE PARSER TEST SUITE 🧪\n');
  
  // Test configuration check
  console.log('📋 TEST CONFIGURATION:');
  const hasAIKey = !!process.env.ANTHROPIC_API_KEY;
  console.log(`- Anthropic API Key: ${hasAIKey ? 'FOUND ✅' : 'NOT FOUND ❌'}`);
  console.log(`- Algorithmic Parser: AVAILABLE ✅`);
  console.log('\n');

  // Testing both parsing methods with multiple recipes
  for (const [name, recipe] of Object.entries(testRecipes)) {
    console.log(`🔍 TESTING ${name.toUpperCase()} RECIPE\n`);
    
    // Test algorithmic parser
    console.log('⚙️ ALGORITHMIC PARSER:');
    try {
      console.time('Algorithmic parsing time');
      const algorithmicResult = await parseRecipeText(recipe, false);
      console.timeEnd('Algorithmic parsing time');
      
      console.log(`- Recipe name: ${algorithmicResult.name}`);
      console.log(`- Ingredients identified: ${algorithmicResult.ingredients.length}`);
      console.log(`- Instructions identified: ${algorithmicResult.instructions.length}`);
      console.log(`- Yield: ${algorithmicResult.yieldQuantity || 'Not detected'} ${algorithmicResult.yieldUnit || ''}`);
      console.log(`- Prep time: ${algorithmicResult.prepTimeMinutes ? algorithmicResult.prepTimeMinutes + ' minutes' : 'Not detected'}`);
      console.log(`- Cook time: ${algorithmicResult.cookTimeMinutes ? algorithmicResult.cookTimeMinutes + ' minutes' : 'Not detected'}`);
      console.log('✅ Algorithmic parsing completed successfully\n');
    } catch (error) {
      console.log(`❌ Algorithmic parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
    
    // Test AI parser if API key is available
    if (hasAIKey) {
      console.log('🤖 AI PARSER:');
      try {
        console.time('AI parsing time');
        const aiResult = await parseRecipeWithAI(recipe);
        console.timeEnd('AI parsing time');
        
        console.log(`- Recipe name: ${aiResult.name}`);
        console.log(`- Ingredients identified: ${aiResult.ingredients.length}`);
        console.log(`- Instructions identified: ${aiResult.instructions.length}`);
        console.log(`- Yield: ${aiResult.yieldQuantity || 'Not detected'} ${aiResult.yieldUnit || ''}`);
        console.log(`- Prep time: ${aiResult.prepTimeMinutes ? aiResult.prepTimeMinutes + ' minutes' : 'Not detected'}`);
        console.log(`- Cook time: ${aiResult.cookTimeMinutes ? aiResult.cookTimeMinutes + ' minutes' : 'Not detected'}`);
        console.log('✅ AI parsing completed successfully\n');
      } catch (error) {
        console.log(`❌ AI parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      }
    } else {
      console.log('🤖 AI PARSER: SKIPPED (No API key available)\n');
    }
    
    console.log('-'.repeat(50) + '\n');
  }
  
  // Test edge cases for ingredients
  console.log('🧪 TESTING INGREDIENT EDGE CASES\n');
  
  const ingredientTestCases = [
    "2 1/2 cups flour",
    "1 large onion, finely chopped",
    "Salt and pepper to taste",
    "3-4 apples, peeled and sliced",
    "1/4 cup olive oil",
    "2 tbsp butter, melted",
    "A pinch of nutmeg",
    "8 oz cream cheese, softened",
    "500g ground beef",
    "100ml whole milk",
  ];
  
  for (const ingredient of ingredientTestCases) {
    try {
      // For ingredient tests, we'll wrap each in a minimal recipe structure
      const minimalRecipe = `Test Recipe\n\nIngredients:\n${ingredient}\n\nInstructions:\n1. Test`;
      
      console.log(`Testing ingredient: "${ingredient}"`);
      
      // Test algorithmic parser for this ingredient
      const algorithmicResult = await parseRecipeText(minimalRecipe, false);
      
      if (algorithmicResult.ingredients.length > 0) {
        const parsed = algorithmicResult.ingredients[0];
        console.log(`- Algorithmic parser: quantity=${parsed.quantity}, unit=${parsed.unit}, name=${parsed.name}`);
      } else {
        console.log('- Algorithmic parser failed to extract ingredient');
      }
      
      // Test AI parser if available
      if (hasAIKey) {
        try {
          const aiResult = await parseRecipeWithAI(minimalRecipe);
          if (aiResult.ingredients.length > 0) {
            const parsed = aiResult.ingredients[0];
            console.log(`- AI parser: quantity=${parsed.quantity}, unit=${parsed.unit}, name=${parsed.name}`);
          } else {
            console.log('- AI parser failed to extract ingredient');
          }
        } catch (error) {
          console.log(`- AI parser error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      console.log('');
    } catch (error) {
      console.log(`Error testing ingredient "${ingredient}": ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }
  
  console.log('🏁 PARSER TESTING COMPLETE 🏁');
}

// Run the tests
runParserTests().catch(console.error); 