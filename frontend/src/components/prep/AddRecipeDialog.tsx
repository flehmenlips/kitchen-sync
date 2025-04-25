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
import { Recipe } from '../../types/recipe';
import { getRecipes } from '../../services/apiService';
import { usePrepBoardStore } from '../../stores/prepBoardStore';
import { v4 as uuidv4 } from 'uuid';

interface AddRecipeDialogProps {
    open: boolean;
    onClose: () => void;
}

const AddRecipeDialog: React.FC<AddRecipeDialogProps> = ({ open, onClose }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addTask } = usePrepBoardStore();

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

    const handleAddRecipe = (recipe: Recipe) => {
        const newTask = {
            id: uuidv4(),
            recipeId: recipe.id,
            recipeName: recipe.name,
            description: recipe.description || '',
            status: 'to-prep',
            priority: 'MEDIUM' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        addTask(newTask);
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