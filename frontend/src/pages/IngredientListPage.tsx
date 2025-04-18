import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getIngredients, Ingredient, deleteIngredient } from '../services/apiService';

// Import MUI components
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListItemButton from '@mui/material/ListItemButton';

const IngredientListPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        const data = await getIngredients();
        setIngredients(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch ingredients. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchIngredients();
  }, []);

  const handleDeleteClick = (ingredient: Ingredient) => {
    setDialogError(null);
    setIngredientToDelete(ingredient);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setIngredientToDelete(null);
    setDialogError(null);
  };

  const handleConfirmDelete = async () => {
    if (!ingredientToDelete) return;
    const ingredientId = ingredientToDelete.id;

    setIsDeleting(true);
    setDialogError(null);

    try {
        await deleteIngredient(ingredientId);
        console.log('Ingredient deleted successfully');
        setIngredients(prevIngredients => prevIngredients.filter(i => i.id !== ingredientId));
        handleCloseDialog(); // Close on success
    } catch (err: any) {
        console.error('Failed to delete ingredient:', err);
        const backendErrorMsg = err.response?.data?.message || err.message || 'Failed to delete ingredient.';
        const isInUse = backendErrorMsg.toLowerCase().includes('currently used') || 
                        backendErrorMsg.toLowerCase().includes('foreign key constraint');

        const displayError = isInUse 
            ? "This ingredient is in use in one or more recipes and cannot be deleted. Please remove it from all recipes before deleting." 
            : `Error: ${backendErrorMsg}`;

        setDialogError(displayError); // Set error to display in dialog
        // Dialog remains open
    } finally {
        setIsDeleting(false);
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
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
         <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">
                KitchenSync
            </Link>
            <Typography color="text.primary">Ingredients</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
                Ingredients
            </Typography>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/ingredients/new"
            >
                Add Ingredient
            </Button>
        </Box>
      
        {ingredients.length === 0 ? (
            <Typography sx={{ mt: 2 }}>No ingredients found.</Typography>
        ) : (
            <List>
                {ingredients.map((ingredient) => (
                    <ListItem 
                        key={ingredient.id} 
                        disablePadding
                        secondaryAction={
                             <Stack direction="row" spacing={0.5}>
                                <IconButton 
                                    edge="end" 
                                    aria-label="edit" 
                                    component={RouterLink} 
                                    to={`/ingredients/${ingredient.id}/edit`}
                                    size="small"
                                    title="Edit Ingredient"
                                >
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                                <IconButton 
                                    edge="end" 
                                    aria-label="delete" 
                                    onClick={() => handleDeleteClick(ingredient)} 
                                    disabled={isDeleting && ingredientToDelete?.id === ingredient.id}
                                    color="error"
                                    size="small"
                                    title="Delete Ingredient"
                                >
                                     <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </Stack>
                        }
                    >
                        <ListItemButton component={RouterLink} to={`/ingredients/${ingredient.id}/edit`} sx={{ pr: 15 }}>
                            <ListItemText
                                primary={ingredient.name}
                                secondary={ingredient.description || ''} 
                            />
                         </ListItemButton>
                    </ListItem>
                ))}
            </List>
        )}

        {ingredientToDelete && (
            <ConfirmationDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                contentText={`Are you sure you want to delete the ingredient "${ingredientToDelete?.name || ''}"? This action cannot be undone.`}
                errorText={dialogError}
                isProcessing={isDeleting}
                confirmText="Delete"
            />
        )}
    </Container>
  );
};

export default IngredientListPage; 