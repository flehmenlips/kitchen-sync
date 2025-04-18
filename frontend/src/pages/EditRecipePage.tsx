import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import RecipeForm from '../components/forms/RecipeForm';
import { getRecipeById, updateRecipe, Recipe } from '../services/apiService';
import { ProcessedRecipeData, RecipeFormData } from '../components/forms/RecipeForm';
import { AxiosError } from 'axios';

const EditRecipePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError('No recipe ID provided for editing');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const recipeId = parseInt(id, 10);
        if (isNaN(recipeId)) throw new Error('Invalid recipe ID format');
        const data = await getRecipeById(recipeId);
        setRecipe(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load recipe data for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleFormSubmit = async (formData: ProcessedRecipeData) => {
    if (!id) return;
    setSubmitError(null);
    setIsSubmitting(true);
    console.log('Submitting updated data:', formData);
    try {
      const recipeId = parseInt(id, 10);
      const updated = await updateRecipe(recipeId, formData);
      console.log('Recipe updated:', updated);
      navigate(`/recipes/${updated.id}`); // Navigate to detail page after update
    } catch (error) {
      console.error('Failed to update recipe:', error);
      let message = 'An unexpected error occurred.';
      if (error instanceof AxiosError && error.response) {
        message = error.response.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(`Failed to update recipe: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Transform fetched recipe data into the shape RecipeForm expects for initialData
  const transformRecipeToFormData = (recipeData: Recipe | null): Partial<RecipeFormData> | undefined => {
    if (!recipeData) return undefined;
    return {
        name: recipeData.name,
        description: recipeData.description || '',
        yieldQuantity: recipeData.yieldQuantity?.toString() || '',
        yieldUnitId: recipeData.yieldUnit?.id || '',
        prepTimeMinutes: recipeData.prepTimeMinutes?.toString() || '',
        cookTimeMinutes: recipeData.cookTimeMinutes?.toString() || '',
        tags: recipeData.tags?.join(', ') || '',
        instructions: recipeData.instructions || '',
        ingredients: recipeData.recipeIngredients?.map(ing => ({
            // Determine type based on which ID exists
            type: ing.ingredient ? 'ingredient' : (ing.subRecipe ? 'sub-recipe' : ''), 
            ingredientId: ing.ingredient?.id || '',
            subRecipeId: ing.subRecipe?.id || '',
            quantity: ing.quantity.toString(),
            unitId: ing.unit.id || '',
        })) || [{ type: '', ingredientId: '', quantity: '', unitId: '' }] // Ensure default includes type
    };
  };

  // Transform fetched data for the form
  const transformIngredientToFormData = ( /* ... */ ): Partial<IngredientFormData> | undefined => { /* ... */ };
  const initialFormData = transformRecipeToFormData(recipe);
  console.log('Initial data passed to RecipeForm:', initialFormData);

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

   if (!recipe) {
        return <Alert severity="warning" sx={{ m: 2 }}>Recipe data not found.</Alert>;
    }

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/recipes">Recipes</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to={`/recipes/${id}`}>{recipe.name || 'Recipe'}</Link>
        <Typography color="text.primary">Edit</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Edit Recipe: {recipe.name}
      </Typography>
      
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <RecipeForm 
        onSubmit={handleFormSubmit} 
        isSubmitting={isSubmitting} 
        initialData={initialFormData}
      /> 

    </Container>
  );
};

export default EditRecipePage; 