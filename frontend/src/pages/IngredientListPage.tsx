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

const IngredientListPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{ [key: number]: string | null }>({});
  const [isDeleting, setIsDeleting] = useState<{ [key: number]: boolean }>({});

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

  const handleDelete = async (ingredient: Ingredient) => {
    if (window.confirm(`Are you sure you want to delete ingredient "${ingredient.name}"? This cannot be undone if the ingredient is in use.`)) {
        setIsDeleting(prev => ({ ...prev, [ingredient.id]: true }));
        setDeleteError(prev => ({ ...prev, [ingredient.id]: null }));
        try {
            await deleteIngredient(ingredient.id);
            console.log('Ingredient deleted successfully');
            // Refetch ingredients or remove from state
            setIngredients(prevIngredients => prevIngredients.filter(i => i.id !== ingredient.id));
        } catch (err: any) {
            console.error('Failed to delete ingredient:', err);
            setDeleteError(prev => ({ ...prev, [ingredient.id]: err.response?.data?.message || err.message || 'Failed to delete ingredient.' }));
        } finally {
            setIsDeleting(prev => ({ ...prev, [ingredient.id]: false }));
        }
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
                             <Stack direction="row" spacing={1}>
                                <IconButton 
                                    edge="end" 
                                    aria-label="edit" 
                                    component={RouterLink} 
                                    to={`/ingredients/${ingredient.id}/edit`}
                                    size="small"
                                >
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                                <IconButton 
                                    edge="end" 
                                    aria-label="delete" 
                                    onClick={() => handleDelete(ingredient)}
                                    disabled={isDeleting[ingredient.id]}
                                    color="error"
                                    size="small"
                                >
                                    {isDeleting[ingredient.id] ? <CircularProgress size={16} color="inherit"/> : <DeleteIcon fontSize="small"/>}
                                </IconButton>
                            </Stack>
                        }
                    >
                        <ListItemText
                            primary={ingredient.name}
                            secondary={ingredient.description || ''} 
                        />
                    </ListItem>
                ))}
            </List>
        )}
        {Object.entries(deleteError).map(([id, msg]) => 
            msg ? <Alert severity="error" key={id} sx={{ mt: 1 }}>Error deleting ingredient {id}: {msg}</Alert> : null
        )}
    </Container>
  );
};

export default IngredientListPage; 