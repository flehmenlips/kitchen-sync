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
import { unifiedContentService, UnifiedRestaurantContent } from '../../services/unifiedContentService';
import ContentBlockRenderer from '../../components/customer/ContentBlockRenderer';

const CustomerHomePage: React.FC = () => {
  const [content, setContent] = useState<UnifiedRestaurantContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const unifiedContent = await unifiedContentService.getUnifiedContent('home');
      console.log('[CustomerHomePage] Fetched content:', unifiedContent);
      console.log('[CustomerHomePage] Opening hours data:', unifiedContent?.contact?.openingHours);
      setContent(unifiedContent);
    } catch (error) {
      console.error('Error fetching unified content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = () => {
    if (!content) return '';
    const parts = [
      content.contact.address,
      content.contact.city,
      content.contact.state,
      content.contact.zip
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Safe rendering helper to prevent objects as React children
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      // If it's an object, try to extract meaningful content
      if (Array.isArray(value)) return value.join(', ');
      if (value.toString && typeof value.toString === 'function') return value.toString();
      return JSON.stringify(value);
    }
    return String(value);
  };

  const getTodayHours = () => {
    if (!content?.contact.openingHours) return 'Hours not available';
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const hours = content.contact.openingHours[today];
    if (hours && typeof hours === 'object' && 'open' in hours && 'close' in hours) {
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
          backgroundImage: content?.hero.imageUrl 
            ? `url(${content.hero.imageUrl})` 
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
            {safeRender(content?.hero.title) || 'Welcome to Our Restaurant'}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              mb: 4,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {safeRender(content?.hero.subtitle) || 'Experience culinary excellence'}
          </Typography>
          {content?.hero.ctaText && content?.hero.ctaLink && (
            <Button
              component={Link}
              to={content.hero.ctaLink}
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
              {safeRender(content.hero.ctaText)}
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
                {content?.contact.openingHours && (
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(content.contact.openingHours).map(([day, hours]: [string, any]) => {
                      // Debug logging to see what's causing the React error
                      console.log('[CustomerHomePage] Rendering day:', day, 'hours:', hours, 'type:', typeof hours);
                      
                      // Safely handle hours data - ensure we render strings only
                      const formatHours = (hours: any) => {
                        if (!hours) return 'Closed';
                        if (typeof hours === 'string') return hours;
                        if (typeof hours === 'object' && hours.open && hours.close) {
                          const open = typeof hours.open === 'string' ? hours.open : String(hours.open);
                          const close = typeof hours.close === 'string' ? hours.close : String(hours.close);
                          return `${open} - ${close}`;
                        }
                        // Fallback for any other data type
                        return String(hours);
                      };

                      const formattedHours = formatHours(hours);
                      console.log('[CustomerHomePage] Formatted hours for', day, ':', formattedHours);

                      return (
                        <Typography key={day} variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {day}: {formattedHours}
                        </Typography>
                      );
                    })}
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
                {content?.contact.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1">
                      <a href={`tel:${content.contact.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {safeRender(content.contact.phone)}
                      </a>
                    </Typography>
                  </Box>
                )}
                {content?.contact.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1">
                      <a href={`mailto:${content.contact.email}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {safeRender(content.contact.email)}
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
      {(content?.about.title || content?.about.description) && (
        <Container maxWidth="lg" sx={{ my: 8 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" component="h2" gutterBottom>
                {safeRender(content?.about.title) || 'About Us'}
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {safeRender(content?.about.description) || 'Welcome to our restaurant, where we serve delicious food made with love and the finest ingredients.'}
              </Typography>
              <Button
                component={Link}
                to="/menu"
                variant="outlined"
                size="large"
                startIcon={<RestaurantIcon />}
                sx={{ mt: 2 }}
              >
                View Our Menu
              </Button>
            </Grid>
            {content?.about.imageUrl && (
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                  <CardMedia
                    component="img"
                    height="400"
                    image={content.about.imageUrl}
                    alt={content.about.title || 'About our restaurant'}
                    sx={{ objectFit: 'cover' }}
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
        </Container>
      )}

      {/* Dynamic Content Blocks */}
      <ContentBlockRenderer blocks={content?.contentBlocks || []} />
    </Box>
  );
};

export default CustomerHomePage; 