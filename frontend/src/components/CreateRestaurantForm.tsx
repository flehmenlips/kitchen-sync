import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { Restaurant as RestaurantIcon, Save as SaveIcon } from '@mui/icons-material';
import apiService from '../services/apiService';
import { useSnackbar } from '../context/SnackbarContext';
import { useRestaurant } from '../context/RestaurantContext';

const cuisineTypes = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 
  'Indian', 'French', 'Mediterranean', 'Korean', 'Vietnamese', 'Other'
];

interface CreateRestaurantFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateRestaurantForm: React.FC<CreateRestaurantFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { showSnackbar } = useSnackbar();
  const { refreshRestaurants } = useRestaurant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    cuisine: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      setError(null);
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting restaurant creation with data:', formData);
      const response = await apiService.post('/restaurants', formData);
      console.log('Restaurant created successfully:', response);
      
      showSnackbar('Restaurant created successfully!', 'success');
      
      // Refresh restaurant list
      await refreshRestaurants();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating restaurant:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create restaurant. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <RestaurantIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h5" fontWeight="bold">
          Create Your Restaurant
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Restaurant Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., The Golden Fork"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="restaurant@example.com"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Cuisine Type"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleSelectChange}
            >
              <MenuItem value="">
                <em>Select cuisine type</em>
              </MenuItem>
              {cuisineTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="NY"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="10001"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your restaurant..."
            />
          </Grid>
        </Grid>

        <Box display="flex" gap={2} mt={4}>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
            sx={{ flex: 1 }}
          >
            {loading ? 'Creating...' : 'Create Restaurant'}
          </Button>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
};

export default CreateRestaurantForm;

