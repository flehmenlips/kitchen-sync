import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Skeleton
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { restaurantSettingsService, RestaurantSettings } from '../../services/restaurantSettingsService';
import { contentBlockService, ContentBlock } from '../../services/contentBlockService';
import ContentBlockRenderer from '../../components/customer/ContentBlockRenderer';

const CustomerHomePage: React.FC = () => {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsData, blocksData] = await Promise.all([
        restaurantSettingsService.getPublicSettings(),
        contentBlockService.getPublicBlocks('home')
      ]);
      setSettings(settingsData);
      setContentBlocks(blocksData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = () => {
    if (!settings) return '';
    const parts = [
      settings.contactAddress,
      settings.contactCity,
      settings.contactState,
      settings.contactZip
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getTodayHours = () => {
    if (!settings?.openingHours) return 'Hours not available';
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const hours = settings.openingHours[today];
    if (hours && hours.open && hours.close) {
      return `${hours.open} - ${hours.close}`;
    }
    return 'Closed today';
  };

  if (loading) {
    return (
      <Box>
        {/* Hero Section Skeleton */}
        <Box
          sx={{
            position: 'relative',
            height: '500px',
            backgroundColor: 'grey.300'
          }}
        >
          <Skeleton variant="rectangular" height="100%" />
        </Box>

        {/* Info Cards Skeleton */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {[1, 2, 3].map(i => (
              <Grid item xs={12} md={4} key={i}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '500px',
          backgroundImage: settings?.heroImageUrl 
            ? `url(${settings.heroImageUrl})` 
            : 'linear-gradient(to right, #1976d2, #42a5f5)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            {settings?.heroTitle || 'Welcome to Our Restaurant'}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {settings?.heroSubtitle || 'Experience culinary excellence'}
          </Typography>
          {settings?.heroCTAText && settings?.heroCTALink && (
            <Button
              component={Link}
              to={settings.heroCTALink}
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }}
            >
              {settings.heroCTAText}
            </Button>
          )}
        </Container>
      </Box>

      {/* Restaurant Info Cards */}
      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {/* Opening Hours Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <AccessTimeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Opening Hours
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Today: <strong>{getTodayHours()}</strong>
                </Typography>
                {settings?.openingHours && (
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(settings.openingHours).map(([day, hours]) => (
                      <Typography key={day} variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {day}: {hours.open} - {hours.close}
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Location Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <LocationOnIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Our Location
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {formatAddress() || '123 Main Street, City, State 12345'}
                </Typography>
                <Button
                  variant="text"
                  color="primary"
                  sx={{ mt: 2 }}
                  href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress())}`}
                  target="_blank"
                >
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <PhoneIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Contact Us
                </Typography>
                {settings?.contactPhone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1">
                      <a href={`tel:${settings.contactPhone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {settings.contactPhone}
                      </a>
                    </Typography>
                  </Box>
                )}
                {settings?.contactEmail && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1">
                      <a href={`mailto:${settings.contactEmail}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {settings.contactEmail}
                      </a>
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* About Section */}
      {(settings?.aboutTitle || settings?.aboutDescription) && (
        <Container maxWidth="lg" sx={{ my: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom>
                {settings.aboutTitle || 'About Us'}
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {settings.aboutDescription || 'Welcome to our restaurant, where we serve delicious food made with love and the finest ingredients.'}
              </Typography>
              <Button
                component={Link}
                to="/customer/menu"
                variant="outlined"
                size="large"
                startIcon={<RestaurantIcon />}
                sx={{ mt: 2 }}
              >
                View Our Menu
              </Button>
            </Grid>
            {settings?.aboutImageUrl && (
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    height="400"
                    image={settings.aboutImageUrl}
                    alt={settings.aboutTitle || 'About our restaurant'}
                    sx={{ objectFit: 'cover' }}
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>
      )}

      {/* Dynamic Content Blocks */}
      <ContentBlockRenderer blocks={contentBlocks} />
    </Box>
  );
};

export default CustomerHomePage; 