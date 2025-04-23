import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { PrepTask, PrepColumn } from '../components/prep/types';

// Define column IDs as constants to ensure consistency
export const COLUMN_IDS = {
    TO_PREP: 'to-prep',
    PREPPING: 'prepping',
    READY: 'ready',
    COMPLETE: 'complete'
} as const;

interface PrepBoardState {
    columns: PrepColumn[];
    addTask: (task: PrepTask) => void;
    moveTask: (taskId: string, sourceColId: string, destColId: string, destinationIndex: number) => void;
    updateTask: (taskId: string, updates: Partial<PrepTask>) => void;
    removeTask: (taskId: string) => void;
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

export const usePrepBoardStore = create<PrepBoardState>()(
    persist(
        (set, get) => ({
            columns: initialColumns,

            addTask: (task) => {
                console.log('Adding task to store:', task);
                const currentState = get();
                console.log('Current store state:', currentState);
                
                set((state) => {
                    // Ensure we're working with a fresh state
                    const columns = state.columns.length > 0 ? state.columns : initialColumns;
                    const toPrepColumn = columns.find(col => col.id === COLUMN_IDS.TO_PREP);
                    
                    if (!toPrepColumn) {
                        console.error('To Prep column not found! Current columns:', columns);
                        // If column structure is broken, reset to initial state with new task
                        return {
                            columns: initialColumns.map(col => 
                                col.id === COLUMN_IDS.TO_PREP
                                    ? { ...col, tasks: [task] }
                                    : col
                            )
                        };
                    }

                    const newState = {
                        columns: columns.map(col => 
                            col.id === COLUMN_IDS.TO_PREP
                                ? { ...col, tasks: [...col.tasks, task] }
                                : col
                        )
                    };
                    console.log('New store state:', newState);
                    return newState;
                });

                // Verify the update
                const newState = get();
                console.log('Store state after update:', newState);
                const toPrepColumn = newState.columns.find(col => col.id === COLUMN_IDS.TO_PREP);
                console.log('To Prep column tasks:', toPrepColumn?.tasks);
            },

            moveTask: (taskId, sourceColId, destColId, destinationIndex) => set((state) => {
                const sourceColumn = state.columns.find(col => col.id === sourceColId);
                const destColumn = state.columns.find(col => col.id === destColId);
                
                if (!sourceColumn || !destColumn) return state;

                const task = sourceColumn.tasks.find(t => t.id === taskId);
                if (!task) return state;

                // Remove from source
                const sourceColumnTasks = sourceColumn.tasks.filter(t => t.id !== taskId);
                
                // Add to destination
                const destColumnTasks = [...destColumn.tasks];
                destColumnTasks.splice(destinationIndex, 0, {
                    ...task,
                    status: destColId as PrepTask['status'],
                    updatedAt: new Date().toISOString()
                });

                return {
                    columns: state.columns.map(col => {
                        if (col.id === sourceColId) {
                            return { ...col, tasks: sourceColumnTasks };
                        }
                        if (col.id === destColId) {
                            return { ...col, tasks: destColumnTasks };
                        }
                        return col;
                    })
                };
            }),

            updateTask: (taskId, updates) => set((state) => ({
                columns: state.columns.map(col => ({
                    ...col,
                    tasks: col.tasks.map(task => 
                        task.id === taskId 
                            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                            : task
                    )
                }))
            })),

            removeTask: (taskId) => set((state) => ({
                columns: state.columns.map(col => ({
                    ...col,
                    tasks: col.tasks.filter(task => task.id !== taskId)
                }))
            })),
        }),
        {
            name: 'prep-board-storage',
            version: 1,
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                console.log('Store rehydrated with state:', state);
            }
        }
    )
); 