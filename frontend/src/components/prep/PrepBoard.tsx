import React, { useEffect, useState } from 'react';
import { Box, Fab, Tooltip } from '@mui/material';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import PrepColumn from './PrepColumn';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import AddIcon from '@mui/icons-material/Add';
import AddRecipeDialog from './AddRecipeDialog';

export const PrepBoard: React.FC = () => {
    const { columns, fetchColumns, moveTask } = usePrepBoardStore();
    const [isAddRecipeDialogOpen, setIsAddRecipeDialogOpen] = useState(false);

    useEffect(() => {
        fetchColumns();
    }, [fetchColumns]);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        moveTask(
            draggableId,
            source.droppableId,
            destination.droppableId,
            destination.index
        );
    };

    const openAddRecipeDialog = () => {
        setIsAddRecipeDialogOpen(true);
    };

    const closeAddRecipeDialog = () => {
        setIsAddRecipeDialogOpen(false);
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Box
                sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    minHeight: 'calc(100vh - 64px)', // Adjust based on your app's header height
                    p: 2,
                    gap: 2,
                    position: 'relative'
                }}
            >
                {columns.map((column) => (
                    <PrepColumn
                        key={column.id}
                        column={column}
                        tasks={column.tasks}
                        onDeleteTask={(taskId) => usePrepBoardStore.getState().removeTask(taskId)}
                        onViewRecipe={(taskId) => {
                            const task = column.tasks.find(t => t.id === taskId);
                            if (task?.recipeId) {
                                // Navigate to recipe view
                                window.location.href = `/recipes/${task.recipeId}`;
                            }
                        }}
                    />
                ))}
                
                {/* Add Recipe Button */}
                <Tooltip title="Add Recipe to Prep Board">
                    <Fab 
                        color="primary" 
                        aria-label="add recipe"
                        onClick={openAddRecipeDialog}
                        sx={{
                            position: 'fixed',
                            bottom: 24,
                            right: 24,
                        }}
                    >
                        <AddIcon />
                    </Fab>
                </Tooltip>
                
                {/* Add Recipe Dialog */}
                <AddRecipeDialog 
                    open={isAddRecipeDialogOpen} 
                    onClose={closeAddRecipeDialog}
                />
            </Box>
        </DragDropContext>
    );
};

export default PrepBoard; 