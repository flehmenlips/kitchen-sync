import React, { useEffect, useState } from 'react';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography, Paper, Alert } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import PrepColumn from './PrepColumn';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import AddRecipeDialog from './AddRecipeDialog';
import ColumnFormDialog from './ColumnFormDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import TaskDetailsDrawer from './TaskDetailsDrawer';
import { PrepColumn as PrepColumnType, PrepTask } from '../../types/prep';
import { useSnackbar } from '../../context/SnackbarContext';

export const PrepBoard: React.FC = () => {
    const { columns, fetchColumns, moveTask, addColumn, updateColumn, deleteColumn, reorderColumns } = usePrepBoardStore();
    const [isAddRecipeDialogOpen, setIsAddRecipeDialogOpen] = useState(false);
    const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentColumn, setCurrentColumn] = useState<PrepColumnType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [speedDialOpen, setSpeedDialOpen] = useState(false);
    const { showSnackbar } = useSnackbar();
    
    // Task Details Drawer state
    const [selectedTask, setSelectedTask] = useState<PrepTask | null>(null);
    const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
    const [selectedColumnName, setSelectedColumnName] = useState('');
    const [selectedColumnColor, setSelectedColumnColor] = useState('#1976d2');

    useEffect(() => {
        fetchColumns();
    }, [fetchColumns]);

    // Function to open the task details drawer
    const handleViewTaskDetails = (taskId: string, columnId: string) => {
        // Find the column and task
        const column = columns.find(col => col.id === columnId);
        if (!column) return;
        
        const task = column.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        setSelectedTask(task);
        setSelectedColumnName(column.name);
        setSelectedColumnColor(column.color || '#1976d2');
        setIsTaskDrawerOpen(true);
    };

    // Function to close the task details drawer
    const handleCloseTaskDetails = () => {
        setIsTaskDrawerOpen(false);
        // Optionally refetch data when drawer closes to ensure UI is up to date
        fetchColumns();
    };

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId, type } = result;
        
        console.log('DragEnd Debug:', { 
            destination,
            source,
            draggableId,
            type,
            isColumnDrag: type === 'column'
        });

        // Drop was cancelled or dropped outside a valid droppable
        if (!destination) {
            console.log('No destination, drag cancelled');
            return;
        }

        // Dropped in the same position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            console.log('Dropped in same position, no action needed');
            return;
        }

        // Handle column reordering
        if (type === 'column') {
            const newColumnOrder = Array.from(columns.map(col => col.id));
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);
            
            console.log('Reordering columns:', {
                oldOrder: columns.map(col => col.id),
                newOrder: newColumnOrder
            });
            
            // Optimistically update UI and persist to backend
            handleReorderColumns(newColumnOrder);
            return;
        }

        // Handle task reordering - either within the same column or between columns
        console.log('Moving task:', {
            taskId: draggableId,
            sourceColumn: source.droppableId,
            destColumn: destination.droppableId,
            isSameColumn: source.droppableId === destination.droppableId,
            sourceIndex: source.index,
            destIndex: destination.index
        });
        
        moveTask(
            draggableId,
            source.droppableId,
            destination.droppableId,
            destination.index
        );
    };

    const handleReorderColumns = async (columnIds: string[]) => {
        try {
            await reorderColumns(columnIds);
        } catch (error) {
            console.error('Error reordering columns:', error);
            showSnackbar('Failed to reorder columns', 'error');
        }
    };

    // Recipe Dialog Handlers
    const openAddRecipeDialog = () => {
        setIsAddRecipeDialogOpen(true);
        setSpeedDialOpen(false);
    };

    const closeAddRecipeDialog = () => {
        setIsAddRecipeDialogOpen(false);
    };

    // Column Dialog Handlers
    const openAddColumnDialog = () => {
        setCurrentColumn(null);
        setIsColumnDialogOpen(true);
        setSpeedDialOpen(false);
    };

    const openEditColumnDialog = (column: PrepColumnType) => {
        setCurrentColumn(column);
        setIsColumnDialogOpen(true);
    };

    const closeColumnDialog = () => {
        setIsColumnDialogOpen(false);
        setCurrentColumn(null);
    };

    // Delete Dialog Handlers
    const openDeleteColumnDialog = (column: PrepColumnType) => {
        setCurrentColumn(column);
        setIsDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setCurrentColumn(null);
    };

    // Column CRUD Handlers
    const handleSaveColumn = async (columnData: any) => {
        setIsLoading(true);
        try {
            if (currentColumn) {
                // Update existing column
                await updateColumn(currentColumn.id, columnData);
                showSnackbar('Column updated successfully', 'success');
            } else {
                // Create new column
                await addColumn(columnData);
                showSnackbar('Column created successfully', 'success');
            }
            closeColumnDialog();
        } catch (error) {
            console.error('Error saving column:', error);
            showSnackbar('Failed to save column', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteColumn = async () => {
        if (!currentColumn) return;
        
        setIsLoading(true);
        try {
            await deleteColumn(currentColumn.id);
            showSnackbar('Column deleted successfully', 'success');
            closeDeleteDialog();
        } catch (error) {
            console.error('Error deleting column:', error);
            showSnackbar('Failed to delete column', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board" direction="horizontal" type="column">
                {(provided) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                            display: 'flex',
                            overflowX: 'auto',
                            minHeight: 'calc(100vh - 64px)', // Adjust based on your app's header height
                            p: 3,
                            gap: 3,
                            position: 'relative',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', // Subtle Remise-inspired gradient
                            '&::-webkit-scrollbar': {
                                height: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            }
                        }}
                    >
                        {columns.length === 0 && (
                            <Paper elevation={0} sx={{ 
                                p: 4, 
                                maxWidth: 600, 
                                mx: 'auto', 
                                my: 4, 
                                textAlign: 'center',
                                background: 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                                    borderRadius: '20px'
                                }
                            }}>
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <Typography variant="h4" gutterBottom sx={{ 
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        mb: 2
                                    }}>
                                        🍳 Welcome to AgileChef!
                                    </Typography>
                                    <Alert severity="info" sx={{ 
                                        mb: 3,
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '12px',
                                        '& .MuiAlert-icon': {
                                            color: '#3b82f6'
                                        }
                                    }}>
                                        No columns found. Click the <strong>plus button</strong> in the lower right corner to add a new column or recipe to your prep board.
                                    </Alert>
                                    <Typography variant="body1" sx={{ color: '#6b7280', lineHeight: 1.6 }}>
                                        The prep board helps you organize your kitchen tasks and recipes into customizable columns. 
                                        Start by creating a column such as "To Prep," "In Progress," or "Completed."
                                    </Typography>
                                </Box>
                            </Paper>
                        )}
                        
                        {columns.map((column, index) => (
                            <Draggable key={column.id} draggableId={column.id} index={index}>
                                {(provided, snapshot) => (
                                    <Box
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        sx={{
                                            // Apply elevated styles when dragging
                                            zIndex: snapshot.isDragging ? 10 : 'auto',
                                            boxShadow: snapshot.isDragging ? '0px 5px 10px rgba(0, 0, 0, 0.2)' : 'none',
                                        }}
                                    >
                                        <PrepColumn
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
                                            onEditColumn={openEditColumnDialog}
                                            onDeleteColumn={openDeleteColumnDialog}
                                            onViewTaskDetails={(taskId) => handleViewTaskDetails(taskId, column.id)}
                                        />
                                    </Box>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Add floating action buttons */}
                        <SpeedDial
                            ariaLabel="Prep board speed dial"
                            sx={{ 
                                position: 'fixed', 
                                bottom: 32, 
                                right: 32,
                                '& .MuiFab-primary': {
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                        boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                                    }
                                },
                                '& .MuiFab-root': {
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        background: 'rgba(255, 255, 255, 1)',
                                        transform: 'scale(1.05)',
                                    }
                                }
                            }}
                            icon={<SpeedDialIcon />}
                            onClose={() => setSpeedDialOpen(false)}
                            onOpen={() => setSpeedDialOpen(true)}
                            open={speedDialOpen}
                        >
                            <SpeedDialAction
                                icon={<ViewColumnIcon />}
                                tooltipTitle="Add Column"
                                onClick={openAddColumnDialog}
                                sx={{
                                    '& .MuiFab-root': {
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #059669, #047857)',
                                        }
                                    }
                                }}
                            />
                            <SpeedDialAction
                                icon={<RestaurantIcon />}
                                tooltipTitle="Add Recipe"
                                onClick={openAddRecipeDialog}
                                sx={{
                                    '& .MuiFab-root': {
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #d97706, #b45309)',
                                        }
                                    }
                                }}
                            />
                        </SpeedDial>
                        
                        {/* Dialogs */}
                        <AddRecipeDialog 
                            open={isAddRecipeDialogOpen} 
                            onClose={closeAddRecipeDialog}
                        />
                        
                        <ColumnFormDialog
                            open={isColumnDialogOpen}
                            onClose={closeColumnDialog}
                            column={currentColumn || undefined}
                            onSave={handleSaveColumn}
                            isLoading={isLoading}
                        />
                        
                        <DeleteConfirmationDialog
                            open={isDeleteDialogOpen}
                            onClose={closeDeleteDialog}
                            onConfirm={handleDeleteColumn}
                            title="Delete Column"
                            content={`Are you sure you want to delete the column "${currentColumn?.name}"? This will also delete all tasks in this column.`}
                            isLoading={isLoading}
                        />

                        {/* Task Details Drawer */}
                        <TaskDetailsDrawer
                            open={isTaskDrawerOpen}
                            onClose={handleCloseTaskDetails}
                            task={selectedTask}
                            columnName={selectedColumnName}
                            columnColor={selectedColumnColor}
                        />
                    </Box>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default PrepBoard; 