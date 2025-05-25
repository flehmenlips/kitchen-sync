import React from 'react';
import { Container, Box } from '@mui/material';
import { CustomerLoginForm } from '../../components/customer/CustomerLoginForm';
import { useNavigate } from 'react-router-dom';

export const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/customer/dashboard');
  };

  return (
    <Container maxWidth="sm">
      <Box py={4}>
        <CustomerLoginForm onSuccess={handleLoginSuccess} />
      </Box>
    </Container>
  );
}; 