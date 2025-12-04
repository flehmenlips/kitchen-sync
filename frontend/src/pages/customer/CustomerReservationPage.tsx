import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Notes as NotesIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, addDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { customerReservationService, ReservationFormData } from '../../services/customerReservationService';
import { restaurantSettingsService, RestaurantSettings } from '../../services/restaurantSettingsService';
import { getCurrentRestaurantSlug, buildCustomerUrl } from '../../utils/subdomain';
import { useSnackbar } from 'notistack';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { customerAuthService } from '../../services/customerAuthService';
import { Link } from '@mui/material';

interface FormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: string;
  reservationDate: Date | null;
  reservationTime: string;
  specialRequests: string;
}

const CustomerReservationPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading: authLoading } = useCustomerAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
  }>({});
  
  const [formData, setFormData] = useState<FormData>({
    customerName: user?.name || '',
    customerPhone: '', // Phone not available in user object yet
    customerEmail: user?.email || '',
    partySize: '2',
    reservationDate: null,
    reservationTime: '',
    specialRequests: ''
  });

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email || !email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone || !phone.trim()) {
      return 'Phone number is required';
    }
    // Prevent email addresses - check before other validations to provide specific error message
    if (phone.includes('@')) {
      return 'Please enter a valid phone number, not an email address';
    }
    // Remove common formatting characters for validation
    const cleanedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    // Check if it contains only digits and has reasonable length (7-15 digits)
    if (!/^\d+$/.test(cleanedPhone)) {
      return 'Please enter a valid phone number (digits only, with optional formatting)';
    }
    if (cleanedPhone.length < 7 || cleanedPhone.length > 15) {
      return 'Phone number must be between 7 and 15 digits';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};
    
    // Validate name
    if (!formData.customerName || !formData.customerName.trim()) {
      errors.customerName = 'Name is required';
    }
    
    // Validate email
    const emailError = validateEmail(formData.customerEmail);
    if (emailError) {
      errors.customerEmail = emailError;
    }
    
    // Validate phone
    const phoneError = validatePhone(formData.customerPhone);
    if (phoneError) {
      errors.customerPhone = phoneError;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const steps = ['Select Date & Time', 'Confirmation'];

  // Check authentication on mount
  useEffect(() => {
    if (!authLoading && !user) {
      // User not authenticated - show message but allow them to see the form
      // They'll be blocked when trying to submit
    }
  }, [user, authLoading]);

  // Fetch customer profile to get phone number, name, and email
  useEffect(() => {
    let isMounted = true;
    const currentUserId = user?.id; // Capture current user ID to check against stale responses
    
    const fetchProfile = async () => {
      if (user) {
        try {
          const profile = await customerAuthService.getProfile();
          // Only update state if component is still mounted and user hasn't changed
          if (isMounted && currentUserId === user?.id) {
            const phoneNumber = profile?.user?.phone;
            const profileName = profile?.user?.name;
            const profileEmail = profile?.user?.email;
            
            setFormData(prev => ({
              ...prev,
              customerPhone: prev.customerPhone || phoneNumber || '',
              customerName: prev.customerName || profileName || '',
              customerEmail: prev.customerEmail || profileEmail || ''
            }));
          }
        } catch (error) {
          // Silently fail - profile data is optional
          if (isMounted && currentUserId === user?.id) {
            console.error('Failed to fetch profile:', error);
          }
        }
      }
    };
    fetchProfile();
    
    // Cleanup function to prevent stale responses from updating state
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail
      }));
    }
  }, [user]);

  // Fetch restaurant settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await restaurantSettingsService.getPublicSettings();
        setRestaurantSettings(settings);
        
        // Update party size if reservation settings have a minimum
        if (settings.reservationSettings?.minPartySize) {
          const minSize = settings.reservationSettings.minPartySize;
          setFormData(prev => ({
            ...prev,
            partySize: Math.max(parseInt(prev.partySize) || minSize, minSize).toString()
          }));
        }
      } catch (error) {
        console.error('Error fetching restaurant settings:', error);
        // Continue with default time slots if fetch fails
      }
    };
    fetchSettings();
  }, []);

  // Generate default time slots (fallback)
  const generateDefaultTimeSlots = (): string[] => {
    const slots = [];
    for (let hour = 11; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Generate time slots based on selected date and operating hours
  const generateTimeSlots = (date: Date | null): string[] => {
    if (!date) {
      return generateDefaultTimeSlots();
    }

    // If no restaurant settings or no opening hours, use default
    if (!restaurantSettings?.openingHours || typeof restaurantSettings.openingHours !== 'object') {
      return generateDefaultTimeSlots();
    }

    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const operatingHours = restaurantSettings.openingHours;
    const dayHours = operatingHours[dayName];

    // If day is closed or no hours configured, return empty array
    if (!dayHours || dayHours.closed || !dayHours.open || !dayHours.close) {
      return [];
    }

    const { open, close } = dayHours;
    const interval = 30; // 30-minute intervals

    // Parse times and generate slots
    const [openHour, openMin] = open.split(':').map(Number);
    const [closeHour, closeMin] = close.split(':').map(Number);
    const startMinutes = openHour * 60 + openMin;
    let endMinutes = closeHour * 60 + closeMin;

    const slots: string[] = [];
    let currentMinutes = startMinutes;

    // Handle midnight crossing - if end time is earlier than start time,
    // it means the end time is the next day (e.g., 20:00 to 02:00)
    const crossesMidnight = endMinutes <= startMinutes;
    
    if (crossesMidnight) {
      // Generate slots from start time to end of day (23:59)
      const endOfDay = 24 * 60; // 1440 minutes
      while (currentMinutes < endOfDay) {
        const hour = Math.floor(currentMinutes / 60);
        const minute = currentMinutes % 60;
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        currentMinutes += interval;
      }
      
      // Generate slots from start of next day (00:00) to end time
      currentMinutes = 0;
      while (currentMinutes <= endMinutes) {
        const hour = Math.floor(currentMinutes / 60);
        const minute = currentMinutes % 60;
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        currentMinutes += interval;
      }
    } else {
      // Normal case: end time is after start time on the same day
      while (currentMinutes <= endMinutes) {
        const hour = Math.floor(currentMinutes / 60);
        const minute = currentMinutes % 60;
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        currentMinutes += interval;
      }
    }

    return slots;
  };

  // Get time slots for the selected date
  const timeSlots = generateTimeSlots(formData.reservationDate);

  // Check if a date should be disabled (restaurant is closed)
  const shouldDisableDate = (date: Date): boolean => {
    if (!restaurantSettings?.openingHours || typeof restaurantSettings.openingHours !== 'object') {
      return false; // Don't disable if we don't have operating hours
    }

    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const operatingHours = restaurantSettings.openingHours;
    const dayHours = operatingHours[dayName];

    // Disable if day is closed or no hours configured
    return !dayHours || dayHours.closed || !dayHours.open || !dayHours.close;
  };

  // Get party size range from reservation settings
  const minPartySize = restaurantSettings?.reservationSettings?.minPartySize || 1;
  const maxPartySize = restaurantSettings?.reservationSettings?.maxPartySize || 10;
  
  // Generate party size options
  const partySizeOptions: number[] = [];
  for (let size = minPartySize; size <= maxPartySize; size++) {
    partySizeOptions.push(size);
  }

  const handleNext = () => {
    // Check authentication before proceeding
    if (!user) {
      enqueueSnackbar('Please sign in to make a reservation', { variant: 'warning' });
      navigate(buildCustomerUrl('login'), { 
        state: { from: '/reservations/new', message: 'Please sign in to make a reservation' }
      });
      return;
    }

    // Check email verification (handles false, undefined, and null)
    if (user.emailVerified !== true) {
      enqueueSnackbar('Please verify your email address before making a reservation', { variant: 'warning' });
      navigate(buildCustomerUrl('verify-email-sent'), {
        state: { from: '/reservations/new', message: 'Email verification required' }
      });
      return;
    }

    if (activeStep === 0 && (!formData.reservationDate || !formData.reservationTime)) {
      enqueueSnackbar('Please select both date and time', { variant: 'error' });
      return;
    }
    
    // Step 0 is now the only step before confirmation - submit directly
    if (activeStep === 0) {
      handleSubmit();
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    // Double-check authentication before submitting
    if (!user) {
      enqueueSnackbar('Please sign in to make a reservation', { variant: 'error' });
      navigate(buildCustomerUrl('login'), { 
        state: { from: '/reservations/new', message: 'Please sign in to make a reservation' }
      });
      return;
    }

    // Double-check email verification (handles false, undefined, and null)
    if (user.emailVerified !== true) {
      enqueueSnackbar('Please verify your email address before making a reservation', { variant: 'error' });
      navigate(buildCustomerUrl('verify-email-sent'), {
        state: { from: '/reservations/new', message: 'Email verification required' }
      });
      return;
    }

    // Validate form before submitting
    if (!validateForm()) {
      enqueueSnackbar('Please fix the errors in the form', { variant: 'error' });
      return;
    }

    setLoading(true);
    
    try {
      const restaurantSlug = getCurrentRestaurantSlug();

      const data: ReservationFormData & { 
        restaurantSlug?: string;
      } = {
        reservationDate: format(formData.reservationDate!, 'yyyy-MM-dd'),
        reservationTime: formData.reservationTime,
        partySize: parseInt(formData.partySize),
        notes: formData.specialRequests || undefined,
        specialRequests: formData.specialRequests || undefined,
        customerPhone: formData.customerPhone || undefined,
        customerName: formData.customerName || undefined,
        customerEmail: formData.customerEmail || undefined,
        // Include restaurant slug
        restaurantSlug: restaurantSlug || undefined
      };
      const response = await customerReservationService.createReservation(data);
      setConfirmationData(response.reservation);
      setActiveStep(1); // Move to confirmation step
      enqueueSnackbar('Reservation confirmed!', { variant: 'success' });
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      const errorResponse = error.response?.data;
      
      // Handle specific error cases
      if (errorResponse?.requiresVerification) {
        enqueueSnackbar('Please verify your email address before making a reservation', { variant: 'error' });
        navigate(buildCustomerUrl('verify-email-sent'), {
          state: { from: '/reservations/new', message: errorResponse.message }
        });
        return;
      }
      
      if (error.response?.status === 401) {
        enqueueSnackbar('Please sign in to make a reservation', { variant: 'error' });
        navigate(buildCustomerUrl('login'), { 
          state: { from: '/reservations/new', message: 'Authentication required' }
        });
        return;
      }
      
      const errorMessage = errorResponse?.error || errorResponse?.message || 'Failed to create reservation. Please try again.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                When would you like to join us?
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Reservation Date"
                  value={formData.reservationDate}
                  onChange={(newValue: Date | null) => {
                    setFormData({ 
                      ...formData, 
                      reservationDate: newValue,
                      reservationTime: '' // Reset time when date changes
                    });
                  }}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 90)}
                  shouldDisableDate={shouldDisableDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Party Size</InputLabel>
                <Select
                  value={formData.partySize}
                  onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                  startAdornment={<PeopleIcon sx={{ mr: 1, color: 'action.active' }} />}
                >
                  {partySizeOptions.map((size) => (
                    <MenuItem key={size} value={size.toString()}>
                      {size} {size === 1 ? 'Guest' : 'Guests'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Available Times
              </Typography>
              {!formData.reservationDate ? (
                <Alert severity="info" sx={{ mt: 1 }}>
                  Please select a date to see available times
                </Alert>
              ) : timeSlots.length === 0 ? (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  The restaurant is closed on this day. Please select a different date.
                </Alert>
              ) : (
                <Grid container spacing={1}>
                  {timeSlots.map((time) => (
                    <Grid item key={time}>
                      <Button
                        variant={formData.reservationTime === time ? 'contained' : 'outlined'}
                        onClick={() => setFormData({ ...formData, reservationTime: time })}
                        sx={{ minWidth: 80 }}
                      >
                        {time}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Authentication prompt */}
            {!user && (
              <Grid item xs={12}>
                <Alert 
                  severity="info" 
                  sx={{ mt: 2 }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => navigate(buildCustomerUrl('login'), { 
                          state: { from: '/reservations/new' }
                        })}
                      >
                        Sign In
                      </Button>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => navigate(buildCustomerUrl('register'), { 
                          state: { from: '/reservations/new' }
                        })}
                      >
                        Sign Up
                      </Button>
                    </Box>
                  }
                >
                  <Typography variant="body2">
                    <strong>Account required:</strong> Please sign in or create an account to make a reservation.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Email verification prompt */}
            {user && user.emailVerified !== true && (
              <Grid item xs={12}>
                <Alert 
                  severity="warning" 
                  sx={{ mt: 2 }}
                  action={
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => navigate(buildCustomerUrl('verify-email-sent'), {
                        state: { from: '/reservations/new' }
                      })}
                    >
                      Verify Email
                    </Button>
                  }
                >
                  <Typography variant="body2">
                    <strong>Email verification required:</strong> Please verify your email address before making a reservation. Check your inbox for the verification email.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Contact Information Section - Show when user is logged in */}
            {user && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                    Your Contact Information
                  </Typography>
                </Grid>

                {/* Name field */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.customerName}
                    onChange={(e) => {
                      setFormData({ ...formData, customerName: e.target.value });
                      setFieldErrors({ ...fieldErrors, customerName: undefined });
                    }}
                    error={!!fieldErrors.customerName}
                    helperText={fieldErrors.customerName}
                    autoComplete="name"
                    required
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>

                {/* Email field */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, customerEmail: e.target.value });
                      setFieldErrors({ ...fieldErrors, customerEmail: undefined });
                    }}
                    error={!!fieldErrors.customerEmail}
                    helperText={fieldErrors.customerEmail}
                    autoComplete="email"
                    required
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                </Grid>
              </>
            )}

            {/* Phone number field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => {
                  const value = e.target.value;
                  // Prevent email addresses from being entered
                  if (!value.includes('@')) {
                    setFormData({ ...formData, customerPhone: value });
                    setFieldErrors({ ...fieldErrors, customerPhone: undefined });
                  }
                }}
                error={!!fieldErrors.customerPhone}
                helperText={fieldErrors.customerPhone || 'Required - for reservation confirmations and updates'}
                autoComplete="tel"
                placeholder="(555) 123-4567"
                required
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
                inputProps={{
                  inputMode: 'tel',
                  pattern: '[0-9\\s\\-\\(\\)\\+]*',
                  maxLength: 20
                }}
              />
            </Grid>

            {/* Special requests field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests (Optional)"
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                multiline
                rows={3}
                placeholder="Dietary restrictions, special occasions, seating preferences..."
                autoComplete="off"
                InputProps={{
                  startAdornment: <NotesIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box textAlign="center">
            <CheckIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Reservation Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We've sent a confirmation email to {formData.customerEmail}
            </Typography>

            <Card sx={{ mt: 3, mb: 3, textAlign: 'left', maxWidth: 500, mx: 'auto' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Reservation Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formData.reservationDate && format(formData.reservationDate, 'EEEE, MMMM d, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Time</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formData.reservationTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Party Size</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formData.partySize} {parseInt(formData.partySize) === 1 ? 'Guest' : 'Guests'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formData.customerName}
                    </Typography>
                  </Grid>
                  {formData.customerEmail && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formData.customerEmail}
                      </Typography>
                    </Grid>
                  )}
                  {formData.customerPhone && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formData.customerPhone}
                      </Typography>
                    </Grid>
                  )}
                  {confirmationData && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Confirmation Number</Typography>
                      <Typography variant="h6" color="primary" fontWeight="medium">
                        #{confirmationData.id}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/customer')}
              sx={{ mr: 2 }}
            >
              Back to Home
            </Button>
            {user?.isCustomer && (
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/customer/reservations')}
              >
                View My Reservations
              </Button>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Restaurant Branding Header */}
      {restaurantSettings && (
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {restaurantSettings.logoUrl && (
            <Box sx={{ mb: 2 }}>
              <img 
                src={restaurantSettings.logoUrl} 
                alt={restaurantSettings.restaurant?.name || 'Restaurant Logo'}
                style={{ 
                  maxHeight: isMobile ? '60px' : '80px', 
                  maxWidth: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              color: restaurantSettings.primaryColor || 'primary.main'
            }}
          >
            {restaurantSettings.restaurant?.name || 'Restaurant'}
          </Typography>
          {restaurantSettings.tagline && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
              {restaurantSettings.tagline}
            </Typography>
          )}
          <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 2 }}>
            Make a Reservation
          </Typography>
        </Box>
      )}
      
      {!restaurantSettings && (
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Make a Reservation
        </Typography>
      )}

      <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
        <Stepper activeStep={activeStep} alternativeLabel={!isMobile} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        {activeStep < 1 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || !user || user.emailVerified !== true}
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerReservationPage; 