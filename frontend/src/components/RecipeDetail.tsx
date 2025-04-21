import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { getRecipeById, Recipe, deleteRecipe } from '../services/apiService';

// Import MUI components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link'; // MUI Link
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from './common/ConfirmationDialog'; // Import the dialog

const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate(); // Hook for navigation
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [dialogOpen, setDialogOpen] = useState(false); // State for dialog

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) {
                setError('No recipe ID provided');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const recipeId = parseInt(id, 10);
                if (isNaN(recipeId)) {
                    throw new Error('Invalid recipe ID format');
                }
                const data = await getRecipeById(recipeId);
                setRecipe(data);
                setError(null);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to fetch recipe details.');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]); // Re-run effect if the ID changes

    const handleDeleteClick = () => {
        setDeleteError(null); // Clear previous errors
        setDialogOpen(true); // Open the dialog
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!recipe) return;
        // Actual delete logic moved here from handleDeleteClick
        setIsDeleting(true);
        setDeleteError(null);
        try {
            await deleteRecipe(recipe.id);
            console.log('Recipe deleted successfully');
            navigate('/recipes'); 
        } catch (err: any) {
            console.error('Failed to delete recipe:', err);
            setDeleteError(err.response?.data?.message || err.message || 'Failed to delete recipe.');
            // Keep dialog open on error? Or close and show alert?
            // For now, dialog closes automatically via onClose in onConfirm call
        } finally {
            setIsDeleting(false);
            // No need to close dialog here, ConfirmationDialog handles it
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    }

    if (!recipe) {
        return <Alert severity="warning" sx={{ m: 2 }}>Recipe not found.</Alert>;
    }

    // Helper to format time
    const formatTime = (minutes: number | null): string => {
        if (minutes === null || minutes === undefined) return 'N/A';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hr${hours > 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} min` : ''}`;
    };

    return (
        <Container maxWidth="md" sx={{ mt: 2 }}> {/* Main container */} 
             <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/">
                    KitchenSync
                </Link>
                 <Link component={RouterLink} underline="hover" color="inherit" to="/recipes">
                    Recipes
                </Link>
                <Typography color="text.primary">{recipe.name}</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h4" component="h2" gutterBottom>{recipe.name}</Typography>
                <Stack direction="row" spacing={1}>
                    <Button 
                        variant="outlined" 
                        startIcon={<EditIcon />} 
                        component={RouterLink}
                        to={`/recipes/${recipe.id}/edit`}
                        size="small"
                    >
                        Edit
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<DeleteIcon />} 
                        onClick={handleDeleteClick}
                        disabled={isDeleting || !recipe}
                        size="small"
                    >
                        Delete
                    </Button>
                </Stack>
            </Box>
            {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
            
            {recipe.description && <Typography variant="body1" sx={{ mb: 2 }}><em>{recipe.description}</em></Typography>}
            
            <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2">
                    <strong>Yield:</strong> {recipe.yieldQuantity || 'N/A'} {recipe.yieldUnit?.name || ''}
                </Typography>
                <Typography variant="body2">
                    <strong>Prep Time:</strong> {formatTime(recipe.prepTimeMinutes)}
                </Typography>
                 <Typography variant="body2">
                    <strong>Cook Time:</strong> {formatTime(recipe.cookTimeMinutes)}
                </Typography>
            </Box>
            {recipe.tags && recipe.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <strong>Tags:</strong> {recipe.tags.map(tag => <Chip key={tag} label={tag} size="small" sx={{ ml: 0.5 }} />)}
                </Box>
            )}

            <Divider sx={{ my: 2 }}/>

            <Typography variant="h5" component="h3" gutterBottom>Ingredients</Typography>
            {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
                 <List dense> {/* Use dense list for ingredients */} 
                    {recipe.recipeIngredients.map((item) => (
                        <ListItem key={item.id} disableGutters>
                             <Typography variant="body1">
                                {item.quantity} {item.unit.abbreviation || item.unit.name}
                                {item.ingredient ? ` ${item.ingredient.name}` : ''}
                                {item.subRecipe ? 
                                    <> {item.subRecipe.name} (<Link component={RouterLink} to={`/recipes/${item.subRecipe.id}`}>Sub-Recipe</Link>)
                                    </> : ''}
                             </Typography>
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography>No ingredients listed.</Typography>
            )}

             <Divider sx={{ my: 2 }}/>

            <Typography variant="h5" component="h3" gutterBottom>Instructions</Typography>
            {/* Use dangerouslySetInnerHTML to render formatted instructions */}
            {recipe.instructions && recipe.instructions !== '<p><br></p>' ? (
                <Typography 
                    variant="body1" 
                    sx={{ mb: 4 }} 
                    dangerouslySetInnerHTML={{ __html: recipe.instructions }}
                />
            ) : (
                <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic' }}>
                    No instructions provided.
                </Typography>
            )}

            {/* Temporarily comment out ConfirmationDialog to isolate error */}
            {/* <ConfirmationDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                contentText={`Are you sure you want to delete the recipe \"${recipe?.name || \'\'}\"? This action cannot be undone.`}
                confirmText={isDeleting ? 'Deleting...' : 'Delete'}
            /> */}
        </Container>
    );
};

export default RecipeDetail; 