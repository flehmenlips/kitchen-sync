import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import CustomerDetailModal from './CustomerDetailModal';
import CustomerEditModal from './CustomerEditModal';
import { customerApi } from '../../services/adminApi';

interface Customer {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
  reservationCount?: number;
  lastReservation?: {
    reservationDate: string;
    reservationTime: string;
    status: string;
  };
  _count?: {
    sessions: number;
  };
}

interface CustomerListResponse {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCustomer, setMenuCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerApi.getCustomers({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm
      });
      setCustomers(response.customers);
      setTotalCount(response.pagination.total);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (page === 0) {
        fetchCustomers();
      } else {
        setPage(0); // This will trigger fetchCustomers
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, customer: Customer) => {
    setAnchorEl(event.currentTarget);
    setMenuCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCustomer(null);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailModalOpen(true);
    handleMenuClose();
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditModalOpen(true);
    handleMenuClose();
  };

  const formatCustomerName = (customer: Customer) => {
    if (customer.firstName || customer.lastName) {
      return `${customer.firstName || ''} ${customer.lastName || ''}`.trim();
    }
    return 'No name';
  };

  const getStatusChip = (status: string) => {
    const statusColors: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
      CONFIRMED: 'success',
      CANCELLED: 'error',
      COMPLETED: 'info',
      NO_SHOW: 'warning'
    };
    return (
      <Chip 
        label={status} 
        size="small" 
        color={statusColors[status] || 'default'}
      />
    );
  };

  if (loading && customers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchCustomers}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4">
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Customer Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Customer</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="center">Verified</TableCell>
              <TableCell align="center">Reservations</TableCell>
              <TableCell>Last Visit</TableCell>
              <TableCell>Member Since</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCustomerName(customer)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {customer.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" flexDirection="column" gap={0.5}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{customer.email}</Typography>
                    </Box>
                    {customer.phone && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{customer.phone}</Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {customer.emailVerified ? (
                    <Tooltip title="Email Verified">
                      <CheckCircleIcon color="success" />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Email Not Verified">
                      <CancelIcon color="error" />
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    icon={<RestaurantIcon />}
                    label={customer.reservationCount || 0}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {customer.lastReservation ? (
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(customer.lastReservation.reservationDate), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {customer.lastReservation.reservationTime} • {getStatusChip(customer.lastReservation.status)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No reservations
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CalendarIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, customer)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuCustomer && handleViewDetails(menuCustomer)}>
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => menuCustomer && handleEditCustomer(menuCustomer)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Customer
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <NotesIcon fontSize="small" sx={{ mr: 1 }} />
          Add Note
        </MenuItem>
      </Menu>

      {/* Modals */}
      {selectedCustomer && (
        <>
          <CustomerDetailModal
            open={detailModalOpen}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedCustomer(null);
            }}
            customerId={selectedCustomer.id}
            onUpdate={fetchCustomers}
          />
          <CustomerEditModal
            open={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedCustomer(null);
            }}
            customer={selectedCustomer}
            onUpdate={fetchCustomers}
          />
        </>
      )}
    </Box>
  );
};

export default CustomerManagement; 