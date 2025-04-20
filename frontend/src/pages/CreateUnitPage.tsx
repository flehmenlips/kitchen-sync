import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import UnitForm, { UnitFormShape } from '../components/forms/UnitForm';
import { createUnit, UnitFormData } from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

const CreateUnitPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleFormSubmit = async (formData: UnitFormShape) => {
    setSubmitError(null);
    setIsSubmitting(true);
    console.log('Received Unit form data:', formData);
    
    // Process formData (UnitFormShape) into payload (UnitFormData)
    const payload: UnitFormData = { 
        name: formData.name,
        abbreviation: formData.abbreviation || null, // Convert empty string to null
        type: formData.type || null // Convert empty string to null
    };

    console.log('Submitting Unit API payload:', payload);

    try {
      const newUnit = await createUnit(payload); 
      console.log('Unit created:', newUnit);
      showSnackbar(`Unit "${newUnit.name}" created successfully!`, 'success');
      navigate('/units'); 
    } catch (error) {
      console.error('Failed to create unit:', error);
      let message = 'An unexpected error occurred while creating the unit.';
      if (error instanceof AxiosError && error.response) {
        if (error.response.status === 409) {
            message = error.response.data?.message || "An item with this name or abbreviation already exists.";
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
    <Container maxWidth="sm" sx={{ mt: 2 }}> {/* Smaller container for simpler form */} 
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
            KitchenSync
        </Link>
         <Link component={RouterLink} underline="hover" color="inherit" to="/units"> {/* TODO: Update link when list page exists */} 
            Units
        </Link>
        <Typography color="text.primary">Create New</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Create New Unit of Measure
      </Typography>
      
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <UnitForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} /> 

    </Container>
  );
};

export default CreateUnitPage; 