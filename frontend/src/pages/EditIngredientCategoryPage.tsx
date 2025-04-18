// frontend/src/pages/EditIngredientCategoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import IngredientCategoryForm from '../components/forms/IngredientCategoryForm';
import { getIngredientCategoryById, updateIngredientCategory, IngredientCategory, IngredientCategoryFormData } from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

const EditIngredientCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [category, setCategory] = useState<IngredientCategory | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) { setError('No ID provided'); setLoading(false); return; }
      try {
        setLoading(true);
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) throw new Error('Invalid ID');
        const data = await getIngredientCategoryById(categoryId);
        setCategory(data);
        setError(null);
      } catch (err: any) { setError(err.message || 'Failed to load data.'); }
       finally { setLoading(false); }
    };
    fetchCategory();
  }, [id]);

  const handleFormSubmit = async (formData: IngredientCategoryFormData) => {
    if (!id) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const categoryId = parseInt(id, 10);
      const updated = await updateIngredientCategory(categoryId, formData);
      showSnackbar(`Ingredient Category "${updated.name}" updated.`, 'success');
      navigate('/ingredient-categories');
    } catch (error) {
      console.error('Failed:', error);
      let message = 'Update failed.';
      if (error instanceof AxiosError && error.response) { message = error.response.data?.message || error.message; }
       else if (error instanceof Error) { message = error.message; }
      setSubmitError(`Failed: ${message}`);
    } finally { setIsSubmitting(false); }
  };

   const transformData = (catData: IngredientCategory | null): Partial<IngredientCategoryFormData> | undefined => {
    if (!catData) return undefined;
    return { name: catData.name, description: catData.description || '' };
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center'}}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!category) return <Alert severity="warning">Category not found.</Alert>;

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/ingredient-categories">Ingredient Categories</Link>
        <Typography color="text.primary">Edit: {category.name}</Typography>
      </Breadcrumbs>
      <Typography variant="h4" component="h1" gutterBottom>Edit Ingredient Category</Typography>
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
      <IngredientCategoryForm 
        onSubmit={handleFormSubmit} 
        isSubmitting={isSubmitting} 
        initialData={transformData(category)} 
      /> 
    </Container>
  );
};
export default EditIngredientCategoryPage; 