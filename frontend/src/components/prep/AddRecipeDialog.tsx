import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Recipe } from '../../types/recipe';
import { getRecipes } from '../../services/apiService';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import { AddRecipeDialogProps, CreatePrepTaskInput } from '../../types/prep';
import { useSnackbar } from '../../context/SnackbarContext';

const AddRecipeDialog: React.FC<AddRecipeDialogProps> = ({ open, onClose, columnId: initialColumnId }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>(initialColumnId);
    const { addTask, columns } = usePrepBoardStore();
    const { showSnackbar } = useSnackbar();

    // Reset selected column when dialog opens/closes or initial column changes
    useEffect(() => {
        setSelectedColumnId(initialColumnId);
    }, [open, initialColumnId]);

    useEffect(() => {
        const fetchRecipes = async () => {
            if (!open) return;
            try {
                setLoading(true);
                const data = await getRecipes();
                setRecipes(data);
                setError(null);
            } catch (err) {
                setError('Failed to load recipes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [open]);

    const handleAddRecipe = async (recipe: Recipe) => {
        if (!selectedColumnId) {
            showSnackbar('Please select a column first', 'error');
            return;
        }

        try {
            // Get the column to add to
            const targetColumn = columns.find(col => col.id === selectedColumnId);
            if (!targetColumn) {
                showSnackbar('Selected column not found', 'error');
                return;
            }

            // Calculate the new task order (highest current order + 1)
            const highestOrder = targetColumn.tasks.length > 0 
                ? Math.max(...targetColumn.tasks.map(task => task.order))
                : -1;

            // Convert recipeId to number (backend expects Int type)
            const recipeId = recipe.id ? parseInt(recipe.id.toString(), 10) : undefined;

            const newTask: CreatePrepTaskInput = {
                title: recipe.name,
                description: recipe.description || '',
                columnId: selectedColumnId,
                recipeId: recipeId
            };

            await addTask(newTask);
            showSnackbar(`Added "${recipe.name}" to ${targetColumn.name}`, 'success');
        } catch (err) {
            console.error('Error adding recipe to prep board:', err);
            showSnackbar('Failed to add recipe to prep board', 'error');
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Add Recipe to Prep Board</DialogTitle>
            <DialogContent>
                {!initialColumnId && (
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="column-select-label">Column</InputLabel>
                        <Select
                            labelId="column-select-label"
                            value={selectedColumnId || ''}
                            label="Column"
                            onChange={(e) => setSelectedColumnId(e.target.value)}
                        >
                            {columns.map((column) => (
                                <MenuItem 
                                    key={column.id} 
                                    value={column.id}
                                >
                                    {column.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <List>
                        {recipes.map((recipe) => (
                            <ListItem key={recipe.id} divider>
                                <ListItemText
                                    primary={recipe.name}
                                    secondary={recipe.description}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleAddRecipe(recipe)}
                                        color="primary"
                                        disabled={!selectedColumnId}
                                        title={!selectedColumnId ? 'Please select a column first' : 'Add to prep board'}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddRecipeDialog; 