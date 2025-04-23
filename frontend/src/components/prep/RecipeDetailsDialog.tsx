import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Recipe, RecipeIngredient } from '../../types/recipe';
import { getRecipeById } from '../../services/apiService';

interface RecipeDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    recipeId: number;
}

const RecipeDetailsDialog: React.FC<RecipeDetailsDialogProps> = ({ open, onClose, recipeId }) => {
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!open) return;
            try {
                setLoading(true);
                const data = await getRecipeById(recipeId);
                // Ensure the recipe data has all required fields
                const validatedRecipe: Recipe = {
                    ...data,
                    recipeIngredients: data.recipeIngredients || [],
                    description: data.description || null,
                    yieldQuantity: data.yieldQuantity || null,
                    yieldUnit: data.yieldUnit || null,
                    prepTimeMinutes: data.prepTimeMinutes || null,
                    cookTimeMinutes: data.cookTimeMinutes || null,
                    category: data.category || null
                };
                setRecipe(validatedRecipe);
                setError(null);
            } catch (err) {
                setError('Failed to load recipe details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [recipeId, open]);

    if (!open) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                {loading ? 'Loading Recipe...' : recipe?.name}
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : recipe ? (
                    <Box sx={{ mt: 2 }}>
                        {recipe.description && (
                            <Typography variant="body1" paragraph>
                                {recipe.description}
                            </Typography>
                        )}

                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Ingredients
                        </Typography>
                        {recipe.recipeIngredients.map((ing: RecipeIngredient, index: number) => (
                            <Typography key={index} variant="body1">
                                • {ing.quantity} {ing.unit.abbreviation} {ing.ingredient?.name || ing.subRecipe?.name}
                            </Typography>
                        ))}

                        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            Instructions
                        </Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {recipe.instructions}
                        </Typography>

                        {(recipe.prepTimeMinutes || recipe.cookTimeMinutes) && (
                            <Box sx={{ mt: 3, display: 'flex', gap: 3 }}>
                                {recipe.prepTimeMinutes && (
                                    <Typography variant="body2" color="text.secondary">
                                        Prep Time: {recipe.prepTimeMinutes} minutes
                                    </Typography>
                                )}
                                {recipe.cookTimeMinutes && (
                                    <Typography variant="body2" color="text.secondary">
                                        Cook Time: {recipe.cookTimeMinutes} minutes
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                ) : null}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecipeDetailsDialog; 