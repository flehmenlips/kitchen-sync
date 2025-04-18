import React, { useState, useEffect, useMemo } from 'react';
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
import Button from '@mui/material/Button'; // Import Button
import AddIcon from '@mui/icons-material/Add'; // Import an icon
import Collapse from '@mui/material/Collapse'; // For collapsible sections
import ListSubheader from '@mui/material/ListSubheader'; // For category headers
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder'; // Optional icon for categories
import ListItemIcon from '@mui/material/ListItemIcon';

// Type for grouped data
interface GroupedRecipes {
  [categoryName: string]: Recipe[];
}

const UNCATEGORIZED_KEY = 'Uncategorized';

const RecipeList: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // State to track open/closed categories
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await getRecipes(); // Assuming this now includes category
        setRecipes(data);
        setError(null);
        // Initialize all categories as open by default
        const initialOpenState: { [key: string]: boolean } = {};
        data.forEach(recipe => {
            const categoryName = recipe.category?.name || UNCATEGORIZED_KEY;
            if (!(categoryName in initialOpenState)) {
                 initialOpenState[categoryName] = true; // Default to open
            }
        });
        if (!initialOpenState[UNCATEGORIZED_KEY] && data.some(r => !r.category)) {
             initialOpenState[UNCATEGORIZED_KEY] = true; // Ensure Uncategorized is open if present
        }
        setOpenCategories(initialOpenState);

      } catch (err) {
        console.error(err);
        setError('Failed to fetch recipes. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Group recipes by category using useMemo for efficiency
  const groupedRecipes = useMemo(() => {
    return recipes.reduce<GroupedRecipes>((acc, recipe) => {
      const categoryName = recipe.category?.name || UNCATEGORIZED_KEY;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(recipe);
      return acc;
    }, {});
  }, [recipes]);

  // Sort category names (optional, puts Uncategorized last)
  const sortedCategoryNames = useMemo(() => {
      return Object.keys(groupedRecipes).sort((a, b) => {
          if (a === UNCATEGORIZED_KEY) return 1;
          if (b === UNCATEGORIZED_KEY) return -1;
          return a.localeCompare(b);
      });
  }, [groupedRecipes]);

  const handleCategoryClick = (categoryName: string) => {
    setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

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
    <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', mt: 2 }}> {/* Basic container */} 
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          Recipes
        </Typography>
        {/* Add Recipe Button */}
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          component={RouterLink} 
          to="/recipes/new"
        >
          Add Recipe
        </Button>
      </Box>
      {recipes.length === 0 && !loading ? (
        <Typography sx={{ mt: 2 }}>No recipes found.</Typography>
      ) : (
        <List
            sx={{ width: '100%', bgcolor: 'background.paper' }} 
            component="nav"
            aria-labelledby="recipe-list-subheader"
        >
          {sortedCategoryNames.map((categoryName) => (
            <React.Fragment key={categoryName}>
              <ListItemButton onClick={() => handleCategoryClick(categoryName)}>
                 {/* Optional Icon */}
                 {/* <ListItemIcon><FolderIcon /></ListItemIcon> */}
                <ListItemText primary={categoryName} primaryTypographyProps={{ fontWeight: 'medium' }} />
                {openCategories[categoryName] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openCategories[categoryName]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}> {/* Indent recipes */} 
                  {groupedRecipes[categoryName].map((recipe) => (
                    <ListItem key={recipe.id} disablePadding>
                      <ListItemButton component={RouterLink} to={`/recipes/${recipe.id}`}>
                        <ListItemText
                          primary={recipe.name}
                          secondary={recipe.description || ''}
                          secondaryTypographyProps={{ noWrap: true, sx: { display: 'block' } }} // Prevent wrap, ensure display
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RecipeList; 