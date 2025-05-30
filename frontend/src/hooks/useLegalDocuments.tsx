import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { LegalDocumentModal } from '../components/common/LegalDocumentModal';
import { EULAContent } from '../components/legal/EULAContent';
import { PrivacyPolicyContent } from '../components/legal/PrivacyPolicyContent';
import { Box, Typography, Link } from '@mui/material';

type LegalDocumentType = 'eula' | 'privacy' | 'ccpa';

interface UseLegalDocumentsReturn {
  showEULA: () => void;
  showPrivacyPolicy: () => void;
  showCCPANotice: () => void;
  LegalDocumentModals: React.FC;
}

// Define custom event types
declare global {
  interface WindowEventMap {
    'showPrivacyPolicy': CustomEvent;
    'showCCPANotice': CustomEvent;
  }
}

export const useLegalDocuments = (): UseLegalDocumentsReturn => {
  const [activeModal, setActiveModal] = useState<LegalDocumentType | null>(null);

  const showEULA = useCallback(() => setActiveModal('eula'), []);
  const showPrivacyPolicy = useCallback(() => setActiveModal('privacy'), []);
  const showCCPANotice = useCallback(() => setActiveModal('ccpa'), []);

  const handleClose = useCallback(() => setActiveModal(null), []);

  useEffect(() => {
    const handleShowPrivacyPolicy = (event: CustomEvent) => showPrivacyPolicy();
    const handleShowCCPANotice = (event: CustomEvent) => showCCPANotice();

    window.addEventListener('showPrivacyPolicy', handleShowPrivacyPolicy as EventListener);
    window.addEventListener('showCCPANotice', handleShowCCPANotice as EventListener);

    return () => {
      window.removeEventListener('showPrivacyPolicy', handleShowPrivacyPolicy as EventListener);
      window.removeEventListener('showCCPANotice', handleShowCCPANotice as EventListener);
    };
  }, [showPrivacyPolicy, showCCPANotice]);

  const LegalDocumentModals: React.FC = () => {
    const getModalContent = () => {
      switch (activeModal) {
        case 'eula':
          return {
            title: 'End User License Agreement',
            content: <EULAContent />,
            maxWidth: 'md' as const,
          };
        case 'privacy':
          return {
            title: 'Privacy Policy',
            content: <PrivacyPolicyContent />,
            maxWidth: 'md' as const,
          };
        case 'ccpa':
          return {
            title: 'California Privacy Notice',
            content: (
              <Box sx={{ typography: 'body1' }}>
                <Typography paragraph>
                  This California Privacy Notice supplements the information contained in our Privacy Policy
                  and applies solely to California residents ("consumers" or "you").
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Your California Privacy Rights
                </Typography>
                <Typography paragraph>
                  Under the California Consumer Privacy Act (CCPA), you have the following rights:
                </Typography>
                <Box component="ul">
                  <Typography component="li">
                    Right to Know: You can request information about the personal information we collect, use, and disclose.
                  </Typography>
                  <Typography component="li">
                    Right to Delete: You can request deletion of your personal information.
                  </Typography>
                  <Typography component="li">
                    Right to Opt-Out: You can opt-out of the sale of your personal information.
                  </Typography>
                  <Typography component="li">
                    Right to Non-Discrimination: We will not discriminate against you for exercising your CCPA rights.
                  </Typography>
                </Box>
                <Typography paragraph>
                  To exercise these rights, please contact us at{' '}
                  <Link href="mailto:privacy@kitchensync.restaurant">
                    privacy@kitchensync.restaurant
                  </Link>
                </Typography>
              </Box>
            ),
            maxWidth: 'sm' as const,
          };
        default:
          return null;
      }
    };

    const modalContent = getModalContent();

    if (!modalContent) return null;

    return (
      <LegalDocumentModal
        open={!!activeModal}
        onClose={handleClose}
        title={modalContent.title}
        content={modalContent.content}
        maxWidth={modalContent.maxWidth}
      />
    );
  };

  return {
    showEULA,
    showPrivacyPolicy,
    showCCPANotice,
    LegalDocumentModals,
  };
}; 