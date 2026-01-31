import React from 'react';
import { Box, Container, Divider, Typography } from '@mui/material';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        KITCHENSYNC PRIVACY POLICY
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Last updated: January 31, 2026
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="body1">
          KitchenSync (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the KitchenSync mobile application.
        </Typography>

        <Box>
          <Typography variant="h6" gutterBottom>
            INFORMATION WE COLLECT
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Account Information:</strong> When you create an account, we collect your email address and
            password (encrypted).
          </Typography>
          <Typography variant="body1">
            <strong>User Content:</strong> We store recipes, menus, prep lists, and other content you create within
            the app.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            HOW WE USE YOUR INFORMATION
          </Typography>
          <Typography component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body1">To provide and maintain the app</Typography>
            <Typography component="li" variant="body1">To sync your data across devices</Typography>
            <Typography component="li" variant="body1">To authenticate your account</Typography>
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            DATA STORAGE
          </Typography>
          <Typography variant="body1">
            Your data is stored securely using Supabase, a cloud database service. Data is encrypted in transit and at rest.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            THIRD-PARTY SERVICES
          </Typography>
          <Typography variant="body1">
            We use OpenAI&apos;s API for AI recipe generation. When you use AI features, your prompts are sent to OpenAI.
            See OpenAI&apos;s privacy policy for details.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            DATA RETENTION
          </Typography>
          <Typography variant="body1">
            Your data is retained until you delete your account. You can request account deletion by contacting us.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            CONTACT US
          </Typography>
          <Typography variant="body1">
            For questions about this privacy policy, contact: george@seabreeze.farm
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            CHANGES TO THIS POLICY
          </Typography>
          <Typography variant="body1">
            We may update this policy from time to time. We will notify you of changes by posting the new policy in the app.
          </Typography>
        </Box>

        <Divider sx={{ mt: 2 }} />
        <Typography variant="caption" color="text.secondary">
          This policy applies to kitchensync.restaurant and the KitchenSync mobile application.
        </Typography>
      </Box>
    </Container>
  );
};

export default PrivacyPolicyPage;
