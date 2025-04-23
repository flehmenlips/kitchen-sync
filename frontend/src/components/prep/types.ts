export interface PrepTask {
    id: string;
    recipeId: number;
    recipeName: string;
    description: string;
    status: 'to-prep' | 'prepping' | 'ready' | 'complete';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    assignedTo?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PrepColumn {
    id: string;
    title: string;
    tasks: PrepTask[];
}

export interface PrepBoard {
    columns: PrepColumn[];
} 