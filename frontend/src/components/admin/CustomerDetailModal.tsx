import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

interface CustomerDetailModalProps {
  open: boolean;
  onClose: () => void;
  customerId: number;
  onUpdate?: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  open,
  onClose,
  customerId,
  onUpdate
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Customer Details</DialogTitle>
      <DialogContent>
        {/* TODO: Implement customer detail view */}
        <p>Customer ID: {customerId}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDetailModal; 