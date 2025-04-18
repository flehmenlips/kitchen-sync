import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import UnitForm from '../components/forms/UnitForm';
import { createUnit, UnitFormData } from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

// Define the type for the processed form data expected by onSubmit
interface ProcessedUnitFormData {
    name: string;
    abbreviation: string | null;
    type: string | null;
}

const CreateUnitPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const handleFormSubmit = async (formData: ProcessedUnitFormData) => {
    setSubmitError(null);
    setIsSubmitting(true);
    console.log('Submitting Unit data:', formData);
    
    // Payload is already processed by the form's internal handler
    const payload = formData; 

    try {
      const newUnit = await createUnit(payload); 
      console.log('Unit created:', newUnit);
      showSnackbar(`Unit "${newUnit.name}" created successfully!`, 'success');
      navigate('/units'); 
    } catch (error) {
      console.error('Failed to create unit:', error);
      let message = 'An unexpected error occurred.';
      if (error instanceof AxiosError && error.response) {
        message = error.response.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(`Failed to create unit: ${message}`);
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