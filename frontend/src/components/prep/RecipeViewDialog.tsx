import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import { Recipe } from '../../types/recipe';
import { getRecipeById } from '../../services/apiService';
import { ConciseRecipeView } from '../ConciseRecipeView';

interface RecipeViewDialogProps {
    open: boolean;
    onClose: () => void;
    recipeId: number | null;
}

const RecipeViewDialog: React.FC<RecipeViewDialogProps> = ({ open, onClose, recipeId }) => {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConciseMode, setIsConciseMode] = useState(true);

    useEffect(() => {
        const loadRecipe = async () => {
            if (!recipeId || !open) return;
            
            setIsLoading(true);
            try {
                const data = await getRecipeById(recipeId);
                setRecipe(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load recipe');
            } finally {
                setIsLoading(false);
            }
        };

        loadRecipe();
    }, [recipeId, open]);

    if (!recipe && !isLoading && !error) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{recipe?.name || 'Recipe Details'}</span>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <ToggleButton
                            value="concise"
                            selected={isConciseMode}
                            onChange={() => setIsConciseMode(!isConciseMode)}
                            size="small"
                        >
                            {isConciseMode ? <MenuBookIcon /> : <ListAltIcon />}
                        </ToggleButton>
                        <IconButton size="small" onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : recipe ? (
                    isConciseMode ? (
                        <ConciseRecipeView
                            name={recipe.name}
                            ingredients={recipe.recipeIngredients || []}
                            yieldQuantity={recipe.yieldQuantity || 1}
                            yieldUnit={recipe.yieldUnit ? { name: recipe.yieldUnit.name } : undefined}
                        />
                    ) : (
                        <Box>
                            {recipe.description && (
                                <>
                                    <Typography variant="h6" gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {recipe.description}
                                    </Typography>
                                </>
                            )}
                            <Typography variant="h6" gutterBottom>
                                Yield
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {recipe.yieldQuantity || 1} {recipe.yieldUnit?.name || 'servings'}
                            </Typography>
                            <Typography variant="h6" gutterBottom>
                                Ingredients
                            </Typography>
                            <List>
                                {(recipe.recipeIngredients || []).map((ing, idx) => (
                                    <React.Fragment key={ing.id}>
                                        {idx > 0 && <Divider />}
                                        <ListItem>
                                            <ListItemText
                                                primary={`${ing.quantity} ${ing.unit.name} ${ing.ingredient?.name || ''}`}
                                                secondary={ing.note}
                                            />
                                        </ListItem>
                                    </React.Fragment>
                                ))}
                            </List>
                            {recipe.instructions && (
                                <>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                        Instructions
                                    </Typography>
                                    <div dangerouslySetInnerHTML={{ __html: recipe.instructions }} />
                                </>
                            )}
                        </Box>
                    )
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecipeViewDialog; 