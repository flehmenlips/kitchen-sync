import { api } from './api';

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

export enum OrderStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEOUT = 'TAKEOUT',
  DELIVERY = 'DELIVERY'
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED'
}

const BASE_URL = '/orders';

export const orderService = {
  // Get all orders with optional filters
  async getOrders(params?: { status?: string; date?: string; orderType?: string }): Promise<Order[]> {
    const response = await api.get(BASE_URL, { params });
    return response.data;
  },

  // Get single order by ID
  async getOrderById(id: number): Promise<Order> {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new order
  async createOrder(data: CreateOrderInput): Promise<Order> {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // Update order status
  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await api.put(`${BASE_URL}/${id}/status`, { status });
    return response.data;
  },

  // Update order item status
  async updateOrderItemStatus(orderId: number, itemId: number, status: OrderItemStatus): Promise<OrderItem> {
    const response = await api.put(`${BASE_URL}/${orderId}/items/${itemId}/status`, { status });
    return response.data;
  },

  // Delete order (only if not active)
  async deleteOrder(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  }
}; 