import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    IconButton,
    Stack,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { PrepColumn } from '../../types/prep';
import { getPrepColumns, reorderPrepColumns } from '../../services/prepColumnService';
import { ManageColumnsDialog } from './ManageColumnsDialog';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';

export const PrepBoard: React.FC = () => {
    const { enqueueSnackbar } = useSnackbar();
    const { user } = useAuth();
    const [columns, setColumns] = useState<PrepColumn[]>([]);
    const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchColumns = async () => {
        if (!user) {
            setError('Please log in to view your prep board');
            setLoading(false);
            return;
        }

        try {
            const fetchedColumns = await getPrepColumns();
            console.log('Fetched columns:', fetchedColumns);
            
            if (!Array.isArray(fetchedColumns)) {
                throw new Error('Invalid response format from server');
            }
            
            setColumns(fetchedColumns);
            setError(null);
        } catch (error: any) {
            console.error('Error details:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error fetching prep columns';
            setError(errorMessage);
            enqueueSnackbar(errorMessage, { variant: 'error' });
            setColumns([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColumns();
    }, [user]);

    const handleAddTask = (columnId: string) => {
        // TODO: Implement add task functionality
        console.log('Add task to column:', columnId);
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source } = result;

        // Dropped outside the list
        if (!destination) {
            return;
        }

        // Dropped in the same position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newColumns = Array.from(columns);
        const [removed] = newColumns.splice(source.index, 1);
        newColumns.splice(destination.index, 0, removed);

        // Update the order property for each column
        const reorderedColumns = newColumns.map((col, index) => ({
            ...col,
            order: index,
        }));

        // Optimistically update the UI
        setColumns(reorderedColumns);

        try {
            // Send the new order to the backend
            await reorderPrepColumns(reorderedColumns.map(col => col.id));
        } catch (error: any) {
            // If the update fails, revert to the original order
            setColumns(columns);
            enqueueSnackbar('Failed to update column order', { variant: 'error' });
        }
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error" gutterBottom>
                    {error}
                </Typography>
                <Button
                    variant="contained"
                    onClick={fetchColumns}
                    sx={{ mt: 2 }}
                >
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h1">
                    Prep Board
                </Typography>
                <Tooltip title="Manage Columns">
                    <IconButton
                        onClick={() => setIsManageColumnsOpen(true)}
                        size="large"
                    >
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Columns */}
            {columns.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        No columns yet
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<SettingsIcon />}
                        onClick={() => setIsManageColumnsOpen(true)}
                    >
                        Set Up Columns
                    </Button>
                </Box>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="prep-columns" direction="horizontal">
                        {(provided) => (
                            <Box
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)',
                                        lg: 'repeat(4, 1fr)'
                                    },
                                    gap: 2,
                                }}
                            >
                                {columns.map((column, index) => (
                                    <Draggable
                                        key={column.id}
                                        draggableId={column.id}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <Paper
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                sx={{
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    borderTop: `4px solid ${column.color}`,
                                                    transform: snapshot.isDragging ? 'rotate(3deg)' : 'none',
                                                    zIndex: snapshot.isDragging ? 1 : 'auto',
                                                }}
                                            >
                                                {/* Column Header */}
                                                <Box sx={{
                                                    p: 2,
                                                    borderBottom: 1,
                                                    borderColor: 'divider',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Typography variant="h6" component="h2">
                                                        {column.name}
                                                    </Typography>
                                                    <Tooltip title="Add Task">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleAddTask(column.id)}
                                                        >
                                                            <AddIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>

                                                {/* Tasks */}
                                                <Box sx={{ p: 2, flexGrow: 1 }}>
                                                    {column.tasks.length === 0 ? (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            textAlign="center"
                                                        >
                                                            No tasks yet
                                                        </Typography>
                                                    ) : (
                                                        <Stack spacing={1}>
                                                            {column.tasks.map((task) => (
                                                                <Paper
                                                                    key={task.id}
                                                                    sx={{
                                                                        p: 1.5,
                                                                        bgcolor: 'background.default',
                                                                        '&:hover': {
                                                                            bgcolor: 'action.hover',
                                                                            cursor: 'pointer'
                                                                        }
                                                                    }}
                                                                >
                                                                    <Typography variant="body2">
                                                                        {task.name}
                                                                    </Typography>
                                                                    {task.description && (
                                                                        <Typography
                                                                            variant="caption"
                                                                            color="text.secondary"
                                                                            display="block"
                                                                            sx={{ mt: 0.5 }}
                                                                        >
                                                                            {task.description}
                                                                        </Typography>
                                                                    )}
                                                                </Paper>
                                                            ))}
                                                        </Stack>
                                                    )}
                                                </Box>
                                            </Paper>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </Box>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {/* Manage Columns Dialog */}
            <ManageColumnsDialog
                open={isManageColumnsOpen}
                onClose={() => setIsManageColumnsOpen(false)}
                columns={columns}
                onColumnsChange={fetchColumns}
            />
        </Box>
    );
}; 