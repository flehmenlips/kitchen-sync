import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  Store,
  Email,
  Phone,
  LocationOn,
  CheckCircle,
  Block,
  Note,
  Timeline,
  People,
  ShoppingCart,
  CalendarToday,
  TrendingUp,
  Edit,
  Refresh,
} from '@mui/icons-material';
import restaurantService, { Restaurant, RestaurantNote, RestaurantAnalytics } from '../services/restaurantService';

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
      id={`restaurant-tabpanel-${index}`}
      aria-labelledby={`restaurant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [analytics, setAnalytics] = useState<RestaurantAnalytics | null>(null);
  const [notes, setNotes] = useState<RestaurantNote[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [dialogNote, setDialogNote] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  useEffect(() => {
    if (id) {
      loadRestaurantData();
    }
  }, [id]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurant(Number(id));
      setRestaurant(data.restaurant);
      setNotes(data.restaurant.notes || []);
      setActivity(data.recentActivity || []);
      
      // Load analytics
      const analyticsData = await restaurantService.getRestaurantAnalytics(Number(id));
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      await restaurantService.verifyRestaurant(Number(id), dialogNote);
      setVerifyDialogOpen(false);
      setDialogNote('');
      loadRestaurantData();
    } catch (error) {
      console.error('Failed to verify restaurant:', error);
    }
  };

  const handleSuspend = async () => {
    try {
      await restaurantService.suspendRestaurant(Number(id), suspendReason);
      setSuspendDialogOpen(false);
      setSuspendReason('');
      loadRestaurantData();
    } catch (error) {
      console.error('Failed to suspend restaurant:', error);
    }
  };

  const handleUnsuspend = async () => {
    try {
      await restaurantService.unsuspendRestaurant(Number(id), dialogNote);
      setDialogNote('');
      loadRestaurantData();
    } catch (error) {
      console.error('Failed to unsuspend restaurant:', error);
    }
  };

  const handleAddNote = async () => {
    try {
      await restaurantService.addRestaurantNote(Number(id), dialogNote);
      setNoteDialogOpen(false);
      setDialogNote('');
      loadRestaurantData();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: any; icon: React.ReactElement }> = {
      PENDING: { color: 'warning', icon: <Store /> },
      VERIFIED: { color: 'success', icon: <CheckCircle /> },
      SUSPENDED: { color: 'error', icon: <Block /> },
      ACTIVE: { color: 'primary', icon: <CheckCircle /> },
    };

    const config = statusConfig[status] || { color: 'default', icon: <Store /> };

    return (
      <Chip
        label={status}
        color={config.color}
        size="medium"
        icon={config.icon}
      />
    );
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!restaurant) {
    return (
      <Box>
        <Alert severity="error">Restaurant not found</Alert>
        <Button onClick={() => navigate('/platform-admin/restaurants')} sx={{ mt: 2 }}>
          Back to Restaurants
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/platform-admin/restaurants')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {restaurant.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getStatusChip(restaurant.onboardingStatus)}
            {restaurant.subscription && (
              <Chip 
                label={restaurant.subscription.plan} 
                variant="outlined" 
                color="primary" 
                size="small" 
              />
            )}
          </Box>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={loadRestaurantData}
          sx={{ mr: 2 }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate(`/platform-admin/restaurants/${id}/edit`)}
        >
          Edit
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Overview" />
          <Tab label="Analytics" />
          <Tab label="Notes" />
          <Tab label="Activity" />
        </Tabs>
      </Paper>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Restaurant Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Restaurant Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar><Email /></Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Email"
                      secondary={restaurant.email || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar><Phone /></Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Phone"
                      secondary={restaurant.phone || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar><LocationOn /></Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Address"
                      secondary={
                        restaurant.address ? 
                        `${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}` :
                        'Not provided'
                      }
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Owner Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Owner Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Owner Name"
                      secondary={restaurant.ownerName || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Owner Email"
                      secondary={restaurant.ownerEmail || 'Not provided'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Business Phone"
                      secondary={restaurant.businessPhone || 'Not provided'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Stats */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <People sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Staff
                        </Typography>
                        <Typography variant="h6">
                          {restaurant._count?.staff || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 30, color: 'success.main', mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Reservations
                        </Typography>
                        <Typography variant="h6">
                          {restaurant._count?.reservations || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShoppingCart sx={{ fontSize: 30, color: 'warning.main', mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Orders
                        </Typography>
                        <Typography variant="h6">
                          {restaurant._count?.orders || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <People sx={{ fontSize: 30, color: 'info.main', mr: 1 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Customers
                        </Typography>
                        <Typography variant="h6">
                          {restaurant._count?.customers || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {restaurant.onboardingStatus === 'PENDING' && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => setVerifyDialogOpen(true)}
                    >
                      Verify Restaurant
                    </Button>
                  )}
                  {restaurant.suspendedAt ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUnsuspend}
                    >
                      Unsuspend Restaurant
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Block />}
                      onClick={() => setSuspendDialogOpen(true)}
                    >
                      Suspend Restaurant
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Note />}
                    onClick={() => setNoteDialogOpen(true)}
                  >
                    Add Note
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Analytics Tab */}
      <TabPanel value={tabValue} index={1}>
        {analytics && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Reservation Statistics
                  </Typography>
                  <Grid container spacing={2}>
                    {analytics.reservationStats.map((stat) => (
                      <Grid item xs={6} sm={3} key={stat.status}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4">{stat._count}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stat.status}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Notes Tab */}
      <TabPanel value={tabValue} index={2}>
        <List>
          {notes.length === 0 ? (
            <ListItem>
              <ListItemText primary="No notes yet" />
            </ListItem>
          ) : (
            notes.map((note) => (
              <React.Fragment key={note.id}>
                <ListItem>
                  <ListItemText
                    primary={note.note}
                    secondary={
                      <>
                        By {note.admin.name} • {new Date(note.createdAt).toLocaleString()}
                        {note.isInternal && <Chip label="Internal" size="small" sx={{ ml: 1 }} />}
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </TabPanel>

      {/* Activity Tab */}
      <TabPanel value={tabValue} index={3}>
        <List>
          {activity.length === 0 ? (
            <ListItem>
              <ListItemText primary="No activity recorded" />
            </ListItem>
          ) : (
            activity.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar><Timeline /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.action}
                    secondary={`By ${item.admin.name} • ${new Date(item.createdAt).toLocaleString()}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          )}
        </List>
      </TabPanel>

      {/* Dialogs */}
      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Verify Restaurant</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            value={dialogNote}
            onChange={(e) => setDialogNote(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleVerify} variant="contained" color="success">
            Verify
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Suspend Restaurant</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Suspending a restaurant will prevent them from accessing their account.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for suspension"
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSuspend} variant="contained" color="error" disabled={!suspendReason}>
            Suspend
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Note"
            value={dialogNote}
            onChange={(e) => setDialogNote(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNote} variant="contained" disabled={!dialogNote}>
            Add Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantDetail; 