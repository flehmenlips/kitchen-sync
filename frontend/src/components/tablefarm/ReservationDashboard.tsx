import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { reservationService, ReservationStats } from '../../services/reservationService';
import { useRestaurant } from '../../context/RestaurantContext';
import { useSnackbar } from '../../context/SnackbarContext';

export const ReservationDashboard: React.FC = () => {
  const theme = useTheme();
  const { currentRestaurant } = useRestaurant();
  const { showSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchStats();
  }, [dateRange, currentRestaurant?.id]);

  const fetchStats = async () => {
    if (!currentRestaurant?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await reservationService.getStats({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        restaurantId: currentRestaurant.id,
        groupBy: 'day'
      });
      setStats(data);
    } catch (err) {
      console.error('Error fetching reservation stats:', err);
      setError('Failed to load reservation statistics');
      showSnackbar('Failed to load statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!currentRestaurant?.id) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Please select a restaurant to view reservation analytics.
      </Alert>
    );
  }

  if (!stats) {
    return null;
  }

  const cancellationRate = stats.totalReservations > 0
    ? ((stats.cancelled / stats.totalReservations) * 100).toFixed(1)
    : '0.0';

  const confirmationRate = stats.totalReservations > 0
    ? ((stats.confirmed / stats.totalReservations) * 100).toFixed(1)
    : '0.0';

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Reservation Analytics
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Reservations
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalReservations}
                  </Typography>
                </Box>
                <EventIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Confirmed
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.confirmed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {confirmationRate}% of total
                  </Typography>
                </Box>
                <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Cancelled
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.cancelled}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {cancellationRate}% cancellation rate
                  </Typography>
                </Box>
                <CancelIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total Guests
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalGuests}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avg party: {stats.averagePartySize.toFixed(1)}
                  </Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Peak Hours */}
      {stats.peakHours && stats.peakHours.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTimeIcon />
            Peak Hours
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {stats.peakHours.slice(0, 10).map((peakHour, index) => {
              const maxCount = stats.peakHours[0]?.count || 1;
              const percentage = (peakHour.count / maxCount) * 100;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight="medium">
                        {peakHour.hour}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {peakHour.count} reservation{peakHour.count !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        height: 8,
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          width: `${percentage}%`,
                          backgroundColor: theme.palette.primary.main,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Reservations by Date */}
      {stats.byDate && stats.byDate.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon />
            Reservations by Date
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {stats.byDate.slice(0, 10).map((dateStat, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {format(new Date(dateStat.date), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {dateStat.count} reservation{dateStat.count !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dateStat.totalGuests} guests
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

