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
import { contentBlockService, ContentBlock } from '../../services/contentBlockService';
import { restaurantSettingsService, RestaurantSettings } from '../../services/restaurantSettingsService';
import ContentBlockRenderer from '../../components/customer/ContentBlockRenderer';
import { getCurrentRestaurantSlug } from '../../utils/subdomain';

const CustomerHomePage: React.FC = () => {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch content blocks (primary source for website content)
      const blocks = await contentBlockService.getPublicBlocks('home');
      console.log('[CustomerHomePage] Fetched content blocks:', blocks);
      setContentBlocks(blocks);

      // Fetch restaurant settings only for contact info and branding
      const settings = await restaurantSettingsService.getPublicSettings();
      console.log('[CustomerHomePage] Fetched restaurant settings for contact/branding:', settings);
      setRestaurantSettings(settings);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = () => {
    if (!restaurantSettings) return '';
    const parts = [
      restaurantSettings.contactAddress,
      restaurantSettings.contactCity,
      restaurantSettings.contactState,
      restaurantSettings.contactZip
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getTodayHours = () => {
    try {
      if (!restaurantSettings?.openingHours) return 'Hours not available';
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[new Date().getDay()];
      const hours = restaurantSettings.openingHours[today];
      
      if (!hours || typeof hours !== 'object') return 'Closed today';
      
      const open = hours.open;
      const close = hours.close;
      
      if (!open || !close) return 'Closed today';
      
      return `${String(open)} - ${String(close)}`;
    } catch (error) {
      console.error('Error getting today hours:', error);
      return 'Hours not available';
    }
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

  // Separate content blocks by type
  const heroBlock = contentBlocks.find(block => block.blockType === 'hero');
  const otherBlocks = contentBlocks
    .filter(block => block.blockType !== 'hero')
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <Box>
      {/* Hero Section from ContentBlocks */}
      {heroBlock && <ContentBlockRenderer blocks={[heroBlock]} />}

      {/* Restaurant Info Cards - only show if we have restaurant settings */}
      {restaurantSettings && (
        <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
          <Grid container spacing={3}>
            {/* Opening Hours Card */}
            {restaurantSettings.openingHours && (
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <AccessTimeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {restaurantSettings.hoursCardTitle || 'Opening Hours'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Today: <strong>{getTodayHours()}</strong>
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {(() => {
                        try {
                          if (!restaurantSettings?.openingHours || typeof restaurantSettings.openingHours !== 'object') {
                            return <Typography variant="body2">Hours not available</Typography>;
                          }
                          
                          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                          const validEntries = days
                            .filter(day => restaurantSettings.openingHours[day])
                            .map(day => {
                              const hours = restaurantSettings.openingHours[day];
                              
                              if (!hours || typeof hours !== 'object') {
                                return { day, formattedHours: 'Closed' };
                              }
                              
                              const open = hours.open ? String(hours.open) : '';
                              const close = hours.close ? String(hours.close) : '';
                              
                              if (!open || !close) {
                                return { day, formattedHours: 'Closed' };
                              }
                              
                              return { day, formattedHours: `${open} - ${close}` };
                            });
                          
                          return validEntries.map(({ day, formattedHours }) => (
                            <Typography key={day} variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {day}: {formattedHours}
                            </Typography>
                          ));
                        } catch (error) {
                          console.error('Error rendering opening hours:', error);
                          return <Typography variant="body2">Hours not available</Typography>;
                        }
                      })()}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Location Card */}
            {(restaurantSettings.contactAddress || restaurantSettings.contactCity) && (
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <LocationOnIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {restaurantSettings.locationCardTitle || 'Our Location'}
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
            )}

            {/* Contact Card */}
            {(restaurantSettings.contactPhone || restaurantSettings.contactEmail) && (
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <PhoneIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {restaurantSettings.contactCardTitle || 'Contact Us'}
                    </Typography>
                    {restaurantSettings.contactPhone && (
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        <PhoneIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {restaurantSettings.contactPhone}
                      </Typography>
                    )}
                    {restaurantSettings.contactEmail && (
                      <Typography variant="body1" color="text.secondary">
                        <EmailIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                        {restaurantSettings.contactEmail}
                      </Typography>
                    )}
                    {restaurantSettings.contactPhone && (
                      <Button
                        variant="text"
                        color="primary"
                        sx={{ mt: 2 }}
                        href={`tel:${restaurantSettings.contactPhone}`}
                      >
                        Call Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Container>
      )}

      {/* All other content blocks from Website Builder */}
      {otherBlocks.length > 0 && (
        <Container maxWidth="lg" sx={{ my: 4 }}>
          <ContentBlockRenderer blocks={otherBlocks} />
        </Container>
      )}

      {/* Fallback content if no content blocks */}
      {contentBlocks.length === 0 && (
        <Container maxWidth="lg" sx={{ my: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {restaurantSettings?.websiteName || 'Welcome to Our Restaurant'}
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 4 }}>
            {restaurantSettings?.tagline || 'Experience culinary excellence with fresh, locally-sourced ingredients.'}
          </Typography>
          <Button
            component={Link}
            to="/menu"
            variant="contained"
            size="large"
            startIcon={<RestaurantIcon />}
          >
            View Our Menu
          </Button>
        </Container>
      )}
    </Box>
  );
};

export default CustomerHomePage; 