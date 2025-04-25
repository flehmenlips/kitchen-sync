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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Select,
    InputLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIndicatorIcon,
    Palette as PaletteIcon,
} from '@mui/icons-material';
import { PrepColumn as PrepColumnType, PrepTask } from '../../types/prep';
import PrepCard from './PrepCard';
import { usePrepBoardStore } from '../../stores/prepBoardStore';

// Predefined color palette - same as in ColumnFormDialog
const colorOptions = [
    { name: 'Blue', value: '#1976d2' },
    { name: 'Red', value: '#d32f2f' },
    { name: 'Green', value: '#2e7d32' },
    { name: 'Orange', value: '#ed6c02' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Teal', value: '#009688' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Indigo', value: '#3f51b5' },
    { name: 'Yellow', value: '#ffc107' },
    { name: 'Cyan', value: '#00bcd4' },
    { name: 'Brown', value: '#795548' },
    { name: 'Grey', value: '#757575' }
];

interface PrepColumnProps {
    column: PrepColumnType;
    tasks: PrepTask[];
    onDeleteTask: (taskId: string) => void;
    onViewRecipe: (taskId: string) => void;
    onEditColumn: (column: PrepColumnType) => void;
    onDeleteColumn: (column: PrepColumnType) => void;
    onViewTaskDetails?: (taskId: string) => void;
}

const PrepColumn: React.FC<PrepColumnProps> = ({
    column,
    tasks,
    onDeleteTask,
    onViewRecipe,
    onEditColumn,
    onDeleteColumn,
    onViewTaskDetails,
}) => {
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState(column.color || '#1976d2');
    const addTask = usePrepBoardStore(state => state.addTask);
    const updateColumn = usePrepBoardStore(state => state.updateColumn);

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

    const handleOpenColorPicker = () => {
        setSelectedColor(column.color || '#1976d2');
        setIsColorPickerOpen(true);
        handleMenuClose();
    };

    const handleCloseColorPicker = () => {
        setIsColorPickerOpen(false);
    };

    const handleColorChange = async () => {
        try {
            console.log('Updating column color:', {
                columnId: column.id,
                currentColor: column.color,
                newColor: selectedColor
            });
            
            await updateColumn(column.id, { color: selectedColor });
            console.log('Column color updated successfully');
            
            // Force a re-fetch of all columns to ensure state is up to date
            await usePrepBoardStore.getState().fetchColumns();
            
            handleCloseColorPicker();
        } catch (error) {
            console.error('Failed to update column color:', error);
        }
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
                        <MenuItem onClick={handleOpenColorPicker}>
                            <ListItemIcon>
                                <PaletteIcon fontSize="small" sx={{ color: column.color || '#1976d2' }} />
                            </ListItemIcon>
                            <ListItemText>Change Color</ListItemText>
                        </MenuItem>
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

            {/* Color Picker Dialog */}
            <Dialog open={isColorPickerOpen} onClose={handleCloseColorPicker}>
                <DialogTitle>Change Column Color</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="column-color-select-label">Column Color</InputLabel>
                        <Select
                            labelId="column-color-select-label"
                            id="column-color-select"
                            value={selectedColor}
                            label="Column Color"
                            onChange={(e) => setSelectedColor(e.target.value)}
                        >
                            {colorOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box 
                                            sx={{ 
                                                width: 24, 
                                                height: 24, 
                                                bgcolor: option.value,
                                                borderRadius: 1,
                                                mr: 1
                                            }} 
                                        />
                                        <Typography>{option.name}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseColorPicker}>Cancel</Button>
                    <Button 
                        onClick={handleColorChange} 
                        variant="contained"
                        sx={{ 
                            bgcolor: selectedColor,
                            '&:hover': {
                                bgcolor: `${selectedColor}dd`
                            }
                        }}
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>

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
                                onClick={() => onViewTaskDetails && onViewTaskDetails(task.id)}
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