import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Box, Typography, CircularProgress, Alert, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import { PrepColumn } from './PrepColumn';
import AddRecipeDialog from './AddRecipeDialog';
import RecipeViewDialog from './RecipeViewDialog';

export const PrepBoard: React.FC = () => {
    const { columns, moveTask, removeTask, isLoading, error, fetchTasks } = usePrepBoardStore();
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [viewRecipeId, setViewRecipeId] = useState<number | null>(null);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleDragEnd = (result: any) => {
        if (!result.destination) return;

        const { draggableId, source, destination } = result;
        
        if (source.droppableId !== destination.droppableId || source.index !== destination.index) {
            moveTask(
                draggableId,
                source.droppableId,
                destination.droppableId,
                destination.index
            );
        }
    };

    const handleViewRecipe = (taskId: string) => {
        const task = columns.flatMap(col => col.tasks).find(t => t.id === taskId);
        if (task?.recipeId) {
            setViewRecipeId(task.recipeId);
        }
    };

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Prep Board</Typography>
                <IconButton color="primary" onClick={() => setAddDialogOpen(true)}>
                    <AddIcon />
                </IconButton>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 2,
                        alignItems: 'start',
                        minHeight: 'calc(100vh - 200px)',
                        '& > *': {
                            minWidth: 250,
                            height: '100%'
                        }
                    }}>
                        {columns.map(column => (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided) => (
                                    <PrepColumn
                                        column={column}
                                        provided={provided}
                                        onDelete={removeTask}
                                        onViewRecipe={handleViewRecipe}
                                    />
                                )}
                            </Droppable>
                        ))}
                    </Box>
                </DragDropContext>
            )}

            <AddRecipeDialog
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
            />

            <RecipeViewDialog
                open={viewRecipeId !== null}
                onClose={() => setViewRecipeId(null)}
                recipeId={viewRecipeId}
            />
        </Box>
    );
}; 