import React from 'react';
import { Box, Container, Divider, Typography } from '@mui/material';

const SupportPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        KITCHENSYNC SUPPORT
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Need help with KitchenSync? We&apos;re here to assist.
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            FREQUENTLY ASKED QUESTIONS
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                How do I create a recipe?
              </Typography>
              <Typography variant="body1">
                From the Home screen, tap &quot;CookBook&quot; then tap &quot;Add Recipe&quot; or &quot;AI Recipe&quot; to generate one automatically.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                How do I scale a recipe?
              </Typography>
              <Typography variant="body1">
                Open any recipe and tap the scale icon. Choose a multiplier (2x, 1/2x, etc.) or scale by a specific ingredient amount.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                How do I create a menu?
              </Typography>
              <Typography variant="body1">
                From the Home screen, tap &quot;MenuBuilder&quot; then tap the + button to create a new menu for your event or meal.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                How do I create a prep list?
              </Typography>
              <Typography variant="body1">
                From the Home screen, tap &quot;AgileChef&quot; to access lists and tasks. Tap + to create a new prep list, shopping list, or to-do list.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Is my data backed up?
              </Typography>
              <Typography variant="body1">
                Yes! Your recipes, menus, and lists sync automatically to the cloud and are available on all your devices.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                How do I delete my account?
              </Typography>
              <Typography variant="body1">
                Contact us at the email below and we will process your account deletion request within 48 hours.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            CONTACT US
          </Typography>
          <Typography variant="body1" paragraph>
            For questions, feedback, or support requests:
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            Email: george@seabreeze.farm
          </Typography>
          <Typography variant="body1">
            We typically respond within 24-48 hours.
          </Typography>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>
            REPORT A BUG
          </Typography>
          <Typography variant="body1" paragraph>
            Found something not working correctly? Please email us with:
          </Typography>
          <Typography component="ul" sx={{ pl: 3, m: 0 }}>
            <Typography component="li" variant="body1">What you were trying to do</Typography>
            <Typography component="li" variant="body1">What happened instead</Typography>
            <Typography component="li" variant="body1">Your device model and iOS version</Typography>
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Thank you for using KitchenSync!
          </Typography>
        </Box>

        <Divider sx={{ mt: 2 }} />
        <Typography variant="caption" color="text.secondary">
          This support page applies to kitchensync.restaurant and the KitchenSync mobile application.
        </Typography>
      </Box>
    </Container>
  );
};

export default SupportPage;
