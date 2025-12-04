import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerAuthService } from '../../services/customerAuthService';
import { buildCustomerUrl } from '../../utils/subdomain';

export const CustomerVerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurantSlug, setRestaurantSlug] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const restaurant = searchParams.get('restaurant');
    
    if (restaurant) {
      setRestaurantSlug(restaurant);
    }
    
    if (token) {
      verifyEmail(token);
    } else {
      setError('No verification token provided');
      setLoading(false);
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await customerAuthService.verifyEmail(token);
      setSuccess(true);
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || 'Failed to verify email. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box py={4}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Verifying your email...
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box py={4}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {success ? (
            <>
              <Box sx={{ mb: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
              </Box>
              
              <Typography variant="h4" component="h1" gutterBottom>
                Email Verified!
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                Thank you for verifying your email address. Your account is now fully activated.
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                You can now enjoy all the benefits of having an account, including:
              </Typography>
              
              <Box sx={{ textAlign: 'left', mx: 'auto', maxWidth: 300, mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  • Easy online reservations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • View your reservation history
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Save your preferences
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Receive special offers
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  // Redirect to restaurant-specific login page if restaurant context exists
                  const loginUrl = restaurantSlug 
                    ? buildCustomerUrl('login')
                    : '/customer/login';
                  navigate(loginUrl);
                }}
                sx={{ mt: 2 }}
              >
                Sign In to Your Account
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
              </Box>
              
              <Typography variant="h4" component="h1" gutterBottom>
                Verification Failed
              </Typography>
              
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Common reasons for verification failure:
              </Typography>
              
              <Box sx={{ textAlign: 'left', mx: 'auto', maxWidth: 300, mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  • The verification link has expired (24 hours)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • The link has already been used
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • The link was incomplete or corrupted
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    const registerUrl = restaurantSlug 
                      ? buildCustomerUrl('register')
                      : '/customer/register';
                    navigate(registerUrl);
                  }}
                >
                  Try Registering Again
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => {
                    const homeUrl = restaurantSlug 
                      ? buildCustomerUrl()
                      : '/customer';
                    navigate(homeUrl);
                  }}
                >
                  Back to Home
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}; 