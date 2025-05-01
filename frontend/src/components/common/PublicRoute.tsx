import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define props type
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Public route component to prevent authenticated users from accessing routes like login/register
 * If user is authenticated, they're redirected to the dashboard or specified path
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { user } = useAuth();

  // If user is authenticated, redirect them away from the auth route
  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is not authenticated, render the children (login/register component)
  return <>{children}</>;
};

export default PublicRoute; 