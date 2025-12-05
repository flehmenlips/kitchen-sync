import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { timeSlotCapacityService, TimeSlotCapacity } from '../services/timeSlotCapacityService';
import { useSnackbar } from '../context/SnackbarContext';
import { useRestaurant } from '../context/RestaurantContext';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

const DEFAULT_TIME_SLOTS = [
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

interface CapacityRow {
  dayOfWeek: number;
  timeSlot: string;
  maxCovers: number;
  isActive: boolean;
  id?: number;
}

const TimeSlotCapacityPage: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [capacities, setCapacities] = useState<Map<string, TimeSlotCapacity>>(new Map());
  const [editingRow, setEditingRow] = useState<CapacityRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const restaurantId = currentRestaurant?.id || null;

  useEffect(() => {
    if (restaurantId) {
      fetchCapacities();
    } else {
      setLoading(false);
    }
  }, [restaurantId]);

  const fetchCapacities = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const data = await timeSlotCapacityService.getTimeSlotCapacities(restaurantId);
      const capacityMap = new Map<string, TimeSlotCapacity>();
      data.forEach(cap => {
        const key = `${cap.dayOfWeek}-${cap.timeSlot}`;
        capacityMap.set(key, cap);
      });
      setCapacities(capacityMap);
    } catch (error) {
      console.error('Error fetching time slot capacities:', error);
      showSnackbar('Failed to load time slot capacities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCapacity = (dayOfWeek: number, timeSlot: string): TimeSlotCapacity | null => {
    const key = `${dayOfWeek}-${timeSlot}`;
    return capacities.get(key) || null;
  };

  const handleCapacityChange = (dayOfWeek: number, timeSlot: string, maxCovers: number) => {
    const key = `${dayOfWeek}-${timeSlot}`;
    const existing = capacities.get(key);
    
    if (existing) {
      const updated = new Map(capacities);
      updated.set(key, { ...existing, maxCovers });
      setCapacities(updated);
    } else {
      const newCapacity: TimeSlotCapacity = {
        id: 0,
        restaurantId: restaurantId!,
        dayOfWeek,
        timeSlot,
        maxCovers,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = new Map(capacities);
      updated.set(key, newCapacity);
      setCapacities(updated);
    }
  };

  const handleActiveToggle = (dayOfWeek: number, timeSlot: string) => {
    const key = `${dayOfWeek}-${timeSlot}`;
    const existing = capacities.get(key);
    
    if (existing) {
      const updated = new Map(capacities);
      updated.set(key, { ...existing, isActive: !existing.isActive });
      setCapacities(updated);
    } else {
      // If capacity doesn't exist (using default), create a new one when toggling inactive
      // Use a default maxCovers value (100) so it can be saved
      const newCapacity: TimeSlotCapacity = {
        id: 0,
        restaurantId: restaurantId!,
        dayOfWeek,
        timeSlot,
        maxCovers: 100, // Default value - user can change it
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = new Map(capacities);
      updated.set(key, newCapacity);
      setCapacities(updated);
    }
  };

  const handleBulkSave = async () => {
    if (!restaurantId) {
      showSnackbar('Restaurant ID not available', 'error');
      return;
    }

    setSaving(true);
    try {
      const capacityArray: Array<{
        dayOfWeek: number;
        timeSlot: string;
        maxCovers: number;
        isActive: boolean;
      }> = [];
      
      const capacitiesToDelete: number[] = [];

      capacities.forEach(cap => {
        // If maxCovers is 0, it means "use default capacity"
        // However, if isActive is explicitly false, we need to preserve that state
        // even if maxCovers is 0 (user wants to disable this time slot)
        if (cap.maxCovers === 0 || cap.maxCovers < 1) {
          // If explicitly inactive, save it with minimum covers to preserve the inactive state
          if (cap.isActive === false) {
            capacityArray.push({
              dayOfWeek: cap.dayOfWeek,
              timeSlot: cap.timeSlot,
              maxCovers: 1, // Use minimum value to preserve inactive state
              isActive: false
            });
            return;
          }
          
          // If this capacity exists in DB (has id), delete it
          // Otherwise, don't save it (it will use default)
        // If this capacity exists in DB (has id), delete it
        // Otherwise, don't save it (it will use default)
        if (cap.maxCovers === 0 || cap.maxCovers < 1) {
          if (cap.id && cap.id > 0) {
            capacitiesToDelete.push(cap.id);
          }
          return; // Skip adding to capacityArray
        }
        
        capacityArray.push({
          dayOfWeek: cap.dayOfWeek,
          timeSlot: cap.timeSlot,
          maxCovers: cap.maxCovers,
          isActive: cap.isActive
        });
      });

      // Delete capacities that were set to 0 (use default)
      // Process deletions individually to handle partial failures gracefully
      const deletionResults: Array<{ id: number; success: boolean; error?: any }> = [];
      
      for (const id of capacitiesToDelete) {
        try {
          await timeSlotCapacityService.deleteTimeSlotCapacity(id);
          deletionResults.push({ id, success: true });
        } catch (error: any) {
          // Treat 404 as success (item already deleted) to avoid error loops
          if (error.response?.status === 404) {
            deletionResults.push({ id, success: true });
          } else {
            deletionResults.push({ id, success: false, error });
          }
        }
      }

      const successfulDeletions = deletionResults.filter(r => r.success).length;
      const failedDeletions = deletionResults.filter(r => !r.success);
      await Promise.all(
        capacitiesToDelete.map(id => timeSlotCapacityService.deleteTimeSlotCapacity(id))
      );

      // Save capacities with valid maxCovers (> 0)
      if (capacityArray.length > 0) {
        await timeSlotCapacityService.bulkUpsertTimeSlotCapacities(restaurantId, capacityArray);
      }

      const savedCount = capacityArray.length;
      let message = 'Time slot capacities saved successfully';
      
      // Build success message
      if (successfulDeletions > 0 && savedCount > 0) {
        message = `Saved ${savedCount} capacity setting${savedCount !== 1 ? 's' : ''} and removed ${successfulDeletions} default setting${successfulDeletions !== 1 ? 's' : ''}`;
      } else if (successfulDeletions > 0) {
        message = `Removed ${successfulDeletions} capacity setting${successfulDeletions !== 1 ? 's' : ''} (using defaults)`;
      const deletedCount = capacitiesToDelete.length;
      const savedCount = capacityArray.length;
      let message = 'Time slot capacities saved successfully';
      if (deletedCount > 0 && savedCount > 0) {
        message = `Saved ${savedCount} capacity setting${savedCount !== 1 ? 's' : ''} and removed ${deletedCount} default setting${deletedCount !== 1 ? 's' : ''}`;
      } else if (deletedCount > 0) {
        message = `Removed ${deletedCount} capacity setting${deletedCount !== 1 ? 's' : ''} (using defaults)`;
      } else if (savedCount > 0) {
        message = `Saved ${savedCount} capacity setting${savedCount !== 1 ? 's' : ''}`;
      } else {
        message = 'No changes to save';
      }

      // Show warning if some deletions failed
      if (failedDeletions.length > 0) {
        const errorMessage = failedDeletions[0].error?.response?.data?.message || 'Some deletions failed';
        showSnackbar(
          `${message}. Warning: ${failedDeletions.length} deletion${failedDeletions.length !== 1 ? 's' : ''} failed: ${errorMessage}`,
          'warning'
        );
      } else {
        showSnackbar(message, 'success');
      }
      
      // Always refresh state to sync with database, even if there were errors
      
      showSnackbar(message, 'success');
      fetchCapacities();
    } catch (error: any) {
      console.error('Error saving time slot capacities:', error);
      
      // Always refresh state on error to prevent stale IDs from causing retry loops
      fetchCapacities();
      
      showSnackbar(
        error.response?.data?.message || 'Failed to save time slot capacities',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopyDay = (sourceDay: number) => {
    setSelectedDay(sourceDay);
    setDialogOpen(true);
  };

  const handleCopyDayConfirm = (targetDay: number) => {
    if (selectedDay === null) return;

    const updated = new Map(capacities);
    
    // Get all capacities for source day
    const sourceCapacities: TimeSlotCapacity[] = [];
    capacities.forEach(cap => {
      if (cap.dayOfWeek === selectedDay) {
        sourceCapacities.push(cap);
      }
    });

    // Copy to target day
    sourceCapacities.forEach(sourceCap => {
      // Skip capacities with maxCovers: 0 that don't have an ID
      // These represent "use default" and shouldn't be copied
      if (sourceCap.maxCovers === 0 && (!sourceCap.id || sourceCap.id === 0)) {
        return;
      }
      
      const key = `${targetDay}-${sourceCap.timeSlot}`;
      const existingTarget = updated.get(key);
      
      // Preserve existing ID if target already has a database entry
      // This ensures deletion logic works correctly when maxCovers is set to 0
      const preservedId = existingTarget?.id && existingTarget.id > 0 
        ? existingTarget.id 
        : 0;
      
      updated.set(key, {
        ...sourceCap,
        id: preservedId,
        dayOfWeek: targetDay,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    setCapacities(updated);
    setDialogOpen(false);
    setSelectedDay(null);
    showSnackbar(`Copied ${DAYS_OF_WEEK[selectedDay].label} settings to ${DAYS_OF_WEEK[targetDay].label}`, 'success');
  };

  const handleDeleteCapacity = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this capacity setting?')) {
      return;
    }

    try {
      await timeSlotCapacityService.deleteTimeSlotCapacity(id);
      showSnackbar('Capacity setting deleted', 'success');
      fetchCapacities();
    } catch (error: any) {
      console.error('Error deleting capacity:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to delete capacity setting',
        'error'
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading time slot capacities...</Typography>
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Time Slot Capacity Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleBulkSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure maximum capacity (covers) for specific time slots on each day of the week. 
        These settings override the general capacity limit set in Reservation Settings. 
        Leave empty to use the default capacity from Reservation Settings.
      </Alert>

      {DAYS_OF_WEEK.map(day => (
        <Paper key={day.value} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">{day.label}</Typography>
            <Tooltip title={`Copy ${day.label} settings to another day`}>
              <IconButton size="small" onClick={() => handleCopyDay(day.value)}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={2}>
            {DEFAULT_TIME_SLOTS.map(timeSlot => {
              const capacity = getCapacity(day.value, timeSlot);
              const maxCovers = capacity?.maxCovers || 0;
              const isActive = capacity?.isActive !== false;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={timeSlot}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {timeSlot}
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={isActive}
                            onChange={() => handleActiveToggle(day.value, timeSlot)}
                          />
                        }
                        label={isActive ? 'Active' : 'Inactive'}
                        labelPlacement="end"
                      />
                    </Box>
                    <TextField
                      fullWidth
                      type="number"
                      label="Max Covers"
                      value={maxCovers || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        handleCapacityChange(day.value, timeSlot, value);
                      }}
                      size="small"
                      inputProps={{ min: 0 }}
                      helperText={maxCovers === 0 ? 'Uses default capacity' : `${maxCovers} covers max`}
                    />
                    {capacity?.id && (
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCapacity(capacity.id!)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      ))}

      {/* Copy Day Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Copy Day Settings</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Copy settings from {selectedDay !== null ? DAYS_OF_WEEK[selectedDay].label : ''} to:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {DAYS_OF_WEEK.filter(day => day.value !== selectedDay).map(day => (
              <Grid item xs={6} key={day.value}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleCopyDayConfirm(day.value)}
                >
                  {day.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TimeSlotCapacityPage;

