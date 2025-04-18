import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import CategoryForm from '../components/forms/CategoryForm';
import { getCategoryById, updateCategory, Category, CategoryFormData } from '../services/apiService'; // Need getCategoryById
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

// Processed form data type
interface ProcessedCategoryFormData {
    name: string;
    description: string | null;
}

const EditCategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) {
        setError('No category ID provided for editing');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const categoryId = parseInt(id, 10);
        if (isNaN(categoryId)) throw new Error('Invalid category ID format');
        // We need getCategoryById in apiService
        const data = await getCategoryById(categoryId); 
        setCategory(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load category data for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  const handleFormSubmit = async (formData: ProcessedCategoryFormData) => {
    if (!id) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const categoryId = parseInt(id, 10);
      const updated = await updateCategory(categoryId, formData);
      showSnackbar(`Category "${updated.name}" updated successfully!`, 'success');
      navigate('/categories'); 
    } catch (error) {
      console.error('Failed to update category:', error);
      let message = 'An unexpected error occurred.';
      if (error instanceof AxiosError && error.response) {
        message = error.response.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(`Failed to update category: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

   // Transform fetched data for the form
   const transformCategoryToFormData = (catData: Category | null): Partial<CategoryFormData> | undefined => {
    if (!catData) return undefined;
    return {
        name: catData.name,
        description: catData.description || '' // Form expects string or null
    };
  };

  if (loading) { /* ... loading spinner ... */}
  if (error) { /* ... error alert ... */}
  if (!category) { /* ... not found alert ... */}

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/categories">Categories</Link>
        <Typography color="text.primary">Edit: {category?.name || '...'}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Edit Category: {category?.name}
      </Typography>
      
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <CategoryForm 
        onSubmit={handleFormSubmit} 
        isSubmitting={isSubmitting} 
        initialData={transformCategoryToFormData(category)} 
      /> 

    </Container>
  );
};

export default EditCategoryPage; 