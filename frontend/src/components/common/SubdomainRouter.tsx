import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Container, Alert } from '@mui/material';
import { getSubdomain, isRestaurantSubdomain, getMainAppUrl } from '../../utils/subdomain';

interface SubdomainRouterProps {
  children: React.ReactNode;
}

/**
 * Routes users based on subdomain
 * - If on restaurant subdomain -> show customer portal
 * - If on main domain -> show main app
 */
export const SubdomainRouter: React.FC<SubdomainRouterProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [shouldShowCustomerPortal, setShouldShowCustomerPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubdomain = async () => {
      try {
        const subdomain = getSubdomain();
        
        // If we have a subdomain, validate it exists
        if (subdomain) {
          // In a real implementation, you might want to validate the subdomain
          // by making an API call to check if the restaurant exists
          setShouldShowCustomerPortal(true);
        } else {
          setShouldShowCustomerPortal(false);
        }
      } catch (err) {
        console.error('Error checking subdomain:', err);
        setError('Unable to determine restaurant');
      } finally {
        setLoading(false);
      }
    };

    checkSubdomain();
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="100vh"
          textAlign="center"
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body1">
            Please check the URL and try again.
          </Typography>
        </Box>
      </Container>
    );
  }

  // If on restaurant subdomain, redirect to customer portal
  if (shouldShowCustomerPortal && !window.location.pathname.startsWith('/customer')) {
    return <Navigate to="/customer" replace />;
  }

  // If on main domain but trying to access customer portal, redirect to main app
  if (!shouldShowCustomerPortal && window.location.pathname.startsWith('/customer')) {
    // In production, you might want to redirect to the main app login
    // For now, we'll allow it for backward compatibility
  }

  return <>{children}</>;
}; 