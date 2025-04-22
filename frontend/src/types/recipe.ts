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