export type UnitType = 'WEIGHT' | 'VOLUME' | 'COUNT' | 'LENGTH' | 'TEMPERATURE';

export interface DisplayedIngredient {
    id: number;
    quantity: number;
    unit: {
        id: number;
        name: string;
        abbreviation: string;
        type?: UnitType;
    };
    ingredient?: {
        id: number;
        name: string;
    };
    note?: string;
}

export interface ScalingIngredient {
    id: number;
    name: string;
    quantity: number;
    unit: {
        id: number;
        name: string;
        type: UnitType;
    };
}

export interface ScaleOptions {
    type: 'multiply' | 'divide' | 'constraint';
    value: number;
    constraintIngredientId?: number;
    constraintQuantity?: number;
    constraintUnitId?: number;
}

export interface ParsedIngredient {
    name: string;
    quantity: string;
    unit: string;
    raw: string;
}

export interface ParsedRecipe {
    name: string;
    description: string;
    ingredients: ParsedIngredient[];
    instructions: string;
    yieldQuantity?: number;
    yieldUnit?: string;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
}

// Base types for recipe form data
export interface RecipeFormIngredient {
    type: 'ingredient' | 'sub-recipe' | '';
    ingredientId: string;
    subRecipeId: string;
    quantity: string;
    unitId: string;
}

export interface RecipeFormData {
    name: string;
    description: string;
    yieldQuantity: string;
    yieldUnitId: string;
    prepTimeMinutes: string;
    cookTimeMinutes: string;
    tags: string[];
    instructions: string;
    categoryId: string;
    ingredients: RecipeFormIngredient[];
}

// Types for recipe API data
export interface RecipeApiIngredient {
    type: 'ingredient' | 'sub-recipe';
    ingredientId?: number;
    subRecipeId?: number;
    quantity: number;
    unitId: number;
}

export interface RecipeApiData {
    name: string;
    description: string;
    yieldQuantity?: number;
    yieldUnitId?: number;
    prepTimeMinutes?: number;
    cookTimeMinutes?: number;
    tags: string[];
    instructions: string;
    categoryId?: number;
    ingredients: RecipeApiIngredient[];
}

// Types for API responses
export interface Unit {
    id: number;
    name: string;
    abbreviation: string;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Ingredient {
    id: number;
    name: string;
    description?: string;
}

export interface SubRecipe {
    id: number;
    name: string;
    description?: string;
}

export interface RecipeIngredient {
    id: number;
    quantity: number;
    unit: Unit;
    ingredient?: Ingredient;
    subRecipe?: SubRecipe;
}

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    ingredients: string[];
    instructions: string[];
    createdAt: string;
    updatedAt: string;
    userId: string;
} 