interface Ingredient {
    id: number;
    name: string;
    quantity: number;
    unit: {
        id: number;
        name: string;
        type: 'WEIGHT' | 'VOLUME' | 'COUNT' | 'LENGTH' | 'TEMPERATURE';
    };
}

interface ScaledIngredient extends Ingredient {
    note?: string;
}

interface ScaleOptions {
    type: 'multiply' | 'divide' | 'constraint';
    value: number;
    constraintIngredientId?: number;
    constraintQuantity?: number;
    constraintUnitId?: number;
}

// List of ingredients that should be rounded to whole numbers
const WHOLE_NUMBER_INGREDIENTS = [
    'egg',
    'eggs',
    'whole egg',
    'whole eggs',
    'banana',
    'bananas',
    'apple',
    'apples',
    'orange',
    'oranges',
];

// Common fractions to round to
const COMMON_FRACTIONS = [
    { decimal: 0.25, fraction: '1/4' },
    { decimal: 0.33, fraction: '1/3' },
    { decimal: 0.5, fraction: '1/2' },
    { decimal: 0.67, fraction: '2/3' },
    { decimal: 0.75, fraction: '3/4' },
];

const shouldRoundToWhole = (ingredient: Ingredient): boolean => {
    const nameLower = ingredient.name.toLowerCase();
    return WHOLE_NUMBER_INGREDIENTS.some(item => nameLower.includes(item)) ||
           ingredient.unit.type === 'COUNT';
};

const roundToNearestFraction = (value: number): number => {
    // For very small values, return as is
    if (value < 0.125) return value;

    // Split into whole and decimal parts
    const wholePart = Math.floor(value);
    const decimalPart = value - wholePart;

    // If decimal part is very small or very close to 1, round to whole
    if (decimalPart < 0.125) return wholePart;
    if (decimalPart > 0.875) return wholePart + 1;

    // Find the closest common fraction
    const closestFraction = COMMON_FRACTIONS.reduce((prev, curr) => {
        return Math.abs(curr.decimal - decimalPart) < Math.abs(prev.decimal - decimalPart) ? curr : prev;
    });

    return wholePart + closestFraction.decimal;
};

const roundIngredientQuantity = (ingredient: Ingredient, scaledQuantity: number): number => {
    if (shouldRoundToWhole(ingredient)) {
        // For whole number ingredients, round to nearest whole number
        // but provide a range if it's between numbers
        return Math.round(scaledQuantity);
    }

    // For other ingredients, round to nearest common fraction
    return roundToNearestFraction(scaledQuantity);
};

export const scaleRecipe = (
    ingredients: Ingredient[],
    options: ScaleOptions
): ScaledIngredient[] => {
    let scaleFactor = options.value;

    // For constraint-based scaling, calculate the scale factor
    if (options.type === 'constraint' && options.constraintIngredientId && options.constraintQuantity) {
        const baseIngredient = ingredients.find(i => i.id === options.constraintIngredientId);
        if (baseIngredient) {
            scaleFactor = options.constraintQuantity / baseIngredient.quantity;
        }
    }

    return ingredients.map(ingredient => {
        const scaledQuantity = ingredient.quantity * scaleFactor;
        const roundedQuantity = roundIngredientQuantity(ingredient, scaledQuantity);

        return {
            ...ingredient,
            quantity: roundedQuantity,
            // Add a note if the rounding was significant
            note: Math.abs(roundedQuantity - scaledQuantity) > 0.1 ? 
                `Rounded from ${scaledQuantity.toFixed(2)}` : undefined
        };
    });
}; 