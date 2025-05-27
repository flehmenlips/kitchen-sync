import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Email,
  CheckCircle,
  AccessTime,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const VerifyEmailSentPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Email sx={{ fontSize: 80, color: 'primary.main' }} />
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Check Your Email
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          We've sent a verification email to complete your registration.
        </Typography>

        <Alert severity="info" sx={{ mt: 3, mb: 3, textAlign: 'left' }}>
          <Typography variant="body2">
            Please check your inbox and click the verification link to activate your KitchenSync account and start your 14-day free trial.
          </Typography>
        </Alert>

        <Box sx={{ my: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            What happens next?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Click the verification link"
                secondary="Check your email and click the button to verify"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Account activation"
                secondary="Your restaurant account will be instantly activated"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Welcome dashboard"
                secondary="You'll be taken to your personalized welcome page"
              />
            </ListItem>
          </List>
        </Box>

        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1 }} />
            <Typography variant="body2">
              The verification link will expire in 24 hours
            </Typography>
          </Box>
        </Alert>

        <Typography variant="body2" color="text.secondary" paragraph>
          Didn't receive the email? Check your spam folder or
        </Typography>

        <Button
          variant="outlined"
          sx={{ mb: 2 }}
          onClick={() => {
            // TODO: Implement resend verification email
            alert('Resend functionality coming soon!');
          }}
        >
          Resend Verification Email
        </Button>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyEmailSentPage; 