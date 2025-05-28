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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  TrendingUp as UsageIcon,
  CreditCard as PaymentIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  EventAvailable as CalendarIcon,
  CreditCard,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { API_URL } from '../../../config';

interface SubscriptionDetail {
  id: number;
  restaurant: {
    id: number;
    name: string;
    slug: string;
    ownerEmail: string;
    ownerName: string;
    phone?: string;
    address?: string;
  };
  plan: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  cancelAt?: string;
  canceledAt?: string;
  seats: number;
  billingEmail?: string;
  billingName?: string;
  billingAddress?: any;
  stripeCustomerId?: string;
  stripeSubId?: string;
  invoices: Invoice[];
  usageRecords: UsageRecord[];
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  amount: number;
  total: number;
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
  invoiceUrl?: string;
}

interface UsageRecord {
  id: number;
  metric: string;
  quantity: number;
  totalAmount?: number;
  periodStart: string;
  periodEnd: string;
  recordedAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subscription-tabpanel-${index}`}
      aria-labelledby={`subscription-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface SubscriptionDetailModalProps {
  open: boolean;
  onClose: () => void;
  subscriptionId: number | null;
  onOpenBillingPortal?: (customerId: string) => void;
}

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  open,
  onClose,
  subscriptionId,
  onOpenBillingPortal,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && subscriptionId) {
      fetchSubscriptionDetails();
    }
  }, [open, subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    if (!subscriptionId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('platformToken');
      const response = await fetch(`${API_URL}/platform/subscriptions/${subscriptionId}`, {
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch subscription details');

      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      TRIAL: 'info',
      ACTIVE: 'success',
      PAST_DUE: 'warning',
      CANCELED: 'error',
      SUSPENDED: 'error',
    };
    return colors[status] || 'default';
  };

  const getPlanColor = (plan: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'warning'> = {
      TRIAL: 'default',
      STARTER: 'primary',
      PROFESSIONAL: 'secondary',
      ENTERPRISE: 'warning',
    };
    return colors[plan] || 'default';
  };

  if (!subscription && !loading) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Subscription Details</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : subscription ? (
          <>
            <Box mb={3}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h5" gutterBottom>
                    {subscription.restaurant.name}
                  </Typography>
                  <Box display="flex" gap={1} mb={1}>
                    <Chip
                      label={subscription.plan}
                      size="small"
                      color={getPlanColor(subscription.plan)}
                    />
                    <Chip
                      label={subscription.status}
                      size="small"
                      color={getStatusColor(subscription.status)}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} textAlign={{ md: 'right' }}>
                  {subscription.stripeCustomerId && onOpenBillingPortal && (
                    <Button
                      variant="outlined"
                      startIcon={<PaymentIcon />}
                      onClick={() => onOpenBillingPortal(subscription.stripeCustomerId!)}
                    >
                      Open Billing Portal
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>

            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Overview" />
              <Tab label="Invoices" icon={<ReceiptIcon />} iconPosition="start" />
              <Tab label="Usage" icon={<UsageIcon />} iconPosition="start" />
            </Tabs>

            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Restaurant Information
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <BusinessIcon fontSize="small" color="action" />
                        <Typography>{subscription.restaurant.name}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography>{subscription.restaurant.ownerName || 'N/A'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography>{subscription.restaurant.ownerEmail}</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Billing Information
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography>{subscription.billingName || 'Not set'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography>{subscription.billingEmail || 'Not set'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CreditCard fontSize="small" color="action" />
                        <Typography>
                          {subscription.stripeCustomerId ? 'Connected' : 'Not connected'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Subscription Details
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">
                              Current Period
                            </Typography>
                            <Typography>
                              {format(new Date(subscription.currentPeriodStart), 'MMM d, yyyy')} -{' '}
                              {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">
                              Seats
                            </Typography>
                            <Typography>{subscription.seats}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box mb={2}>
                            <Typography variant="caption" color="text.secondary">
                              Stripe Subscription
                            </Typography>
                            <Typography variant="body2" fontFamily="monospace">
                              {subscription.stripeSubId || 'N/A'}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {subscription.trialEndsAt && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          Trial ends on {format(new Date(subscription.trialEndsAt), 'MMMM d, yyyy')}
                        </Alert>
                      )}

                      {subscription.cancelAt && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Subscription will cancel on {format(new Date(subscription.cancelAt), 'MMMM d, yyyy')}
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Paid Date</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscription.invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary" py={3}>
                            No invoices yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscription.invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {format(new Date(invoice.periodStart), 'MMM d')} -{' '}
                            {format(new Date(invoice.periodEnd), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={invoice.status}
                              size="small"
                              color={invoice.status === 'PAID' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="right">${invoice.total}</TableCell>
                          <TableCell>
                            {invoice.paidAt
                              ? format(new Date(invoice.paidAt), 'MMM d, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell align="center">
                            {invoice.invoiceUrl && (
                              <Tooltip title="View Invoice">
                                <IconButton
                                  size="small"
                                  href={invoice.invoiceUrl}
                                  target="_blank"
                                >
                                  <ReceiptIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Recorded</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subscription.usageRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" py={3}>
                            No usage records yet
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscription.usageRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.metric}</TableCell>
                          <TableCell>
                            {format(new Date(record.periodStart), 'MMM d')} -{' '}
                            {format(new Date(record.periodEnd), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell align="right">{record.quantity}</TableCell>
                          <TableCell align="right">
                            {record.totalAmount ? `$${record.totalAmount}` : '-'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(record.recordedAt), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 