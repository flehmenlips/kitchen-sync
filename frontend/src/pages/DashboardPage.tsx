import React from 'react';
import { Box, Typography, Button, Stack, Container, Paper, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

const DashboardPage: React.FC = () => {
  const { user } = useAuth(); // Get user info from context

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back{user?.name ? `, ${user.name}` : ''}!
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Actions Card */}
        <Grid item xs={12} md={4}>
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

        {/* Main Content Area (Search / Recent etc.) */}
        <Grid item xs={12} md={8}>
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
              // TODO: Add search functionality state and handler
            />
          </Paper>
          
          {/* Placeholder for Recent Recipes/Favorites */}
           <Paper elevation={2} sx={{ p: 2 }}>
             <Typography variant="h6" gutterBottom>Recent Activity</Typography>
             <Typography variant="body2" color="text.secondary">
                 (Recent recipes will appear here)
             </Typography>
            </Paper>

        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardPage; 