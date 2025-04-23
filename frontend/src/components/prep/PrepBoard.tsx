import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import { PrepTask } from './types';
import PrepCard from './PrepCard';
import RecipeDetailsDialog from './RecipeDetailsDialog';
import AddRecipeDialog from './AddRecipeDialog';

export const PrepBoard: React.FC = () => {
    const { columns, moveTask } = usePrepBoardStore();
    const [selectedTask, setSelectedTask] = useState<PrepTask | null>(null);
    const [recipeDialogOpen, setRecipeDialogOpen] = useState(false);
    const [addRecipeDialogOpen, setAddRecipeDialogOpen] = useState(false);

    // Debug: Log columns whenever they change
    useEffect(() => {
        console.log('PrepBoard columns updated:', columns);
        columns.forEach(col => {
            console.log(`${col.title} tasks:`, col.tasks);
        });
    }, [columns]);

    const handleDragEnd = (result: any) => {
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

    const handleViewRecipe = (task: PrepTask) => {
        setSelectedTask(task);
        setRecipeDialogOpen(true);
    };

    const getColumnColor = (columnId: string) => {
        switch (columnId) {
            case 'to-prep':
                return 'info.main';
            case 'prepping':
                return 'warning.main';
            case 'ready':
                return 'success.main';
            case 'complete':
                return 'text.secondary';
            default:
                return 'primary.main';
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                <IconButton
                    color="primary"
                    onClick={() => setAddRecipeDialogOpen(true)}
                    size="large"
                >
                    <AddIcon />
                </IconButton>
            </Box>
            
            <Box sx={{ display: 'flex', height: 'calc(100vh - 160px)', gap: 2, p: 2 }}>
                <DragDropContext onDragEnd={handleDragEnd}>
                    {columns.map((column) => (
                        <Box
                            key={column.id}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '300px',
                            }}
                        >
                            <Paper
                                sx={{
                                    p: 2,
                                    backgroundColor: 'background.paper',
                                    mb: 2,
                                    borderTop: 3,
                                    borderColor: getColumnColor(column.id)
                                }}
                                elevation={2}
                            >
                                <Typography variant="h6" sx={{ color: getColumnColor(column.id) }}>
                                    {column.title} ({column.tasks.length})
                                </Typography>
                            </Paper>

                            <Droppable droppableId={column.id}>
                                {(provided) => (
                                    <Paper
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        sx={{
                                            p: 1,
                                            flexGrow: 1,
                                            minHeight: '100px',
                                            backgroundColor: 'background.default',
                                            overflowY: 'auto'
                                        }}
                                    >
                                        {column.tasks.map((task, index) => (
                                            <Draggable
                                                key={task.id}
                                                draggableId={task.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <Box
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        sx={{ mb: 1 }}
                                                    >
                                                        <PrepCard
                                                            task={task}
                                                            onClick={() => setSelectedTask(task)}
                                                            onViewRecipe={() => handleViewRecipe(task)}
                                                        />
                                                    </Box>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Paper>
                                )}
                            </Droppable>
                        </Box>
                    ))}
                </DragDropContext>
            </Box>

            {selectedTask && (
                <RecipeDetailsDialog
                    open={recipeDialogOpen}
                    onClose={() => setRecipeDialogOpen(false)}
                    recipeId={selectedTask.recipeId}
                />
            )}

            <AddRecipeDialog
                open={addRecipeDialogOpen}
                onClose={() => setAddRecipeDialogOpen(false)}
            />
        </Box>
    );
}; 