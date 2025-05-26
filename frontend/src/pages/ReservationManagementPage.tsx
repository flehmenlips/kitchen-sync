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
  Alert
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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { reservationService, Reservation, ReservationStatus } from '../services/reservationService';
import { useSnackbar } from '../context/SnackbarContext';

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
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    partySize: 2,
    reservationDate: format(new Date(), 'yyyy-MM-dd'),
    reservationTime: '18:00',
    status: ReservationStatus.CONFIRMED,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

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
        notes: reservation.notes || ''
      });
    } else {
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        partySize: 2,
        reservationDate: format(new Date(), 'yyyy-MM-dd'),
        reservationTime: '18:00',
        status: ReservationStatus.CONFIRMED,
        notes: ''
      });
    }
  }, [reservation]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (reservation) {
        await reservationService.updateReservation(reservation.id, formData);
        showSnackbar('Reservation updated successfully', 'success');
      } else {
        await reservationService.createReservation({
          ...formData,
          restaurantId: 1 // Single restaurant MVP
        });
        showSnackbar('Reservation created successfully', 'success');
      }
      onSave();
      onClose();
    } catch (error) {
      showSnackbar('Failed to save reservation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {reservation ? 'Edit Reservation' : 'New Reservation'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Customer Name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
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
            <TextField
              fullWidth
              label="Party Size"
              type="number"
              value={formData.partySize}
              onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
              inputProps={{ min: 1, max: 20 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.reservationDate}
              onChange={(e) => setFormData({ ...formData, reservationDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Time"
              type="time"
              value={formData.reservationTime}
              onChange={(e) => setFormData({ ...formData, reservationTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
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
              label="Special Requests / Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.customerName}
        >
          {reservation ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ReservationManagementPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');  // Empty means show all dates
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationService.getReservations({
        date: selectedDate || undefined,  // Only pass date if one is selected
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setReservations(data);
    } catch (error) {
      showSnackbar('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [selectedDate, statusFilter]);

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setFormDialogOpen(true);
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
    return reservations
      .filter(r => r.status !== ReservationStatus.CANCELLED)
      .reduce((sum, r) => sum + r.partySize, 0);
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Reservation Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedReservation(null);
            setFormDialogOpen(true);
          }}
        >
          New Reservation
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              placeholder="All dates"
              helperText={!selectedDate ? "Showing all dates" : ""}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                {Object.values(ReservationStatus).map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center">
              <GroupIcon sx={{ mr: 1 }} />
              <Typography>
                Total Covers: <strong>{getTotalCovers()}</strong>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchReservations}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reservations Table */}
      <TableContainer component={Paper}>
        <Table>
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
            ) : (
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reservation Form Dialog */}
      <ReservationFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        reservation={selectedReservation}
        onSave={fetchReservations}
      />
    </Container>
  );
};

export default ReservationManagementPage; 