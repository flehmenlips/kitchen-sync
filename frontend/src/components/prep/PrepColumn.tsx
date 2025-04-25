import React, { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import {
    Paper,
    Typography,
    Box,
    IconButton,
    TextField,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { PrepColumn as PrepColumnType, PrepTask } from '../../types/prep';
import PrepCard from './PrepCard';
import { usePrepBoardStore } from '../../stores/prepBoardStore';

interface PrepColumnProps {
    column: PrepColumnType;
    tasks: PrepTask[];
    onDeleteTask: (taskId: string) => void;
    onViewRecipe: (taskId: string) => void;
    onEditColumn: (column: PrepColumnType) => void;
    onDeleteColumn: (column: PrepColumnType) => void;
}

const PrepColumn: React.FC<PrepColumnProps> = ({
    column,
    tasks,
    onDeleteTask,
    onViewRecipe,
    onEditColumn,
    onDeleteColumn,
}) => {
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const addTask = usePrepBoardStore(state => state.addTask);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleEditColumn = () => {
        handleMenuClose();
        onEditColumn(column);
    };

    const handleDeleteColumn = () => {
        handleMenuClose();
        onDeleteColumn(column);
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;

        try {
            await addTask({
                title: newTaskTitle.trim(),
                columnId: column.id,
            });
            setNewTaskTitle('');
            setIsAddingTask(false);
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    return (
        <Paper
            sx={{
                width: 300,
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2,
                transition: 'background-color 0.2s ease, transform 0.1s ease',
                '&:hover': {
                    backgroundColor: '#f9f9f9',
                },
                borderTop: `4px solid ${column.color || '#1976d2'}`,
            }}
        >
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    borderBottom: '1px solid #eee',
                    pb: 1,
                    cursor: 'grab',
                    '&:active': {
                        cursor: 'grabbing',
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                    <Typography 
                        variant="h6" 
                        component="div"
                        sx={{ 
                            color: column.color || '#1976d2',
                            fontWeight: 'bold'
                        }}
                    >
                        {column.name}
                    </Typography>
                </Box>
                <Box>
                    <IconButton
                        size="small"
                        onClick={() => setIsAddingTask(true)}
                        sx={{ '&:hover': { color: column.color || 'primary.main' } }}
                    >
                        <AddIcon />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={handleMenuOpen}
                        sx={{ '&:hover': { color: column.color || 'primary.main' } }}
                    >
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleEditColumn}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Edit Column</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDeleteColumn}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText>Delete Column</ListItemText>
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            {isAddingTask && (
                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Task title"
                        autoFocus
                        sx={{ mb: 1 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddTask}
                            disabled={!newTaskTitle.trim()}
                            sx={{ 
                                bgcolor: column.color || 'primary.main',
                                '&:hover': {
                                    bgcolor: column.color ? `${column.color}dd` : 'primary.dark',
                                }
                            }}
                        >
                            Add
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setIsAddingTask(false);
                                setNewTaskTitle('');
                            }}
                            sx={{ 
                                borderColor: column.color || 'primary.main',
                                color: column.color || 'primary.main',
                                '&:hover': {
                                    borderColor: column.color ? `${column.color}dd` : 'primary.dark',
                                }
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            )}

            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <Box
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        sx={{
                            flex: 1,
                            backgroundColor: snapshot.isDraggingOver 
                                ? `${column.color}11` || 'action.hover' 
                                : 'transparent',
                            transition: 'background-color 0.2s ease',
                            borderRadius: 1,
                            minHeight: 100,
                            padding: snapshot.isDraggingOver ? '8px' : '0px',
                        }}
                    >
                        {tasks.map((task, index) => (
                            <PrepCard
                                key={task.id}
                                task={task}
                                index={index}
                                onDelete={onDeleteTask}
                                onViewRecipe={onViewRecipe}
                                columnColor={column.color}
                                columnName={column.name}
                            />
                        ))}
                        {provided.placeholder}
                    </Box>
                )}
            </Droppable>
        </Paper>
    );
};

export default PrepColumn; 