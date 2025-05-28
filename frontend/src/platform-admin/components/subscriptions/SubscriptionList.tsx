import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Button,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import subscriptionService, { Subscription } from '../../services/subscriptionService';

interface SubscriptionListProps {
  onViewDetails: (subscription: Subscription) => void;
  onEditSubscription: (subscription: Subscription) => void;
  onCancelSubscription: (subscription: Subscription) => void;
}

const planColors: Record<string, 'default' | 'primary' | 'secondary' | 'warning'> = {
  TRIAL: 'default',
  STARTER: 'primary',
  PROFESSIONAL: 'secondary',
  HOME: 'warning',
};

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  TRIAL: 'info',
  ACTIVE: 'success',
  PAST_DUE: 'warning',
  CANCELED: 'error',
  SUSPENDED: 'error',
};

const planPrices: Record<string, number> = {
  TRIAL: 0,
  STARTER: 49,
  PROFESSIONAL: 149,
  HOME: 299,
};

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  onViewDetails,
  onEditSubscription,
  onCancelSubscription,
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, [page, rowsPerPage, search, statusFilter, planFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(planFilter && { plan: planFilter }),
      };

      const data = await subscriptionService.getSubscriptions(params);
      setSubscriptions(data.subscriptions);
      setTotalCount(data.pagination.total);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateMRR = (subscription: Subscription) => {
    if (subscription.status !== 'ACTIVE') return 0;
    const basePrice = planPrices[subscription.plan] || 0;
    const extraSeats = Math.max(0, subscription.seats - 5) * 10;
    return basePrice + extraSeats;
  };

  const renderSubscriptionRow = (subscription: Subscription) => {
    const mrr = calculateMRR(subscription);
    const isTrialExpiringSoon = subscription.trialEndsAt && 
      new Date(subscription.trialEndsAt) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    return (
      <TableRow key={subscription.id} hover>
        <TableCell>
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {subscription.restaurant.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subscription.restaurant.ownerEmail}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Chip
            label={subscription.plan}
            size="small"
            color={planColors[subscription.plan]}
          />
        </TableCell>
        <TableCell>
          <Chip
            label={subscription.status}
            size="small"
            color={statusColors[subscription.status]}
          />
          {isTrialExpiringSoon && (
            <Typography variant="caption" color="warning.main" display="block">
              Trial ends {formatDistanceToNow(new Date(subscription.trialEndsAt!))}
            </Typography>
          )}
        </TableCell>
        <TableCell align="center">{subscription.seats}</TableCell>
        <TableCell>
          {mrr > 0 ? (
            <Box display="flex" alignItems="center" gap={0.5}>
              <MoneyIcon fontSize="small" color="success" />
              <Typography variant="body2">${mrr}/mo</Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">-</Typography>
          )}
        </TableCell>
        <TableCell>
          <Typography variant="caption">
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </Typography>
        </TableCell>
        <TableCell>
          <Box>
            {subscription.billingName || '-'}
            {subscription.billingEmail && (
              <Typography variant="caption" color="text.secondary" display="block">
                {subscription.billingEmail}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell align="right">
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onViewDetails(subscription)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Subscription">
            <IconButton size="small" onClick={() => onEditSubscription(subscription)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {subscription.status !== 'CANCELED' && (
            <Tooltip title="Cancel Subscription">
              <IconButton 
                size="small" 
                onClick={() => onCancelSubscription(subscription)}
                color="error"
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by restaurant or billing info..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="TRIAL">Trial</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="PAST_DUE">Past Due</MenuItem>
                  <MenuItem value="CANCELED">Canceled</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Plan</InputLabel>
                <Select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  label="Plan"
                >
                  <MenuItem value="">All Plans</MenuItem>
                  <MenuItem value="TRIAL">Trial</MenuItem>
                  <MenuItem value="STARTER">Starter</MenuItem>
                  <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                  <MenuItem value="HOME">Home</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                href="/platform-admin/subscriptions/analytics"
              >
                Analytics
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Restaurant</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Seats</TableCell>
              <TableCell>MRR</TableCell>
              <TableCell>Next Billing</TableCell>
              <TableCell>Billing Contact</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={8}>
                    <Skeleton />
                  </TableCell>
                </TableRow>
              ))
            ) : subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" py={3}>
                    No subscriptions found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map(renderSubscriptionRow)
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}; 