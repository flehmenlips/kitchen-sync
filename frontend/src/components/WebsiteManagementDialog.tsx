import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { websiteManagementService, WebsiteSummary } from '../services/websiteManagementService';
import { useSnackbar } from '../context/SnackbarContext';

interface WebsiteManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onWebsiteReset?: () => void;
}

const steps = ['Confirm Action', 'Review Options', 'Final Confirmation'];

const WebsiteManagementDialog: React.FC<WebsiteManagementDialogProps> = ({
  open,
  onClose,
  onWebsiteReset
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [action, setAction] = useState<'reset' | 'delete' | null>(null);
  const [preserveAssets, setPreserveAssets] = useState(true);
  const [summary, setSummary] = useState<WebsiteSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSummary, setFetchingSummary] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      fetchSummary();
      setActiveStep(0);
      setAction(null);
      setPreserveAssets(true);
      setConfirmationText('');
    }
  }, [open]);

  const fetchSummary = async () => {
    try {
      setFetchingSummary(true);
      const data = await websiteManagementService.getWebsiteSummary();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching website summary:', error);
      showSnackbar('Failed to load website information', 'error');
    } finally {
      setFetchingSummary(false);
    }
  };

  const handleActionSelect = (selectedAction: 'reset' | 'delete') => {
    setAction(selectedAction);
    setActiveStep(1);
  };

  const handleNext = () => {
    if (activeStep === 1) {
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    if (activeStep === 2) {
      setActiveStep(1);
    } else if (activeStep === 1) {
      setActiveStep(0);
      setAction(null);
    }
  };

  const handleConfirm = async () => {
    if (!action) return;

    // Final confirmation check
    const expectedText = action === 'delete' ? 'DELETE WEBSITE' : 'RESET WEBSITE';
    if (confirmationText !== expectedText) {
      showSnackbar(`Please type "${expectedText}" to confirm`, 'error');
      return;
    }

    try {
      setLoading(true);
      
      if (action === 'delete') {
        await websiteManagementService.deleteWebsite({ preserveAssets });
        showSnackbar('Website deleted successfully. Starting fresh with default template.', 'success');
      } else {
        await websiteManagementService.resetWebsite({ preserveAssets });
        showSnackbar('Website reset successfully. Default template applied.', 'success');
      }

      onWebsiteReset?.();
      handleClose();
    } catch (error: any) {
      console.error('Error managing website:', error);
      showSnackbar(
        error.response?.data?.error || 'Failed to manage website. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing during operation
    setActiveStep(0);
    setAction(null);
    setConfirmationText('');
    setPreserveAssets(true);
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Website Management
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose an action to manage your website:
            </Typography>

            {fetchingSummary ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : summary && (
              <Box mb={3}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Current Status:</strong>
                  </Typography>
                  <Typography variant="body2">
                    • {summary.contentBlocksCount} content blocks
                  </Typography>
                  <Typography variant="body2">
                    • Template: {summary.currentTemplate || 'None'}
                  </Typography>
                  {summary.lastUpdated && (
                    <Typography variant="body2">
                      • Last updated: {new Date(summary.lastUpdated).toLocaleDateString()}
                    </Typography>
                  )}
                </Alert>
              </Box>
            )}

            <Box display="flex" flexDirection="column" gap={2}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RefreshIcon />}
                onClick={() => handleActionSelect('reset')}
                fullWidth
                sx={{ py: 2 }}
              >
                <Box textAlign="left">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Reset Website
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Delete all content blocks and reset to default template
                  </Typography>
                </Box>
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleActionSelect('delete')}
                fullWidth
                sx={{ py: 2 }}
              >
                <Box textAlign="left">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Delete Website
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completely remove website and start from scratch
                  </Typography>
                </Box>
              </Button>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {action === 'delete' ? 'Delete Website' : 'Reset Website'}
            </Typography>

            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                ⚠️ Warning: This action cannot be undone!
              </Typography>
              {action === 'delete' ? (
                <Typography variant="body2">
                  This will permanently delete all website content, settings, and content blocks.
                </Typography>
              ) : (
                <Typography variant="body2">
                  This will delete all content blocks and reset your website to a default template.
                </Typography>
              )}
            </Alert>

            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                What will be {action === 'delete' ? 'deleted' : 'reset'}:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <DeleteIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="All content blocks" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DeleteIcon color="error" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Website settings and configuration" />
                </ListItem>
                {action === 'delete' && (
                  <ListItem>
                    <ListItemIcon>
                      <DeleteIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Template applications" />
                  </ListItem>
                )}
              </List>
            </Box>

            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Checkbox
                  checked={preserveAssets}
                  onChange={(e) => setPreserveAssets(e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Preserve Asset Library
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Keep all uploaded images, videos, and files in your asset library.
                    They can be reconnected to new content blocks.
                  </Typography>
                </Box>
              }
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {action === 'delete' 
                  ? 'After deletion, your website will be reset to a basic default template with sample content blocks.'
                  : 'After reset, your website will use a default template with basic content blocks (Hero, About, Contact).'
                }
              </Typography>
            </Alert>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Final Confirmation
            </Typography>

            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                ⚠️ Last Chance!
              </Typography>
              <Typography variant="body2">
                This action is permanent and cannot be undone. All your current website content will be lost.
              </Typography>
            </Alert>

            <Box mb={3}>
              <Typography variant="body2" gutterBottom>
                To confirm this action, please type{' '}
                <strong>{action === 'delete' ? 'DELETE WEBSITE' : 'RESET WEBSITE'}</strong> below:
              </Typography>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={action === 'delete' ? 'DELETE WEBSITE' : 'RESET WEBSITE'}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  fontSize: '16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase'
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Summary:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <InfoIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Action: ${action === 'delete' ? 'Delete Website' : 'Reset Website'}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {preserveAssets ? <CheckCircleIcon color="success" fontSize="small" /> : <DeleteIcon color="error" fontSize="small" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Assets: ${preserveAssets ? 'Preserved' : 'Will be deleted'}`}
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6">Website Management</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        {activeStep === 1 && (
          <Button 
            onClick={handleNext} 
            variant="contained"
            disabled={loading}
          >
            Continue
          </Button>
        )}
        {activeStep === 2 && (
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={action === 'delete' ? 'error' : 'warning'}
            disabled={loading || confirmationText !== (action === 'delete' ? 'DELETE WEBSITE' : 'RESET WEBSITE')}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? 'Processing...' : action === 'delete' ? 'Delete Website' : 'Reset Website'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WebsiteManagementDialog;

