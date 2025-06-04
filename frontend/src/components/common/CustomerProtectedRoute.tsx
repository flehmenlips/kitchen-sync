import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { getSubdomain } from '../../utils/subdomain';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useCustomerAuth();
  const location = useLocation();
  const subdomain = getSubdomain();
  const isRestaurantSubdomain = Boolean(subdomain);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Redirect to appropriate login page based on domain
    const loginPath = isRestaurantSubdomain ? '/login' : '/customer/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default CustomerProtectedRoute; 