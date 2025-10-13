import React from 'react';
import { Box, Typography, Button, Stack, Paper, Grid, Card, CardContent, Avatar, Chip, LinearProgress } from '@mui/material';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, DashboardStats } from '../services/apiService';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Check if a customer user is somehow accessing this page
  React.useEffect(() => {
    const customerAuth = sessionStorage.getItem('customerAuth');
    if (customerAuth) {
      window.location.href = '/customer/dashboard';
    }
  }, []);

  // State for dashboard stats
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = React.useState<boolean>(true);
  const [statsError, setStatsError] = React.useState<string | null>(null);

  // Fetch stats on component mount
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setStatsError(null);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        setStatsError("Could not load dashboard statistics.");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Mock data for recent activity and notifications
  const recentActivity = [
    { id: 1, action: 'Created recipe', item: 'Chocolate Lava Cake', time: '2 hours ago', type: 'recipe' },
    { id: 2, action: 'Added ingredient', item: 'Vanilla Extract', time: '4 hours ago', type: 'ingredient' },
    { id: 3, action: 'Updated category', item: 'Desserts', time: '1 day ago', type: 'category' },
    { id: 4, action: 'Created recipe', item: 'Beef Wellington', time: '2 days ago', type: 'recipe' },
  ];

  const notifications = [
    { id: 1, message: 'New subscription tier available', type: 'info', time: '1 hour ago' },
    { id: 2, message: 'Recipe import completed successfully', type: 'success', time: '3 hours ago' },
    { id: 3, message: 'Weekly analytics report ready', type: 'info', time: '1 day ago' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'recipe': return <RestaurantMenuIcon />;
      case 'ingredient': return <InventoryIcon />;
      case 'category': return <CategoryIcon />;
      default: return <RecentActorsIcon />;
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      px: { xs: 2, sm: 3, md: 4 }, 
      mt: 2,
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      pb: 4
    }}>
      {/* Hero Welcome Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          borderRadius: '20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            borderRadius: '20px'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back{user?.name ? `, ${user.name}` : ''}! 👨‍🍳
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Ready to create something delicious today?
          </Typography>
          
          {/* Quick Search */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search recipes, ingredients, or categories..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: '500px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.7)',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255,255,255,0.7)',
              },
            }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: '#1f2937' }}>
            📊 Your Kitchen Overview
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statsLoading && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              </Grid>
            )}
            
            {statsError && (
              <Grid item xs={12}>
                <Alert severity="warning">{statsError}</Alert>
              </Grid>
            )}
            
            {stats && !statsLoading && !statsError && (
              <>
                <Grid item xs={6} sm={3}>
                  <Card sx={{ 
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
                        width: 56, 
                        height: 56, 
                        mx: 'auto', 
                        mb: 2 
                      }}>
                        <RestaurantMenuIcon />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                        {stats.recipes}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Recipes
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ 
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
                        width: 56, 
                        height: 56, 
                        mx: 'auto', 
                        mb: 2 
                      }}>
                        <InventoryIcon />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                        {stats.ingredients}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Ingredients
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ 
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'linear-gradient(135deg, #10b981, #059669)', 
                        width: 56, 
                        height: 56, 
                        mx: 'auto', 
                        mb: 2 
                      }}>
                        <CategoryIcon />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                        {stats.recipeCategories}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Categories
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Card sx={{ 
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        bgcolor: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                        width: 56, 
                        height: 56, 
                        mx: 'auto', 
                        mb: 2 
                      }}>
                        <AccessTimeIcon />
                      </Avatar>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                        {stats.units}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Units
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>

          {/* Recent Activity */}
          <Card sx={{ 
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <RecentActorsIcon sx={{ mr: 1 }} />
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                {recentActivity.map((activity) => (
                  <Box key={activity.id} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}>
                    <Avatar sx={{ 
                      bgcolor: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                      width: 40, 
                      height: 40, 
                      mr: 2 
                    }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {activity.action}: <strong>{activity.item}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Quick Actions */}
          <Card sx={{ 
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            mb: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                ⚡ Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  component={RouterLink} 
                  to="/recipes/new"
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '12px',
                    py: 1.5,
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
                    }
                  }}
                >
                  Create New Recipe
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  component={RouterLink} 
                  to="/ingredients/new"
                  fullWidth
                  sx={{ borderRadius: '12px', py: 1.5, fontWeight: 500 }}
                >
                  Add Ingredient
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />} 
                  component={RouterLink} 
                  to="/categories/new"
                  fullWidth
                  sx={{ borderRadius: '12px', py: 1.5, fontWeight: 500 }}
                >
                  Add Category
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<AnalyticsIcon />} 
                  component={RouterLink} 
                  to="/analytics"
                  fullWidth
                  sx={{ borderRadius: '12px', py: 1.5, fontWeight: 500 }}
                >
                  View Analytics
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card sx={{ 
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1 }} />
                Notifications
              </Typography>
              <Stack spacing={2}>
                {notifications.map((notification) => (
                  <Box key={notification.id} sx={{ 
                    p: 2, 
                    borderRadius: '12px',
                    background: notification.type === 'success' 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(59, 130, 246, 0.1)',
                    border: `1px solid ${notification.type === 'success' 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(59, 130, 246, 0.2)'}`
                  }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {notification.time}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;