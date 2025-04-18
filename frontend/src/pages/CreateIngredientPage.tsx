import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import IngredientForm from '../components/forms/IngredientForm';
import { createIngredient } from '../services/apiService';
import { AxiosError } from 'axios';

// Define the type for the processed form data expected by onSubmit
interface ProcessedIngredientFormData {
    name: string;
    description: string | null;
}

const CreateIngredientPage: React.FC = () => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleFormSubmit = async (formData: ProcessedIngredientFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    console.log('Submitting Ingredient data:', formData);

    try {
      const newIngredient = await createIngredient(formData); 
      console.log('Ingredient created:', newIngredient);
      // Navigate back to the (yet to be created) ingredients list page
      // For now, navigate back to recipes as a placeholder
      navigate('/recipes'); // TODO: Change to /ingredients when list page exists
    } catch (error) {
      console.error('Failed to create ingredient:', error);
      let message = 'An unexpected error occurred.';
      if (error instanceof AxiosError && error.response) {
        message = error.response.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(`Failed to create ingredient: ${message}`);
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