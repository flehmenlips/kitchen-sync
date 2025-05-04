import React from 'react';
import { Box, Typography, Button, Stack, Container, Paper, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import EqualizerIcon from '@mui/icons-material/Equalizer'; // Icon for stats

import { getDashboardStats, DashboardStats } from '../services/apiService'; // Import API call and type

const DashboardPage: React.FC = () => {
  const { user } = useAuth(); // Get user info from context

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

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {/* Welcome Card that stands out more */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          backgroundImage: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
          borderLeft: '5px solid',
          borderColor: 'primary.main'
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          What would you like to prepare today?
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Stats Card - Placed before Quick Actions */}
        <Grid xs={12} md={8}> {/* Make stats take more space */}
           <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
             <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <EqualizerIcon sx={{ mr: 1 }} /> Statistics
             </Typography>
             {statsLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>}
             {statsError && <Alert severity="warning" sx={{ mt: 1 }}>{statsError}</Alert>}
             {stats && !statsLoading && !statsError && (
                <Grid container spacing={2} sx={{ textAlign: 'center' }}>
                    <Grid xs={4} sm={2}><Typography variant="h5">{stats.recipes}</Typography><Typography variant="caption">Recipes</Typography></Grid>
                    <Grid xs={4} sm={2}><Typography variant="h5">{stats.ingredients}</Typography><Typography variant="caption">Ingredients</Typography></Grid>
                    <Grid xs={4} sm={2}><Typography variant="h5">{stats.units}</Typography><Typography variant="caption">Units</Typography></Grid>
                    <Grid xs={6} sm={3}><Typography variant="h5">{stats.recipeCategories}</Typography><Typography variant="caption">Recipe Cats</Typography></Grid>
                    <Grid xs={6} sm={3}><Typography variant="h5">{stats.ingredientCategories}</Typography><Typography variant="caption">Ingredient Cats</Typography></Grid>
                </Grid>
             )}
           </Paper>

           {/* Search Moved Here */}
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Search Recipes"
                    placeholder="e.g., Chicken Soup, Chocolate Cake..."
                    InputProps={{
                        startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                        ),
                    }}
                />
            </Paper>
        </Grid>

        {/* Quick Actions Card */}
        <Grid xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Stack spacing={1.5}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/recipes/new"
                fullWidth
              >
                Create New Recipe
              </Button>
               <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/ingredients/new"
                fullWidth
              >
                Add Ingredient
              </Button>
               <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/categories/new"
                fullWidth
              >
                Add Recipe Category
              </Button>
               <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/ingredient-categories/new"
                fullWidth
              >
                Add Ingredient Category
              </Button>
                 <Button 
                variant="outlined" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/units/new"
                fullWidth
              >
                Add Unit
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Main Content Area Removed/Merged */}
        {/* <Grid item xs={12} md={8}> ... </Grid> */}
      </Grid>
    </Container>
  );
};

export default DashboardPage; 