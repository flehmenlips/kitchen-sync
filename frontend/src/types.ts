export interface Recipe {
    id: number;
    name: string;
    description: string | null;
    ingredients: RecipeIngredient[];
    instructions: string[];
    notes: string | null;
    yieldQuantity: number | null;
    yieldUnit: string | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    sections?: RecipeSection[];
    photoUrl?: string | null;
    menuTitle?: string | null;
    menuDescription?: string | null;
}

// Order related types
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

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  price: number | string;
  modifiers?: any;
  status: OrderItemStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: number;
  orderNumber: string;
  reservationId?: number;
  restaurantId: number;
  customerName?: string;
  status: OrderStatus;
  orderType: OrderType;
  notes?: string;
  totalAmount?: number | string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  orderItems: OrderItem[];
  reservation?: Reservation;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price?: string;
  position: number;
  active: boolean;
  recipeId?: number;
  sectionId: number;
  recipe?: Recipe;
}

export interface Reservation {
  id: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerId?: number;
  restaurantId: number;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: ReservationStatus;
  notes?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

// Placeholder for other types that might be needed
export interface RecipeIngredient {
  // Define based on your actual schema
  id?: number;
  name: string;
  quantity: number;
  unit: string;
}

export interface RecipeSection {
  // Define based on your actual schema
  id?: number;
  title: string;
  content: string;
} 