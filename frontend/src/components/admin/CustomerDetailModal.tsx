import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  Stack
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Restaurant as RestaurantIcon,
  Notes as NotesIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  VpnKey as VpnKeyIcon,
  History as HistoryIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { customerApi } from '../../services/adminApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface CustomerDetailModalProps {
  open: boolean;
  onClose: () => void;
  customerId: number;
  onUpdate?: () => void;
}

interface CustomerDetails {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
  vipStatus?: boolean;
  totalSpent?: number;
  reservations?: any[];
  customerNotes?: any[];
  preferences?: {
    dietaryRestrictions?: string[];
    seatingPreferences?: string[];
    specialOccasions?: any[];
  };
  stats?: {
    totalReservations: number;
    completedReservations: number;
    cancelledReservations: number;
    noShowCount: number;
    averagePartySize: number;
    favoriteItems?: string[];
  };
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  open,
  onClose,
  customerId,
  onUpdate
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerDetails();
    }
  }, [open, customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerApi.getCustomerById(customerId);
      setCustomer(data);
    } catch (err) {
      setError('Failed to fetch customer details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setAddingNote(true);
      await customerApi.addCustomerNote(customerId, newNote);
      setNewNote('');
      fetchCustomerDetails(); // Refresh data
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm('Send password reset email to customer?')) {
      try {
        await customerApi.resetCustomerPassword(customerId);
        alert('Password reset email sent successfully');
      } catch (err) {
        alert('Failed to send password reset email');
        console.error(err);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getCustomerName = () => {
    if (customer?.firstName || customer?.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }
    return 'No name';
  };

  const getInitials = () => {
    const name = getCustomerName();
    if (name === 'No name') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !customer) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">{error || 'Customer not found'}</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
              {getInitials()}
            </Avatar>
            <Box>
              <Typography variant="h5">{getCustomerName()}</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="textSecondary">
                  Customer #{customer.id}
                </Typography>
                {customer.vipStatus && (
                  <Chip 
                    icon={<StarIcon />} 
                    label="VIP" 
                    size="small" 
                    color="warning"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={handleResetPassword} title="Reset Password">
            <VpnKeyIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="customer details tabs">
          <Tab label="Overview" />
          <Tab label="Reservations" />
          <Tab label="Notes" />
          <Tab label="Activity" />
        </Tabs>
      </Box>

      <DialogContent>
        <TabPanel value={tabValue} index={0}>
          {/* Overview Tab */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={customer.email}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {customer.emailVerified ? (
                            <>
                              <CheckCircleIcon color="success" fontSize="small" />
                              <Typography variant="caption">Verified</Typography>
                            </>
                          ) : (
                            <>
                              <CancelIcon color="error" fontSize="small" />
                              <Typography variant="caption">Not Verified</Typography>
                            </>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {customer.phone && (
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText primary={customer.phone} />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Member Since"
                      secondary={format(new Date(customer.createdAt), 'MMMM d, yyyy')}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="primary">
                        {customer.stats?.totalReservations || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Reservations
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="success.main">
                        {customer.stats?.completedReservations || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="warning.main">
                        {customer.stats?.averagePartySize || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Avg Party Size
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="error.main">
                        {customer.stats?.noShowCount || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        No Shows
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {customer.tags && customer.tags.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {customer.tags.map((tag, index) => (
                      <Chip key={index} label={tag} />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Reservations Tab */}
          <Typography variant="h6" gutterBottom>
            Reservation History
          </Typography>
          {customer.reservations && customer.reservations.length > 0 ? (
            <List>
              {customer.reservations.map((reservation: any) => (
                <React.Fragment key={reservation.id}>
                  <ListItem>
                    <ListItemIcon>
                      <RestaurantIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${format(new Date(reservation.reservationDate), 'MMM d, yyyy')} at ${reservation.reservationTime}`}
                      secondary={`Party of ${reservation.partySize} - ${reservation.status}`}
                    />
                    <Chip 
                      label={reservation.status} 
                      size="small"
                      color={reservation.status === 'CONFIRMED' ? 'success' : 'default'}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary">No reservations yet</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Notes Tab */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Add Note
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Add a note about this customer..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleAddNote}
                disabled={!newNote.trim() || addingNote}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            Customer Notes
          </Typography>
          {customer.customerNotes && customer.customerNotes.length > 0 ? (
            <List>
              {customer.customerNotes.map((note: any) => (
                <React.Fragment key={note.id}>
                  <ListItem>
                    <ListItemIcon>
                      <NotesIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={note.note}
                      secondary={`Added by ${note.createdBy?.name || 'Unknown'} on ${format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography color="textSecondary">No notes yet</Typography>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Activity Tab */}
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Typography color="textSecondary">
            Activity tracking coming soon...
          </Typography>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDetailModal; 