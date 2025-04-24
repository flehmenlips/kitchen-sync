export interface PrepTask {
    id: string;
    name: string;
    description?: string;
    order: number;
    completed: boolean;
    dueDate?: Date;
    columnId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrepColumn {
    id: string;
    name: string;
    color: string;
    order: number;
    userId: string;
    tasks: PrepTask[];
    createdAt: Date;
    updatedAt: Date;
} 