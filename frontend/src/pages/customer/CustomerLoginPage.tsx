import React from 'react';
import { Container, Box } from '@mui/material';
import { CustomerLoginForm } from '../../components/customer/CustomerLoginForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildCustomerUrl } from '../../utils/subdomain';

export const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = () => {
    const locationState = location.state as any;
    let pendingReservation = locationState?.pendingReservation;
    const from = locationState?.from;
    
    // Check sessionStorage as fallback (needed for window.location.href redirects)
    // This preserves reservation data when CustomerVerifyEmailPage uses full page navigation
    if (!pendingReservation) {
      const stored = sessionStorage.getItem('pendingReservation');
      if (stored) {
        try {
          pendingReservation = JSON.parse(stored);
          // Don't remove from sessionStorage here - let CustomerReservationPage handle cleanup
        } catch (e) {
          console.error('Failed to parse pending reservation from sessionStorage:', e);
        }
      }
    }
    
    // If there's a pending reservation, redirect to reservations page with it
    if (pendingReservation) {
      navigate(buildCustomerUrl('reservations/new'), {
        state: { pendingReservation }
      });
    } else if (from) {
      // Check if there's a redirect location from navigation state
      navigate(from, {
        state: locationState // Preserve any other state
      });
    } else {
      // Default to restaurant-specific reservations page
      navigate(buildCustomerUrl('reservations/new'));
    }
  };

  return (
    <Container maxWidth="sm">
      <Box py={4}>
        <CustomerLoginForm onSuccess={handleLoginSuccess} />
      </Box>
    </Container>
  );
}; 