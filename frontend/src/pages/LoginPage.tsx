// frontend/src/pages/LoginPage.tsx
import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import LoginForm from '../components/forms/LoginForm';
import { useAuth } from '../context/AuthContext';
import { UserCredentials } from '../services/apiService';
import { AxiosError } from 'axios';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth(); // Use login from context
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Redirect if already logged in? (Handled by protected routes later)

  const handleLogin = async (credentials: UserCredentials) => {
    setSubmitError(null);
    try {
      await login(credentials);
      // Redirect to intended page or dashboard after login
      const from = location.state?.from?.pathname || "/"; 
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      let message = 'Login failed.';
      if (error instanceof AxiosError && error.response) {
        message = error.response.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(message);
    }
  };

  return (
    <Container component="main" maxWidth="xs"> {/* Center small form */} 
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* KitchenSync Logo and Branding */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mb: 4 
        }}>
          <img 
            src="/logo.svg" 
            alt="KitchenSync Logo" 
            style={{ 
              height: '80px',
              width: 'auto',
              marginBottom: '16px'
            }}
          />
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              letterSpacing: '0.5px',
              mb: 1
            }}
          >
            KitchenSync
          </Typography>
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            Restaurant Management Platform
          </Typography>
        </Box>

        <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
          Sign In
        </Typography>
        {submitError && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{submitError}</Alert>}
        <LoginForm onSubmit={handleLogin} isSubmitting={isLoading} />
         <Typography variant="body2" sx={{ mt: 2 }}>
            Don't have an account? {' '}
            <Link component={RouterLink} to="/register" variant="body2">
              Sign Up
            </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default LoginPage; 