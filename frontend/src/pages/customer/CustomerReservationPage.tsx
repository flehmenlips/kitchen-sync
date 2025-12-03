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
import { getCurrentRestaurantSlug } from '../../utils/subdomain';
import { useSnackbar } from 'notistack';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

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
  const { user } = useCustomerAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    customerName: user?.name || '',
    customerPhone: '', // Phone not available in user object yet
    customerEmail: user?.email || '',
    partySize: '2',
    reservationDate: null,
    reservationTime: '',
    specialRequests: ''
  });

  const steps = ['Select Date & Time', 'Guest Information', 'Confirmation'];

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
  const partySizeOptions = [];
  for (let size = minPartySize; size <= maxPartySize; size++) {
    partySizeOptions.push(size);
  }

  const handleNext = () => {
    if (activeStep === 0 && (!formData.reservationDate || !formData.reservationTime)) {
      enqueueSnackbar('Please select both date and time', { variant: 'error' });
      return;
    }
    
    if (activeStep === 1) {
      if (!formData.customerName || !formData.customerPhone || !formData.customerEmail) {
        enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
        return;
      }
      // Submit reservation
      handleSubmit();
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const restaurantSlug = getCurrentRestaurantSlug();
      
      const data: ReservationFormData & { 
        restaurantSlug?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
      } = {
        reservationDate: format(formData.reservationDate!, 'yyyy-MM-dd'),
        reservationTime: formData.reservationTime,
        partySize: parseInt(formData.partySize),
        notes: formData.specialRequests || undefined,
        specialRequests: formData.specialRequests || undefined,
        // Include restaurant slug for public reservations
        restaurantSlug: restaurantSlug || undefined,
        // Include customer info for public reservations
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone
      };
      
      const response = await customerReservationService.createReservation(data);
      setConfirmationData(response.reservation);
      setActiveStep(2);
      enqueueSnackbar('Reservation confirmed!', { variant: 'success' });
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create reservation. Please try again.';
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
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tell us about yourself
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                InputProps={{
                  startAdornment: <PeopleIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                required
                type="tel"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
                type="email"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests (Optional)"
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                multiline
                rows={3}
                placeholder="Dietary restrictions, special occasions, seating preferences..."
                InputProps={{
                  startAdornment: <NotesIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
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
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Make a Reservation
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
        <Stepper activeStep={activeStep} alternativeLabel={!isMobile} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        {activeStep < 2 && (
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
              disabled={loading}
            >
              {activeStep === 1 ? 'Confirm Reservation' : 'Next'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CustomerReservationPage; 