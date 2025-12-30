import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Anthropic client (primary provider for now)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ParsedIngredient {
  quantity: number;
  unit: string;
  name: string;
  notes?: string;
}

export interface ParsedRecipe {
  name: string;
  description: string;
  ingredients: ParsedIngredient[];
  instructions: string[];
  notes?: string;
  yieldQuantity?: number;
  yieldUnit?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
}

const DEFAULT_UNIT = 'piece';

const normalizeIngredient = (ingredient: ParsedIngredient) => {
  return {
    quantity: ingredient.quantity,
    unit: ingredient.unit.trim() || DEFAULT_UNIT,
    name: ingredient.name.trim(),
    notes: ingredient.notes?.trim()
  };
};

const buildPrompt = (recipeText: string) => {
  const system = `You are a precise recipe parsing expert. Extract structured data and return ONLY valid JSON (no Markdown fences, no prose). Normalize:
- Convert mixed numbers (e.g., "1 1/2") to decimals (1.5).
- Default missing quantity to 1 and unit to "piece".
- Use common cooking units (g, ml, cup, tbsp, tsp, oz, lb, piece).
- Split instructions into clear step strings.
- Extract yield (quantity + unit) when present; leave null/omitted if absent.
- Extract prep and cook times in minutes when present.`;

  const user = `Parse this recipe into JSON exactly matching this shape:
{
  "name": "string",
  "description": "string",
  "ingredients": [
    {
      "quantity": number,
      "unit": "string",
      "name": "string",
      "notes": "string (optional)"
    }
  ],
  "instructions": ["string"],
  "notes": "string (optional)",
  "yieldQuantity": number (optional),
  "yieldUnit": "string (optional)",
  "prepTimeMinutes": number (optional),
  "cookTimeMinutes": number (optional)
}

Recipe text:
${recipeText}

Return JSON only.`;

  return { system, user };
};

const extractJson = (text: string): string => {
  // If the model returns fenced JSON, strip fences; otherwise return raw
  const fenced = text.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return text.trim();
};

/**
 * Parse recipe text using AI (Anthropic Claude). Validates output and normalizes defaults.
 */
export async function parseRecipeWithAI(recipeText: string): Promise<ParsedRecipe> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('AI parsing unavailable: ANTHROPIC_API_KEY is not configured.');
  }

  const { system, user } = buildPrompt(recipeText);

  try {
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system,
      messages: [{ role: 'user', content: user }],
      temperature: 0.1
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const jsonContent = extractJson(content);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonContent);
    } catch (err) {
      console.error('AI parse JSON error:', err, 'Raw content:', jsonContent);
      throw new Error('AI response was not valid JSON.');
    }

    const validated = validateParsedRecipe(parsed);
    const normalized: ParsedRecipe = {
      ...validated,
      ingredients: validated.ingredients.map(normalizeIngredient),
      description: validated.description || ''
    };

    return normalized;
  } catch (error) {
    console.error('Error parsing recipe with AI:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error from AI parser';
    throw new Error(`Failed to parse recipe with AI: ${message}`);
  }
}

const isFiniteNumber = (val: unknown): val is number =>
  typeof val === 'number' && Number.isFinite(val);

const validateParsedRecipe = (data: any): ParsedRecipe => {
  if (!data || typeof data !== 'object') {
    throw new Error('AI response is empty or not an object.');
  }

  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    throw new Error('AI response missing recipe name.');
  }

  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    throw new Error('AI response missing ingredients.');
  }

  if (!Array.isArray(data.instructions) || data.instructions.length === 0) {
    throw new Error('AI response missing instructions.');
  }

  const ingredients: ParsedIngredient[] = data.ingredients.map((ing: any, idx: number) => {
    if (!ing || typeof ing !== 'object' || typeof ing.name !== 'string' || !ing.name.trim()) {
      throw new Error(`AI ingredient #${idx + 1} is invalid or missing name.`);
    }
    const quantity = isFiniteNumber(ing.quantity) ? ing.quantity : 1;
    return {
      name: ing.name,
      quantity,
      unit: typeof ing.unit === 'string' && ing.unit.trim() ? ing.unit : DEFAULT_UNIT,
      notes: typeof ing.notes === 'string' ? ing.notes : undefined
    };
  });

  const instructions: string[] = data.instructions.map((step: any, idx: number) => {
    if (typeof step !== 'string' || !step.trim()) {
      throw new Error(`AI instruction #${idx + 1} is invalid.`);
    }
    return step.trim();
  });

  const recipe: ParsedRecipe = {
    name: data.name,
    description: typeof data.description === 'string' ? data.description : '',
    ingredients,
    instructions,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    yieldQuantity: isFiniteNumber(data.yieldQuantity) ? data.yieldQuantity : undefined,
    yieldUnit: typeof data.yieldUnit === 'string' ? data.yieldUnit : undefined,
    prepTimeMinutes: isFiniteNumber(data.prepTimeMinutes) ? data.prepTimeMinutes : undefined,
    cookTimeMinutes: isFiniteNumber(data.cookTimeMinutes) ? data.cookTimeMinutes : undefined
  };

  return recipe;
};

export default {
  parseRecipeWithAI
};