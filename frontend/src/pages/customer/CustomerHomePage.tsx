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
import { contentBlockService, ContentBlock } from '../../services/contentBlockService';
import ContentBlockRenderer from '../../components/customer/ContentBlockRenderer';

const CustomerHomePage: React.FC = () => {
  const [content, setContent] = useState<UnifiedRestaurantContent | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch unified content for hero, info cards, etc.
      const unifiedContent = await unifiedContentService.getUnifiedContent('home');
      console.log('[CustomerHomePage] Fetched content:', unifiedContent);
      console.log('[CustomerHomePage] Opening hours data:', unifiedContent?.contact?.openingHours);
      setContent(unifiedContent);

      // Fetch content blocks separately for proper typing
      const blocks = await contentBlockService.getPublicBlocks('home');
      console.log('[CustomerHomePage] Fetched content blocks:', blocks);
      setContentBlocks(blocks);
    } catch (error) {
      console.error('Error fetching content:', error);
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
    try {
      if (!content?.contact?.openingHours) return 'Hours not available';
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[new Date().getDay()];
      const hours = content.contact.openingHours[today];
      
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

  // Separate hero block from other content blocks
  const heroBlock = contentBlocks.find(block => block.blockType === 'hero');
  const otherBlocks = contentBlocks.filter(block => block.blockType !== 'hero');

  return (
    <Box>
      {/* Hero Section from ContentBlocks */}
      {heroBlock && <ContentBlockRenderer blocks={[heroBlock]} />}

      {/* Restaurant Info Cards */}
      <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 2 }}>
        <Grid container spacing={3}>
          {/* Opening Hours Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <AccessTimeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {content?.seo?.hoursCardTitle || 'Opening Hours'}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Today: <strong>{getTodayHours()}</strong>
                </Typography>
                {content?.contact.openingHours && (
                  <Box sx={{ mt: 2 }}>
                    {(() => {
                      try {
                        if (!content?.contact?.openingHours || typeof content.contact.openingHours !== 'object') {
                          return <Typography variant="body2">Hours not available</Typography>;
                        }
                        
                        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                        const validEntries = days
                          .filter(day => content.contact.openingHours[day])
                          .map(day => {
                            const hours = content.contact.openingHours[day];
                            
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
                  {content?.seo?.locationCardTitle || 'Our Location'}
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
                  {content?.seo?.contactCardTitle || 'Contact Us'}
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

      {/* Other Content Blocks (About, Contact, Menu Preview, etc.) */}
      <ContentBlockRenderer blocks={otherBlocks} />
    </Box>
  );
};

export default CustomerHomePage; 