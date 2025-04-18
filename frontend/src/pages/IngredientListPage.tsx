import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getIngredients, Ingredient, deleteIngredient, IngredientCategory } from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';

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
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import ListItemIcon from '@mui/material/ListItemIcon';

// Type for grouped data
interface GroupedIngredients {
  [categoryName: string]: Ingredient[];
}

const UNCATEGORIZED_ING_KEY = 'Uncategorized';
const LOCAL_STORAGE_KEY_ING_CAT = 'kitchenSyncIngredientCategoryState';

const IngredientListPage: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const { showSnackbar } = useSnackbar();

  // State for collapse state
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>(() => {
      try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY_ING_CAT);
        return savedState ? JSON.parse(savedState) : {};
    } catch (error) { return {}; }
  });

  useEffect(() => { fetchIngredients(); }, []);

  const fetchIngredients = async () => {
      try {
        setLoading(true);
        const data = await getIngredients(); // Assuming this now includes ingredientCategory
        setIngredients(data);
        setError(null);
        // Initialize open state
        setOpenCategories(prevState => {
             const newState = { ...prevState };
             let updated = false;
             const allCategoryNames = new Set<string>([UNCATEGORIZED_ING_KEY]);
             data.forEach(ing => { allCategoryNames.add(ing.ingredientCategory?.name || UNCATEGORIZED_ING_KEY); });
             allCategoryNames.forEach(categoryName => {
                 if (!(categoryName in newState)) {
                     newState[categoryName] = true; updated = true;
                 }
             });
             // Default all if nothing loaded
             if (Object.keys(prevState).length === 0 && !updated && data.length > 0) {
                 allCategoryNames.forEach(name => newState[name] = true);
                 updated = true;
             }
             return updated ? newState : prevState;
        });
      } catch (err) { setError('Failed to fetch ingredients.'); } 
      finally { setLoading(false); }
    };

  // Save open state to localStorage
   useEffect(() => {
      if (Object.keys(openCategories).length > 0 && !loading) {
        try {
             localStorage.setItem(LOCAL_STORAGE_KEY_ING_CAT, JSON.stringify(openCategories));
        } catch (error) { console.error("Error saving ingredient category state:", error);}
      }
  }, [openCategories, loading]);

  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    return ingredients.reduce<GroupedIngredients>((acc, ingredient) => {
      const categoryName = ingredient.ingredientCategory?.name || UNCATEGORIZED_ING_KEY;
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(ingredient);
      return acc;
    }, {});
  }, [ingredients]);

  // Sort category names
  const sortedCategoryNames = useMemo(() => {
      return Object.keys(groupedIngredients).sort((a, b) => {
          if (a === UNCATEGORIZED_ING_KEY) return 1;
          if (b === UNCATEGORIZED_ING_KEY) return -1;
          return a.localeCompare(b);
      });
  }, [groupedIngredients]);

  const handleCategoryClick = (categoryName: string) => {
    setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

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
            <List component="nav" aria-labelledby="ingredient-list-subheader">
                {sortedCategoryNames.map((categoryName) => (
                    <React.Fragment key={categoryName}>
                        <ListItemButton onClick={() => handleCategoryClick(categoryName)}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <FolderIcon fontSize="small" />
                            </ListItemIcon>
                           <ListItemText primary={categoryName} primaryTypographyProps={{ fontWeight: 'medium' }} />
                           {!!openCategories[categoryName] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={!!openCategories[categoryName]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 4 }}>
                            {groupedIngredients[categoryName].map((ingredient) => (
                                <ListItem 
                                    key={ingredient.id} 
                                    disablePadding
                                    secondaryAction={
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton edge="end" component={RouterLink} to={`/ingredients/${ingredient.id}/edit`} size="small" title="Edit Ingredient"><EditIcon fontSize="small"/></IconButton>
                                            <IconButton edge="end" onClick={() => handleDeleteClick(ingredient)} disabled={isDeleting && ingredientToDelete?.id === ingredient.id} color="error" size="small" title="Delete Ingredient"><DeleteIcon fontSize="small"/></IconButton>
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
                        </Collapse>
                    </React.Fragment>
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