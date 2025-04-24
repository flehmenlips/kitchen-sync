import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Box, Typography, CircularProgress, Alert, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import { PrepColumn } from './PrepColumn';
import AddRecipeDialog from './AddRecipeDialog';

export const PrepBoard: React.FC = () => {
    const { columns, moveTask, isLoading, error, fetchTasks } = usePrepBoardStore();
    const [addDialogOpen, setAddDialogOpen] = useState(false);

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
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: 2,
                        alignItems: 'start'
                    }}>
                        {columns.map(column => (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided) => (
                                    <PrepColumn
                                        column={column}
                                        provided={provided}
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
        </Box>
    );
}; 