// frontend/src/pages/IngredientCategoryListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getIngredientCategories, IngredientCategory, deleteIngredientCategory } from '../services/apiService';
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
import { useSnackbar } from '../context/SnackbarContext';
import ListItemButton from '@mui/material/ListItemButton';

const IngredientCategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<IngredientCategory | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getIngredientCategories();
        setCategories(data);
        setError(null);
      } catch (err) { setError('Failed to fetch ingredient categories.'); }
       finally { setLoading(false); }
    };

  const handleDeleteClick = (category: IngredientCategory) => {
    setDialogError(null);
    setCategoryToDelete(category);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCategoryToDelete(null);
    setDialogError(null);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setDialogError(null);
    try {
        await deleteIngredientCategory(categoryToDelete.id);
        showSnackbar(`Ingredient Category "${categoryToDelete.name}" deleted.`, 'success');
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id));
        handleCloseDialog(); 
    } catch (err: any) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to delete.';
        // Deleting these also uses SetNull, so no dependency error expected
        setDialogError(`Error: ${errorMsg}`);
    } finally {
        setIsDeleting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center'}}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
         <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
            <Typography color="text.primary">Ingredient Categories</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">Ingredient Categories</Typography>
            <Button variant="contained" startIcon={<AddIcon />} component={RouterLink} to="/ingredient-categories/new">Add Category</Button>
        </Box>
        {categories.length === 0 ? <Typography>No categories found.</Typography> : (
            <List>{categories.map((category) => ( <ListItem key={category.id} disablePadding secondaryAction={<Stack direction="row" spacing={0.5}><IconButton edge="end" component={RouterLink} to={`/ingredient-categories/${category.id}/edit`} size="small" title="Edit"><EditIcon fontSize="small"/></IconButton><IconButton edge="end" onClick={() => handleDeleteClick(category)} disabled={isDeleting && categoryToDelete?.id === category.id} color="error" size="small" title="Delete"><DeleteIcon fontSize="small"/></IconButton></Stack>}><ListItemButton component={RouterLink} to={`/ingredient-categories/${category.id}/edit`} sx={{ pr: 15 }}><ListItemText primary={category.name} secondary={category.description || ''} /></ListItemButton></ListItem> ))}</List>
        )}
        {categoryToDelete && <ConfirmationDialog open={dialogOpen} onClose={handleCloseDialog} onConfirm={handleConfirmDelete} title="Confirm Deletion" contentText={`Delete category "${categoryToDelete?.name || ''}"? Ingredients using it will become uncategorized.`} errorText={dialogError} isProcessing={isDeleting} confirmText="Delete"/>}
    </Container>
  );
};
export default IngredientCategoryListPage; 