import React from 'react';
import { Container, Box } from '@mui/material';
import { CustomerRegisterForm } from '../../components/customer/CustomerRegisterForm';

export const CustomerRegisterPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box py={4}>
        <CustomerRegisterForm />
      </Box>
    </Container>
  );
}; 