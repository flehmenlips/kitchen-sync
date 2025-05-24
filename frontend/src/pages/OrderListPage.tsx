import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { Order, OrderStatus, OrderType } from '../types';
import { OrderEntryDialog } from '../components/tablefarm/OrderEntryDialog';

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [orderEntryOpen, setOrderEntryOpen] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrders({
        status: statusFilter,
        date: dateFilter,
        orderType: orderTypeFilter
      });
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFilter, orderTypeFilter]);

  const handleStatusUpdate = async (order: Order, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(order.id, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    try {
      await orderService.deleteOrder(orderToDelete.id);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      await fetchOrders();
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order');
    }
  };

  const handleOrderCreated = () => {
    setOrderEntryOpen(false);
    fetchOrders();
  };

  const getStatusChip = (status: OrderStatus) => {
    const color = orderService.getStatusColor(status);
    return (
      <Chip
        label={status.replace('_', ' ')}
        size="small"
        style={{ backgroundColor: color, color: 'white' }}
      />
    );
  };

  const filteredOrders = orders.filter(order => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.reservation?.customerName.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Orders
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOrderEntryOpen(true)}
            >
              New Order
            </Button>
            <IconButton onClick={fetchOrders} color="primary">
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Order # or customer name"
              size="small"
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              type="date"
              label="Date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {Object.values(OrderStatus).map(status => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={orderTypeFilter}
                onChange={(e) => setOrderTypeFilter(e.target.value as OrderType | 'all')}
                label="Order Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {Object.values(OrderType).map(type => (
                  <MenuItem key={type} value={type}>
                    {orderService.getOrderTypeDisplay(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Orders Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Time</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" py={4}>
                      No orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography fontWeight="medium">
                        {orderService.formatOrderNumber(order.orderNumber)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {order.customerName || order.reservation?.customerName || 'Walk-in'}
                      {order.reservation && (
                        <Typography variant="caption" display="block" color="textSecondary">
                          Table {order.reservation.partySize}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{orderService.getOrderTypeDisplay(order.orderType)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {order.orderItems.length} items
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        ${Number(order.totalAmount || 0).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order, e.target.value as OrderStatus)}
                        size="small"
                        variant="standard"
                        renderValue={(value) => getStatusChip(value as OrderStatus)}
                      >
                        {Object.values(OrderStatus).map(status => (
                          <MenuItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(order.createdAt), 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View Order">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tablefarm/orders/${order.id}`)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Order">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/tablefarm/orders/${order.id}/edit`)}
                            disabled={['COMPLETED', 'CANCELLED'].includes(order.status)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Order">
                          <IconButton
                            size="small"
                            onClick={() => window.print()}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Order">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(order)}
                            disabled={['IN_PROGRESS', 'READY'].includes(order.status)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Order Entry Dialog */}
      <OrderEntryDialog
        open={orderEntryOpen}
        onClose={() => setOrderEntryOpen(false)}
        onSuccess={handleOrderCreated}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete order {orderToDelete && orderService.formatOrderNumber(orderToDelete.orderNumber)}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderListPage; 