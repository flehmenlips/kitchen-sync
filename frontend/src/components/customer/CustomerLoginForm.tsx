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
  Checkbox,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { LoginData } from '../../services/customerAuthService';
import { buildCustomerUrl } from '../../utils/subdomain';
import { restaurantSettingsService, RestaurantSettings } from '../../services/restaurantSettingsService';

interface CustomerLoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const CustomerLoginForm: React.FC<CustomerLoginFormProps> = ({ 
  onSuccess, 
  redirectTo = buildCustomerUrl()
}) => {
  const navigate = useNavigate();
  const { login: contextLogin } = useCustomerAuth();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      await contextLogin(formData.email, formData.password, formData.rememberMe);
      
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          navigate(redirectTo);
        }, 100);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof LoginData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [field]: value });
    setError(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign In
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" mb={3}>
          Welcome back to {restaurantSettings?.websiteName || restaurantSettings?.restaurant?.name || 'our restaurant'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          margin="normal"
          required
          autoComplete="email"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange('password')}
          margin="normal"
          required
          autoComplete="current-password"
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
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rememberMe}
                onChange={handleChange('rememberMe')}
                color="primary"
              />
            }
            label="Remember me"
          />
          
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              navigate(buildCustomerUrl('forgot-password'));
            }}
          >
            Forgot password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 2, mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={() => navigate(buildCustomerUrl('reservations/new'))}
          sx={{ mb: 2 }}
        >
          Continue as Guest
        </Button>

        <Typography variant="body2" align="center">
          Don't have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault();
              navigate(buildCustomerUrl('register'));
            }}
          >
            Create Account
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}; 