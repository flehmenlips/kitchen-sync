import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CategoryForm, { CategoryFormShape } from '../components/forms/CategoryForm';
import { createCategory, CategoryFormData } from '../services/apiService';
import { AxiosError } from 'axios';

const CreateCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar(); // Assuming Snackbar context is setup
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleFormSubmit = async (formData: CategoryFormShape) => {
    setSubmitError(null);
    setIsSubmitting(true);

    // Process form shape into API data type
    const payload: CategoryFormData = {
        name: formData.name,
        description: formData.description || null // Convert empty string to null
    };

    try {
      const newCategory = await createCategory(payload); // Pass processed payload
      showSnackbar(`Category "${newCategory.name}" created successfully!`, 'success');
      navigate('/categories'); // Navigate to category list
    } catch (error) {
      console.error('Failed to create category:', error);
      let message = 'An unexpected error occurred while creating the category.';
      if (error instanceof AxiosError && error.response) {
        // Check for 409 Conflict
        if (error.response.status === 409) {
            message = error.response.data?.message || "A category with this name already exists.";
        } else {
        message = error.response.data?.message || error.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(message); // Set user-friendly message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}> 
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/categories">Categories</Link> 
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Create New Category
      </Typography>
      
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <CategoryForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /> 

    </Container>
  );
};

// Need to import useSnackbar or handle feedback differently
import { useSnackbar } from '../context/SnackbarContext'; 

export default CreateCategoryPage; 