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
        // Find the task and source/destination columns
        const sourceColumn = get().columns.find(col => col.id === sourceColId);
        const destColumn = get().columns.find(col => col.id === destColId);
        const task = sourceColumn?.tasks.find(t => t.id === taskId);
        
        console.log('Move Task Debug:', {
            taskId,
            sourceColId,
            destColId,
            destinationIndex,
            sourceColumnExists: !!sourceColumn,
            destColumnExists: !!destColumn,
            taskExists: !!task,
            sameColumn: sourceColId === destColId,
            sourceTaskCount: sourceColumn?.tasks.length,
            destTaskCount: destColumn?.tasks.length
        });
        
        if (!task || !sourceColumn || !destColumn) return;

        // Find the source index of the task
        const sourceIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
        console.log('Source task index:', sourceIndex);

        // Optimistically update the UI
        set(state => ({
            columns: state.columns.map(col => {
                if (col.id === sourceColId && sourceColId !== destColId) {
                    // Remove task from source column (only if moving between columns)
                    return { ...col, tasks: col.tasks.filter(t => t.id !== taskId) };
                }
                if (col.id === destColId) {
                    // Handle adding to destination column
                    if (sourceColId === destColId) {
                        // Same column reordering - remove and insert at new position
                        const updatedTasks = [...col.tasks];
                        const [movedTask] = updatedTasks.splice(sourceIndex, 1);
                        updatedTasks.splice(destinationIndex, 0, { ...movedTask, columnId: destColId });
                        return { ...col, tasks: updatedTasks };
                    } else {
                        // Different column - just insert at destination
                        const newTasks = [...col.tasks];
                        newTasks.splice(destinationIndex, 0, { ...task, columnId: destColId });
                        return { ...col, tasks: newTasks };
                    }
                }
                return col;
            })
        }));

        // Update in the backend
        try {
            // Calculate tasks that need to be reordered
            const tasksToUpdate = [];
            
            // Add the moved task with its new position
            tasksToUpdate.push({
                id: taskId,
                columnId: destColId,
                order: destinationIndex
            });
            
            // Reorder tasks in the destination column after the insertion point
            const updatedDestTasks = get().columns
                .find(col => col.id === destColId)?.tasks || [];
            
            console.log('updatedDestTasks after UI update:', updatedDestTasks.map(t => ({ id: t.id, title: t.title, order: t.order })));
            
            // Different logic for same column vs different column moves
            if (sourceColId === destColId) {
                // For same column moves, we need to reorder all tasks to ensure consistency
                updatedDestTasks.forEach((t, index) => {
                    if (t.id !== taskId) {
                        tasksToUpdate.push({
                            id: t.id,
                            columnId: destColId,
                            order: index
                        });
                    }
                });
            } else {
                // For different column moves, just update tasks after the insertion point
                updatedDestTasks.forEach((t, index) => {
                    if (t.id !== taskId && index >= destinationIndex) {
                        tasksToUpdate.push({
                            id: t.id,
                            columnId: destColId,
                            order: index + 1 // Shift all subsequent tasks down by 1
                        });
                    }
                });
            }
            
            console.log('tasksToUpdate:', tasksToUpdate);
            
            // Use the reorderTasks API for batch updates
            if (tasksToUpdate.length > 0) {
                console.log('Sending reorderTasks API call with:', tasksToUpdate);
                const updatedTasks = await prepTaskService.reorderTasks(tasksToUpdate);
                console.log('API response:', updatedTasks);
                
                // If it's a same-column move, refresh the tasks to ensure consistency
                if (sourceColId === destColId) {
                    await get().fetchColumns();
                }
            }
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
        console.log('updateColumn called with:', { columnId, updates });
        set({ isLoading: true, error: null });
        try {
            console.log('Calling prepColumnService.updateColumn...');
            const updatedColumn = await prepColumnService.updateColumn(columnId, updates);
            console.log('prepColumnService.updateColumn response:', updatedColumn);
            
            // Update the column in state
            set(state => {
                console.log('Updating state with new column data:', updatedColumn);
                const updatedColumns = state.columns.map(col => 
                    col.id === columnId 
                        ? { ...col, ...updatedColumn } 
                        : col
                );
                console.log('New columns state:', updatedColumns);
                return {
                    columns: updatedColumns,
                    isLoading: false
                };
            });

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