import { COLUMN_IDS } from '../../stores/prepBoardStore';

export type PrepTaskStatus = typeof COLUMN_IDS[keyof typeof COLUMN_IDS];

export interface PrepTask {
    id: string;
    title: string;
    description?: string | null;
    status: PrepTaskStatus;
    recipeId?: number | null;
    recipe?: {
        id: number;
        name: string;
        description: string;
    } | null;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface PrepColumn {
    id: PrepTaskStatus;
    title: string;
    tasks: PrepTask[];
}

export interface PrepBoard {
    columns: PrepColumn[];
} 