import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  useMediaQuery,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  Restaurant,
  MenuBook,
  Kitchen,
  CalendarMonth,
  DashboardCustomize,
  CheckCircle,
  TrendingUp,
  Speed,
  Group,
  ArrowForward,
  Star,
  AttachMoney,
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <MenuBook sx={{ fontSize: 48 }} />,
      title: 'CookBook',
      subtitle: 'Recipe Management',
      description: 'Centralize your recipes with scaling, costing, and nutritional analysis.',
    },
    {
      icon: <Kitchen sx={{ fontSize: 48 }} />,
      title: 'AgileChef',
      subtitle: 'Prep Management',
      description: 'Streamline kitchen prep with task boards and real-time tracking.',
    },
    {
      icon: <Restaurant sx={{ fontSize: 48 }} />,
      title: 'MenuBuilder',
      subtitle: 'Menu Design',
      description: 'Create beautiful menus with drag-and-drop simplicity and recipe integration.',
    },
    {
      icon: <CalendarMonth sx={{ fontSize: 48 }} />,
      title: 'TableFarm',
      subtitle: 'Reservations & Orders',
      description: 'Manage reservations, online orders, and customer relationships.',
    },
    {
      icon: <DashboardCustomize sx={{ fontSize: 48 }} />,
      title: 'ChefRail',
      subtitle: 'Kitchen Display',
      description: 'Real-time order management with kitchen display system.',
    },
  ];

  const benefits = [
    'Reduce food waste by up to 30%',
    'Save 10+ hours per week on admin tasks',
    'Increase kitchen efficiency by 40%',
    'Improve customer satisfaction scores',
    'Real-time analytics and insights',
    'Mobile-friendly for on-the-go management',
  ];

  const testimonials = [
    {
      quote: "KitchenSync transformed how we run our kitchen. We've cut prep time in half and virtually eliminated order errors.",
      author: "Chef Michael Chen",
      restaurant: "The Modern Table",
      rating: 5,
    },
    {
      quote: "The recipe scaling and costing features alone have saved us thousands of dollars per month.",
      author: "Sarah Martinez",
      restaurant: "Bella Vista Bistro",
      rating: 5,
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation */}
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(255,255,255,0.9)' }}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            KitchenSync
          </Typography>
          <Button color="primary" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
            Sign In
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/register')}>
            Start Free Trial
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          pt: 8,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
                All-in-One Restaurant Management Platform
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                From recipes to reservations, manage every aspect of your restaurant with one powerful system.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/register')}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Start 14-Day Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Watch Demo
                </Button>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                No credit card required • Setup in minutes • Cancel anytime
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <img 
                  src="/api/placeholder/600/400" 
                  alt="KitchenSync Dashboard"
                  style={{ width: '100%', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, backgroundColor: 'background.default' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
            Everything You Need to Run Your Restaurant
          </Typography>
          <Typography variant="h6" align="center" paragraph sx={{ mb: 6, color: 'text.secondary' }}>
            Five powerful modules working together seamlessly
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    }
                  }}
                  elevation={2}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ color: 'primary.main', mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      {feature.subtitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" gutterBottom fontWeight="bold">
                Why Restaurant Owners Choose KitchenSync
              </Typography>
              <List>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={benefit}
                      primaryTypographyProps={{ variant: 'h6' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  ROI in 60 Days
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Most restaurants see positive ROI within 60 days through reduced waste, improved efficiency, and better customer experience.
                </Typography>
                <Button variant="contained" size="large" onClick={() => navigate('/register')}>
                  Start Saving Today
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Testimonials */}
      <Box sx={{ py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
            Loved by Restaurant Owners
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: 'warning.main' }} />
                      ))}
                    </Box>
                    <Typography variant="h6" paragraph>
                      "{testimonial.quote}"
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {testimonial.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.restaurant}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: 10, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom fontWeight="bold">
            Simple, Transparent Pricing
          </Typography>
          <Typography variant="h6" align="center" paragraph sx={{ mb: 6, color: 'text.secondary' }}>
            Start with a 14-day free trial. No credit card required.
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ textAlign: 'center', position: 'relative' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Starter
                  </Typography>
                  <Box sx={{ my: 3 }}>
                    <Typography variant="h3" component="span" fontWeight="bold">
                      $49
                    </Typography>
                    <Typography variant="h6" component="span" color="text.secondary">
                      /month
                    </Typography>
                  </Box>
                  <List sx={{ mb: 3 }}>
                    <ListItem sx={{ justifyContent: 'center' }}>
                      <ListItemText primary="Up to 5 staff accounts" />
                    </ListItem>
                    <ListItem sx={{ justifyContent: 'center' }}>
                      <ListItemText primary="All core modules" />
                    </ListItem>
                    <ListItem sx={{ justifyContent: 'center' }}>
                      <ListItemText primary="Email support" />
                    </ListItem>
                  </List>
                  <Button variant="outlined" fullWidth size="large" onClick={() => navigate('/register')}>
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ textAlign: 'center', position: 'relative', border: '2px solid', borderColor: 'primary.main' }}>
                <Box sx={{ 
                  position: 'absolute', 
                  top: -16, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  px: 3,
                  py: 0.5,
                  borderRadius: 1,
                }}>
                  <Typography variant="body2" fontWeight="bold">
                    MOST POPULAR
                  </Typography>
                </Box>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Professional
                  </Typography>
                  <Box sx={{ my: 3 }}>
                    <Typography variant="h3" component="span" fontWeight="bold">
                      $149
                    </Typography>
                    <Typography variant="h6" component="span" color="text.secondary">
                      /month
                    </Typography>
                  </Box>
                  <List sx={{ mb: 3 }}>
                    <ListItem sx={{ justifyContent: 'center' }}>
                      <ListItemText primary="Up to 20 staff accounts" />
                    </ListItem>
                    <ListItem sx={{ justifyContent: 'center' }}>
                      <ListItemText primary="Advanced analytics" />
                    </ListItem>
                    <ListItem sx={{ justifyContent: 'center' }}>
                      <ListItemText primary="Priority support" />
                    </ListItem>
                    <ListItem sx={{ justifyContent: 'center' }}>
                      <ListItemText primary="API access" />
                    </ListItem>
                  </List>
                  <Button variant="contained" fullWidth size="large" onClick={() => navigate('/register')}>
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, backgroundColor: 'primary.main', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Ready to Transform Your Restaurant?
          </Typography>
          <Typography variant="h6" paragraph sx={{ mb: 4 }}>
            Join thousands of restaurant owners who are saving time and money with KitchenSync.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/register')}
            sx={{ px: 6, py: 2 }}
          >
            Start Your 14-Day Free Trial
          </Button>
          <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
            No credit card required • Setup in minutes • Cancel anytime
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, backgroundColor: 'grey.900', color: 'grey.400' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                KitchenSync
              </Typography>
              <Typography variant="body2">
                The all-in-one restaurant management platform.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
                Product
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Features</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Pricing</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Demo</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
                Company
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>About</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Blog</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Contact</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
                Support
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Help Center</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Documentation</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>API</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
                Legal
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Privacy Policy</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', mb: 1 }}>Terms of Service</Typography>
            </Grid>
          </Grid>
          <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'grey.800', textAlign: 'center' }}>
            <Typography variant="body2">
              © 2025 KitchenSync. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 