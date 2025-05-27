import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://kitchen-sync-api.onrender.com/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/restaurant-onboarding/verify-email`, {
          token
        });

        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        setAuthData(response.data);

        // Store auth data
        if (response.data.user && response.data.user.token) {
          const userInfo = {
            user: response.data.user,
            token: response.data.user.token
          };
          localStorage.setItem('kitchenSyncUserInfo', JSON.stringify(userInfo));
        }

        // Redirect to welcome page after a short delay
        setTimeout(() => {
          navigate('/welcome');
        }, 3000);

      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Failed to verify email. The link may have expired.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              Verifying your email...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please wait while we activate your account.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom>
              Email Verified!
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              {message}
            </Typography>
            {authData?.restaurant && (
              <Alert severity="success" sx={{ mt: 3, mb: 3 }}>
                <Typography variant="body2">
                  <strong>{authData.restaurant.name}</strong> has been activated!
                  Your 14-day free trial has started.
                </Typography>
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary">
              Redirecting you to your dashboard...
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom>
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ mt: 3, mb: 3 }}>
              <Typography variant="body2">
                {message}
              </Typography>
            </Alert>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{ mr: 2 }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Go to Home
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmailPage; 