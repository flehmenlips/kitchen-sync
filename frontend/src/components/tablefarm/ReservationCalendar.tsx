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
  Restaurant as RestaurantIcon,
  ViewDay as ViewDayIcon,
  ViewWeek as ViewWeekIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, startOfMonth, eachDayOfInterval, getDaysInMonth, getDay } from 'date-fns';
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
        return isSameDay(resDate, date) && res.status !== ReservationStatus.CANCELLED;
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
      setView(newView);
    }
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
        <Grid container spacing={0.5} sx={{ mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Grid item xs={12/7} key={day}>
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
            </Grid>
          ))}
        </Grid>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={0.5} key={weekIndex} sx={{ mb: 0.5 }}>
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
                <Grid item xs={12/7} key={dayIndex}>
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
                </Grid>
              );
            })}
          </Grid>
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

        <Typography variant="h6" gutterBottom align="center">
          {getPeriodLabel()}
        </Typography>

        {/* Day View */}
        {view === 'day' && viewDates.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {renderDayView(viewDates[0])}
          </Box>
        )}

        {/* Week View */}
        {view === 'week' && (
          <Grid container spacing={1} sx={{ mt: 2 }}>
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
              <Grid item xs={12} sm={6} md={12/7} key={index}>
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
              </Grid>
            );
            })}
          </Grid>
        )}

        {/* Month View */}
        {view === 'month' && (
          <Box sx={{ mt: 2 }}>
            {renderMonthView()}
          </Box>
        )}
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
                        // FIXED: Use != null to check for both null and undefined
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