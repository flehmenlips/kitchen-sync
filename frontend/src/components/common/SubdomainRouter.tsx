import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Container, Alert } from '@mui/material';
import { getSubdomain, isRestaurantSubdomain, getMainAppUrl } from '../../utils/subdomain';

interface SubdomainRouterProps {
  children: React.ReactNode;
}

/**
 * Routes users based on subdomain
 * - If on restaurant subdomain -> show customer portal with clean URLs (no /customer prefix)
 * - If on main domain -> show main app or customer portal with /customer prefix (backward compatibility)
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

  const subdomain = getSubdomain();
  
  // Handle restaurant subdomain routing
  if (subdomain) {
    // On restaurant subdomain, we use clean URLs without /customer prefix
    // If someone tries to access /customer/* on a subdomain, redirect to clean URL
    if (location.pathname.startsWith('/customer')) {
      console.log('[SubdomainRouter] On restaurant subdomain with /customer prefix - redirecting to clean URL');
      const cleanPath = location.pathname.replace('/customer', '') || '/';
      const searchParams = location.search;
      return <Navigate to={`${cleanPath}${searchParams}`} replace />;
    }
    
    // Allow access to restaurant portal routes and platform admin
    const allowedPaths = ['/', '/menu', '/reservations', '/register', '/login', '/verify-email', '/verify-email-sent', '/dashboard', '/platform-admin'];
    const isAllowedPath = allowedPaths.some(path => 
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
    
    if (!isAllowedPath) {
      console.log('[SubdomainRouter] On restaurant subdomain with invalid path - redirecting to home');
      const searchParams = location.search;
      return <Navigate to={`/${searchParams}`} replace />;
    }
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

  // On main domain, allow backward compatibility for /customer routes
  if (!shouldShowCustomerPortal && location.pathname.startsWith('/customer')) {
    console.log('[SubdomainRouter] On main domain but accessing /customer - allowing for backward compatibility');
  }

  return <>{children}</>;
}; 