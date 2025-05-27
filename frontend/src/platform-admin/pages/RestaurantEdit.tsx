import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import restaurantService, { Restaurant } from '../services/restaurantService';

const RestaurantEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    ownerName: '',
    ownerEmail: '',
    businessPhone: '',
    website: '',
    description: '',
    cuisine: '',
    onboardingStatus: '',
  });

  useEffect(() => {
    if (id) {
      loadRestaurant();
    }
  }, [id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurant(Number(id));
      setRestaurant(data.restaurant);
      setFormData({
        name: data.restaurant.name || '',
        email: data.restaurant.email || '',
        phone: data.restaurant.phone || '',
        address: data.restaurant.address || '',
        city: data.restaurant.city || '',
        state: data.restaurant.state || '',
        zipCode: data.restaurant.zipCode || '',
        country: data.restaurant.country || 'US',
        ownerName: data.restaurant.ownerName || '',
        ownerEmail: data.restaurant.ownerEmail || '',
        businessPhone: data.restaurant.businessPhone || '',
        website: data.restaurant.website || '',
        description: data.restaurant.description || '',
        cuisine: data.restaurant.cuisine || '',
        onboardingStatus: data.restaurant.onboardingStatus || '',
      });
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      setError('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (event: any) => {
    setFormData(prev => ({ ...prev, [name]: event.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await restaurantService.updateRestaurant(Number(id), formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/platform-admin/restaurants/${id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update restaurant:', error);
      setError(error.response?.data?.error || 'Failed to update restaurant');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!restaurant) {
    return (
      <Box>
        <Alert severity="error">Restaurant not found</Alert>
        <Button onClick={() => navigate('/platform-admin/restaurants')} sx={{ mt: 2 }}>
          Back to Restaurants
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(`/platform-admin/restaurants/${id}`)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Edit Restaurant: {restaurant.name}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Restaurant updated successfully! Redirecting...
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Restaurant Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
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
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cuisine Type"
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.onboardingStatus}
                        onChange={handleSelectChange('onboardingStatus')}
                        label="Status"
                      >
                        <MenuItem value="PENDING">Pending</MenuItem>
                        <MenuItem value="EMAIL_VERIFIED">Email Verified</MenuItem>
                        <MenuItem value="INFO_SUBMITTED">Info Submitted</MenuItem>
                        <MenuItem value="PAYMENT_ADDED">Payment Added</MenuItem>
                        <MenuItem value="VERIFIED">Verified</MenuItem>
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="REJECTED">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={3}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Location
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Zip Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Owner Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Owner Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Owner Name"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Owner Email"
                      name="ownerEmail"
                      type="email"
                      value={formData.ownerEmail}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Phone"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={() => navigate(`/platform-admin/restaurants/${id}`)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default RestaurantEdit; 