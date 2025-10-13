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
  ArrowForward,
  Star,
} from '@mui/icons-material';
import { PLAN_DETAILS } from '../services/billingService';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Get plans in display order
  const planOrder = ['HOME', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
  const plans = planOrder.map((key) => PLAN_DETAILS[key]);

  return (
    <Box sx={{ 
      flexGrow: 1,
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #8b5cf6 75%, #a855f7 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
        `,
        animation: 'float 20s ease-in-out infinite'
      }} />

      {/* Navigation */}
      <AppBar 
        position="fixed" 
        color="transparent" 
        elevation={0} 
        sx={{ 
          backdropFilter: 'blur(20px)', 
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h5" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            KitchenSync
          </Typography>
          {user ? (
            <Button 
              onClick={() => navigate('/dashboard')} 
              sx={{ 
                mr: 2,
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.5)'
                }
              }}
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => navigate('/login')} 
                sx={{ 
                  mr: 2,
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.5)'
                  }
                }}
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  borderRadius: '12px',
                  px: 4,
                  py: 1,
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Start Free Trial
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          pt: 8,
          position: 'relative',
          zIndex: 1
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              {/* Floating stats cards */}
              <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Paper sx={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  px: 3,
                  py: 2,
                  minWidth: '120px'
                }}>
                  <Typography variant="h4" fontWeight="bold" color="white">
                    10K+
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Restaurants
                  </Typography>
                </Paper>
                <Paper sx={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  px: 3,
                  py: 2,
                  minWidth: '120px'
                }}>
                  <Typography variant="h4" fontWeight="bold" color="white">
                    99.9%
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)">
                    Uptime
                  </Typography>
                </Paper>
              </Box>

              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                fontWeight="800"
                sx={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                All-in-One Restaurant Management Platform
              </Typography>
              <Typography 
                variant="h5" 
                paragraph 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  lineHeight: 1.6
                }}
              >
                From recipes to reservations, manage every aspect of your restaurant with one powerful system.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
                <Button
                  size="large"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/register')}
                  sx={{ 
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#1e40af',
                    borderRadius: '16px',
                    px: 5,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Start 14-Day Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank')}
                  sx={{ 
                    color: 'white', 
                    borderColor: 'rgba(255,255,255,0.4)',
                    borderRadius: '16px',
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    backdropFilter: 'blur(20px)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.6)',
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Watch Demo
                </Button>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.95rem' }}>
                No credit card required • Setup in minutes • Cancel anytime
              </Typography>
            </Grid>
            
            {/* Hero Visual */}
            <Grid item xs={12} md={6}>
              <Box sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* Glass-morphism dashboard preview */}
                <Paper sx={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '24px',
                  p: 4,
                  width: '100%',
                  maxWidth: '500px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
                }}>
                  <Typography variant="h6" color="white" fontWeight="600" gutterBottom>
                    KitchenSync Dashboard
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Paper sx={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      p: 2,
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="h4" color="white" fontWeight="bold">127</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">Orders</Typography>
                    </Paper>
                    <Paper sx={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      p: 2,
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      <Typography variant="h4" color="white" fontWeight="bold">$2.4K</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.8)">Revenue</Typography>
                    </Paper>
                  </Box>
                  <Box sx={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    p: 2,
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Typography variant="body2" color="rgba(255,255,255,0.7)">
                      Real-time restaurant management
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ 
        py: 12, 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        position: 'relative'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h3" 
              gutterBottom 
              fontWeight="800"
              sx={{
                background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Everything You Need to Run Your Restaurant
            </Typography>
            <Typography 
              variant="h6" 
              paragraph 
              sx={{ 
                mb: 6, 
                color: 'text.secondary',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Five powerful modules working together seamlessly
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '20px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      background: 'rgba(255,255,255,0.8)'
                    }
                  }}
                  elevation={0}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Box sx={{ 
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '80px',
                      height: '80px',
                      mx: 'auto',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      borderRadius: '20px',
                      boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                    }}>
                      <Box sx={{ color: 'white', fontSize: '32px' }}>
                        {feature.icon}
                      </Box>
                    </Box>
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      fontWeight="700"
                      sx={{
                        background: 'linear-gradient(135deg, #1e40af 0%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom 
                      sx={{
                        color: '#6b7280',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {feature.subtitle}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{
                        color: '#64748b',
                        lineHeight: 1.6,
                        fontSize: '0.95rem'
                      }}
                    >
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
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} md={3} key={plan.plan}>
                <Card sx={{ textAlign: 'center', position: 'relative', border: plan.plan === 'PROFESSIONAL' ? '2px solid' : undefined, borderColor: plan.plan === 'PROFESSIONAL' ? 'primary.main' : undefined }}>
                  {plan.plan === 'PROFESSIONAL' && (
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
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      {plan.name}
                    </Typography>
                    <Box sx={{ my: 3 }}>
                      <Typography variant="h3" component="span" fontWeight="bold">
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      </Typography>
                      {plan.price !== 0 && (
                        <Typography variant="h6" component="span" color="text.secondary">
                          /month
                        </Typography>
                      )}
                    </Box>
                    <List sx={{ mb: 3 }}>
                      {plan.features.map((feature, i) => (
                        <ListItem sx={{ justifyContent: 'center' }} key={i}>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant={plan.plan === 'PROFESSIONAL' ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      onClick={() => navigate(`/register?plan=${plan.plan}`)}
                    >
                      {plan.price === 0 ? 'Start Free Trial' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
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