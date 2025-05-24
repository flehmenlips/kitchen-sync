import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Paper,
  Chip,
  Autocomplete,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { OrderType, MenuItem as MenuItemType } from '../../types';
import { menuService } from '../../services/menuService';
import { reservationService } from '../../services/reservationService';
import { orderService } from '../../services/orderService';

interface OrderItem {
  menuItemId: number;
  menuItem?: MenuItemType;
  quantity: number;
  price: number;
  modifiers?: string;
  notes?: string;
}

interface OrderEntryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reservationId?: number;
}

export const OrderEntryDialog: React.FC<OrderEntryDialogProps> = ({
  open,
  onClose,
  onSuccess,
  reservationId
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<OrderType>(OrderType.DINE_IN);
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // Menu data
  const [menus, setMenus] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  
  // Load reservation data if provided
  useEffect(() => {
    if (reservationId && open) {
      loadReservation();
    }
  }, [reservationId, open]);
  
  // Load menus on dialog open
  useEffect(() => {
    if (open) {
      loadMenus();
    }
  }, [open]);
  
  // Load menu items when menu is selected
  useEffect(() => {
    if (selectedMenu) {
      loadMenuItems();
    }
  }, [selectedMenu]);
  
  const loadReservation = async () => {
    try {
      const reservation = await reservationService.getReservationById(reservationId!);
      setCustomerName(reservation.customerName);
    } catch (err) {
      console.error('Error loading reservation:', err);
    }
  };
  
  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await menuService.getMenus();
      const activeMenus = data.filter((menu: any) => !menu.isArchived);
      setMenus(activeMenus);
      if (activeMenus.length > 0) {
        setSelectedMenu(activeMenus[0]);
      }
    } catch (err) {
      console.error('Error loading menus:', err);
      setError('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };
  
  const loadMenuItems = async () => {
    if (!selectedMenu) return;
    
    try {
      const menuData = await menuService.getMenuById(selectedMenu.id);
      const items: MenuItemType[] = [];
      
      menuData.sections?.forEach((section: any) => {
        section.items?.forEach((item: any) => {
          if (item.active) {
            items.push(item);
          }
        });
      });
      
      setMenuItems(items);
    } catch (err) {
      console.error('Error loading menu items:', err);
    }
  };
  
  const handleAddItem = (menuItem: MenuItemType) => {
    const existingIndex = orderItems.findIndex(item => item.menuItemId === menuItem.id);
    
    if (existingIndex >= 0) {
      // Increase quantity if item already exists
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      setOrderItems(updated);
    } else {
      // Add new item
      setOrderItems([...orderItems, {
        menuItemId: menuItem.id,
        menuItem,
        quantity: 1,
        price: parseFloat(menuItem.price || '0'),
        modifiers: '',
        notes: ''
      }]);
    }
  };
  
  const handleUpdateQuantity = (index: number, delta: number) => {
    const updated = [...orderItems];
    updated[index].quantity = Math.max(1, updated[index].quantity + delta);
    setOrderItems(updated);
  };
  
  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };
  
  const handleUpdateNotes = (index: number, notes: string) => {
    const updated = [...orderItems];
    updated[index].notes = notes;
    setOrderItems(updated);
  };
  
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    
    if (orderItems.length === 0) {
      setError('Please add at least one item to the order');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      await orderService.createOrder({
        reservationId: reservationId,
        customerName,
        orderType,
        notes,
        orderItems: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          modifiers: item.modifiers ? JSON.parse(item.modifiers) : undefined,
          notes: item.notes
        }))
      });
      
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order');
    } finally {
      setSaving(false);
    }
  };
  
  const handleClose = () => {
    setCustomerName('');
    setOrderType(OrderType.DINE_IN);
    setNotes('');
    setOrderItems([]);
    setError(null);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">New Order</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Customer Information */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              disabled={!!reservationId}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                label="Order Type"
              >
                {Object.values(OrderType).map(type => (
                  <MenuItem key={type} value={type}>
                    {orderService.getOrderTypeDisplay(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Order Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={2}
            />
          </Grid>
          
          {/* Menu Selection */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Add Items
            </Typography>
            
            {loading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Menu</InputLabel>
                  <Select
                    value={selectedMenu?.id || ''}
                    onChange={(e) => {
                      const menu = menus.find(m => m.id === e.target.value);
                      setSelectedMenu(menu);
                    }}
                    label="Menu"
                  >
                    {menus.map(menu => (
                      <MenuItem key={menu.id} value={menu.id}>
                        {menu.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                  <Grid container spacing={1}>
                    {menuItems.map(item => (
                      <Grid item xs={12} sm={6} key={item.id}>
                        <Paper
                          variant="outlined"
                          sx={{ 
                            p: 1.5, 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => handleAddItem(item)}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="subtitle2">{item.name}</Typography>
                              {item.price && (
                                <Typography variant="body2" color="primary">
                                  ${item.price}
                                </Typography>
                              )}
                            </Box>
                            <IconButton size="small" color="primary">
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </>
            )}
          </Grid>
          
          {/* Order Items */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Order Items
            </Typography>
            
            {orderItems.length === 0 ? (
              <Typography color="textSecondary" align="center" py={2}>
                No items added yet
              </Typography>
            ) : (
              <List>
                {orderItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography>{item.menuItem?.name}</Typography>
                            <Typography color="textSecondary">
                              ${item.price.toFixed(2)} each
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box mt={1}>
                            <TextField
                              size="small"
                              placeholder="Special instructions"
                              value={item.notes || ''}
                              onChange={(e) => handleUpdateNotes(index, e.target.value)}
                              fullWidth
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box display="flex" alignItems="center" gap={1}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleUpdateQuantity(index, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ minWidth: 30, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => handleUpdateQuantity(index, 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < orderItems.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
            
            {orderItems.length > 0 && (
              <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="h6" align="right">
                  Total: ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={saving || orderItems.length === 0}
        >
          {saving ? <CircularProgress size={20} /> : 'Create Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 