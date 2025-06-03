import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [shouldShowCustomerPortal, setShouldShowCustomerPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubdomain = () => {
      try {
        const subdomain = getSubdomain();
        console.log('[SubdomainRouter] Detected subdomain:', subdomain);
        console.log('[SubdomainRouter] Current pathname:', location.pathname);
        
        // If we have a subdomain, we should show customer portal
        if (subdomain) {
          console.log('[SubdomainRouter] Setting shouldShowCustomerPortal to true');
          setShouldShowCustomerPortal(true);
        } else {
          console.log('[SubdomainRouter] No subdomain, showing main app');
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
  }, [location.pathname]);

  // If on restaurant subdomain but not on customer path, immediately redirect
  const subdomain = getSubdomain();
  if (subdomain && !location.pathname.startsWith('/customer')) {
    console.log('[SubdomainRouter] Immediate redirect to /customer');
    return <Navigate to="/customer" replace />;
  }

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

  // If on main domain but trying to access customer portal, allow for backward compatibility
  if (!shouldShowCustomerPortal && location.pathname.startsWith('/customer')) {
    console.log('[SubdomainRouter] On main domain but accessing /customer - allowing for backward compatibility');
  }

  return <>{children}</>;
}; 