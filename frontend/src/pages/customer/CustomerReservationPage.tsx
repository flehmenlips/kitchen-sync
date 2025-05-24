import React, { useState } from 'react';
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
import { reservationService, CreateReservationInput } from '../../services/reservationService';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerEmail: user?.email || '',
    partySize: '2',
    reservationDate: null,
    reservationTime: '',
    specialRequests: ''
  });

  const steps = ['Select Date & Time', 'Guest Information', 'Confirmation'];

  // Generate time slots from 11:00 to 22:00 in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 11; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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
      const data: CreateReservationInput = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        partySize: parseInt(formData.partySize),
        reservationDate: format(formData.reservationDate!, 'yyyy-MM-dd'),
        reservationTime: formData.reservationTime,
        specialRequests: formData.specialRequests || undefined,
        restaurantId: 1 // Single restaurant for MVP
      };
      
      const reservation = await reservationService.createReservation(data);
      setConfirmationData(reservation);
      setActiveStep(2);
      enqueueSnackbar('Reservation confirmed!', { variant: 'success' });
    } catch (error) {
      console.error('Error creating reservation:', error);
      enqueueSnackbar('Failed to create reservation. Please try again.', { variant: 'error' });
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
                  onChange={(newValue: Date | null) => setFormData({ ...formData, reservationDate: newValue })}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 90)}
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
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                    <MenuItem key={size} value={size}>
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