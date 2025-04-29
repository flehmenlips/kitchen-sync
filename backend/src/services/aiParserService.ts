import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

/**
 * Parse recipe text using Anthropic's Claude API
 * @param recipeText Raw recipe text input
 * @returns Structured recipe data
 */
export async function parseRecipeWithAI(recipeText: string): Promise<ParsedRecipe> {
  try {
    // Create a more detailed system prompt to guide Claude
    const systemPrompt = `You are a recipe parsing expert. Extract the following information from the recipe text:
- Recipe name
- Description 
- Ingredients (with quantity, unit, and ingredient name separated)
- Instructions (as numbered steps)
- Notes (if any)
- Yield information (how many servings)
- Prep time in minutes (if specified)
- Cook time in minutes (if specified)

For ingredients, be attentive to the various formats:
- When you see "2 carrots", parse quantity=2, unit="piece", name="carrots"
- When you see "100g whole garlic", parse quantity=100, unit="g", name="whole garlic"
- When you see "8 cloves", parse quantity=8, unit="piece", name="cloves"
- When you see "25g peppercorns", parse quantity=25, unit="g", name="peppercorns"
- For numeric quantities without explicit units, use "piece" as the unit
- For ingredients without specified quantities, set quantity to 1 and unit to "piece".
- For ingredient measurements that use mixed numbers (like 1 1/2), convert to decimal (1.5).`;

    const userPrompt = `Parse this recipe into a structured JSON format:

${recipeText}

Return ONLY the following JSON format with no other text or explanation:
{
  "name": "Recipe Name",
  "description": "Recipe description",
  "ingredients": [
    {
      "quantity": number,
      "unit": "unit of measurement (e.g., g, ml, cup, piece, etc.)",
      "name": "ingredient name",
      "notes": "any additional notes about the ingredient (optional)"
    }
  ],
  "instructions": ["Step 1 instruction", "Step 2 instruction"],
  "notes": "Any additional notes about the recipe (optional)",
  "yieldQuantity": number of servings (optional),
  "yieldUnit": "servings" (usually, optional),
  "prepTimeMinutes": prep time in minutes (optional),
  "cookTimeMinutes": cook time in minutes (optional)
}`;

    // Make the API call
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Use the current available model
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2 // Lower temperature for more deterministic outputs
    });

    // Extract and parse the JSON response
    // Find the JSON content in the response (Claude might wrap it in markdown)
    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    const jsonMatch = content.match(/```(?:json)?([\s\S]+?)```/) || [null, content];
    const jsonContent = jsonMatch[1].trim();
    
    // Parse the JSON
    const parsedRecipe = JSON.parse(jsonContent) as ParsedRecipe;
    
    // Validate the response has the required fields
    if (!parsedRecipe.name || !Array.isArray(parsedRecipe.ingredients)) {
      console.error("Invalid API response:", jsonContent);
      throw new Error("Invalid response format from AI parser");
    }
    
    return parsedRecipe;
  } catch (error) {
    console.error("Error parsing recipe with Claude AI:", error);
    throw new Error(`Failed to parse recipe with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default {
  parseRecipeWithAI
}; 