export interface Recipe {
    id: number;
    name: string;
    description: string | null;
    ingredients: RecipeIngredient[];
    instructions: string[];
    notes: string | null;
    yieldQuantity: number | null;
    yieldUnit: string | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    sections?: RecipeSection[];
    photoUrl?: string | null;
} 