// frontend/src/pages/RegisterPage.tsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import RegisterForm from '../components/forms/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { UserCredentials } from '../services/apiService';
import { AxiosError } from 'axios';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth(); // Use register from context
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleRegister = async (credentials: UserCredentials) => {
    setSubmitError(null);
    try {
      await register(credentials);
      navigate('/'); // Redirect to dashboard after successful registration/login
    } catch (error) {
      console.error('Registration failed:', error);
      let message = 'Registration failed.';
      if (error instanceof AxiosError && error.response) {
        message = error.response.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        {submitError && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{submitError}</Alert>}
        <RegisterForm onSubmit={handleRegister} isSubmitting={isLoading} />
        <Typography variant="body2" sx={{ mt: 2 }}>
            Already have an account? {' '}
            <Link component={RouterLink} to="/login" variant="body2">
              Sign In
            </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default RegisterPage; 