import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Chip,
  IconButton,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  Search,
  Visibility,
  Block,
  CheckCircle,
  Store,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import restaurantService, { Restaurant, RestaurantListParams } from '../services/restaurantService';

const RestaurantList: React.FC = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');

  useEffect(() => {
    loadRestaurants();
  }, [page, rowsPerPage, search, statusFilter, planFilter]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const params: RestaurantListParams = {
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        status: statusFilter || undefined,
        plan: planFilter || undefined,
      };

      const response = await restaurantService.getRestaurants(params);
      setRestaurants(response.restaurants);
      setTotalCount(response.pagination.total);
    } catch (error) {
      console.error('Failed to load restaurants:', error);
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
        size="small"
        icon={config.icon}
      />
    );
  };

  const getPlanChip = (plan?: string) => {
    if (!plan) return null;

    const planConfig: Record<string, { color: any }> = {
      TRIAL: { color: 'info' },
      STARTER: { color: 'primary' },
      PROFESSIONAL: { color: 'secondary' },
      ENTERPRISE: { color: 'success' },
    };

    const config = planConfig[plan] || { color: 'default' };

    return <Chip label={plan} color={config.color} size="small" variant="outlined" />;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Restaurants
      </Typography>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search by name, email, or owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="VERIFIED">Verified</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Plan</InputLabel>
                <Select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  label="Plan"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="TRIAL">Trial</MenuItem>
                  <MenuItem value="STARTER">Starter</MenuItem>
                  <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                  <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={loadRestaurants}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Restaurant Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Restaurant</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell align="center">Staff</TableCell>
              <TableCell align="center">Reservations</TableCell>
              <TableCell align="center">Created</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : restaurants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No restaurants found
                </TableCell>
              </TableRow>
            ) : (
              restaurants.map((restaurant) => (
                <TableRow key={restaurant.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1">{restaurant.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {restaurant.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{restaurant.ownerName || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {restaurant.ownerEmail || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(restaurant.onboardingStatus)}</TableCell>
                  <TableCell>{getPlanChip(restaurant.subscription?.plan)}</TableCell>
                  <TableCell align="center">{restaurant._count?.staff || 0}</TableCell>
                  <TableCell align="center">{restaurant._count?.reservations || 0}</TableCell>
                  <TableCell align="center">
                    {new Date(restaurant.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/platform-admin/restaurants/${restaurant.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
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

export default RestaurantList; 