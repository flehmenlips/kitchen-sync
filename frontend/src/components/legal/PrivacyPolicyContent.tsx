import React from 'react';
import { Box, Typography, Link, Divider } from '@mui/material';

export const PrivacyPolicyContent: React.FC = () => {
  return (
    <Box sx={{ typography: 'body1' }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Effective Date: 29 May 2025
      </Typography>

      <Typography paragraph>
        KitchenSync, LLC ("KitchenSync," "we," "us," or "our") is committed to protecting your privacy. 
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
        use our restaurant management platform and related services (collectively, the "Service").
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        1. Information We Collect
      </Typography>
      <Typography component="div">
        <Typography variant="subtitle2" gutterBottom>
          1.1 Information You Provide
        </Typography>
        <ul>
          <li>Account information (name, email, phone number)</li>
          <li>Restaurant information (name, address, business details)</li>
          <li>Payment information (processed securely through Stripe)</li>
          <li>Customer data you input into the Service</li>
          <li>Communications with us</li>
        </ul>

        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          1.2 Automatically Collected Information
        </Typography>
        <ul>
          <li>Usage data (features used, time spent)</li>
          <li>Device information (browser type, IP address)</li>
          <li>Cookies and similar technologies</li>
          <li>Log data (access times, pages viewed)</li>
        </ul>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        2. How We Use Your Information
      </Typography>
      <Typography component="div">
        <ul>
          <li>Provide, maintain, and improve the Service</li>
          <li>Process transactions and send related information</li>
          <li>Send administrative notifications</li>
          <li>Respond to comments and questions</li>
          <li>Monitor and analyze usage patterns</li>
          <li>Detect, prevent, and address technical issues</li>
          <li>Comply with legal obligations</li>
        </ul>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        3. Information Sharing and Disclosure
      </Typography>
      <Typography component="div">
        <Typography variant="subtitle2" gutterBottom>
          We may share your information with:
        </Typography>
        <ul>
          <li>Service providers (hosting, payment processing, analytics)</li>
          <li>Business partners (with your consent)</li>
          <li>Legal authorities (when required by law)</li>
          <li>In connection with a business transaction</li>
        </ul>
        <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
          We do not sell your personal information.
        </Typography>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        4. Data Security
      </Typography>
      <Typography paragraph>
        We implement appropriate technical and organizational measures to protect your information. 
        However, no method of transmission over the Internet is 100% secure, and we cannot guarantee 
        absolute security.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        5. Your Rights and Choices
      </Typography>
      <Typography component="div">
        <Typography variant="subtitle2" gutterBottom>
          You have the right to:
        </Typography>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing</li>
          <li>Data portability</li>
          <li>Withdraw consent</li>
        </ul>
        <Typography paragraph sx={{ mt: 2 }}>
          To exercise these rights, contact us at{' '}
          <Link href="mailto:privacy@kitchensync.restaurant">
            privacy@kitchensync.restaurant
          </Link>
        </Typography>
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        6. International Data Transfers
      </Typography>
      <Typography paragraph>
        Your information may be transferred to and processed in countries other than your own. 
        We ensure appropriate safeguards are in place for such transfers.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        7. Children's Privacy
      </Typography>
      <Typography paragraph>
        The Service is not intended for children under 16. We do not knowingly collect personal 
        information from children under 16.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        8. Changes to This Policy
      </Typography>
      <Typography paragraph>
        We may update this Privacy Policy from time to time. We will notify you of any changes by 
        posting the new Privacy Policy on this page and updating the effective date.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        9. California Privacy Rights
      </Typography>
      <Typography paragraph>
        California residents have additional rights under the California Consumer Privacy Act (CCPA). 
        For details about these rights and how to exercise them, please see our{' '}
        <Link href="#" onClick={(e) => {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('showCCPANotice'));
        }}>
          California Privacy Notice
        </Link>.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" color="text.secondary">
        For privacy-related questions, contact:{' '}
        <Link href="mailto:privacy@kitchensync.restaurant">
          privacy@kitchensync.restaurant
        </Link>
      </Typography>
    </Box>
  );
}; 