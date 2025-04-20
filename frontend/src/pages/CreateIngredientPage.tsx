import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import IngredientForm, { IngredientFormShape } from '../components/forms/IngredientForm';
import { createIngredient, IngredientFormData } from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

const CreateIngredientPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleFormSubmit = async (formData: IngredientFormShape) => {
    setSubmitError(null);
    setIsSubmitting(true);
    console.log('Received Ingredient form data:', formData);
    
    const payload: IngredientFormData = { 
        name: formData.name,
        description: formData.description || null,
        ingredientCategoryId: formData.ingredientCategoryId 
                                ? parseInt(String(formData.ingredientCategoryId), 10) || null 
                                : null
    };

    console.log('Submitting Ingredient API payload:', payload);

    try {
      const newIngredient = await createIngredient(payload);
      console.log('Ingredient created:', newIngredient);
      showSnackbar(`Ingredient "${newIngredient.name}" created successfully!`, 'success');
      navigate('/ingredients'); 
    } catch (error) {
      console.error('Failed to create ingredient:', error);
      let message = 'An unexpected error occurred while creating the ingredient.';
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
             message = error.response.data?.message || "An ingredient with this name already exists.";
         } else {
            message = error.response.data?.message || error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}> 
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
            KitchenSync
        </Link>
         <Link component={RouterLink} underline="hover" color="inherit" to="/ingredients"> {/* TODO: Update link */} 
            Ingredients
        </Link>
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Create New Ingredient
      </Typography>
      
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <IngredientForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /> 

    </Container>
  );
};

export default CreateIngredientPage; 