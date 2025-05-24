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
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Notes as NotesIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { reservationService, Reservation, ReservationStatus, CreateReservationInput } from '../../services/reservationService';
import { useSnackbar } from 'notistack';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewReservation, setViewReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: '2',
    reservationTime: '18:00',
    notes: '',
    specialRequests: ''
  });

  // Generate time slots from 11:00 to 22:00 in 30-minute intervals
  const timeSlots = Array.from({ length: 23 }, (_, i) => {
    const hour = Math.floor(11 + i * 0.5);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

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
  }, []);

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
        restaurantId: 1 // TODO: Get from context or props
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
                  >
                    {timeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
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