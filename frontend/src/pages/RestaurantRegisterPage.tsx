import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  MenuItem,
  Divider,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useNavigate } from 'react-router-dom';
import { registerRestaurant, checkEmailAvailability } from '../services/restaurantOnboardingService';

const steps = ['Personal Information', 'Restaurant Details', 'Business Information'];

const cuisineTypes = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 
  'Indian', 'French', 'Mediterranean', 'Korean', 'Vietnamese', 'Other'
];

const RestaurantRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [eulaAccepted, setEulaAccepted] = useState(false);
  const [eulaError, setEulaError] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Restaurant Details
    restaurantName: '',
    phone: '',
    cuisineType: '',
    
    // Step 3: Business Information
    address: '',
    city: '',
    state: '',
    zipCode: '',
    seatingCapacity: '',
    operatingHours: ''
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    setFormErrors(prev => ({ ...prev, [name]: '' }));
    
    // Check email availability when email changes
    if (name === 'email' && value && value.includes('@')) {
      checkEmailAvailability(value).then(result => {
        setEmailAvailable(result.available);
        if (!result.available) {
          setFormErrors(prev => ({ ...prev, email: result.message }));
        }
      }).catch(() => {
        // Ignore email check errors
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (step) {
      case 0: // Personal Information
        if (!formData.ownerName.trim()) errors.ownerName = 'Name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
        else if (emailAvailable === false) errors.email = 'This email is already registered';
        if (!formData.password) errors.password = 'Password is required';
        else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
        break;
        
      case 1: // Restaurant Details
        if (!formData.restaurantName.trim()) errors.restaurantName = 'Restaurant name is required';
        if (!formData.phone.trim()) errors.phone = 'Phone number is required';
        if (!formData.cuisineType) errors.cuisineType = 'Cuisine type is required';
        break;
        
      case 2: // Business Information
        if (!formData.address.trim()) errors.address = 'Address is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.state.trim()) errors.state = 'State is required';
        if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required';
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;
    if (!eulaAccepted) {
      setEulaError('You must agree to the End User License Agreement (EULA) to create an account.');
      return;
    }
    setEulaError('');
    setLoading(true);
    setError(null);
    
    try {
      const registrationData = {
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
        restaurantName: formData.restaurantName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        cuisineType: formData.cuisineType,
        seatingCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : undefined,
        operatingHours: formData.operatingHours
      };
      
      const response = await registerRestaurant(registrationData);
      
      // Check if email verification is required
      if (response.requiresVerification) {
        // Navigate to email verification sent page
        navigate('/verify-email-sent');
      } else {
        // Old flow for backward compatibility
        const userInfo = {
          user: response.user,
          token: response.user.token
        };
        localStorage.setItem('kitchenSyncUserInfo', JSON.stringify(userInfo));
        navigate('/welcome');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                error={!!formErrors.ownerName}
                helperText={formErrors.ownerName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
                InputProps={{
                  endAdornment: emailAvailable === true ? (
                    <InputAdornment position="end">
                      <Typography color="success.main" variant="caption">✓ Available</Typography>
                    </InputAdornment>
                  ) : null
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                required
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Restaurant Name"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                error={!!formErrors.restaurantName}
                helperText={formErrors.restaurantName}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                required
                placeholder="(555) 123-4567"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Cuisine Type"
                name="cuisineType"
                value={formData.cuisineType}
                onChange={handleChange}
                error={!!formErrors.cuisineType}
                helperText={formErrors.cuisineType}
                required
              >
                {cuisineTypes.map(type => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                error={!!formErrors.city}
                helperText={formErrors.city}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={!!formErrors.state}
                helperText={formErrors.state}
                required
                inputProps={{ maxLength: 2 }}
                placeholder="CA"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                error={!!formErrors.zipCode}
                helperText={formErrors.zipCode}
                required
                placeholder="12345"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Optional Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Seating Capacity"
                name="seatingCapacity"
                type="number"
                value={formData.seatingCapacity}
                onChange={handleChange}
                placeholder="50"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Operating Hours"
                name="operatingHours"
                value={formData.operatingHours}
                onChange={handleChange}
                placeholder="Mon-Fri 11am-10pm"
              />
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <RestaurantIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Register Your Restaurant
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join KitchenSync and start your 14-day free trial
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          {renderStepContent(activeStep)}
          {activeStep === steps.length - 1 && (
            <div style={{ margin: '2em 0 1em 0' }}>
              <label>
                <input
                  type="checkbox"
                  checked={eulaAccepted}
                  onChange={e => setEulaAccepted(e.target.checked)}
                  required
                />
                {' '}I have read and agree to the{' '}
                <a href="/eula.html" target="_blank" rel="noopener noreferrer">End User License Agreement (EULA)</a>
              </label>
              {eulaError && <div style={{ color: 'red', marginTop: '0.5em' }}>{eulaError}</div>}
            </div>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none' }}
            >
              Sign In
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RestaurantRegisterPage; 