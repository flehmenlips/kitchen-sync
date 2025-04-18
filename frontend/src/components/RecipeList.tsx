import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getRecipes, Recipe } from '../services/apiService';

// Import MUI components
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton'; // For clickable list items

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await getRecipes();
        setRecipes(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch recipes. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    // Center the loading spinner
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
    <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', mt: 2 }}> {/* Basic container */} 
      <Typography variant="h4" component="h2" gutterBottom>
        Recipe List (CookBook)
      </Typography>
      {/* TODO: Add "Add Recipe" button here */}
      {recipes.length === 0 ? (
        <Typography sx={{ mt: 2 }}>No recipes found. Add some via the API!</Typography>
      ) : (
        <List>
          {recipes.map((recipe) => (
            <ListItem key={recipe.id} disablePadding>
              {/* Use ListItemButton for link behavior */}
              <ListItemButton component={RouterLink} to={`/recipes/${recipe.id}`}>
                <ListItemText
                  primary={recipe.name}
                  secondary={recipe.description || ''}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RecipeList; 