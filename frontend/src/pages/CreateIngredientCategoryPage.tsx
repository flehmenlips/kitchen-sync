// frontend/src/pages/CreateIngredientCategoryPage.tsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import IngredientCategoryForm from '../components/forms/IngredientCategoryForm';
import { createIngredientCategory, IngredientCategoryFormData } from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

const CreateIngredientCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleFormSubmit = async (formData: IngredientCategoryFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const newCategory = await createIngredientCategory(formData); 
      showSnackbar(`Ingredient Category "${newCategory.name}" created.`, 'success');
      navigate('/ingredient-categories'); // Go to list
    } catch (error) {
      console.error('Failed:', error);
      let message = 'An unexpected error occurred.';
      if (error instanceof AxiosError && error.response) { message = error.response.data?.message || error.message; }
       else if (error instanceof Error) { message = error.message; }
      setSubmitError(`Failed: ${message}`);
    } finally { setIsSubmitting(false); }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}> 
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/ingredient-categories">Ingredient Categories</Link> 
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>
      <Typography variant="h4" component="h1" gutterBottom>Create Ingredient Category</Typography>
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
      <IngredientCategoryForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /> 
    </Container>
  );
};
export default CreateIngredientCategoryPage; 