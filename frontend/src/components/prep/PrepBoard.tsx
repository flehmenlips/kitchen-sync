import React, { useEffect, useState } from 'react';
import { Box, SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import PrepColumn from './PrepColumn';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import AddRecipeDialog from './AddRecipeDialog';
import ColumnFormDialog from './ColumnFormDialog';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import { PrepColumn as PrepColumnType } from '../../types/prep';
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

    useEffect(() => {
        fetchColumns();
    }, [fetchColumns]);

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Handle column reordering
        if (type === 'column') {
            const newColumnOrder = Array.from(columns.map(col => col.id));
            newColumnOrder.splice(source.index, 1);
            newColumnOrder.splice(destination.index, 0, draggableId);
            
            // Optimistically update UI and persist to backend
            handleReorderColumns(newColumnOrder);
            return;
        }

        // Handle task reordering
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
                    </Box>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default PrepBoard; 