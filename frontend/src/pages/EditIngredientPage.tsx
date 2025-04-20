import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import IngredientForm, { IngredientFormShape } from '../components/forms/IngredientForm';
import { getIngredientById, updateIngredient, Ingredient, IngredientFormData } from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

const EditIngredientPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchIngredient = async () => {
      if (!id) {
        setError('No ingredient ID provided for editing');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const ingredientId = parseInt(id, 10);
        if (isNaN(ingredientId)) throw new Error('Invalid ingredient ID format');
        const data = await getIngredientById(ingredientId);
        setIngredient(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load ingredient data for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchIngredient();
  }, [id]);

  const handleFormSubmit = async (formData: IngredientFormShape) => {
    if (!id) return;
    setSubmitError(null);
    setIsSubmitting(true);
    console.log('Received updated Ingredient form data:', formData);
    
    const payload: IngredientFormData = { 
        name: formData.name,
        description: formData.description || null,
        ingredientCategoryId: formData.ingredientCategoryId 
                                ? parseInt(String(formData.ingredientCategoryId), 10) || null 
                                : null
    };

    console.log('Submitting updated Ingredient API payload:', payload);

    try {
      const ingredientId = parseInt(id, 10);
      const updated = await updateIngredient(ingredientId, payload);
      console.log('Ingredient updated:', updated);
      showSnackbar(`Ingredient "${updated.name}" updated successfully!`, 'success');
      navigate('/ingredients'); 
    } catch (error) {
      console.error('Failed to update ingredient:', error);
      let message = 'An unexpected error occurred while updating the ingredient.';
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

  const transformData = (ingredientData: Ingredient | null): Partial<IngredientFormShape> | undefined => {
    if (!ingredientData) return undefined;
    return {
        name: ingredientData.name,
        description: ingredientData.description || '',
        ingredientCategoryId: ingredientData.ingredientCategoryId ?? '' 
    };
  };

  if (loading) {
     return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

   if (!ingredient) {
        return <Alert severity="warning" sx={{ m: 2 }}>Ingredient data not found.</Alert>;
    }

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/ingredients">Ingredients</Link>
        <Typography color="text.primary">Edit: {ingredient.name}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Edit Ingredient: {ingredient.name}
      </Typography>
      
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <IngredientForm 
        onSubmit={handleFormSubmit} 
        isSubmitting={isSubmitting} 
        initialData={transformData(ingredient)} 
      /> 

    </Container>
  );
};

export default EditIngredientPage; 