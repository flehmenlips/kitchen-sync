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
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
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

export const ReservationCalendar: React.FC = () => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { currentRestaurant } = useRestaurant();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
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

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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
    return reservations.filter(res => 
      isSameDay(new Date(res.reservationDate), date) &&
      res.status !== ReservationStatus.CANCELLED
    );
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormOpen(true);
  };

  const handleReservationClick = (reservation: Reservation) => {
    setViewReservation(reservation);
  };

  const handleFormSubmit = async () => {
    if (!selectedDate) return;
    
    try {
      const data: CreateReservationInput = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone || undefined,
        customerEmail: formData.customerEmail || undefined,
        partySize: parseInt(formData.partySize),
        reservationDate: format(selectedDate, 'yyyy-MM-dd'),
        reservationTime: formData.reservationTime,
        notes: formData.notes || undefined,
        specialRequests: formData.specialRequests || undefined,
        restaurantId: currentRestaurant?.id || 0
      };
      
      await reservationService.createReservation(data);
      enqueueSnackbar('Reservation created successfully!', { variant: 'success' });
      setFormOpen(false);
      resetForm();
      fetchReservations();
    } catch (error) {
      console.error('Error creating reservation:', error);
      enqueueSnackbar('Failed to create reservation', { variant: 'error' });
    }
  };

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
      partySize: '2',
      reservationTime: '18:00',
      notes: '',
      specialRequests: ''
    });
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

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            <RestaurantIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
            Reservation Calendar
          </Typography>
          <Box>
            <IconButton onClick={handlePreviousWeek}>
              <ArrowBackIcon />
            </IconButton>
            <Button
              startIcon={<TodayIcon />}
              onClick={handleToday}
              sx={{ mx: 1 }}
            >
              Today
            </Button>
            <IconButton onClick={handleNextWeek}>
              <ArrowForwardIcon />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom align="center">
          {format(weekStart, 'MMMM d')} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMMM d, yyyy')}
        </Typography>

        <Grid container spacing={1} sx={{ mt: 2 }}>
          {weekDays.map((day, index) => {
            const dayReservations = getReservationsForDay(day);
            const isCurrentDay = isToday(day);
            
            return (
              <Grid item xs={12} sm={6} md={12/7} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    minHeight: 200,
                    backgroundColor: isCurrentDay ? theme.palette.action.hover : undefined,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
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
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Create Reservation Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create Reservation - {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {availableTimeSlots.length === 0 && selectedDate && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Restaurant is closed on {format(selectedDate, 'EEEE, MMMM d')}. Please select a different date.
              </Alert>
            )}
            <TextField
              fullWidth
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Party Size</InputLabel>
                  <Select
                    value={formData.partySize}
                    onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size} {size === 1 ? 'Guest' : 'Guests'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Time</InputLabel>
                  <Select
                    value={formData.reservationTime}
                    onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
                    disabled={availableTimeSlots.length === 0}
                  >
                    {availableTimeSlots.length === 0 ? (
                      <MenuItem disabled>Restaurant closed on this day</MenuItem>
                    ) : (
                      availableTimeSlots.map((time) => {
                        const availability = timeSlotAvailabilities.get(time);
                        // FIXED: Check if availability exists and is explicitly false
                        // If availability is undefined, assume available (backend hasn't filtered it out)
                        // Only disable if availability exists and available is explicitly false
                        const remaining = availability?.remaining;
                        const capacity = availability?.capacity;
                        
                        let label = time;
                        if (capacity !== null && remaining !== null) {
                          label = `${time} (${remaining}/${capacity} available)`;
                        } else if (capacity !== null) {
                          label = `${time} (${capacity} capacity)`;
                        }
                        
                        return (
                          <MenuItem 
                            key={time} 
                            value={time}
                            disabled={availability !== undefined && availability.available === false}
                          >
                            {label}
                          </MenuItem>
                        );
                      })
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Special Requests"
              multiline
              rows={2}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Internal Notes"
              multiline
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              sx={{ mt: 2 }}
              helperText="For staff use only"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={!formData.customerName}
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
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <EventIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      {format(new Date(viewReservation.reservationDate), 'EEEE, MMMM d, yyyy')}
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