import React from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Alert
} from '@mui/material';
import {
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const CustomerVerifyEmailSentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box py={4}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <EmailIcon sx={{ fontSize: 64, color: 'primary.main' }} />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Check Your Email
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            We've sent a verification email to your registered email address. 
            Please click the link in the email to verify your account.
          </Typography>
          
          <Alert severity="info" sx={{ my: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>Didn't receive the email?</strong>
            </Typography>
            <Typography variant="body2">
              • Check your spam or junk folder
            </Typography>
            <Typography variant="body2">
              • Make sure you entered the correct email address
            </Typography>
            <Typography variant="body2">
              • The email may take a few minutes to arrive
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/customer/login')}
            >
              Go to Sign In
            </Button>
            
            <Button
              variant="text"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/customer')}
            >
              Back to Home
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            If you continue to have problems, please contact us at support@seabreezekitchen.com
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}; 