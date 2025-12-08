import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { customerAuthService, RegisterData } from '../../services/customerAuthService';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

interface SignUpDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (registrationData: { email: string; name: string; phone: string }) => void | Promise<void>;
  prefillData?: {
    email?: string;
    name?: string;
    phone?: string;
  };
}

export const SignUpDialog: React.FC<SignUpDialogProps> = ({
  open,
  onClose,
  onSuccess,
  prefillData = {}
}) => {
  const { login: contextLogin } = useCustomerAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: prefillData.email || '',
    password: '',
    name: prefillData.name || '',
    phone: prefillData.phone || ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<RegisterData>>({});
  const prevOpenRef = useRef(false);

  // Update form data only when dialog opens (not on every prefillData change)
  useEffect(() => {
    // Only reset form when dialog transitions from closed to open
    if (open && !prevOpenRef.current && prefillData) {
      setFormData({
        email: prefillData.email || '',
        password: '',
        name: prefillData.name || '',
        phone: prefillData.phone || ''
      });
      setConfirmPassword('');
      setError(null);
      setFieldErrors({});
      setAcceptTerms(false);
    }
    prevOpenRef.current = open;
  }, [open, prefillData]);

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
    
    // Phone validation (optional but recommended)
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // Always set field errors before checking other validations
    // This ensures users see all field-level errors even if there are other issues
    setFieldErrors(errors);
    
    // Confirm password validation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Terms acceptance
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }
    
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
      // Register the user
      await customerAuthService.register(formData);
      
      // Automatically log them in
      await contextLogin(formData.email, formData.password, false);
      
      // Call success callback with the actual registration data used
      // This ensures the reservation uses the same email/name/phone as the account
      await onSuccess({
        email: formData.email,
        name: formData.name,
        phone: formData.phone || ''
      });
      onClose();
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorResponse = err.response?.data;
      let errorMessage = errorResponse?.error || errorResponse?.message || 'Failed to create account. Please try again.';
      
      // Handle email already exists - suggest signing in
      if (errorResponse?.error?.toLowerCase().includes('email') && 
          (errorResponse?.error?.toLowerCase().includes('exists') || 
           errorResponse?.error?.toLowerCase().includes('already'))) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      }
      
      setError(errorMessage);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div">
          Create Account to Complete Reservation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Just one more step! Create an account to confirm your reservation.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '1rem',
                padding: '14px 14px 14px 0',
                minWidth: 0, // Allow input to shrink if needed
              },
              '& .MuiInputBase-root': {
                minHeight: '56px', // Ensure adequate height
              }
            }}
            inputProps={{
              style: {
                minWidth: '200px', // Ensure minimum width for email visibility
              }
            }}
          />

          <TextField
            fullWidth
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            error={!!fieldErrors.phone}
            helperText={fieldErrors.phone || 'For reservation confirmations'}
            margin="normal"
            autoComplete="tel"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon color="action" />
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
            error={!!fieldErrors.password}
            helperText={fieldErrors.password || 'Minimum 8 characters'}
            margin="normal"
            required
            autoComplete="new-password"
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
                onChange={(e) => setAcceptTerms(e.target.checked)}
                color="primary"
                required
              />
            }
            label={
              <Typography variant="body2">
                I agree to the terms and conditions
              </Typography>
            }
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating Account...' : 'Create Account & Confirm Reservation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

