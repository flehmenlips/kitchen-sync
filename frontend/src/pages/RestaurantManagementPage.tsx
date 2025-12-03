import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  Link as MuiLink,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Restaurant as RestaurantIcon,
  Event as EventIcon,
  Web as WebIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { restaurantInfoService, RestaurantInfo } from '../services/restaurantInfoService';
import { useSnackbar } from '../context/SnackbarContext';

const RestaurantManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    phone: '',
    email: '',
    website: '',
    description: '',
    cuisine: '',
    ownerName: '',
    ownerEmail: '',
    businessPhone: '',
    businessAddress: '',
  });

  useEffect(() => {
    loadRestaurantInfo();
  }, []);

  const loadRestaurantInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await restaurantInfoService.getRestaurantInfo();
      setRestaurantInfo(info);
      setFormData({
        name: info.name || '',
        address: info.address || '',
        city: info.city || '',
        state: info.state || '',
        zipCode: info.zipCode || '',
        country: info.country || 'US',
        phone: info.phone || '',
        email: info.email || '',
        website: info.website || '',
        description: info.description || '',
        cuisine: info.cuisine || '',
        ownerName: info.ownerName || '',
        ownerEmail: info.ownerEmail || '',
        businessPhone: info.businessPhone || '',
        businessAddress: info.businessAddress || '',
      });
    } catch (err: any) {
      console.error('Failed to load restaurant info:', err);
      setError(err.response?.data?.error || 'Failed to load restaurant information');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const updated = await restaurantInfoService.updateRestaurantInfo(formData);
      setRestaurantInfo(updated);
      showSnackbar('Restaurant information updated successfully', 'success');
    } catch (err: any) {
      console.error('Failed to update restaurant info:', err);
      setError(err.response?.data?.error || 'Failed to update restaurant information');
      showSnackbar('Failed to update restaurant information', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWebsiteBuilderToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    try {
      setSaving(true);
      setError(null);
      const updated = await restaurantInfoService.updateRestaurantInfo({
        website_builder_enabled: enabled
      });
      setRestaurantInfo(updated);
      showSnackbar(
        enabled 
          ? 'Website Builder enabled successfully' 
          : 'Website Builder disabled successfully',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to toggle website builder:', err);
      setError(err.response?.data?.error || 'Failed to update website builder status');
      showSnackbar('Failed to update website builder status', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Restaurant Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Module Integration Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RestaurantIcon color="primary" />
                Module Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                All modules are automatically tied to your restaurant. Manage your restaurant information here,
                and it will be used across all modules.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EventIcon color={restaurantInfo?.modules?.reservations?.enabled ? 'success' : 'disabled'} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      TableFarm Reservations
                    </Typography>
                    {restaurantInfo?.modules?.reservations?.enabled ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Connected"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<CancelIcon />}
                        label="Not Configured"
                        color="default"
                        size="small"
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Restaurant: {restaurantInfo?.name || 'N/A'}
                  </Typography>
                  <MuiLink
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/tablefarm')}
                    sx={{ ml: 4, mt: 0.5 }}
                  >
                    Configure Reservation Settings →
                  </MuiLink>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <WebIcon color={restaurantInfo?.modules?.websiteBuilder?.enabled ? 'success' : 'disabled'} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Website Builder
                    </Typography>
                    {restaurantInfo?.modules?.websiteBuilder?.enabled ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Enabled"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<CancelIcon />}
                        label="Disabled"
                        color="default"
                        size="small"
                      />
                    )}
                  </Box>
                  <Box sx={{ ml: 4, mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={restaurantInfo?.modules?.websiteBuilder?.enabled || false}
                          onChange={handleWebsiteBuilderToggle}
                          disabled={saving}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {restaurantInfo?.modules?.websiteBuilder?.enabled 
                            ? 'Website Builder is enabled' 
                            : 'Enable Website Builder'}
                        </Typography>
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Restaurant: {restaurantInfo?.name || 'N/A'}
                  </Typography>
                  {restaurantInfo?.modules?.websiteBuilder?.enabled && (
                    <MuiLink
                      component="button"
                      variant="body2"
                      onClick={() => navigate('/website')}
                      sx={{ ml: 4, mt: 0.5 }}
                    >
                      Open Website Builder →
                    </MuiLink>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Restaurant Information Form */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RestaurantIcon color="primary" />
                Restaurant Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Update your restaurant's basic information. This information will be used across all modules.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {/* Basic Information */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                      Basic Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Restaurant Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cuisine Type"
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleChange}
                      placeholder="e.g., Italian, Mexican, American"
                      variant="outlined"
                    />
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
                      placeholder="Tell customers about your restaurant..."
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                      Contact Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="outlined"
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
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourrestaurant.com"
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                      Address
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                      Business Owner Information (Optional)
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Owner Name"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      variant="outlined"
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
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Phone"
                      name="businessPhone"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Business Address"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleChange}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => loadRestaurantInfo()}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RestaurantManagementPage;

