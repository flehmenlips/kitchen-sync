import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
  useTheme,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Restaurant as RestaurantIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  CalendarMonth as CalendarMonthIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, startOfMonth, eachDayOfInterval, getDaysInMonth, getDay, differenceInHours, differenceInDays, startOfDay } from 'date-fns';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { reservationService, Reservation, ReservationStatus, CreateReservationInput } from '../../services/reservationService';
import { reservationSettingsService } from '../../services/reservationSettingsService';
import { useSnackbar } from 'notistack';
import { useRestaurant } from '../../context/RestaurantContext';

interface ReservationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: string;
  reservationTime: string;
  notes: string;
  specialRequests: string;
}

type CalendarView = 'day' | 'week' | 'month';

export const ReservationCalendar: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { currentRestaurant } = useRestaurant();
  
  const [view, setView] = useState<CalendarView>('week');
  const [previousView, setPreviousView] = useState<CalendarView | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [reservationSettings, setReservationSettings] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewReservation, setViewReservation] = useState<Reservation | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [timeSlotAvailabilities, setTimeSlotAvailabilities] = useState<Map<string, { available: boolean; remaining: number | null; capacity: number | null }>>(new Map());
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: '2',
    reservationTime: '18:00',
    notes: '',
    specialRequests: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [validatingAvailability, setValidatingAvailability] = useState(false);

  // Generate default time slots (fallback)
  const generateDefaultTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 11; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('22:00');
    return slots;
  };

  // Generate time slots based on reservation settings
  const generateTimeSlots = (date: Date): string[] => {
    if (!reservationSettings) {
      return generateDefaultTimeSlots();
    }

    const dayOfWeek = date.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    const operatingHours = reservationSettings.operatingHours || {};
    const dayHours = operatingHours[dayName];

    if (!dayHours || dayHours.closed) {
      return []; // Restaurant closed this day
    }

    const { open, close } = dayHours;
    const interval = reservationSettings.timeSlotInterval || 30;

    // Parse times and generate slots
    const [openHour, openMin] = open.split(':').map(Number);
    const [closeHour, closeMin] = close.split(':').map(Number);
    const startMinutes = openHour * 60 + openMin;
    let endMinutes = closeHour * 60 + closeMin;

    const slots: string[] = [];
    let currentMinutes = startMinutes;

    // FIXED: Handle midnight crossing - if end time is earlier than start time,
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

  // Calculate dates based on current view
  const getViewDates = () => {
    switch (view) {
      case 'day':
        return [currentDate];
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const firstDayOfWeek = getDay(monthStart);
        const startDate = addDays(monthStart, -firstDayOfWeek); // Start from Sunday of first week
        const daysInMonth = getDaysInMonth(currentDate);
        const endDate = addDays(monthStart, daysInMonth - 1);
        const lastDayOfWeek = getDay(endDate);
        const finalEndDate = addDays(endDate, 6 - lastDayOfWeek); // End on Saturday of last week
        return eachDayOfInterval({ start: startDate, end: finalEndDate });
      default:
        return [];
    }
  };

  const viewDates = getViewDates();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const allReservations = await reservationService.getReservations();
      setReservations(allReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      enqueueSnackbar('Failed to load reservations', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    if (currentRestaurant?.id) {
      fetchReservationSettings();
    }
  }, [currentRestaurant?.id]);

  useEffect(() => {
    if (selectedDate && reservationSettings && currentRestaurant?.id) {
      const slots = generateTimeSlots(selectedDate);
      setAvailableTimeSlots(slots);
      if (slots.length > 0 && !slots.includes(formData.reservationTime)) {
        setFormData(prev => ({ ...prev, reservationTime: slots[0] }));
      }
      
      // Fetch availability for all time slots
      if (slots.length > 0) {
        fetchAvailabilityForDate(selectedDate, slots);
      }
    }
  }, [selectedDate, reservationSettings, currentRestaurant?.id]);

  // Fetch availability for visible dates when view changes
  useEffect(() => {
    if (view === 'day' && viewDates.length > 0 && reservationSettings && currentRestaurant?.id) {
      const date = viewDates[0];
      const slots = generateTimeSlots(date);
      if (slots.length > 0) {
        fetchAvailabilityForDate(date, slots);
      }
    }
    // Don't fetch availability for month view to avoid too many API calls
    // Availability will be fetched when user clicks on a specific date
  }, [view, currentDate, reservationSettings, currentRestaurant?.id]);

  const fetchAvailabilityForDate = async (date: Date, _slots: string[]) => {
    if (!currentRestaurant?.id) return;
    
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const availability = await reservationService.getAvailability(
        currentRestaurant.id,
        dateStr,
        parseInt(formData.partySize) || 1
      );
      
      // Create a map of time slot -> availability
      const availabilityMap = new Map();
      availability.timeSlots.forEach((slot: any) => {
        availabilityMap.set(slot.timeSlot, {
          available: slot.available,
          remaining: slot.remaining,
          capacity: slot.capacity
        });
      });
      setTimeSlotAvailabilities(availabilityMap);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  // Calculate day capacity summary for calendar display
  const getDayCapacitySummary = (date: Date) => {
    if (!reservationSettings) return null;
    
    const dayOfWeek = date.getDay();
    const dayHours = reservationSettings.operatingHours?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek]];
    
    if (!dayHours || dayHours.closed) return null;
    
    // Get reservations for this day
    const dayReservations = getReservationsForDay(date);
    const totalBooked = dayReservations
      .filter(r => r.status === ReservationStatus.CONFIRMED)
      .reduce((sum, r) => sum + r.partySize, 0);
    
    // Estimate capacity (could be improved with actual time slot capacities)
    const estimatedCapacity = reservationSettings.maxCoversPerSlot || 50;
    
    return {
      totalBooked,
      estimatedCapacity,
      utilization: estimatedCapacity > 0 ? (totalBooked / estimatedCapacity) * 100 : 0
    };
  };

  const fetchReservationSettings = async () => {
    if (!currentRestaurant?.id) return;
    
    try {
      const settings = await reservationSettingsService.getReservationSettings(currentRestaurant.id);
      setReservationSettings(settings);
    } catch (error) {
      console.error('Error fetching reservation settings:', error);
      // Use default slots if settings fetch fails
    }
  };

  const getReservationsForDay = (date: Date) => {
    return reservations.filter(res => {
      try {
        const resDate = new Date(res.reservationDate);
        if (isNaN(resDate.getTime())) {
          console.warn('Invalid reservation date:', res.reservationDate, res.id);
          return false;
        }
        // Compare dates using UTC date components to avoid timezone issues
        // Reservation dates are stored as UTC midnight, so we compare UTC dates
        const resDateUTC = new Date(Date.UTC(
          resDate.getUTCFullYear(),
          resDate.getUTCMonth(),
          resDate.getUTCDate()
        ));
        const compareDateUTC = new Date(Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate()
        ));
        return resDateUTC.getTime() === compareDateUTC.getTime() && res.status !== ReservationStatus.CANCELLED;
      } catch (error) {
        console.warn('Error parsing reservation date:', res.reservationDate, res.id, error);
        return false;
      }
    });
  };

  const handlePreviousPeriod = () => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, -1));
        break;
      case 'week':
        setCurrentDate(addDays(currentDate, -7));
        break;
      case 'month':
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
        break;
    }
  };

  const handleNextPeriod = () => {
    switch (view) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addDays(currentDate, 7));
        break;
      case 'month':
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: CalendarView | null) => {
    if (newView !== null) {
      setPreviousView(view);
      setView(newView);
    }
  };

  const handleBackToMonth = () => {
    setView('month');
    setPreviousView(null);
  };

  const getPeriodLabel = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      default:
        return '';
    }
  };

  const handleDateClick = (date: Date) => {
    // In month view, clicking a day should switch to day view
    if (view === 'month') {
      setCurrentDate(date);
      setPreviousView('month');
      setView('day');
    } else {
      // In day/week view, clicking opens create reservation dialog
      handleCreateReservation(date);
    }
  };

  const handleCreateReservation = (date?: Date) => {
    setSelectedDate(date || currentDate);
    setFormOpen(true);
  };

  const handleReservationClick = (reservation: Reservation) => {
    setViewReservation(reservation);
  };

  // Validate form against reservation settings
  const validateForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const errors: { [key: string]: string } = {};
    
    // Customer name validation
    if (!formData.customerName.trim()) {
      errors.customerName = 'Customer name is required';
    } else if (formData.customerName.trim().length < 2) {
      errors.customerName = 'Customer name must be at least 2 characters';
    }
    
    // Email validation (if provided)
    if (formData.customerEmail && formData.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail.trim())) {
        errors.customerEmail = 'Please enter a valid email address';
      }
    }
    
    // Phone validation (if provided)
    if (formData.customerPhone && formData.customerPhone.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.customerPhone.trim()) || formData.customerPhone.trim().length < 10) {
        errors.customerPhone = 'Please enter a valid phone number';
      }
    }
    
    if (!selectedDate) {
      errors.date = 'Please select a date';
    } else if (reservationSettings) {
      // Validate advance booking days
      const today = startOfDay(new Date());
      const selected = startOfDay(selectedDate);
      const daysInAdvance = differenceInDays(selected, today);
      
      if (daysInAdvance < 0) {
        errors.date = 'Cannot book in the past';
      } else if (daysInAdvance > reservationSettings.advanceBookingDays) {
        errors.date = `Reservations can only be made up to ${reservationSettings.advanceBookingDays} days in advance`;
      }
      
      // Validate minimum advance hours
      if (daysInAdvance === 0) {
        const selectedDateTime = new Date(selectedDate);
        const [hours, minutes] = formData.reservationTime.split(':').map(Number);
        selectedDateTime.setHours(hours, minutes, 0, 0);
        
        const hoursInAdvance = differenceInHours(selectedDateTime, new Date());
        if (hoursInAdvance < reservationSettings.minAdvanceHours) {
          errors.reservationTime = `Reservations must be made at least ${reservationSettings.minAdvanceHours} hours in advance`;
        }
      }
      
      // Validate party size
      const partySize = parseInt(formData.partySize);
      if (isNaN(partySize) || partySize < 1) {
        errors.partySize = 'Party size must be at least 1';
      } else if (partySize < reservationSettings.minPartySize) {
        errors.partySize = `Minimum party size is ${reservationSettings.minPartySize} guests`;
      } else if (partySize > reservationSettings.maxPartySize) {
        errors.partySize = `Maximum party size is ${reservationSettings.maxPartySize} guests`;
      }
      
      // Validate date is not closed
      if (selectedDate) {
        const dayOfWeek = selectedDate.getDay();
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
        const dayHours = reservationSettings.operatingHours?.[dayName];
        if (dayHours?.closed) {
          errors.date = 'Restaurant is closed on this day';
        }
      }
    }
    
    if (!formData.reservationTime) {
      errors.reservationTime = 'Please select a time';
    } else if (availableTimeSlots.length > 0 && !availableTimeSlots.includes(formData.reservationTime)) {
      errors.reservationTime = 'Selected time is not available for this date';
    }
    
    setFormErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleFormSubmit = async () => {
    if (!selectedDate) {
      setFormErrors({ date: 'Please select a date' });
      enqueueSnackbar('Please select a date for the reservation', { variant: 'error' });
      return;
    }
    
    // Validate form
    const validation = validateForm();
    if (!validation.isValid) {
      const errorCount = Object.keys(validation.errors).length;
      enqueueSnackbar(
        `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form`,
        { variant: 'error', autoHideDuration: 4000 }
      );
      return;
    }
    
    // Additional pre-submission checks
    const partySize = parseInt(formData.partySize);
    const selectedDateTime = new Date(selectedDate);
    const [hours, minutes] = formData.reservationTime.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    // Check if reservation time is in the past
    if (selectedDateTime < new Date()) {
      setFormErrors({ time: 'Reservation time cannot be in the past' });
      enqueueSnackbar('Reservation time cannot be in the past', { variant: 'error' });
      return;
    }
    
    // Check availability one more time before submitting
    if (currentRestaurant?.id) {
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const availability = await reservationService.getAvailability(
          currentRestaurant.id,
          dateStr,
          partySize
        );
        
        const selectedSlot = availability.timeSlots.find(
          (slot: any) => slot.timeSlot === formData.reservationTime
        );
        
        if (selectedSlot && !selectedSlot.available) {
          setFormErrors({ 
            reservationTime: `This time slot is no longer available. ${selectedSlot.remaining != null ? `Only ${selectedSlot.remaining} spots remaining.` : 'Please select another time.'}` 
          });
          enqueueSnackbar('This time slot is no longer available. Please select another time.', { 
            variant: 'error',
            autoHideDuration: 5000
          });
          return;
        }
      } catch (error) {
        // If availability check fails, warn but allow submission
        console.warn('Could not verify availability before submission:', error);
        enqueueSnackbar('Warning: Could not verify availability. Proceeding with reservation...', { 
          variant: 'warning',
          autoHideDuration: 3000
        });
      }
    }
    
    try {
      const data: CreateReservationInput = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone?.trim() || undefined,
        customerEmail: formData.customerEmail?.trim() || undefined,
        partySize: partySize,
        reservationDate: format(selectedDate, 'yyyy-MM-dd'),
        reservationTime: formData.reservationTime,
        notes: formData.notes?.trim() || undefined,
        specialRequests: formData.specialRequests?.trim() || undefined,
        restaurantId: currentRestaurant?.id || 0
      };
      
      await reservationService.createReservation(data);
      enqueueSnackbar('Reservation created successfully!', { variant: 'success' });
      setFormOpen(false);
      resetForm();
      setFormErrors({});
      fetchReservations();
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to create reservation';
      let fieldErrors: { [key: string]: string } = {};
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors from backend
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Handle field-specific errors
        if (errorData.errors) {
          fieldErrors = errorData.errors;
          setFormErrors(fieldErrors);
        }
        
        // Handle specific error codes
        if (error.response.status === 400) {
          errorMessage = errorData.message || 'Invalid reservation data. Please check your inputs.';
        } else if (error.response.status === 409) {
          errorMessage = errorData.message || 'A reservation already exists for this time slot.';
        } else if (error.response.status === 422) {
          errorMessage = errorData.message || 'Reservation conflicts with existing booking or capacity limits.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error occurred. Please try again or contact support if the problem persists.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Update form errors if any field-specific errors
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      }
      
      enqueueSnackbar(errorMessage, { 
        variant: 'error',
        autoHideDuration: 6000
      });
    }
  };

  // Update availability when party size or time changes
  useEffect(() => {
    if (formOpen && selectedDate && reservationSettings && currentRestaurant?.id) {
      const slots = generateTimeSlots(selectedDate);
      setAvailableTimeSlots(slots);
      
      if (slots.length > 0) {
        setValidatingAvailability(true);
        fetchAvailabilityForDate(selectedDate, slots).finally(() => {
          setValidatingAvailability(false);
        });
      }
    }
  }, [formData.partySize, selectedDate, formOpen]);

  const handleCancelReservation = async (id: number) => {
    try {
      await reservationService.cancelReservation(id);
      enqueueSnackbar('Reservation cancelled', { variant: 'success' });
      setViewReservation(null);
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      enqueueSnackbar('Failed to cancel reservation', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      partySize: reservationSettings?.minPartySize?.toString() || '2',
      reservationTime: '18:00',
      notes: '',
      specialRequests: ''
    });
    setFormErrors({});
  };

  // Get party size options based on settings
  const getPartySizeOptions = (): number[] => {
    if (!reservationSettings) {
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
    const min = reservationSettings.minPartySize || 1;
    const max = reservationSettings.maxPartySize || 20;
    const options: number[] = [];
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    return options;
  };

  // Get selected time slot availability info
  const getSelectedTimeSlotAvailability = () => {
    if (!formData.reservationTime) return null;
    return timeSlotAvailabilities.get(formData.reservationTime);
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return 'success';
      case ReservationStatus.CANCELLED:
        return 'error';
      case ReservationStatus.COMPLETED:
        return 'info';
      case ReservationStatus.NO_SHOW:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Render day view with time slots
  const renderDayView = (date: Date) => {
    const dayReservations = getReservationsForDay(date);
    const isCurrentDay = isToday(date);
    const capacitySummary = getDayCapacitySummary(date);
    const dayOfWeek = date.getDay();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
    const dayHours = reservationSettings?.operatingHours?.[dayName];
    const isClosed = dayHours?.closed || !dayHours;
    
    // Generate time slots for the day
    const timeSlots = reservationSettings 
      ? generateTimeSlots(date)
      : generateDefaultTimeSlots();
    
    // Group reservations by time slot
    const reservationsByTimeSlot = new Map<string, Reservation[]>();
    dayReservations.forEach(res => {
      const timeSlot = res.reservationTime.substring(0, 5); // HH:MM format
      if (!reservationsByTimeSlot.has(timeSlot)) {
        reservationsByTimeSlot.set(timeSlot, []);
      }
      reservationsByTimeSlot.get(timeSlot)!.push(res);
    });

    return (
      <Card
        sx={{
          border: isCurrentDay ? `2px solid ${theme.palette.primary.main}` : undefined,
          backgroundColor: isCurrentDay ? theme.palette.action.hover : undefined
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </Typography>
            {capacitySummary && (
              <Chip
                label={`${capacitySummary.totalBooked}/${capacitySummary.estimatedCapacity} covers`}
                color={capacitySummary.utilization >= 90 ? 'error' : capacitySummary.utilization >= 70 ? 'warning' : 'success'}
              />
            )}
            {isClosed && <Chip label="Closed" color="default" />}
          </Box>

          {isClosed ? (
            <Alert severity="info">Restaurant is closed on this day.</Alert>
          ) : (
            <Box sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {timeSlots.map(timeSlot => {
                const slotReservations = reservationsByTimeSlot.get(timeSlot) || [];
                const availability = timeSlotAvailabilities.get(timeSlot);
                
                return (
                  <Paper
                    key={timeSlot}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1,
                      backgroundColor: availability?.available === false ? 'rgba(244, 67, 54, 0.05)' : undefined,
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                    onClick={() => {
                      setSelectedDate(date);
                      setFormData(prev => ({ ...prev, reservationTime: timeSlot }));
                      setFormOpen(true);
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {timeSlot}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        {availability && (
                          <Typography variant="caption" color="text.secondary">
                            {availability.remaining != null && availability.capacity != null
                              ? `${availability.remaining}/${availability.capacity} available`
                              : availability.available === false
                              ? 'Full'
                              : 'Available'}
                          </Typography>
                        )}
                        {slotReservations.length > 0 && (
                          <Badge badgeContent={slotReservations.length} color="primary">
                            <EventIcon />
                          </Badge>
                        )}
                      </Box>
                    </Box>
                    {slotReservations.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {slotReservations.map(res => (
                          <Chip
                            key={res.id}
                            label={`${res.customerName} - ${res.partySize} ${res.partySize === 1 ? 'guest' : 'guests'}`}
                            color={getStatusColor(res.status) as any}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReservationClick(res);
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Paper>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render month view
  const renderMonthView = () => {
    // Group dates into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < viewDates.length; i += 7) {
      weeks.push(viewDates.slice(i, i + 7));
    }

    return (
      <Box>
        {/* Day headers */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Box
              key={day}
              sx={{
                flex: '1 1 0%',
                minWidth: 0
              }}
            >
              <Paper
                sx={{
                  p: 1,
                  textAlign: 'center',
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 'bold'
                }}
              >
                <Typography variant="caption">{day}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <Box key={weekIndex} sx={{ display: 'flex', gap: 0.5, mb: 0.5 }}>
            {week.map((day, dayIndex) => {
              const dayReservations = getReservationsForDay(day);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const capacitySummary = getDayCapacitySummary(day);
              const dayOfWeek = day.getDay();
              const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
              const dayHours = reservationSettings?.operatingHours?.[dayName];
              const isClosed = dayHours?.closed || !dayHours;

              return (
                <Box
                  key={dayIndex}
                  sx={{
                    flex: '1 1 0%',
                    minWidth: 0
                  }}
                >
                  <Card
                    sx={{
                      minHeight: 120,
                      backgroundColor: !isCurrentMonth 
                        ? theme.palette.action.disabledBackground
                        : isCurrentDay 
                        ? theme.palette.action.hover 
                        : undefined,
                      border: isCurrentDay ? `2px solid ${theme.palette.primary.main}` : undefined,
                      cursor: 'pointer',
                      opacity: !isCurrentMonth ? 0.5 : 1,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                        transform: 'scale(1.02)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                    onClick={() => {
                      if (isCurrentMonth) {
                        handleDateClick(day);
                      } else {
                        // Navigate to that month
                        setCurrentDate(day);
                      }
                    }}
                  >
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography 
                          variant="caption" 
                          fontWeight={isCurrentDay ? 'bold' : 'normal'}
                          color={!isCurrentMonth ? 'text.secondary' : 'text.primary'}
                        >
                          {format(day, 'd')}
                        </Typography>
                        {dayReservations.length > 0 && (
                          <Badge badgeContent={dayReservations.length} color="primary" max={99}>
                            <Box sx={{ width: 8, height: 8 }} />
                          </Badge>
                        )}
                      </Box>
                      
                      {isClosed && (
                        <Chip label="Closed" size="small" sx={{ fontSize: '0.65rem', height: 16 }} />
                      )}
                      
                      {capacitySummary && !isClosed && (
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ width: '100%', height: 3, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                            <Box
                              sx={{
                                height: '100%',
                                width: `${Math.min(capacitySummary.utilization, 100)}%`,
                                bgcolor: capacitySummary.utilization >= 90 ? 'error.main' :
                                         capacitySummary.utilization >= 70 ? 'warning.main' :
                                         capacitySummary.utilization >= 50 ? 'info.main' : 'success.main'
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                            {capacitySummary.totalBooked}/{capacitySummary.estimatedCapacity}
                          </Typography>
                        </Box>
                      )}

                      {dayReservations.length > 0 && (
                        <Box sx={{ mt: 0.5 }}>
                          {dayReservations.slice(0, 2).map(res => {
                            // reservationTime is already in HH:mm format, just extract the time part
                            const timeDisplay = res.reservationTime.includes('T') 
                              ? format(new Date(res.reservationTime), 'HH:mm')
                              : res.reservationTime.substring(0, 5); // Extract HH:mm from string
                            
                            return (
                              <Chip
                                key={res.id}
                                label={`${timeDisplay} - ${res.partySize}`}
                                size="small"
                                color={getStatusColor(res.status) as any}
                                sx={{ 
                                  fontSize: '0.6rem', 
                                  height: 16, 
                                  mb: 0.25,
                                  display: 'block',
                                  width: '100%',
                                  '& .MuiChip-label': { px: 0.5 }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReservationClick(res);
                                }}
                              />
                            );
                          })}
                          {dayReservations.length > 2 && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                              +{dayReservations.length - 2} more
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h4" component="h1">
            <RestaurantIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
            Reservation Calendar
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
              aria-label="calendar view"
              size="small"
            >
              <ToggleButton value="day" aria-label="day view">
                <ViewDayIcon sx={{ mr: 0.5 }} />
                Day
              </ToggleButton>
              <ToggleButton value="week" aria-label="week view">
                <ViewWeekIcon sx={{ mr: 0.5 }} />
                Week
              </ToggleButton>
              <ToggleButton value="month" aria-label="month view">
                <CalendarMonthIcon sx={{ mr: 0.5 }} />
                Month
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleCreateReservation()}
              sx={{ ml: 2 }}
            >
              Create Reservation
            </Button>
            <Box display="flex" alignItems="center" ml={2}>
              <IconButton onClick={handlePreviousPeriod}>
              <ArrowBackIcon />
            </IconButton>
            <Button
              startIcon={<TodayIcon />}
              onClick={handleToday}
              sx={{ mx: 1 }}
            >
              Today
            </Button>
              <IconButton onClick={handleNextPeriod}>
              <ArrowForwardIcon />
            </IconButton>
            </Box>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" gutterBottom>
            {getPeriodLabel()}
          </Typography>
          {view === 'day' && previousView === 'month' && (
            <Button
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={handleBackToMonth}
              size="small"
            >
              Back to Month View
            </Button>
          )}
        </Box>

        {/* Day View */}
        {view === 'day' && viewDates.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {renderDayView(viewDates[0])}
          </Box>
        )}

        {/* Week View */}
        {view === 'week' && (
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            {viewDates.map((day, index) => {
            const dayReservations = getReservationsForDay(day);
            const isCurrentDay = isToday(day);
            const capacitySummary = getDayCapacitySummary(day);
            const dayOfWeek = day.getDay();
            const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
            const dayHours = reservationSettings?.operatingHours?.[dayName];
            const isClosed = dayHours?.closed || !dayHours;
            
            // Determine card color based on capacity/utilization
            let cardBgColor = undefined;
            let borderColor = undefined;
            if (!isClosed && capacitySummary) {
              if (capacitySummary.utilization >= 90) {
                cardBgColor = 'rgba(244, 67, 54, 0.1)'; // Red tint for high utilization
                borderColor = 'error.main';
              } else if (capacitySummary.utilization >= 70) {
                cardBgColor = 'rgba(255, 152, 0, 0.1)'; // Orange tint for medium-high utilization
                borderColor = 'warning.main';
              } else if (capacitySummary.utilization >= 50) {
                cardBgColor = 'rgba(255, 235, 59, 0.1)'; // Yellow tint for medium utilization
              }
            }
            
            return (
              <Box
                key={index}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 50%', md: '1 1 0%' },
                  minWidth: { xs: '100%', sm: 'calc(50% - 4px)', md: 0 },
                  maxWidth: { xs: '100%', sm: 'calc(50% - 4px)', md: 'none' }
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    minHeight: 200,
                    backgroundColor: isCurrentDay 
                      ? theme.palette.action.hover 
                      : cardBgColor || undefined,
                    border: isCurrentDay 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : borderColor 
                        ? `1px solid ${borderColor === 'error.main' ? theme.palette.error.main : borderColor === 'warning.main' ? theme.palette.warning.main : 'transparent'}` 
                        : undefined,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handleDateClick(day)}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2" fontWeight={isCurrentDay ? 'bold' : 'normal'}>
                        {format(day, 'EEE')}
                      </Typography>
                      <Badge badgeContent={dayReservations.length} color="primary">
                        <Typography variant="h6" fontWeight={isCurrentDay ? 'bold' : 'normal'}>
                          {format(day, 'd')}
                        </Typography>
                      </Badge>
                    </Box>
                    
                    {isClosed ? (
                      <Chip 
                        label="Closed" 
                        size="small" 
                        color="default" 
                        sx={{ mb: 1 }}
                      />
                    ) : capacitySummary && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Capacity: {capacitySummary.totalBooked}/{capacitySummary.estimatedCapacity}
                        </Typography>
                        <Box sx={{ mt: 0.5, width: '100%', height: 4, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              height: '100%',
                              width: `${Math.min(capacitySummary.utilization, 100)}%`,
                              bgcolor: capacitySummary.utilization >= 90 ? 'error.main' :
                                       capacitySummary.utilization >= 70 ? 'warning.main' :
                                       capacitySummary.utilization >= 50 ? 'info.main' : 'success.main',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {loading ? (
                      <>
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="80%" />
                      </>
                    ) : (
                      <Box>
                        {dayReservations.slice(0, 3).map((res) => (
                          <Chip
                            key={res.id}
                            label={`${res.reservationTime} - ${res.customerName} (${res.partySize})`}
                            size="small"
                            color={getStatusColor(res.status)}
                            sx={{ mb: 0.5, width: '100%' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReservationClick(res);
                            }}
                          />
                        ))}
                        {dayReservations.length > 3 && (
                          <Typography variant="caption" color="text.secondary">
                            +{dayReservations.length - 3} more
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
        )}

        {/* Month View */}
        {view === 'month' && (
          <Box sx={{ mt: 2 }}>
            {renderMonthView()}
          </Box>
        )}
      </Paper>

      {/* Create Reservation Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Create Reservation
            </Typography>
            {selectedDate && (
              <Chip 
                label={format(selectedDate, 'EEEE, MMMM d, yyyy')} 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Validation Errors */}
            {Object.keys(formErrors).length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Please fix the following errors:</Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {Object.values(formErrors).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Date Selection Info */}
            {selectedDate && reservationSettings && (
              <Alert 
                severity="info" 
                sx={{ mb: 2 }}
                icon={<EventIcon />}
              >
                <Typography variant="body2">
                  <strong>Selected Date:</strong> {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  {(() => {
                    const dayOfWeek = selectedDate.getDay();
                    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
                    const dayHours = reservationSettings.operatingHours?.[dayName];
                    if (dayHours && !dayHours.closed) {
                      return ` • Open: ${dayHours.open} - ${dayHours.close}`;
                    }
                    return null;
                  })()}
                </Typography>
              </Alert>
            )}

            {/* Customer Information */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
              Customer Information
            </Typography>
            <TextField
              fullWidth
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => {
                setFormData({ ...formData, customerName: e.target.value });
                if (formErrors.customerName) {
                  setFormErrors({ ...formErrors, customerName: '' });
                }
              }}
              required
              error={!!formErrors.customerName}
              helperText={formErrors.customerName || 'Required field'}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.customerPhone}
                  onChange={(e) => {
                    setFormData({ ...formData, customerPhone: e.target.value });
                    if (formErrors.customerPhone) {
                      setFormErrors({ ...formErrors, customerPhone: '' });
                    }
                  }}
                  error={!!formErrors.customerPhone}
                  helperText={formErrors.customerPhone || 'Optional'}
                  placeholder="(555) 123-4567"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => {
                    setFormData({ ...formData, customerEmail: e.target.value });
                    if (formErrors.customerEmail) {
                      setFormErrors({ ...formErrors, customerEmail: '' });
                    }
                  }}
                  error={!!formErrors.customerEmail}
                  helperText={formErrors.customerEmail || 'Optional'}
                  placeholder="customer@example.com"
                />
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />

            {/* Reservation Details */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Reservation Details
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.partySize}>
                  <InputLabel>Party Size</InputLabel>
                  <Select
                    value={formData.partySize}
                    onChange={(e) => {
                      setFormData({ ...formData, partySize: e.target.value });
                      if (formErrors.partySize) {
                        setFormErrors({ ...formErrors, partySize: '' });
                      }
                    }}
                  >
                    {getPartySizeOptions().map((size) => (
                      <MenuItem key={size} value={size.toString()}>
                        {size} {size === 1 ? 'Guest' : 'Guests'}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.partySize && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {formErrors.partySize}
                    </Typography>
                  )}
                  {reservationSettings && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                      Party size: {reservationSettings.minPartySize} - {reservationSettings.maxPartySize} guests
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.time}>
                  <InputLabel>Time</InputLabel>
                  <Select
                    value={formData.reservationTime}
                    onChange={(e) => {
                      setFormData({ ...formData, reservationTime: e.target.value });
                      if (formErrors.time) {
                        setFormErrors({ ...formErrors, time: '' });
                      }
                    }}
                    disabled={availableTimeSlots.length === 0 || validatingAvailability}
                  >
                    {availableTimeSlots.length === 0 ? (
                      <MenuItem disabled>Restaurant closed on this day</MenuItem>
                    ) : (
                      availableTimeSlots.map((time) => {
                        const availability = timeSlotAvailabilities.get(time);
                        const remaining = availability?.remaining;
                        const capacity = availability?.capacity;
                        const isAvailable = availability === undefined || availability.available !== false;
                        
                        let label = time;
                        if (capacity != null && remaining != null) {
                          label = `${time} (${remaining}/${capacity} available)`;
                        } else if (capacity != null) {
                          label = `${time} (${capacity} capacity)`;
                        }
                        
                        return (
                          <MenuItem 
                            key={time} 
                            value={time}
                            disabled={availability !== undefined && availability.available === false}
                          >
                            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                              <span>{label}</span>
                              {!isAvailable && (
                                <Chip label="Full" size="small" color="error" sx={{ ml: 1 }} />
                              )}
                            </Box>
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                  {formErrors.time && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {formErrors.time}
                    </Typography>
                  )}
                  {validatingAvailability && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                      Checking availability...
                    </Typography>
                  )}
                  {(() => {
                    const availability = getSelectedTimeSlotAvailability();
                    if (availability && availability.capacity != null && availability.remaining != null) {
                      return (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                          {availability.remaining > 0 
                            ? `${availability.remaining} spots remaining` 
                            : 'Fully booked'}
                        </Typography>
                      );
                    }
                    return null;
                  })()}
                </FormControl>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />

            {/* Additional Information */}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Additional Information
            </Typography>
            <TextField
              fullWidth
              label="Special Requests"
              multiline
              rows={2}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              sx={{ mt: 1 }}
              helperText="Any special requests or dietary restrictions"
            />
            <TextField
              fullWidth
              label="Internal Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              sx={{ mt: 2 }}
              helperText="For staff use only - not visible to customer"
            />

            {/* Cancellation Policy */}
            {reservationSettings?.cancellationPolicy && (
              <>
                <Divider sx={{ my: 2 }} />
                <Alert severity="info" icon={<EventIcon />}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cancellation Policy
                  </Typography>
                  <Typography variant="body2">
                    {reservationSettings.cancellationPolicy}
                  </Typography>
                  {reservationSettings.cancellationHours > 0 && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                      Cancellations must be made at least {reservationSettings.cancellationHours} hours in advance.
                    </Typography>
                  )}
                </Alert>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => {
            setFormOpen(false);
            setFormErrors({});
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={!formData.customerName.trim() || Object.keys(formErrors).length > 0}
            sx={{ minWidth: 150 }}
          >
            Create Reservation
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Reservation Dialog */}
      <Dialog open={!!viewReservation} onClose={() => setViewReservation(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Reservation Details
        </DialogTitle>
        <DialogContent>
          {viewReservation && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {viewReservation.customerName}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={viewReservation.status}
                  color={getStatusColor(viewReservation.status)}
                  sx={{ mb: 1 }}
                />
              </Box>
              {viewReservation.confirmationNumber && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Confirmation Number
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {viewReservation.confirmationNumber}
                  </Typography>
                </Box>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      {(() => {
                        // Format date using UTC components to ensure correct date display
                        // Reservation dates are stored as UTC midnight, so we extract UTC components
                        const resDate = new Date(viewReservation.reservationDate);
                        // Create a local date with UTC components to display correctly
                        const displayDate = new Date(
                          resDate.getUTCFullYear(),
                          resDate.getUTCMonth(),
                          resDate.getUTCDate()
                        );
                        return format(displayDate, 'EEEE, MMMM d, yyyy');
                      })()}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography sx={{ ml: 4 }}>
                      {viewReservation.reservationTime}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      {viewReservation.partySize} {viewReservation.partySize === 1 ? 'Guest' : 'Guests'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {viewReservation.customerPhone && (
                <Box display="flex" alignItems="center" mb={1}>
                  <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{viewReservation.customerPhone}</Typography>
                </Box>
              )}
              {viewReservation.customerEmail && (
                <Box display="flex" alignItems="center" mb={1}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{viewReservation.customerEmail}</Typography>
                </Box>
              )}
              {viewReservation.specialRequests && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Special Requests
                  </Typography>
                  <Typography>{viewReservation.specialRequests}</Typography>
                </Box>
              )}
              {viewReservation.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Internal Notes
                  </Typography>
                  <Typography>{viewReservation.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {viewReservation && viewReservation.status === ReservationStatus.CONFIRMED && (
            <Button
              onClick={() => handleCancelReservation(viewReservation.id)}
              color="error"
            >
              Cancel Reservation
            </Button>
          )}
          <Button onClick={() => setViewReservation(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 