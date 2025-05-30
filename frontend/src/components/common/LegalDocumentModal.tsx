import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface LegalDocumentModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showActions?: boolean;
  onAccept?: () => void;
  acceptText?: string;
  cancelText?: string;
}

export const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  open,
  onClose,
  title,
  content,
  maxWidth = 'md',
  showActions = true,
  onAccept,
  acceptText = 'Accept',
  cancelText = 'Close',
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="legal-document-title"
      aria-describedby="legal-document-content"
      scroll="paper"
    >
      <DialogTitle id="legal-document-title">
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        id="legal-document-content"
        dividers
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: theme.palette.grey[100],
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.grey[400],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme.palette.grey[500],
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          {content}
        </Box>
      </DialogContent>

      {showActions && (
        <DialogActions>
          {onAccept && (
            <Button
              onClick={onAccept}
              variant="contained"
              color="primary"
              autoFocus
            >
              {acceptText}
            </Button>
          )}
          <Button onClick={onClose} color="inherit">
            {cancelText}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}; 