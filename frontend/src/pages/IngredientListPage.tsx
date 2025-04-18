import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getIngredients, Ingredient } from '../services/apiService';

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

const IngredientListPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
                    <ListItem key={ingredient.id} disablePadding>
                        {/* TODO: Make these clickable to an edit page later? */}
                        <ListItemText
                            primary={ingredient.name}
                            secondary={ingredient.description || ''} 
                        />
                        {/* TODO: Add Edit/Delete Icons/Buttons */}
                    </ListItem>
                ))}
            </List>
        )}
    </Container>
  );
};

export default IngredientListPage; 