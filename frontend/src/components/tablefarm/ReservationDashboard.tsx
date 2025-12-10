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
  useTheme,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { reservationService, ReservationStats, ReservationStatus } from '../../services/reservationService';
import { useRestaurant } from '../../context/RestaurantContext';
import { useSnackbar } from '../../context/SnackbarContext';

type DatePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'last90' | 'thisMonth' | 'lastMonth' | 'custom';

export const ReservationDashboard: React.FC = () => {
  const theme = useTheme();
  const { currentRestaurant } = useRestaurant();
  const { showSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('last30');
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [dateRange, currentRestaurant?.id]);

  const applyDatePreset = (preset: DatePreset) => {
    const today = new Date();
    let start: Date;
    let end: Date = endOfDay(today);

    switch (preset) {
      case 'today':
        start = startOfDay(today);
        break;
      case 'yesterday':
        start = startOfDay(subDays(today, 1));
        end = endOfDay(subDays(today, 1));
        break;
      case 'last7':
        start = startOfDay(subDays(today, 7));
        break;
      case 'last30':
        start = startOfDay(subDays(today, 30));
        break;
      case 'last90':
        start = startOfDay(subDays(today, 90));
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'custom':
        // Don't change dates for custom
        return;
      default:
        start = startOfDay(subDays(today, 30));
    }

    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
  };

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    applyDatePreset(preset);
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDatePreset('custom');
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setDatePreset('last30');
    applyDatePreset('last30');
  };

  /**
   * Escapes a CSV field value according to RFC 4180:
   * - Fields containing commas, quotes, or newlines must be wrapped in double quotes
   * - Embedded double quotes must be escaped by doubling them ("")
   */
  const escapeCsvField = (field: string | number): string => {
    const str = String(field);
    // Check if field contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      // Escape embedded quotes by doubling them, then wrap in quotes
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExport = () => {
    if (!stats) return;

    const csvRows = [
      ['Metric', 'Value'],
      ['Total Reservations', stats.totalReservations.toString()],
      ['Confirmed', stats.confirmed.toString()],
      ['Cancelled', stats.cancelled.toString()],
      ['Total Guests', stats.totalGuests.toString()],
      ['Average Party Size', stats.averagePartySize.toFixed(2)],
      [''],
      ['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`],
      [''],
      ['Peak Hours', 'Count'],
      ...stats.peakHours.map(ph => [ph.hour, ph.count.toString()]),
      [''],
      ['Date', 'Reservations', 'Guests'],
      ...stats.byDate.map(d => [d.date, d.count.toString(), d.totalGuests.toString()])
    ];

    const csvContent = csvRows.map(row => row.map(escapeCsvField).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservation-analytics-${dateRange.startDate}-${dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showSnackbar('Analytics data exported successfully', 'success');
  };

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

  const getFilteredStats = (): ReservationStats | null => {
    if (!stats) return null;

    // If no status filter is applied, return stats as-is
    if (statusFilter === 'all') {
      return stats;
    }

    // Filter summary stats based on selected status
    // Note: byDate and peakHours cannot be filtered by status without backend support
    // since they don't contain status breakdown information
    const filteredByStatus = stats.byStatus[statusFilter] || 0;
    
    // Calculate filtered totals - when filtering by a specific status,
    // only show data for that status
    const filteredTotalReservations = filteredByStatus;
    
    // Set status-specific counts based on the filter
    const filteredConfirmed = statusFilter === ReservationStatus.CONFIRMED ? filteredByStatus : 0;
    const filteredCancelled = statusFilter === ReservationStatus.CANCELLED ? filteredByStatus : 0;
    
    // Update byStatus to only show the filtered status
    const filteredByStatusRecord: Record<string, number> = {};
    if (filteredByStatus > 0) {
      filteredByStatusRecord[statusFilter] = filteredByStatus;
    }
    
    return {
      ...stats,
      totalReservations: filteredTotalReservations,
      confirmed: filteredConfirmed,
      cancelled: filteredCancelled,
      pending: 0, // PENDING status doesn't exist in ReservationStatus enum
      byStatus: filteredByStatusRecord,
      // Note: byDate and peakHours remain unfiltered as they don't contain status info
      // To properly filter these, backend support would be needed to include status breakdown
      byDate: stats.byDate, // Cannot filter without status breakdown per date
      peakHours: stats.peakHours, // Cannot filter without status breakdown per hour
      // Average party size and total guests cannot be accurately calculated without
      // fetching individual reservations filtered by status, so we use proportional estimates
      averagePartySize: filteredTotalReservations > 0 && stats.totalReservations > 0
        ? stats.averagePartySize 
        : 0,
      totalGuests: filteredTotalReservations > 0 && stats.totalReservations > 0
        ? Math.round((filteredTotalReservations / stats.totalReservations) * stats.totalGuests)
        : 0
    };
  };

  const filteredStats = getFilteredStats();

  if (!currentRestaurant?.id) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Please select a restaurant to view reservation analytics.
      </Alert>
    );
  }

  const cancellationRate = filteredStats && filteredStats.totalReservations > 0
    ? ((filteredStats.cancelled / filteredStats.totalReservations) * 100).toFixed(1)
    : '0.0';

  const confirmationRate = filteredStats && filteredStats.totalReservations > 0
    ? ((filteredStats.confirmed / filteredStats.totalReservations) * 100).toFixed(1)
    : '0.0';

  return (
    <Box>
      {/* Header with Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5">
          Reservation Analytics
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={loading} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to CSV">
            <IconButton onClick={handleExport} disabled={!filteredStats || loading} color="primary">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            size="small"
          >
            Filters
          </Button>
        </Stack>
      </Box>

      {/* Filters Section */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </Box>
          <Grid container spacing={2}>
            {/* Date Preset Buttons */}
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Quick Date Ranges
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {(['today', 'yesterday', 'last7', 'last30', 'last90', 'thisMonth', 'lastMonth'] as DatePreset[]).map((preset) => (
                  <Chip
                    key={preset}
                    label={preset === 'last7' ? 'Last 7 Days' :
                           preset === 'last30' ? 'Last 30 Days' :
                           preset === 'last90' ? 'Last 90 Days' :
                           preset === 'thisMonth' ? 'This Month' :
                           preset === 'lastMonth' ? 'Last Month' :
                           preset.charAt(0).toUpperCase() + preset.slice(1)}
                    onClick={() => handleDatePresetChange(preset)}
                    color={datePreset === preset ? 'primary' : 'default'}
                    variant={datePreset === preset ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Stack>
            </Grid>

            {/* Custom Date Range */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {Object.values(ReservationStatus).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      ) : !filteredStats ? (
        <Alert severity="info">
          No data available for the selected date range.
        </Alert>
      ) : (
        <>
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
                        {filteredStats.totalReservations}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {(() => {
                          // Parse dates correctly to avoid timezone issues
                          const [startYear, startMonth, startDay] = dateRange.startDate.split('-').map(Number);
                          const [endYear, endMonth, endDay] = dateRange.endDate.split('-').map(Number);
                          const startDisplayDate = new Date(startYear, startMonth - 1, startDay);
                          const endDisplayDate = new Date(endYear, endMonth - 1, endDay);
                          return `${format(startDisplayDate, 'MMM d')} - ${format(endDisplayDate, 'MMM d, yyyy')}`;
                        })()}
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
                        {filteredStats.confirmed}
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
                        {filteredStats.cancelled}
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
                        {filteredStats.totalGuests}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Avg party: {filteredStats.averagePartySize.toFixed(1)}
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Peak Hours */}
          {filteredStats.peakHours && filteredStats.peakHours.length > 0 ? (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon />
                Peak Hours
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {filteredStats.peakHours.slice(0, 10).map((peakHour, index) => {
                  const maxCount = filteredStats.peakHours[0]?.count || 1;
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
          ) : (
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                No peak hours data available for the selected date range.
              </Typography>
            </Paper>
          )}

          {/* Reservations by Date */}
          {filteredStats.byDate && filteredStats.byDate.length > 0 ? (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon />
                Reservations by Date
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {filteredStats.byDate.slice(0, 10).map((dateStat, index) => {
                  // Format date using UTC components to ensure correct date display
                  // The date string from backend is in YYYY-MM-DD format (UTC date)
                  const [year, month, day] = dateStat.date.split('-').map(Number);
                  const displayDate = new Date(year, month - 1, day);
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {format(displayDate, 'MMM dd, yyyy')}
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
                  );
                })}
              </Grid>
            </Paper>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" align="center">
                No reservations found for the selected date range.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};
