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
                            p: 2,
                            gap: 2,
                            position: 'relative'
                        }}
                    >
                        {columns.length === 0 && (
                            <Paper elevation={3} sx={{ 
                                p: 3, 
                                maxWidth: 600, 
                                mx: 'auto', 
                                my: 4, 
                                textAlign: 'center',
                                background: 'rgba(255, 255, 255, 0.9)'
                            }}>
                                <Typography variant="h5" gutterBottom>
                                    Welcome to the Prep Board!
                                </Typography>
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    No columns found. Click the <strong>plus button</strong> in the lower right corner to add a new column or recipe to your prep board.
                                </Alert>
                                <Typography variant="body1">
                                    The prep board helps you organize your kitchen tasks and recipes into customizable columns. 
                                    Start by creating a column such as "To Prep," "In Progress," or "Completed."
                                </Typography>
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
                            sx={{ position: 'fixed', bottom: 24, right: 24 }}
                            icon={<SpeedDialIcon />}
                            onClose={() => setSpeedDialOpen(false)}
                            onOpen={() => setSpeedDialOpen(true)}
                            open={speedDialOpen}
                        >
                            <SpeedDialAction
                                icon={<ViewColumnIcon />}
                                tooltipTitle="Add Column"
                                onClick={openAddColumnDialog}
                            />
                            <SpeedDialAction
                                icon={<RestaurantIcon />}
                                tooltipTitle="Add Recipe"
                                onClick={openAddRecipeDialog}
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