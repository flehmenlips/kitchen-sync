import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Card,
  CardContent,
  CardActions,
  Skeleton,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EventSeat as EventSeatIcon,
  Restaurant as RestaurantIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { customerAuthService, CustomerProfile } from '../../services/customerAuthService';
import { customerReservationService, Reservation } from '../../services/customerReservationService';
import { format } from 'date-fns';

// Using Reservation type from customerReservationService

interface Order {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  orderType: 'DINE_IN' | 'TAKEOUT' | 'DELIVERY';
}

const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useCustomerAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch profile data
      const profileData = await customerAuthService.getProfile();
      setProfile(profileData.user);
      
      // Fetch reservations
      const reservationsData = await customerReservationService.getMyReservations();
      console.log('Raw reservations data:', reservationsData);
      
      // Filter for upcoming reservations only
      const upcomingReservations = reservationsData.filter(res => {
        // Parse the ISO date and extract just the date part
        const dateOnly = res.reservationDate.split('T')[0];
        const resDateTime = new Date(`${dateOnly}T${res.reservationTime}`);
        const isUpcoming = resDateTime > new Date();
        const isConfirmed = res.status === 'CONFIRMED';
        console.log(`Reservation ${res.id}: date=${res.reservationDate}, time=${res.reservationTime}, parsed=${resDateTime}, isUpcoming=${isUpcoming}, status=${res.status}, isConfirmed=${isConfirmed}`);
        return isUpcoming && isConfirmed;
      });
      console.log('Filtered upcoming reservations:', upcomingReservations);
      setReservations(upcomingReservations);
      
      // TODO: Add orders when implemented
      setOrders([]);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      await customerReservationService.cancelReservation(reservationId);
      // Refresh the reservations list
      await fetchDashboardData();
      enqueueSnackbar('Reservation cancelled successfully', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to cancel reservation', { variant: 'error' });
      console.error('Error cancelling reservation:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      case 'NO_SHOW':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    // Extract just the date part if it's an ISO string
    const dateOnly = date.split('T')[0];
    const dateTime = new Date(`${dateOnly}T${time}`);
    return format(dateTime, 'MMM d, yyyy h:mm a');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                My Profile
              </Typography>
              <Tooltip title="Edit Profile">
                <IconButton onClick={() => navigate('/customer/profile')}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={profile?.name || 'Not set'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={profile?.email}
                />
              </ListItem>
              {profile?.phone && (
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={profile.phone}
                  />
                </ListItem>
              )}
              {profile?.dietaryRestrictions && (
                <ListItem>
                  <ListItemText
                    primary="Dietary Restrictions"
                    secondary={profile.dietaryRestrictions}
                  />
                </ListItem>
              )}
            </List>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<EditIcon />}
                onClick={() => navigate('/customer/profile')}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Reservations and Orders Section */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<EventSeatIcon />}
                    onClick={() => navigate('/customer/reservations/new')}
                  >
                    Make Reservation
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RestaurantIcon />}
                    onClick={() => navigate('/customer/menu')}
                  >
                    View Menu
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* Upcoming Reservations */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Upcoming Reservations
                  </Typography>
                  <Button
                    variant="text"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/customer/reservations/new')}
                  >
                    New Reservation
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {reservations.length > 0 ? (
                  <List>
                    {reservations.map((reservation) => (
                      <ListItem
                        key={reservation.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemText
                          primary={formatDateTime(reservation.reservationDate, reservation.reservationTime)}
                          secondary={
                            <>
                              Party of {reservation.partySize}
                              {reservation.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  Note: {reservation.notes}
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={reservation.status}
                            color={getStatusColor(reservation.status) as any}
                            size="small"
                          />
                          {reservation.status === 'CONFIRMED' && (
                            <Tooltip title="Cancel Reservation">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleCancelReservation(reservation.id)}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No upcoming reservations. Click "New Reservation" to make one.
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* Recent Orders */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {orders.length > 0 ? (
                  <List>
                    {orders.map((order) => (
                      <ListItem
                        key={order.id}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <ListItemText
                          primary={`Order #${order.orderNumber}`}
                          secondary={
                            <>
                              {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {order.orderType} • ${order.totalAmount.toFixed(2)}
                              </Typography>
                            </>
                          }
                        />
                        <Chip
                          label={order.status}
                          color={order.status === 'COMPLETED' ? 'success' : 'default'}
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Alert severity="info">
                    No recent orders.
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CustomerDashboardPage; 