import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  AdminPanelSettings,
  Store,
  People,
  AttachMoney,
} from '@mui/icons-material';
import platformAuthService, { PlatformAdmin } from '../services/platformAuthService';
import restaurantService, { PlatformAnalytics } from '../services/restaurantService';

const PlatformDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currentAdmin, analyticsData] = await Promise.all([
        platformAuthService.getCurrentAdmin(),
        restaurantService.getPlatformAnalytics()
      ]);
      setAdmin(currentAdmin);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      navigate('/platform-admin/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return <Typography>Loading...</Typography>;
  }

  const totalRestaurants = analytics.restaurantsByStatus.reduce((sum, item) => sum + item._count, 0);
  const activeSubscriptions = analytics.subscriptionsByPlan.reduce((sum, item) => sum + item._count, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Platform Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {admin?.name}!
      </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Stats Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Store sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Restaurants
                    </Typography>
                    <Typography variant="h4">
                      {totalRestaurants}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Active Subscriptions
                    </Typography>
                    <Typography variant="h4">
                      {activeSubscriptions}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      MRR
                    </Typography>
                    <Typography variant="h4">
                      ${analytics.mrr.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AdminPanelSettings sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Recent Signups
                    </Typography>
                    <Typography variant="h4">
                      {analytics.recentSignups}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                <Button variant="contained" onClick={() => navigate('/platform-admin/restaurants')}>
                  Manage Restaurants
                </Button>
                <Button variant="outlined" onClick={() => navigate('/platform-admin/subscriptions')}>
                  View Subscriptions
                </Button>
                <Button variant="outlined" onClick={() => navigate('/platform-admin/analytics')}>
                  Platform Analytics
                </Button>
                {admin?.role === 'SUPER_ADMIN' && (
                  <Button variant="outlined" onClick={() => navigate('/platform-admin/admins')}>
                    Manage Admins
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Admin Info */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Account
              </Typography>
              <Typography>Email: {admin?.email}</Typography>
              <Typography>Role: {admin?.role}</Typography>
              <Typography>
                Last Login: {admin?.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'First login'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
  );
};

export default PlatformDashboard; 