import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import RecipeForm from '../components/forms/RecipeForm';
import { createRecipe } from '../services/apiService';
import { ProcessedRecipeData } from '../components/forms/RecipeForm';
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

const CreateRecipePage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleFormSubmit = async (formData: ProcessedRecipeData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    console.log('Submitting processed data:', formData);
    try {
      const newRecipe = await createRecipe(formData);
      console.log('Recipe created:', newRecipe);
      showSnackbar(`Recipe "${newRecipe.name}" created successfully!`, 'success');
      navigate(`/recipes/${newRecipe.id}`);
    } catch (error) {
      console.error('Failed to create recipe:', error);
      let message = 'An unexpected error occurred.';
      if (error instanceof AxiosError && error.response) {
        message = error.response.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(`Failed to create recipe: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
            KitchenSync
        </Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/recipes">
            Recipes
        </Link>
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Create New Recipe
      </Typography>
      
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <RecipeForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />

    </Container>
  );
};

export default CreateRecipePage; 