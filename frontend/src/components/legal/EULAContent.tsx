import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';

export const EULAContent: React.FC = () => {
  return (
    <Box sx={{ typography: 'body1' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Effective Date: 29 May 2025
      </Typography>

      <Typography paragraph>
        This End User License Agreement ("Agreement") is a legal agreement between you ("User," "you," or "your") 
        and KitchenSync, LLC ("KitchenSync," "we," "us," or "our") regarding your use of the KitchenSync 
        application, website, and related services ("App").
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        1. Acceptance of Terms
      </Typography>
      <Typography paragraph>
        By accessing or using the App, you agree to be bound by this Agreement. If you do not agree, do not use the App.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        2. License Grant
      </Typography>
      <Typography paragraph>
        KitchenSync grants you a limited, non-exclusive, non-transferable, revocable license to access and use 
        the App for your internal business purposes, subject to this Agreement.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        3. Restrictions
      </Typography>
      <Typography component="div">
        You may not:
        <ul>
          <li>Copy, modify, or create derivative works of the App.</li>
          <li>Reverse engineer, decompile, or disassemble the App.</li>
          <li>Rent, lease, sell, sublicense, or otherwise transfer the App to any third party.</li>
          <li>Use the App for any unlawful, harmful, or fraudulent purpose.</li>
          <li>Circumvent or attempt to circumvent any security or access controls.</li>
        </ul>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        4. User Data & Privacy
      </Typography>
      <Typography component="div">
        <ul>
          <li>You retain ownership of your data submitted to the App.</li>
          <li>You grant KitchenSync the right to use, process, and store your data as necessary to provide the App.</li>
          <li>Our use of your data is governed by our{' '}
            <Link 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                // This will be handled by the parent component
                window.dispatchEvent(new CustomEvent('showPrivacyPolicy'));
              }}
            >
              Privacy Policy
            </Link>.
          </li>
        </ul>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        5. Updates & Availability
      </Typography>
      <Typography component="div">
        <ul>
          <li>KitchenSync may update, modify, or discontinue the App at any time without notice.</li>
          <li>We are not liable for any loss or damage arising from downtime, data loss, or changes to the App.</li>
        </ul>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        6. Intellectual Property
      </Typography>
      <Typography component="div">
        <ul>
          <li>The App and all related intellectual property are owned by KitchenSync, LLC or its licensors.</li>
          <li>All rights not expressly granted are reserved.</li>
        </ul>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        7. Termination
      </Typography>
      <Typography component="div">
        <ul>
          <li>This Agreement is effective until terminated.</li>
          <li>We may terminate your access at any time for violation of this Agreement or for any reason.</li>
          <li>Upon termination, you must cease all use of the App.</li>
        </ul>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        8. Disclaimer of Warranties
      </Typography>
      <Typography component="div">
        <ul>
          <li>The App is provided "AS IS" and "AS AVAILABLE."</li>
          <li>KitchenSync, LLC disclaims all warranties, express or implied, including merchantability, 
              fitness for a particular purpose, and non-infringement.</li>
        </ul>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        9. Limitation of Liability
      </Typography>
      <Typography paragraph>
        To the maximum extent permitted by law, KitchenSync, LLC is not liable for any indirect, incidental, 
        special, consequential, or punitive damages, or any loss of profits or revenues.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        10. Governing Law
      </Typography>
      <Typography paragraph>
        This Agreement is governed by the laws of Oregon, USA, without regard to conflict of law principles.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        11. Changes to this Agreement
      </Typography>
      <Typography paragraph>
        We may update this Agreement from time to time. Continued use of the App after changes constitutes acceptance.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="text.secondary">
        For questions about this Agreement, contact:{' '}
        <Link href="mailto:legal@kitchensync.restaurant">
          legal@kitchensync.restaurant
        </Link>
      </Typography>
    </Box>
  );
}; 