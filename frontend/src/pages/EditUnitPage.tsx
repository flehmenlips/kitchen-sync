import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import UnitForm, { UnitFormShape } from '../components/forms/UnitForm';
import { getUnitById, updateUnit, UnitOfMeasure, UnitFormData } from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';
import { AxiosError } from 'axios';

const EditUnitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<UnitOfMeasure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUnit = async () => {
      if (!id) {
        setError('No unit ID provided for editing');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const unitId = parseInt(id, 10);
        if (isNaN(unitId)) throw new Error('Invalid unit ID format');
        const data = await getUnitById(unitId);
        setUnit(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load unit data for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  const handleFormSubmit = async (formData: UnitFormShape) => {
    if (!id) return;
    setSubmitError(null);
    setIsSubmitting(true);
    console.log('Received updated Unit form data:', formData);
    
    const payload: UnitFormData = {
        name: formData.name,
        abbreviation: formData.abbreviation || null,
        type: formData.type || null
    };

    console.log('Submitting updated Unit API payload:', payload);

    try {
      const unitId = parseInt(id, 10);
      const updated = await updateUnit(unitId, payload);
      console.log('Unit updated:', updated);
      showSnackbar(`Unit "${updated.name}" updated successfully!`, 'success');
      navigate('/units'); 
    } catch (error) {
      console.error('Failed to update unit:', error);
      let message = 'An unexpected error occurred while updating the unit.';
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

  const transformUnitToFormData = (unitData: UnitOfMeasure | null): Partial<UnitFormShape> | undefined => {
    if (!unitData) return undefined;
    return {
        name: unitData.name,
        abbreviation: unitData.abbreviation ?? '',
        type: unitData.type ?? ''
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

   if (!unit) {
        return <Alert severity="warning" sx={{ m: 2 }}>Unit data not found.</Alert>;
    }

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">KitchenSync</Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/units">Units</Link>
        <Typography color="text.primary">Edit: {unit.name}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom>
        Edit Unit: {unit.name}
      </Typography>
      
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}

      <UnitForm 
        onSubmit={handleFormSubmit} 
        isSubmitting={isSubmitting} 
        initialData={transformUnitToFormData(unit)} 
      /> 

    </Container>
  );
};

export default EditUnitPage; 