import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  CheckCircle,
  Restaurant,
  MenuBook,
  CalendarMonth,
  Kitchen,
  Settings,
  PlayCircle,
  Email,
  Support,
  Launch
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const onboardingSteps = [
  'Account Created',
  'Explore Dashboard',
  'Customize Settings',
  'Start Using KitchenSync'
];

const RestaurantWelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurantName, setRestaurantName] = useState<string>('');

  useEffect(() => {
    // Get restaurant info from localStorage (set during registration)
    const storedInfo = localStorage.getItem('kitchenSyncUserInfo');
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        // For now, use the user's name as restaurant name
        setRestaurantName(parsed.user?.name || 'Your Restaurant');
      } catch (error) {
        console.error('Error parsing stored info:', error);
      }
    }

    // If no user info, redirect to login
    if (!storedInfo) {
      navigate('/login');
    }
  }, [navigate]);

  const handleGetStarted = () => {
    // Force a page reload to ensure auth context picks up the stored credentials
    window.location.href = '/dashboard';
  };

  const features = [
    {
      icon: <MenuBook />,
      title: 'CookBook',
      description: 'Manage recipes, ingredients, and costs'
    },
    {
      icon: <Kitchen />,
      title: 'AgileChef',
      description: 'Organize kitchen prep with visual boards'
    },
    {
      icon: <Restaurant />,
      title: 'MenuBuilder',
      description: 'Design and publish beautiful menus'
    },
    {
      icon: <CalendarMonth />,
      title: 'TableFarm',
      description: 'Handle reservations and orders'
    },
    {
      icon: <Settings />,
      title: 'Settings',
      description: 'Customize your restaurant profile'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to KitchenSync!
          </Typography>
          <Typography variant="h5" gutterBottom>
            Your restaurant has been successfully registered
          </Typography>
          <Typography variant="body1">
            Your 14-day free trial has started. Let's get you set up!
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, mb: 4 }}>
        <Stepper activeStep={0} alternativeLabel>
          {onboardingSteps.map((label) => (
            <Step key={label} completed={label === 'Account Created'}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                What's Included in Your Trial
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                We've set up your restaurant with sample data to help you explore all features:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sample Recipes"
                    secondary="Pre-loaded recipes to see how CookBook works"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Menu Template"
                    secondary="A starter menu ready for customization"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sample Reservations"
                    secondary="Example bookings to explore TableFarm"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Prep Board Setup"
                    secondary="AgileChef columns ready to use"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Need Help?
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PlayCircle sx={{ color: 'white' }} />
                  </ListItemIcon>
                  <ListItemText primary="Watch Tutorial Videos" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email sx={{ color: 'white' }} />
                  </ListItemIcon>
                  <ListItemText primary="support@kitchensync.app" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Support sx={{ color: 'white' }} />
                  </ListItemIcon>
                  <ListItemText primary="Live Chat Support" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Explore KitchenSync Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {React.cloneElement(feature.icon, { sx: { fontSize: 48 } })}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleGetStarted}
          sx={{ mr: 2 }}
        >
          Go to Dashboard
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/website')}
          startIcon={<Launch />}
        >
          Set Up Your Website
        </Button>
      </Box>

      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Pro Tip:</strong> Start by exploring the dashboard to get familiar with the interface, 
          then customize your restaurant settings to match your brand.
        </Typography>
      </Alert>
    </Container>
  );
};

export default RestaurantWelcomePage; 