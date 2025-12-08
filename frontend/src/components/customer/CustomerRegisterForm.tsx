import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Paper,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { customerAuthService, RegisterData } from '../../services/customerAuthService';
import { useMobileResponsive, mobileResponsiveStyles } from '../../utils/mobileUtils';
import { restaurantSettingsService, RestaurantSettings } from '../../services/restaurantSettingsService';

interface CustomerRegisterFormProps {
  onSuccess?: () => void;
}

export const CustomerRegisterForm: React.FC<CustomerRegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { isMobile } = useMobileResponsive();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<RegisterData>>({});
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await restaurantSettingsService.getPublicSettings();
        setRestaurantSettings(settings);
      } catch (error) {
        console.error('Error fetching restaurant settings:', error);
        // Continue without settings - will use fallback
      }
    };
    fetchSettings();
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<RegisterData> = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    // Name validation
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Phone validation (optional)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Terms acceptance
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await customerAuthService.register(formData);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/customer/verify-email-sent');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    setFieldErrors({ ...fieldErrors, [field]: undefined });
    setError(null);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{
        ...mobileResponsiveStyles.card(isMobile),
        maxWidth: isMobile ? '100%' : 500,
        mx: isMobile ? 0 : 'auto',
        p: isMobile ? 3 : 4,
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          align="center"
          sx={mobileResponsiveStyles.typography.h4}
        >
          Create Account
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center" 
          mb={3}
          sx={mobileResponsiveStyles.typography.body2}
        >
          Join {restaurantSettings?.websiteName || restaurantSettings?.restaurant?.name || 'our restaurant'} for easy online reservations
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Full Name"
          value={formData.name}
          onChange={handleChange('name')}
          error={!!fieldErrors.name}
          helperText={fieldErrors.name}
          margin="normal"
          required
          autoComplete="name"
          sx={mobileResponsiveStyles.textField(isMobile)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          error={!!fieldErrors.email}
          helperText={fieldErrors.email}
          margin="normal"
          required
          autoComplete="email"
          sx={(() => {
            const mobileTextFieldStyles = mobileResponsiveStyles.textField(isMobile);
            const mobileInputStyles = mobileTextFieldStyles['& .MuiInputBase-input'];
            return {
              ...mobileTextFieldStyles,
              '& .MuiInputBase-input': {
                ...mobileInputStyles,
                // Preserve mobile fontSize to prevent iOS zoom, but use 1rem as fallback
                fontSize: isMobile ? mobileInputStyles.fontSize : '1rem',
                padding: '14px 14px 14px 0',
                minWidth: 0,
              },
              '& .MuiInputBase-root': {
                minHeight: '56px',
              }
            };
          })()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
          inputProps={{
            style: {
              minWidth: '200px',
            }
          }}
        />

        <TextField
          fullWidth
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value;
            // Prevent email addresses from being entered in phone field
            if (!value.includes('@')) {
              handleChange('phone')(e);
            }
          }}
          error={!!fieldErrors.phone}
          helperText={fieldErrors.phone || 'Optional - for reservation confirmations'}
          margin="normal"
          autoComplete="tel"
          placeholder="(555) 123-4567"
          sx={mobileResponsiveStyles.textField(isMobile)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon color="action" />
              </InputAdornment>
            ),
          }}
          inputProps={{
            inputMode: 'tel',
            pattern: '[0-9\\s\\-\\(\\)\\+]*',
            maxLength: 20
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange('password')}
          error={!!fieldErrors.password}
          helperText={fieldErrors.password || 'At least 8 characters'}
          margin="normal"
          required
          autoComplete="new-password"
          sx={mobileResponsiveStyles.textField(isMobile)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={mobileResponsiveStyles.iconButton(isMobile)}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError(null);
          }}
          margin="normal"
          required
          autoComplete="new-password"
          sx={mobileResponsiveStyles.textField(isMobile)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  sx={mobileResponsiveStyles.iconButton(isMobile)}
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                setError(null);
              }}
              color="primary"
              sx={mobileResponsiveStyles.iconButton(isMobile)}
            />
          }
          label={
            <Typography variant="body2" sx={mobileResponsiveStyles.typography.body2}>
              I accept the{' '}
              <Link href="/terms" target="_blank">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank">
                Privacy Policy
              </Link>
            </Typography>
          }
          sx={{ mt: 2, mb: 2 }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size={isMobile ? "large" : "large"}
          disabled={loading}
          sx={{
            ...mobileResponsiveStyles.button(isMobile),
            mt: 2,
            mb: 2,
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Account'}
        </Button>

        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              navigate('/customer/login');
            }}
          >
            Sign In
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}; 