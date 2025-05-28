import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  FormHelperText,
  Divider,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface SubscriptionEditModalProps {
  open: boolean;
  onClose: () => void;
  subscription: {
    id: number;
    restaurant: {
      name: string;
    };
    plan: string;
    status: string;
    seats: number;
  } | null;
  onSave: (id: number, data: UpdateData) => Promise<void>;
}

interface UpdateData {
  plan?: string;
  status?: string;
  seats?: number;
  notes?: string;
}

export const SubscriptionEditModal: React.FC<SubscriptionEditModalProps> = ({
  open,
  onClose,
  subscription,
  onSave,
}) => {
  const [formData, setFormData] = useState<UpdateData>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscription) {
      setFormData({
        plan: subscription.plan,
        status: subscription.status,
        seats: subscription.seats,
      });
      setNotes('');
      setError(null);
    }
  }, [subscription]);

  const handleSave = async () => {
    if (!subscription) return;

    try {
      setLoading(true);
      setError(null);

      const updates: UpdateData = {};
      
      // Only include changed fields
      if (formData.plan !== subscription.plan) updates.plan = formData.plan;
      if (formData.status !== subscription.status) updates.status = formData.status;
      if (formData.seats !== subscription.seats) updates.seats = formData.seats;
      
      if (notes.trim()) {
        updates.notes = notes.trim();
      }

      // Check if any changes were made
      if (Object.keys(updates).length === 0) {
        setError('No changes were made');
        return;
      }

      await onSave(subscription.id, updates);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update subscription');
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) return null;

  const hasChanges = 
    formData.plan !== subscription.plan ||
    formData.status !== subscription.status ||
    formData.seats !== subscription.seats;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Edit Subscription</Typography>
          <Typography variant="body2" color="text.secondary">
            {subscription.restaurant.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Admin Override Warning
          </Typography>
          <Typography variant="body2">
            You are making manual changes to this subscription. These changes will override
            any Stripe subscription settings. Use with caution.
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Plan</InputLabel>
            <Select
              value={formData.plan || ''}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              label="Plan"
            >
              <MenuItem value="TRIAL">Trial</MenuItem>
              <MenuItem value="STARTER">Starter ($49/mo)</MenuItem>
              <MenuItem value="PROFESSIONAL">Professional ($149/mo)</MenuItem>
              <MenuItem value="HOME">Home (Custom)</MenuItem>
            </Select>
            <FormHelperText>
              Current: {subscription.plan}
            </FormHelperText>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status || ''}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              label="Status"
            >
              <MenuItem value="TRIAL">Trial</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="PAST_DUE">Past Due</MenuItem>
              <MenuItem value="CANCELED">Canceled</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
            </Select>
            <FormHelperText>
              Current: {subscription.status}
            </FormHelperText>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Seats"
            value={formData.seats || ''}
            onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 1, max: 999 }}
            helperText={`Current: ${subscription.seats} seats`}
          />

          <Divider />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Required)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Explain the reason for this manual change..."
            helperText="These notes will be saved to the restaurant's history"
            required
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !hasChanges || !notes.trim()}
          color="warning"
        >
          {loading ? <CircularProgress size={20} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 