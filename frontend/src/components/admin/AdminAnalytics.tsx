import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as AttachMoneyIcon,
  Group as GroupIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  AdminPanelSettings as AdminPanelSettingsIcon
} from '@mui/icons-material';
import { format, subDays } from 'date-fns';
import { customerApi, staffApi } from '../../services/adminApi';

interface Analytics {
  customers: {
    total: number;
    newThisMonth: number;
    verified: number;
    withReservations: number;
    growth: number;
    topCustomers: Array<{
      id: number;
      name: string;
      email: string;
      reservationCount: number;
      totalSpent: number;
    }>;
  };
  reservations: {
    totalThisMonth: number;
    completedThisMonth: number;
    cancelledThisMonth: number;
    averagePartySize: number;
    growth: number;
    upcomingCount: number;
  };
  staff: {
    total: number;
    admins: number;
    activeToday: number;
    newThisMonth: number;
  };
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = new Date();
      const startDate = subDays(endDate, parseInt(dateRange));
      
      const [customerAnalytics, staffAnalytics] = await Promise.all([
        customerApi.getCustomerAnalytics({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }),
        staffApi.getStaffAnalytics()
      ]);

      // Combine the analytics data
      setAnalytics({
        customers: customerAnalytics.customers || {
          total: customerAnalytics.total || 0,
          newThisMonth: customerAnalytics.newThisMonth || 0,
          verified: customerAnalytics.verified || 0,
          withReservations: customerAnalytics.withReservations || 0,
          growth: customerAnalytics.growth || 0,
          topCustomers: customerAnalytics.topCustomers || []
        },
        reservations: customerAnalytics.reservations || {
          totalThisMonth: 0,
          completedThisMonth: 0,
          cancelledThisMonth: 0,
          averagePartySize: 0,
          growth: 0,
          upcomingCount: 0
        },
        staff: staffAnalytics || {
          total: staffAnalytics.total || 0,
          admins: staffAnalytics.admins || 0,
          activeToday: staffAnalytics.activeToday || 0,
          newThisMonth: staffAnalytics.newThisMonth || 0
        }
      });
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export functionality coming soon!');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !analytics) {
    return (
      <Alert severity="error">
        {error || 'Failed to load analytics'}
      </Alert>
    );
  }

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon, 
    color = 'primary' 
  }: {
    title: string;
    value: number | string;
    change?: number;
    icon: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  }) => (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {change >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={change >= 0 ? 'success.main' : 'error.main'}
                  ml={0.5}
                >
                  {Math.abs(change)}% vs last period
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Analytics Overview</Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Date Range"
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Customers"
            value={analytics.customers.total}
            change={analytics.customers.growth}
            icon={<PersonIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Verified Customers"
            value={`${analytics.customers.verified}/${analytics.customers.total}`}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Staff"
            value={analytics.staff.total}
            icon={<GroupIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Upcoming Reservations"
            value={analytics.reservations.upcomingCount}
            icon={<RestaurantIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3}>
        {/* Customer Insights */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Insights
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="New Customers This Month"
                  secondary={analytics.customers.newThisMonth}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <RestaurantIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Customers with Reservations"
                  secondary={`${analytics.customers.withReservations} (${Math.round((analytics.customers.withReservations / analytics.customers.total) * 100)}%)`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email Verification Rate"
                  secondary={`${Math.round((analytics.customers.verified / analytics.customers.total) * 100)}%`}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Reservation Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Reservation Statistics
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CalendarIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Total Reservations This Month"
                  secondary={analytics.reservations.totalThisMonth}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Completed Reservations"
                  secondary={`${analytics.reservations.completedThisMonth} (${Math.round((analytics.reservations.completedThisMonth / analytics.reservations.totalThisMonth) * 100)}%)`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Average Party Size"
                  secondary={analytics.reservations.averagePartySize.toFixed(1)}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Customers
            </Typography>
            {analytics.customers.topCustomers.length > 0 ? (
              <List>
                {analytics.customers.topCustomers.map((customer, index) => (
                  <React.Fragment key={customer.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            backgroundColor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          {index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={customer.name || customer.email}
                        secondary={`${customer.reservationCount} reservations`}
                      />
                      {index === 0 && (
                        <Chip
                          icon={<StarIcon />}
                          label="Top Customer"
                          color="warning"
                          size="small"
                        />
                      )}
                    </ListItem>
                    {index < analytics.customers.topCustomers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary">No customer data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Staff Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Staff Overview
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <AdminPanelSettingsIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Admin Users"
                  secondary={`${analytics.staff.admins} of ${analytics.staff.total}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Active Today"
                  secondary={analytics.staff.activeToday}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon />
                </ListItemIcon>
                <ListItemText
                  primary="New Staff This Month"
                  secondary={analytics.staff.newThisMonth}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics; 