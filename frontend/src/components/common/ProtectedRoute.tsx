import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getSubdomain } from '../../utils/subdomain';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const subdomain = getSubdomain();
  const isRestaurantSubdomain = Boolean(subdomain);

  if (isLoading) {
    // Show loading indicator while checking auth status
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  // If not loading and no user, redirect to login
  // Pass the current location so we can redirect back after login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is a customer trying to access staff routes
  // This prevents customers who somehow have auth tokens from accessing the main app
  const userInfo = localStorage.getItem('kitchenSyncUserInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      // If this is a customer user (has isCustomer flag), redirect to customer portal
      if (parsed.user?.isCustomer) {
        const customerPortalPath = isRestaurantSubdomain ? '/' : '/customer';
        return <Navigate to={customerPortalPath} replace />;
      }
    } catch (e) {
      console.error('Error checking user type:', e);
    }
  }

  // If user is logged in and not a customer, render the nested routes
  return <Outlet />;
};

export default ProtectedRoute; 