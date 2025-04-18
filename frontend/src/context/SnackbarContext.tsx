import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';

interface SnackbarMessage {
  message: string;
  severity: AlertColor; // 'success' | 'error' | 'warning' | 'info'
}

interface SnackbarContextProps {
  showSnackbar: (message: string, severity: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<SnackbarMessage | null>(null);

  const showSnackbar = useCallback((message: string, severity: AlertColor) => {
    setSnackbarMessage({ message, severity });
    setOpen(true);
  }, []);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000} // Adjust duration as needed
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Position
      >
        {/* Ensure Alert is rendered only when snackbarMessage is not null */}
        {snackbarMessage && (
             <Alert 
                onClose={handleClose} 
                severity={snackbarMessage.severity} 
                sx={{ width: '100%' }}
                variant="filled" // Use filled variant for better visibility
            >
            {snackbarMessage.message}
            </Alert>
        )}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}; 