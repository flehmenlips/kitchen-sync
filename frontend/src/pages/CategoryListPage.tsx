import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCategories, Category, deleteCategory } from '../services/apiService';
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

const CategoryListPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch categories.');
      } finally {
        setLoading(false);
      }
    };

  const handleDeleteClick = (category: Category) => {
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
    const categoryId = categoryToDelete.id;

    setIsDeleting(true);
    setDialogError(null);
    try {
        await deleteCategory(categoryId);
        showSnackbar(`Category "${categoryToDelete.name}" deleted successfully!`, 'success');
        // Refetch or filter state
        setCategories(prev => prev.filter(c => c.id !== categoryId));
        handleCloseDialog(); 
    } catch (err: any) {
        console.error('Failed to delete category:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to delete category.';
        // NOTE: Deleting Categories is set to SetNull on recipes, so no dependency error expected here
        setDialogError(`Error: ${errorMsg}`);
    } finally {
        setIsDeleting(false);
        // Keep dialog open if error occurred?
        // if(dialogError) {} else { handleCloseDialog(); }
    }
  };

  if (loading) { /* ... loading spinner ... */ }
  if (error) { /* ... error alert ... */ }

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
         <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
            <Typography color="text.primary">Categories</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">Categories</Typography>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/categories/new"
            >
                Add Category
            </Button>
        </Box>
      
        {categories.length === 0 ? (
            <Typography sx={{ mt: 2 }}>No categories found.</Typography>
        ) : (
            <List>
                {categories.map((category) => (
                    <ListItem 
                        key={category.id} 
                        disablePadding
                        secondaryAction={
                             <Stack direction="row" spacing={1}>
                                <IconButton 
                                    edge="end" 
                                    aria-label="edit" 
                                    component={RouterLink} 
                                    to={`/categories/${category.id}/edit`}
                                    size="small"
                                >
                                    <EditIcon fontSize="small"/>
                                </IconButton>
                                <IconButton 
                                    edge="end" 
                                    aria-label="delete" 
                                    onClick={() => handleDeleteClick(category)}
                                    disabled={isDeleting && categoryToDelete?.id === category.id}
                                    color="error"
                                    size="small"
                                >
                                     <DeleteIcon fontSize="small"/>
                                </IconButton>
                            </Stack>
                        }
                    >
                        <ListItemText
                            primary={category.name}
                            secondary={category.description || ''} 
                        />
                    </ListItem>
                ))}
            </List>
        )}
        
        {/* Render Confirmation Dialog */}
        {categoryToDelete && (
            <ConfirmationDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                contentText={`Are you sure you want to delete the category "${categoryToDelete?.name || ''}"? Recipes using this category will become uncategorized.`}
                errorText={dialogError} 
                isProcessing={isDeleting} 
                confirmText="Delete"
            />
        )}
    </Container>
  );
};

export default CategoryListPage; 