import React from 'react';
import { Container, Box } from '@mui/material';
import { CustomerLoginForm } from '../../components/customer/CustomerLoginForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { buildCustomerUrl } from '../../utils/subdomain';

export const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = () => {
    // Check if there's a redirect location from navigation state
    const from = (location.state as any)?.from;
    if (from) {
      navigate(from);
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