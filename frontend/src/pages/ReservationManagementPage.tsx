import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Alert,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format, parseISO, differenceInHours, differenceInDays, startOfDay } from 'date-fns';
import { reservationService, Reservation, ReservationStatus, ReservationFilters, PaginatedReservations } from '../services/reservationService';
import { reservationSettingsService } from '../services/reservationSettingsService';
import { useSnackbar } from '../context/SnackbarContext';
import { useRestaurant } from '../context/RestaurantContext';
import { useMobileResponsive, mobileResponsiveStyles } from '../utils/mobileUtils';

// Reservation form dialog
interface ReservationFormDialogProps {
  open: boolean;
  onClose: () => void;
  reservation?: Reservation | null;
  onSave: () => void;
}

const ReservationFormDialog: React.FC<ReservationFormDialogProps> = ({ 
  open, 
  onClose, 
  reservation, 
  onSave 
}) => {
  const { showSnackbar } = useSnackbar();
  const { currentRestaurant } = useRestaurant();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    partySize: 2,
    reservationDate: format(new Date(), 'yyyy-MM-dd'),
    reservationTime: '18:00',
    status: ReservationStatus.CONFIRMED,
    notes: '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [reservationSettings, setReservationSettings] = useState<any>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Fetch reservation settings
  useEffect(() => {
    if (open && currentRestaurant?.id) {
      reservationSettingsService.getReservationSettings(currentRestaurant.id)
        .then(settings => {
          setReservationSettings(settings);
          // Set default party size from settings
          if (!reservation && settings?.minPartySize) {
            setFormData(prev => ({ ...prev, partySize: settings.minPartySize }));
          }
        })
        .catch(() => {
          // Settings not found or error - continue without them
        });
    }
  }, [open, currentRestaurant?.id, reservation]);

  useEffect(() => {
    if (reservation) {
      setFormData({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail || '',
        customerPhone: reservation.customerPhone || '',
        partySize: reservation.partySize,
        reservationDate: format(parseISO(reservation.reservationDate), 'yyyy-MM-dd'),
        reservationTime: reservation.reservationTime,
        status: reservation.status,
        notes: reservation.notes || '',
        specialRequests: reservation.specialRequests || ''
      });
    } else {
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        partySize: reservationSettings?.minPartySize || 2,
        reservationDate: format(new Date(), 'yyyy-MM-dd'),
        reservationTime: '18:00',
        status: ReservationStatus.CONFIRMED,
        notes: '',
        specialRequests: ''
      });
    }
    setFormErrors({});
  }, [reservation, reservationSettings]);

  // Generate time slots based on selected date
  useEffect(() => {
    if (open && formData.reservationDate && reservationSettings) {
      const selectedDate = new Date(formData.reservationDate);
      const dayOfWeek = selectedDate.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      const dayHours = reservationSettings.operatingHours?.[dayName];
      
      if (dayHours && !dayHours.closed) {
        const slots: string[] = [];
        const interval = reservationSettings.timeSlotInterval || 30;
        const [openHour, openMin] = dayHours.open.split(':').map(Number);
        const [closeHour, closeMin] = dayHours.close.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        let closeMinutes = closeHour * 60 + closeMin;
        
        // Handle midnight crossing
        if (closeMinutes <= openMinutes) {
          closeMinutes += 1440;
        }
        
        let currentMinutes = openMinutes;
        while (currentMinutes <= closeMinutes) {
          const hour = Math.floor(currentMinutes / 60) % 24;
          const minute = currentMinutes % 60;
          slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
          currentMinutes += interval;
        }
        
        setAvailableTimeSlots(slots);
      } else {
        setAvailableTimeSlots([]);
      }
    }
  }, [open, formData.reservationDate, reservationSettings]);

  // Validate form
  const validateForm = (): boolean => {
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
    
    if (reservationSettings) {
      // Validate advance booking days
      const today = startOfDay(new Date());
      const selected = startOfDay(new Date(formData.reservationDate));
      const daysInAdvance = differenceInDays(selected, today);
      
      if (daysInAdvance < 0) {
        errors.reservationDate = 'Cannot book in the past';
      } else if (daysInAdvance > reservationSettings.advanceBookingDays) {
        errors.reservationDate = `Reservations can only be made up to ${reservationSettings.advanceBookingDays} days in advance`;
      }
      
      // Validate minimum advance hours
      if (daysInAdvance === 0) {
        const selectedDateTime = new Date(formData.reservationDate);
        const [hours, minutes] = formData.reservationTime.split(':').map(Number);
        selectedDateTime.setHours(hours, minutes, 0, 0);
        
        const hoursInAdvance = differenceInHours(selectedDateTime, new Date());
        if (hoursInAdvance < reservationSettings.minAdvanceHours) {
          errors.reservationTime = `Reservations must be made at least ${reservationSettings.minAdvanceHours} hours in advance`;
        }
      }
      
      // Validate party size
      if (formData.partySize < 1) {
        errors.partySize = 'Party size must be at least 1';
      } else if (formData.partySize < reservationSettings.minPartySize) {
        errors.partySize = `Minimum party size is ${reservationSettings.minPartySize} guests`;
      } else if (formData.partySize > reservationSettings.maxPartySize) {
        errors.partySize = `Maximum party size is ${reservationSettings.maxPartySize} guests`;
      }
      
      // Validate date is not closed
      const selectedDate = new Date(formData.reservationDate);
      const dayOfWeek = selectedDate.getDay();
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];
      const dayHours = reservationSettings.operatingHours?.[dayName];
      if (dayHours?.closed) {
        errors.reservationDate = 'Restaurant is closed on this day';
      }
    }
    
    if (!formData.reservationTime) {
      errors.reservationTime = 'Please select a time';
    } else if (availableTimeSlots.length > 0 && !availableTimeSlots.includes(formData.reservationTime)) {
      errors.reservationTime = 'Selected time is not available for this date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPartySizeOptions = (): number[] => {
    if (!reservationSettings) {
      return Array.from({ length: 20 }, (_, i) => i + 1);
    }
    const min = reservationSettings.minPartySize || 1;
    const max = reservationSettings.maxPartySize || 20;
    const options: number[] = [];
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    return options;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!reservation && !validateForm()) {
      const errorCount = Object.keys(formErrors).length;
      showSnackbar(
        `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form`,
        'error'
      );
      return;
    }
    
    // Additional pre-submission checks
    const selectedDateTime = new Date(formData.reservationDate);
    const [hours, minutes] = formData.reservationTime.split(':').map(Number);
    selectedDateTime.setHours(hours, minutes, 0, 0);
    
    // Check if reservation time is in the past
    if (selectedDateTime < new Date() && !reservation) {
      setFormErrors({ reservationTime: 'Reservation time cannot be in the past' });
      showSnackbar('Reservation time cannot be in the past', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const submitData = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail?.trim() || undefined,
        customerPhone: formData.customerPhone?.trim() || undefined,
        partySize: formData.partySize,
        reservationDate: formData.reservationDate,
        reservationTime: formData.reservationTime,
        notes: formData.notes?.trim() || undefined,
        specialRequests: formData.specialRequests?.trim() || undefined,
        status: formData.status,
        restaurantId: currentRestaurant?.id || 0
      };
      
      if (reservation) {
        await reservationService.updateReservation(reservation.id, submitData);
        showSnackbar('Reservation updated successfully', 'success');
      } else {
        await reservationService.createReservation(submitData);
        showSnackbar('Reservation created successfully', 'success');
      }
      onSave();
      onClose();
      setFormErrors({});
    } catch (error: any) {
      console.error('Error saving reservation:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to save reservation';
      let fieldErrors: { [key: string]: string } = {};
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        if (errorData.errors) {
          fieldErrors = errorData.errors;
          setFormErrors(fieldErrors);
        }
        
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
      
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(fieldErrors);
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {reservation ? 'Edit Reservation' : 'New Reservation'}
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
          {formData.reservationDate && reservationSettings && (
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              icon={<CalendarIcon />}
            >
              <Typography variant="body2">
                <strong>Selected Date:</strong> {format(new Date(formData.reservationDate), 'EEEE, MMMM d, yyyy')}
                {(() => {
                  const selectedDate = new Date(formData.reservationDate);
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

          <Grid container spacing={2}>
            <Grid item xs={12}>
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
                helperText={formErrors.customerName}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!formErrors.partySize}>
                <InputLabel>Party Size</InputLabel>
                <Select
                  value={formData.partySize.toString()}
                  onChange={(e) => {
                    setFormData({ ...formData, partySize: parseInt(e.target.value) });
                    if (formErrors.partySize) {
                      setFormErrors({ ...formErrors, partySize: '' });
                    }
                  }}
                  label="Party Size"
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
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formData.reservationDate}
                onChange={(e) => {
                  setFormData({ ...formData, reservationDate: e.target.value });
                  if (formErrors.reservationDate) {
                    setFormErrors({ ...formErrors, reservationDate: '' });
                  }
                }}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.reservationDate}
                helperText={formErrors.reservationDate}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!formErrors.reservationTime}>
                <InputLabel>Time</InputLabel>
                <Select
                  value={formData.reservationTime}
                  onChange={(e) => {
                    setFormData({ ...formData, reservationTime: e.target.value });
                    if (formErrors.reservationTime) {
                      setFormErrors({ ...formErrors, reservationTime: '' });
                    }
                  }}
                  label="Time"
                  disabled={availableTimeSlots.length === 0}
                >
                  {availableTimeSlots.length === 0 ? (
                    <MenuItem disabled>Restaurant closed on this day</MenuItem>
                  ) : (
                    availableTimeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {formErrors.reservationTime && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {formErrors.reservationTime}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {reservation && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ReservationStatus })}
                    label="Status"
                  >
                    {Object.values(ReservationStatus).map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests"
                multiline
                rows={2}
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                helperText="Any special requests or dietary restrictions"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Internal Notes"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                helperText="For staff use only - not visible to customer"
              />
            </Grid>
          </Grid>

          {/* Cancellation Policy */}
          {!reservation && reservationSettings?.cancellationPolicy && (
            <>
              <Divider sx={{ my: 2 }} />
              <Alert severity="info" icon={<CalendarIcon />}>
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
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.customerName}
        >
          {loading ? 'Saving...' : (reservation ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ReservationManagementPage: React.FC = () => {
  const { isMobile } = useMobileResponsive();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  
  // Filter state
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [partySizeMin, setPartySizeMin] = useState<number | ''>('');
  const [partySizeMax, setPartySizeMax] = useState<number | ''>('');
  
  // Pagination state
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalCovers?: number;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  const { showSnackbar } = useSnackbar();

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const filters: ReservationFilters = {
        page: currentPage,
        limit: pageSize,
        sortBy: 'reservationDate',
        sortOrder: 'desc'
      };
      
      // Date filtering - use date range if provided (supports partial ranges), otherwise single date
      if (startDate || endDate) {
        // Backend supports open-ended ranges (just startDate or just endDate)
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
      } else if (selectedDate) {
        filters.date = selectedDate;
      }
      
      // Status filter
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      
      // Search filters
      if (searchQuery) {
        filters.search = searchQuery;
      } else {
        // Individual customer filters if no general search
        if (customerName) filters.customerName = customerName;
      }
      
      // Party size filters
      if (partySizeMin !== '') filters.partySizeMin = Number(partySizeMin);
      if (partySizeMax !== '') filters.partySizeMax = Number(partySizeMax);
      
      const response = await reservationService.getReservations(filters);
      
      // Handle paginated or non-paginated response
      if (response && 'pagination' in response) {
        const paginatedResponse = response as PaginatedReservations;
        setReservations(paginatedResponse.data);
        setPagination(paginatedResponse.pagination);
      } else {
        setReservations(response as Reservation[]);
        setPagination(null);
      }
    } catch (error) {
      showSnackbar('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedDate, startDate, endDate, statusFilter, searchQuery, customerName, partySizeMin, partySizeMax, currentPage, pageSize]);
  
  const handleClearFilters = () => {
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('all');
    setSearchQuery('');
    setCustomerName('');
    setPartySizeMin('');
    setPartySizeMax('');
    setCurrentPage(1);
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await reservationService.deleteReservation(id);
        showSnackbar('Reservation deleted successfully', 'success');
        fetchReservations();
      } catch (error) {
        showSnackbar('Failed to delete reservation', 'error');
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: ReservationStatus) => {
    try {
      await reservationService.updateReservation(id, { status: newStatus });
      showSnackbar('Status updated successfully', 'success');
      fetchReservations();
    } catch (error) {
      showSnackbar('Failed to update status', 'error');
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED: return 'success';
      case ReservationStatus.COMPLETED: return 'default';
      case ReservationStatus.CANCELLED: return 'error';
      case ReservationStatus.NO_SHOW: return 'warning';
      default: return 'default';
    }
  };

  const getTotalCovers = () => {
    // If pagination is enabled and totalCovers is available, use it (accurate for all matching reservations)
    if (pagination?.totalCovers !== undefined) {
      return pagination.totalCovers;
    }
    // Fallback: calculate from current page (for backward compatibility when pagination is not enabled)
    return reservations
      .filter(r => r.status !== ReservationStatus.CANCELLED)
      .reduce((sum, r) => sum + r.partySize, 0);
  };

  // Mobile card layout for reservations
  const renderMobileCard = (reservation: Reservation) => (
    <Card key={reservation.id} sx={mobileResponsiveStyles.card(isMobile)}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header with customer name and time */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {reservation.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                {reservation.reservationTime}
              </Typography>
            </Box>
            <Chip
              icon={<GroupIcon />}
              label={`${reservation.partySize} ${reservation.partySize === 1 ? 'Guest' : 'Guests'}`}
              size="small"
              variant="outlined"
            />
          </Box>

          <Divider />

          {/* Contact information */}
          <Stack spacing={1}>
            {reservation.customerEmail && (
              <Box display="flex" alignItems="center">
                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{reservation.customerEmail}</Typography>
              </Box>
            )}
            {reservation.customerPhone && (
              <Box display="flex" alignItems="center">
                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">{reservation.customerPhone}</Typography>
              </Box>
            )}
          </Stack>

          {/* Status and notes */}
          <Box>
            <FormControl fullWidth size="small" sx={{ mb: 1 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={reservation.status}
                onChange={(e) => handleStatusChange(reservation.id, e.target.value as ReservationStatus)}
                label="Status"
              >
                {Object.values(ReservationStatus).map(status => (
                  <MenuItem key={status} value={status}>
                    <Chip 
                      label={status} 
                      size="small" 
                      color={getStatusColor(status) as any}
                      sx={{ minWidth: 100 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {reservation.notes && (
              <Typography variant="body2" color="text.secondary" sx={{ 
                fontStyle: 'italic',
                p: 1,
                bgcolor: 'grey.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200'
              }}>
                "{reservation.notes}"
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => handleEdit(reservation)}
              sx={mobileResponsiveStyles.button(isMobile)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => handleDelete(reservation.id)}
              sx={mobileResponsiveStyles.button(isMobile)}
            >
              Delete
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reservation Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingReservation(null);
            setDialogOpen(true);
          }}
        >
          New Reservation
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Filters & Search</Typography>
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={!selectedDate && !startDate && !endDate && statusFilter === 'all' && !searchQuery && !customerName && partySizeMin === '' && partySizeMax === ''}
          >
            Clear All
          </Button>
        </Box>
        <Grid container spacing={2} alignItems="center">
          {/* Search Bar */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
              }}
            />
          </Grid>
          
          {/* Date Range or Single Date */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedDate(''); // Clear single date when using range
                setCurrentPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedDate(''); // Clear single date when using range
                setCurrentPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {/* Single Date (alternative to range) */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Or Single Date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setStartDate(''); // Clear range when using single date
                setEndDate('');
                setCurrentPage(1);
              }}
              InputLabelProps={{ shrink: true }}
              helperText={selectedDate ? "Using single date" : "Or use date range above"}
            />
          </Grid>
          
          {/* Status Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                {Object.values(ReservationStatus).map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Customer Name Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Customer Name"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setSearchQuery(''); // Clear general search when using specific filter
                setCurrentPage(1);
              }}
              disabled={!!searchQuery}
              helperText={searchQuery ? "Disabled when using general search" : ""}
            />
          </Grid>
          
          {/* Party Size Range */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Party Size"
              type="number"
              value={partySizeMin}
              onChange={(e) => {
                setPartySizeMin(e.target.value === '' ? '' : Number(e.target.value));
                setCurrentPage(1);
              }}
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Party Size"
              type="number"
              value={partySizeMax}
              onChange={(e) => {
                setPartySizeMax(e.target.value === '' ? '' : Number(e.target.value));
                setCurrentPage(1);
              }}
              inputProps={{ min: 1 }}
            />
          </Grid>
          
          {/* Summary Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" alignItems="center">
              <GroupIcon sx={{ mr: 1 }} />
              <Typography>
                Total Covers: <strong>{getTotalCovers()}</strong>
              </Typography>
            </Box>
          </Grid>
          
          {/* Results Count */}
          {pagination && (
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                {pagination.total === 0 ? (
                  'No results found'
                ) : (
                  `Showing ${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, pagination.total)} of ${pagination.total}`
                )}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">Page {pagination.page} of {pagination.totalPages}</Typography>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Per Page</InputLabel>
                <Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  label="Per Page"
                >
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(1)}
                disabled={!pagination.hasPrev}
              >
                First
              </Button>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={!pagination.hasNext}
              >
                Last
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Reservations Table - Desktop */}
      <TableContainer component={Paper} sx={mobileResponsiveStyles.table.desktopTable(isMobile)}>
        <Table sx={mobileResponsiveStyles.table.root}>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Party</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No reservations found
                </TableCell>
              </TableRow>
            ) :
              reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                      {reservation.reservationTime}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      {reservation.customerName}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {reservation.customerEmail && (
                        <Box display="flex" alignItems="center">
                          <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">{reservation.customerEmail}</Typography>
                        </Box>
                      )}
                      {reservation.customerPhone && (
                        <Box display="flex" alignItems="center">
                          <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="caption">{reservation.customerPhone}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={<GroupIcon />}
                      label={reservation.partySize}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation.id, e.target.value as ReservationStatus)}
                        sx={{ minWidth: 120 }}
                      >
                        {Object.values(ReservationStatus).map(status => (
                          <MenuItem key={status} value={status}>
                            <Chip 
                              label={status} 
                              size="small" 
                              color={getStatusColor(status) as any}
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={reservation.notes || ''}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {reservation.notes || '-'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(reservation)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(reservation.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reservations Cards - Mobile */}
      <Box sx={mobileResponsiveStyles.table.mobileCard(isMobile)}>
        {loading ? (
          <Card sx={mobileResponsiveStyles.card(isMobile)}>
            <CardContent>
              <Typography align="center">Loading...</Typography>
            </CardContent>
          </Card>
        ) : reservations.length === 0 ? (
          <Card sx={mobileResponsiveStyles.card(isMobile)}>
            <CardContent>
              <Typography align="center">No reservations found</Typography>
            </CardContent>
          </Card>
        ) : (
          reservations.map((reservation) => renderMobileCard(reservation))
        )}
      </Box>

      {/* Reservation Form Dialog */}
      <ReservationFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        reservation={editingReservation}
        onSave={fetchReservations}
      />
    </Container>
  );
};

export default ReservationManagementPage; 