import { api } from './api';
import type { Order, OrderItem, OrderStatus, OrderType, OrderItemStatus } from '../types';

export interface Order {
  id: number;
  orderNumber: string;
  reservationId?: number;
  restaurantId: number;
  customerName?: string;
  status: OrderStatus;
  orderType: OrderType;
  notes?: string;
  totalAmount?: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  reservation?: {
    id: number;
    customerName: string;
    partySize: number;
  };
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  price: string;
  modifiers?: any;
  status: OrderItemStatus;
  notes?: string;
  menuItem: {
    id: number;
    name: string;
    description?: string;
    price?: string;
    recipe?: {
      id: number;
      name: string;
      prepTimeMinutes?: number;
      cookTimeMinutes?: number;
    };
  };
}

export interface CreateOrderInput {
  reservationId?: number;
  customerName?: string;
  orderType?: OrderType;
  notes?: string;
  orderItems: CreateOrderItemInput[];
}

export interface CreateOrderItemInput {
  menuItemId: number;
  quantity: number;
  price: string;
  modifiers?: any;
  notes?: string;
}

interface CreateOrderData {
  reservationId?: number;
  customerName?: string;
  orderType?: OrderType;
  notes?: string;
  orderItems: {
    menuItemId: number;
    quantity: number;
    price: number;
    modifiers?: any;
    notes?: string;
  }[];
}

interface OrderFilters {
  status?: OrderStatus | 'all';
  date?: string;
  orderType?: OrderType | 'all';
}

const BASE_URL = '/orders';

export const orderService = {
  // Get all orders with optional filters
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.orderType) params.append('orderType', filters.orderType);
    
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Get single order by ID
  async getOrderById(id: number): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Create a new order
  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Update order item status
  async updateOrderItemStatus(orderId: number, itemId: number, status: OrderItemStatus): Promise<OrderItem> {
    const response = await api.put(`/orders/${orderId}/items/${itemId}/status`, { status });
    return response.data;
  },

  // Delete an order (only if not active)
  async deleteOrder(id: number): Promise<void> {
    await api.delete(`/orders/${id}`);
  },

  // Helper to calculate order total
  calculateOrderTotal(items: OrderItem[]): number {
    return items.reduce((total, item) => total + (item.quantity * Number(item.price)), 0);
  },

  // Helper to format order number for display
  formatOrderNumber(orderNumber: string): string {
    return `#${orderNumber}`;
  },

  // Helper to get status color
  getStatusColor(status: OrderStatus): string {
    const colors: Record<OrderStatus, string> = {
      NEW: '#2196f3',        // Blue
      IN_PROGRESS: '#ff9800', // Orange
      READY: '#4caf50',      // Green
      COMPLETED: '#9e9e9e',  // Grey
      CANCELLED: '#f44336'   // Red
    };
    return colors[status] || '#757575';
  },

  // Helper to get order type display text
  getOrderTypeDisplay(type: OrderType): string {
    const displays: Record<OrderType, string> = {
      DINE_IN: 'Dine In',
      TAKEOUT: 'Takeout',
      DELIVERY: 'Delivery'
    };
    return displays[type] || type;
  }
}; 