import { create } from 'zustand';
import { PrepTask, PrepColumn } from '../components/prep/types';
import { prepTaskService } from '../services/prepTaskService';

// Define column IDs as constants to ensure consistency
export const COLUMN_IDS = {
    TO_PREP: 'TO_PREP',
    PREPPING: 'PREPPING',
    READY: 'READY',
    COMPLETE: 'COMPLETE'
} as const;

interface PrepBoardState {
    columns: PrepColumn[];
    isLoading: boolean;
    error: string | null;
    addTask: (task: Omit<PrepTask, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    moveTask: (taskId: string, sourceColId: string, destColId: string, destinationIndex: number) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<PrepTask>) => Promise<void>;
    removeTask: (taskId: string) => Promise<void>;
    fetchTasks: () => Promise<void>;
}

const initialColumns: PrepColumn[] = [
    {
        id: COLUMN_IDS.TO_PREP,
        title: 'To Prep',
        tasks: []
    },
    {
        id: COLUMN_IDS.PREPPING,
        title: 'Prepping',
        tasks: []
    },
    {
        id: COLUMN_IDS.READY,
        title: 'Ready',
        tasks: []
    },
    {
        id: COLUMN_IDS.COMPLETE,
        title: 'Complete',
        tasks: []
    }
];

export const usePrepBoardStore = create<PrepBoardState>()((set, get) => ({
    columns: initialColumns,
    isLoading: false,
    error: null,

    fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const tasks = await prepTaskService.getAllTasks();
            
            // Group tasks by status
            const columns = initialColumns.map(col => ({
                ...col,
                tasks: tasks.filter(task => task.status === col.id)
            }));

            set({ columns, isLoading: false });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            set({ error: 'Failed to fetch tasks', isLoading: false });
        }
    },

    addTask: async (task) => {
        set({ isLoading: true, error: null });
        try {
            const newTask = await prepTaskService.createTask(task);
            
            set(state => ({
                columns: state.columns.map(col =>
                    col.id === newTask.status
                        ? { ...col, tasks: [...col.tasks, newTask] }
                        : col
                ),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error adding task:', error);
            set({ error: 'Failed to add task', isLoading: false });
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
                    newTasks.splice(destinationIndex, 0, { ...task, status: destColId });
                    return { ...col, tasks: newTasks };
                }
                return col;
            })
        }));

        // Update in the backend
        try {
            await prepTaskService.updateTask(taskId, {
                status: destColId,
                order: destinationIndex
            });
        } catch (error) {
            console.error('Error moving task:', error);
            // Revert the change on error
            get().fetchTasks();
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
                    )
                })),
                isLoading: false
            }));
        } catch (error) {
            console.error('Error updating task:', error);
            set({ error: 'Failed to update task', isLoading: false });
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
        }
    }
})); 