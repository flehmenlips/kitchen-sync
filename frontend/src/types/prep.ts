// Task related types
export interface PrepTask {
    id: string;
    title: string;
    description?: string;
    columnId: string;
    recipeId?: string;
    order: number;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

// Column related types
export interface PrepColumn {
    id: string;
    name: string;
    order: number;
    color: string;
    tasks: PrepTask[];
    createdAt: string;
    updatedAt: string;
    userId: string;
}

// Input types for creating/updating tasks
export interface CreatePrepTaskInput {
    title: string;
    description?: string;
    columnId: string;
    recipeId?: number;
}

export interface UpdatePrepTaskInput {
    title?: string;
    description?: string;
    columnId?: string;
    recipeId?: string;
    order?: number;
}

// Column management types
export interface CreatePrepColumnInput {
    name: string;
    order?: number;
    color?: string;
}

export interface UpdatePrepColumnInput {
    name?: string;
    order?: number;
    color?: string;
}

// Recipe selection types
export interface RecipeSelectionOption {
    id: number;
    name: string;
    description?: string | null;
}

// Dialog props types
export interface AddRecipeDialogProps {
    open: boolean;
    onClose: () => void;
    columnId?: string; // Optional - if provided, adds to specific column
}

export interface ColumnSelectionDialogProps {
    open: boolean;
    onClose: () => void;
    onSelect: (columnId: string) => void;
    columns: PrepColumn[];
    title?: string;
    description?: string;
} 