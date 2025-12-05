import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  Stack,
  Grid,
  Container
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Add as AddIcon,
  Support as SupportIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CreateRestaurantForm from './CreateRestaurantForm';

interface NoRestaurantOnboardingProps {
  onRestaurantCreated?: () => void;
}

const NoRestaurantOnboarding: React.FC<NoRestaurantOnboardingProps> = ({
  onRestaurantCreated
}) => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  // Show form if user clicked create
  if (showForm) {
    return (
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', py: 4 }}>
        <CreateRestaurantForm
          onSuccess={() => {
            setShowForm(false);
            if (onRestaurantCreated) {
              onRestaurantCreated();
            }
          }}
          onCancel={() => setShowForm(false)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          mb: 3
        }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <RestaurantIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome to KitchenSync! 🎉
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Get started by setting up your restaurant
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>No restaurant assigned</strong> - You need to create or be assigned to a restaurant 
          before you can use KitchenSync features.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <AddIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  Create New Restaurant
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Set up your restaurant profile and start managing recipes, menus, reservations, and more.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                sx={{ mt: 2 }}
              >
                Create Restaurant
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <SupportIcon color="secondary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight="bold">
                  Need Help?
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                If you should have access to a restaurant or need assistance, contact our support team.
              </Typography>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SupportIcon />}
                onClick={() => window.open('mailto:support@kitchensync.app', '_blank')}
                sx={{ mt: 2 }}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3, bgcolor: 'grey.50' }}>
        <Box display="flex" alignItems="start" gap={2}>
          <InfoIcon color="info" />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              What happens next?
            </Typography>
            <Stack spacing={1} component="ul" sx={{ m: 0, pl: 3 }}>
              <Typography variant="body2" component="li">
                Create your restaurant profile with basic information
              </Typography>
              <Typography variant="body2" component="li">
                Start a 14-day free trial with full access to all features
              </Typography>
              <Typography variant="body2" component="li">
                Get your restaurant website live automatically
              </Typography>
              <Typography variant="body2" component="li">
                Access all modules: CookBook, MenuBuilder, TableFarm, and more
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default NoRestaurantOnboarding;

