import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { getSubdomain } from '../../utils/subdomain';

// Customer Portal Components
import { CustomerAuthProvider } from '../../context/CustomerAuthContext';
import CustomerLayout from '../customer/CustomerLayout';
import CustomerHomePage from '../../pages/customer/CustomerHomePage';
import CustomerReservationPage from '../../pages/customer/CustomerReservationPage';
import CustomerMenuPage from '../../pages/customer/CustomerMenuPage';
import { CustomerRegisterPage } from '../../pages/customer/CustomerRegisterPage';
import { CustomerLoginPage } from '../../pages/customer/CustomerLoginPage';
import { CustomerVerifyEmailSentPage } from '../../pages/customer/CustomerVerifyEmailSentPage';
import { CustomerVerifyEmailPage } from '../../pages/customer/CustomerVerifyEmailPage';
import CustomerDashboardPage from '../../pages/customer/CustomerDashboardPage';
import CustomerDynamicPage from '../../pages/customer/CustomerDynamicPage';
import CustomerProtectedRoute from './CustomerProtectedRoute';

// Main App Components
import LandingPage from '../../pages/LandingPage';

interface ConditionalRoutesProps {
  children: React.ReactNode; // The rest of the routes (platform admin, staff protected routes, etc.)
}

export const ConditionalRoutes: React.FC<ConditionalRoutesProps> = ({ children }) => {
  const subdomain = getSubdomain();
  const isRestaurantSubdomain = Boolean(subdomain);

  if (isRestaurantSubdomain) {
    // Restaurant subdomain: render clean customer portal routes
    return (
      <Routes>
        {/* Restaurant website routes with clean URLs */}
        <Route path="/" element={
          <CustomerAuthProvider>
            <CustomerLayout />
          </CustomerAuthProvider>
        }>
          <Route index element={<CustomerHomePage />} />
          <Route path="menu" element={<CustomerMenuPage />} />
          <Route path="reservations/new" element={<CustomerReservationPage />} />
          <Route path="register" element={<CustomerRegisterPage />} />
          <Route path="login" element={<CustomerLoginPage />} />
          <Route path="verify-email-sent" element={<CustomerVerifyEmailSentPage />} />
          <Route path="verify-email" element={<CustomerVerifyEmailPage />} />
          <Route path="dashboard" element={
            <CustomerProtectedRoute>
              <CustomerDashboardPage />
            </CustomerProtectedRoute>
          } />
          {/* Dynamic page route - must be last to catch all other paths */}
          <Route path=":slug" element={<CustomerDynamicPage />} />
        </Route>
        
        {/* Include other routes like platform admin */}
        {children}
        
        {/* Catch-all redirect to home for restaurant subdomains */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  } else {
    // Main domain: render main app routes with legacy /customer support
    return (
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Legacy customer portal routes with /customer prefix */}
        <Route path="/customer" element={
          <CustomerAuthProvider>
            <CustomerLayout />
          </CustomerAuthProvider>
        }>
          <Route index element={<CustomerHomePage />} />
          <Route path="reservations/new" element={<CustomerReservationPage />} />
          <Route path="menu" element={<CustomerMenuPage />} />
          <Route path="register" element={<CustomerRegisterPage />} />
          <Route path="login" element={<CustomerLoginPage />} />
          <Route path="verify-email-sent" element={<CustomerVerifyEmailSentPage />} />
          <Route path="verify-email" element={<CustomerVerifyEmailPage />} />
          <Route path="dashboard" element={
            <CustomerProtectedRoute>
              <CustomerDashboardPage />
            </CustomerProtectedRoute>
          } />
          {/* Dynamic page route - must be last to catch all other paths */}
          <Route path=":slug" element={<CustomerDynamicPage />} />
        </Route>
        
        {/* Include other routes (platform admin, staff protected routes, etc.) */}
        {children}
      </Routes>
    );
  }
}; 