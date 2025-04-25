import { create } from 'zustand';
import { 
    PrepTask, 
    PrepColumn, 
    CreatePrepTaskInput, 
    UpdatePrepTaskInput,
    CreatePrepColumnInput,
    UpdatePrepColumnInput
} from '../types/prep';
import { prepTaskService } from '../services/prepTaskService';
import { prepColumnService } from '../services/prepColumnService';

interface ColumnWithTasks extends PrepColumn {
    tasks: PrepTask[];
}

interface PrepBoardState {
    columns: ColumnWithTasks[];
    isLoading: boolean;
    error: string | null;
    fetchColumns: () => Promise<void>;
    addTask: (task: CreatePrepTaskInput) => Promise<PrepTask>;
    moveTask: (taskId: string, sourceColId: string, destColId: string, destinationIndex: number) => Promise<void>;
    updateTask: (taskId: string, updates: UpdatePrepTaskInput) => Promise<PrepTask>;
    removeTask: (taskId: string) => Promise<void>;
    addColumn: (column: CreatePrepColumnInput) => Promise<PrepColumn>;
    updateColumn: (columnId: string, updates: UpdatePrepColumnInput) => Promise<PrepColumn>;
    deleteColumn: (columnId: string) => Promise<void>;
    reorderColumns: (columnIds: string[]) => Promise<void>;
}

export const usePrepBoardStore = create<PrepBoardState>()((set, get) => ({
    columns: [],
    isLoading: false,
    error: null,

    fetchColumns: async () => {
        set({ isLoading: true, error: null });
        try {
            const [columns, tasks] = await Promise.all([
                prepColumnService.getColumns(),
                prepTaskService.getTasks()
            ]);

            const columnsWithTasks = columns.map(column => ({
                ...column,
                tasks: tasks.filter(task => task.columnId === column.id)
            }));

            set({ columns: columnsWithTasks, isLoading: false });
        } catch (error) {
            console.error('Error fetching columns:', error);
            set({ error: 'Failed to fetch columns', isLoading: false });
        }
    },

    addTask: async (task) => {
        set({ isLoading: true, error: null });
        try {
            const newTask = await prepTaskService.createTask(task);
            
            set(state => ({
                columns: state.columns.map(col =>
                    col.id === task.columnId
                        ? { ...col, tasks: [...col.tasks, newTask] }
                        : col
                ),
                isLoading: false
            }));

            return newTask;
        } catch (error) {
            console.error('Error adding task:', error);
            set({ error: 'Failed to add task', isLoading: false });
            throw error;
        }
    },

    moveTask: async (taskId, sourceColId, destColId, destinationIndex) => {
        // Find the task
        const sourceColumn = get().columns.find(col => col.id === sourceColId);
        const task = sourceColumn?.tasks.find(t => t.id === taskId);
        
        if (!task) return;

        // Optimistically update the UI
        set(state => ({
            columns: state.columns.map(col => {
                if (col.id === sourceColId) {
                    return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
                }
                if (col.id === destColId) {
                    const newTasks = [...col.tasks];
                    newTasks.splice(destinationIndex, 0, { ...task, columnId: destColId });
                    return { ...col, tasks: newTasks };
                }
                return col;
            })
        }));

        // Update in the backend
        try {
            await prepTaskService.updateTask(taskId, {
                columnId: destColId,
                order: destinationIndex
            });
        } catch (error) {
            console.error('Error moving task:', error);
            // Revert the change on error
            get().fetchColumns();
            set({ error: 'Failed to move task' });
        }
    },

    updateTask: async (taskId, updates) => {
        set({ isLoading: true, error: null });
        try {
            const updatedTask = await prepTaskService.updateTask(taskId, updates);
            
            set(state => ({
                columns: state.columns.map(col => ({
                    ...col,
                    tasks: col.tasks.map(task =>
                        task.id === taskId ? updatedTask : task
                    ).filter(task => task.columnId === col.id)
                })),
                isLoading: false
            }));

            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            set({ error: 'Failed to update task', isLoading: false });
            throw error;
        }
    },

    removeTask: async (taskId) => {
        set({ isLoading: true, error: null });
        try {
            await prepTaskService.deleteTask(taskId);
            
            set(state => ({
                columns: state.columns.map(col => ({
                    ...col,
                    tasks: col.tasks.filter(task => task.id !== taskId)
                })),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error removing task:', error);
            set({ error: 'Failed to remove task', isLoading: false });
            throw error;
        }
    },

    addColumn: async (column) => {
        set({ isLoading: true, error: null });
        try {
            const newColumn = await prepColumnService.createColumn(column);
            
            // Add the new column to the state with an empty tasks array
            set(state => ({
                columns: [...state.columns, { ...newColumn, tasks: [] }],
                isLoading: false
            }));

            return newColumn;
        } catch (error) {
            console.error('Error adding column:', error);
            set({ error: 'Failed to add column', isLoading: false });
            throw error;
        }
    },

    updateColumn: async (columnId, updates) => {
        set({ isLoading: true, error: null });
        try {
            const updatedColumn = await prepColumnService.updateColumn(columnId, updates);
            
            // Update the column in state
            set(state => ({
                columns: state.columns.map(col => 
                    col.id === columnId 
                        ? { ...col, ...updatedColumn } 
                        : col
                ),
                isLoading: false
            }));

            return updatedColumn;
        } catch (error) {
            console.error('Error updating column:', error);
            set({ error: 'Failed to update column', isLoading: false });
            throw error;
        }
    },

    deleteColumn: async (columnId) => {
        set({ isLoading: true, error: null });
        try {
            await prepColumnService.deleteColumn(columnId);
            
            // Remove the column from state
            set(state => ({
                columns: state.columns.filter(col => col.id !== columnId),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error deleting column:', error);
            set({ error: 'Failed to delete column', isLoading: false });
            throw error;
        }
    },

    reorderColumns: async (columnIds) => {
        set({ isLoading: true, error: null });
        try {
            const updatedColumns = await prepColumnService.reorderColumns(columnIds);
            
            // Update the columns in state with the new order
            set(state => {
                // Create a mapping of column id to tasks
                const tasksMap = state.columns.reduce((acc, col) => {
                    acc[col.id] = col.tasks;
                    return acc;
                }, {} as Record<string, PrepTask[]>);
                
                // Map the updated columns with their tasks
                const columnsWithTasks = updatedColumns.map(col => ({
                    ...col,
                    tasks: tasksMap[col.id] || []
                }));
                
                return {
                    columns: columnsWithTasks,
                    isLoading: false
                };
            });
        } catch (error) {
            console.error('Error reordering columns:', error);
            set({ error: 'Failed to reorder columns', isLoading: false });
            throw error;
        }
    }
})); 