import React from 'react';
import { Alert, Box, Typography, Link, Paper } from '@mui/material';
import { useRestaurant } from '../context/RestaurantContext';
import { buildRestaurantUrl, getSubdomain } from '../utils/subdomain';

export const SubdomainInfo: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const currentSubdomain = getSubdomain();
  
  if (!currentRestaurant) return null;
  
  const customerPortalUrl = buildRestaurantUrl(currentRestaurant.slug);
  
  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.lighter' }}>
      <Typography variant="subtitle2" gutterBottom>
        Subdomain Routing Info (Development)
      </Typography>
      <Box sx={{ fontSize: '0.875rem' }}>
        <Typography variant="body2">
          <strong>Restaurant:</strong> {currentRestaurant.name}
        </Typography>
        <Typography variant="body2">
          <strong>Slug:</strong> {currentRestaurant.slug}
        </Typography>
        <Typography variant="body2">
          <strong>Current subdomain:</strong> {currentSubdomain || 'none (main domain)'}
        </Typography>
        <Typography variant="body2">
          <strong>Customer Portal URL:</strong>{' '}
          <Link href={customerPortalUrl} target="_blank" rel="noopener">
            {customerPortalUrl}
          </Link>
        </Typography>
      </Box>
      <Alert severity="info" sx={{ mt: 1 }}>
        <Typography variant="caption">
          In development, use ?restaurant={currentRestaurant.slug} to simulate subdomain routing
        </Typography>
      </Alert>
    </Paper>
  );
}; 