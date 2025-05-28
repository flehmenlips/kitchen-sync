import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link
} from '@mui/material';
import {
  CreditCard,
  CheckCircle,
  Warning,
  Receipt,
  CalendarToday,
  People,
  TrendingUp,
  Cancel,
  Download
} from '@mui/icons-material';
import { billingService, Subscription, Invoice, PlanDetails } from '../services/billingService';
import { useSnackbar } from '../context/SnackbarContext';
import { useNavigate, useLocation } from 'react-router-dom';

const BillingPage: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchBillingData();
    checkUrlParams();
  }, []);

  const checkUrlParams = () => {
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      showSnackbar('Payment successful! Your subscription has been updated.', 'success');
      // Clear the URL params
      navigate('/settings/billing', { replace: true });
    } else if (params.get('canceled') === 'true') {
      showSnackbar('Payment was canceled.', 'info');
      navigate('/settings/billing', { replace: true });
    }
  };

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const [sub, inv] = await Promise.all([
        billingService.getSubscription(),
        billingService.getInvoices()
      ]);
      setSubscription(sub);
      setInvoices(inv);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      showSnackbar('Failed to load billing information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    try {
      setLoadingAction(true);
      const { url } = await billingService.createCheckoutSession(plan);
      window.location.href = url;
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      // Check if it's a Stripe configuration error
      if (error.response?.status === 503) {
        showSnackbar(error.response.data.message || 'Payment processing is not configured yet', 'info');
      } else {
        showSnackbar('Failed to start checkout process', 'error');
      }
      setLoadingAction(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoadingAction(true);
      const { url } = await billingService.createBillingPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      showSnackbar('Failed to open billing portal', 'error');
      setLoadingAction(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoadingAction(true);
      const updatedSub = await billingService.cancelSubscription();
      setSubscription(updatedSub);
      setCancelDialogOpen(false);
      showSnackbar('Subscription will be canceled at the end of the billing period', 'success');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      showSnackbar('Failed to cancel subscription', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'TRIAL':
        return 'info';
      case 'PAST_DUE':
        return 'warning';
      case 'CANCELED':
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const currentPlan = subscription ? billingService.getPlanDetails(subscription.plan) : null;
  const allPlans = billingService.getAllPlans();
  const daysRemaining = subscription?.trialEndsAt 
    ? billingService.calculateDaysRemaining(subscription.trialEndsAt)
    : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Billing & Subscription
      </Typography>

      {/* Current Subscription Status */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Current Subscription</Typography>
          {subscription?.status === 'ACTIVE' && (
            <Button
              variant="outlined"
              startIcon={<CreditCard />}
              onClick={handleManageBilling}
              disabled={loadingAction}
            >
              Manage Payment Method
            </Button>
          )}
        </Box>

        {subscription && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography variant="h5">{currentPlan?.name}</Typography>
                <Chip 
                  label={subscription.status} 
                  color={getStatusColor(subscription.status) as any}
                  size="small"
                />
              </Box>

              {subscription.status === 'TRIAL' && daysRemaining !== null && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <AlertTitle>Free Trial</AlertTitle>
                  {daysRemaining} days remaining in your trial. Upgrade now to ensure uninterrupted service.
                </Alert>
              )}

              {subscription.status === 'PAST_DUE' && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>Payment Required</AlertTitle>
                  Your subscription payment is past due. Please update your payment method to avoid service interruption.
                </Alert>
              )}

              <List dense>
                <ListItem>
                  <ListItemIcon><CalendarToday /></ListItemIcon>
                  <ListItemText 
                    primary="Billing Period"
                    secondary={`${formatDate(subscription.currentPeriodStart)} - ${formatDate(subscription.currentPeriodEnd)}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><People /></ListItemIcon>
                  <ListItemText 
                    primary="Staff Seats"
                    secondary={`${subscription.seats} seats`}
                  />
                </ListItem>
                {subscription.cancelAt && (
                  <ListItem>
                    <ListItemIcon><Cancel /></ListItemIcon>
                    <ListItemText 
                      primary="Cancels On"
                      secondary={formatDate(subscription.cancelAt)}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Plan Features</Typography>
                <List dense>
                  {currentPlan?.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Available Plans */}
      <Typography variant="h6" gutterBottom>
        Available Plans
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {allPlans.filter(plan => plan.plan !== 'TRIAL').map((plan) => (
          <Grid item xs={12} md={4} key={plan.plan}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: subscription?.plan === plan.plan ? 2 : 1,
                borderColor: subscription?.plan === plan.plan ? 'primary.main' : 'divider'
              }}
            >
              {subscription?.plan === plan.plan && (
                <Chip 
                  label="Current Plan" 
                  color="primary" 
                  size="small"
                  sx={{ position: 'absolute', top: 16, right: 16 }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h3" gutterBottom>
                  {formatCurrency(plan.price)}
                  <Typography variant="body2" component="span" color="text.secondary">
                    /month
                  </Typography>
                </Typography>
                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                {subscription?.plan === plan.plan ? (
                  <Button fullWidth disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    fullWidth 
                    variant="contained"
                    onClick={() => handleUpgrade(plan.plan)}
                    disabled={loadingAction || subscription?.status === 'PAST_DUE'}
                  >
                    {subscription && subscription.plan !== 'TRIAL' && 
                     ['STARTER', 'PROFESSIONAL', 'HOME'].indexOf(plan.plan) < 
                     ['STARTER', 'PROFESSIONAL', 'HOME'].indexOf(subscription.plan) 
                      ? 'Downgrade' : 'Upgrade'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Invoice History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Invoice History
        </Typography>
        {invoices.length === 0 ? (
          <Typography color="text.secondary">
            No invoices yet. Invoices will appear here after your first payment.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{formatDate(invoice.periodStart)}</TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={invoice.status} 
                        size="small"
                        color={invoice.status === 'PAID' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {invoice.invoicePdf && (
                        <Link 
                          href={invoice.invoicePdf} 
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download fontSize="small" />
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Cancel Subscription */}
      {subscription && subscription.status === 'ACTIVE' && !subscription.cancelAt && (
        <Box mt={4} textAlign="center">
          <Button 
            color="error" 
            onClick={() => setCancelDialogOpen(true)}
          >
            Cancel Subscription
          </Button>
        </Box>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Subscription?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your subscription? You'll continue to have access 
            until the end of your current billing period on {subscription && formatDate(subscription.currentPeriodEnd)}.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Subscription
          </Button>
          <Button 
            onClick={handleCancelSubscription} 
            color="error"
            disabled={loadingAction}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BillingPage; 