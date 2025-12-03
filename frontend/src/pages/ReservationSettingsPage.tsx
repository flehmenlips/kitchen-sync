import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { reservationSettingsService, ReservationSettings, OperatingHours } from '../services/reservationSettingsService';
import { useSnackbar } from '../context/SnackbarContext';
import { useRestaurant } from '../context/RestaurantContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DAYS_OF_WEEK = [
  { value: 'sunday', label: 'Sunday', index: 0 },
  { value: 'monday', label: 'Monday', index: 1 },
  { value: 'tuesday', label: 'Tuesday', index: 2 },
  { value: 'wednesday', label: 'Wednesday', index: 3 },
  { value: 'thursday', label: 'Thursday', index: 4 },
  { value: 'friday', label: 'Friday', index: 5 },
  { value: 'saturday', label: 'Saturday', index: 6 }
];

const ReservationSettingsPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const { showSnackbar } = useSnackbar();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ReservationSettings>>({});

  const restaurantId = currentRestaurant?.id || null;

  useEffect(() => {
    if (restaurantId) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [restaurantId]);

  const fetchSettings = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const data = await reservationSettingsService.getReservationSettings(restaurantId);
      setFormData(data);
    } catch (error: any) {
      console.error('Error fetching reservation settings:', error);
      // If settings don't exist yet (404), initialize with empty formData
      // The backend will create default settings on first save
      if (error.response?.status === 404) {
        console.log('No reservation settings found - will create on first save');
        setFormData({});
      } else {
        showSnackbar(
          error.response?.data?.message || 'Failed to load reservation settings',
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurantId) {
      showSnackbar('Restaurant ID not available', 'error');
      return;
    }

    setSaving(true);
    try {
      const updated = await reservationSettingsService.upsertReservationSettings(
        restaurantId,
        formData
      );
      setFormData(updated);
      showSnackbar('Reservation settings saved successfully', 'success');
    } catch (error: any) {
      console.error('Error saving reservation settings:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to save reservation settings',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOperatingHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => {
      const operatingHours = { ...(prev.operatingHours || {}) } as OperatingHours;
      if (!operatingHours[day]) {
        operatingHours[day] = { open: '17:00', close: '22:00', closed: false };
      }
      operatingHours[day] = {
        ...operatingHours[day],
        [field]: value
      };
      return { ...prev, operatingHours };
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading reservation settings...</Typography>
      </Box>
    );
  }

  if (!restaurantId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Unable to determine restaurant. Please ensure you are associated with a restaurant.
        </Alert>
      </Box>
    );
  }

  const operatingHours = (formData.operatingHours || {}) as OperatingHours;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Reservation Settings
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab icon={<ScheduleIcon />} label="Operating Hours" />
          <Tab icon={<PeopleIcon />} label="Capacity & Rules" />
          <Tab icon={<InfoIcon />} label="Policies" />
        </Tabs>

        {/* Operating Hours Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Operating Hours
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Set your restaurant's operating hours for each day of the week. Closed days will not show available time slots.
          </Alert>

          <Grid container spacing={2}>
            {DAYS_OF_WEEK.map((day) => {
              const dayHours = operatingHours[day.value] || { closed: true };
              return (
                <Grid item xs={12} md={6} key={day.value}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {day.label}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!dayHours.closed}
                              onChange={(e) =>
                                handleOperatingHoursChange(day.value, 'closed', !e.target.checked)
                              }
                            />
                          }
                          label={dayHours.closed ? 'Closed' : 'Open'}
                        />
                      </Box>

                      {!dayHours.closed && (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Open Time"
                              type="time"
                              value={dayHours.open || '17:00'}
                              onChange={(e) =>
                                handleOperatingHoursChange(day.value, 'open', e.target.value)
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Close Time"
                              type="time"
                              value={dayHours.close || '22:00'}
                              onChange={(e) =>
                                handleOperatingHoursChange(day.value, 'close', e.target.value)
                              }
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        {/* Capacity & Rules Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Capacity & Booking Rules
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Time Slot Interval (minutes)"
                type="number"
                value={formData.timeSlotInterval || 30}
                onChange={(e) =>
                  setFormData({ ...formData, timeSlotInterval: parseInt(e.target.value) })
                }
                select
                SelectProps={{ native: true }}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Default Reservation Duration (minutes)"
                type="number"
                value={formData.defaultDuration || 90}
                onChange={(e) =>
                  setFormData({ ...formData, defaultDuration: parseInt(e.target.value) })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Party Size"
                type="number"
                value={formData.minPartySize || 1}
                onChange={(e) =>
                  setFormData({ ...formData, minPartySize: parseInt(e.target.value) })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Party Size"
                type="number"
                value={formData.maxPartySize || 20}
                onChange={(e) =>
                  setFormData({ ...formData, maxPartySize: parseInt(e.target.value) })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Advance Booking Days"
                type="number"
                value={formData.advanceBookingDays || 60}
                onChange={(e) =>
                  setFormData({ ...formData, advanceBookingDays: parseInt(e.target.value) })
                }
                helperText="How many days in advance customers can book"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Advance Hours"
                type="number"
                value={formData.minAdvanceHours || 2}
                onChange={(e) =>
                  setFormData({ ...formData, minAdvanceHours: parseInt(e.target.value) })
                }
                helperText="Minimum hours before reservation time"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Capacity Management
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Covers Per Slot (Optional)"
                type="number"
                value={formData.maxCoversPerSlot || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxCoversPerSlot: e.target.value ? parseInt(e.target.value) : undefined
                  })
                }
                helperText="Leave empty for unlimited. Can be overridden by time slot capacity settings."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.allowOverbooking || false}
                    onChange={(e) =>
                      setFormData({ ...formData, allowOverbooking: e.target.checked })
                    }
                  />
                }
                label="Allow Overbooking"
              />
              {formData.allowOverbooking && (
                <TextField
                  sx={{ mt: 2, maxWidth: 200 }}
                  label="Overbooking Percentage"
                  type="number"
                  value={formData.overbookingPercentage || 10}
                  onChange={(e) =>
                    setFormData({ ...formData, overbookingPercentage: parseInt(e.target.value) })
                  }
                  helperText="Percentage above capacity to allow"
                  InputProps={{ endAdornment: '%' }}
                />
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Policies Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Reservation Policies
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Cancellation Policy"
                value={formData.cancellationPolicy || ''}
                onChange={(e) =>
                  setFormData({ ...formData, cancellationPolicy: e.target.value })
                }
                helperText="Policy text shown to customers"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cancellation Hours"
                type="number"
                value={formData.cancellationHours || 24}
                onChange={(e) =>
                  setFormData({ ...formData, cancellationHours: parseInt(e.target.value) })
                }
                helperText="Hours before reservation when cancellation is allowed"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Payment Requirements
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requireCreditCard || false}
                    onChange={(e) =>
                      setFormData({ ...formData, requireCreditCard: e.target.checked })
                    }
                  />
                }
                label="Require Credit Card for Reservations"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.requireDeposit || false}
                    onChange={(e) =>
                      setFormData({ ...formData, requireDeposit: e.target.checked })
                    }
                  />
                }
                label="Require Deposit"
              />
              {formData.requireDeposit && (
                <TextField
                  sx={{ mt: 2, maxWidth: 200 }}
                  label="Deposit Amount"
                  type="number"
                  value={formData.depositAmount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      depositAmount: e.target.value ? parseFloat(e.target.value) : undefined
                    })
                  }
                  InputProps={{ startAdornment: '$' }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Communication Settings
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.autoConfirm !== undefined ? formData.autoConfirm : true}
                    onChange={(e) =>
                      setFormData({ ...formData, autoConfirm: e.target.checked })
                    }
                  />
                }
                label="Auto-Confirm Reservations"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sendConfirmation !== undefined ? formData.sendConfirmation : true}
                    onChange={(e) =>
                      setFormData({ ...formData, sendConfirmation: e.target.checked })
                    }
                  />
                }
                label="Send Confirmation Emails"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.sendReminder !== undefined ? formData.sendReminder : true}
                    onChange={(e) =>
                      setFormData({ ...formData, sendReminder: e.target.checked })
                    }
                  />
                }
                label="Send Reminder Emails"
              />
              {formData.sendReminder && (
                <TextField
                  sx={{ mt: 2, maxWidth: 200 }}
                  label="Reminder Hours Before"
                  type="number"
                  value={formData.reminderHours || 24}
                  onChange={(e) =>
                    setFormData({ ...formData, reminderHours: parseInt(e.target.value) })
                  }
                />
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            size="large"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ReservationSettingsPage;

