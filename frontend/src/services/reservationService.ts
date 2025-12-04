import { api } from './api';

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
  orders?: Array<{
    id: number;
    orderNumber: string;
    status: string;
  }>;
}

export interface CreateReservationInput {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  notes?: string;
  specialRequests?: string;
  restaurantId: number;
}

export interface UpdateReservationInput {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  partySize?: number;
  reservationDate?: string;
  reservationTime?: string;
  status?: ReservationStatus;
  notes?: string;
  specialRequests?: string;
}

export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW'
}

export interface ReservationFilters {
  // Date filtering (backward compatible)
  date?: string;
  startDate?: string;
  endDate?: string;
  // Status filtering
  status?: string;
  // Customer search
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  // Party size filtering
  partySizeMin?: number;
  partySizeMax?: number;
  // General search
  search?: string;
  // Restaurant filter
  restaurantId?: number;
  // Pagination
  page?: number;
  limit?: number;
  // Sorting
  sortBy?: 'reservationDate' | 'reservationTime' | 'customerName' | 'partySize' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedReservations {
  data: Reservation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalCovers?: number;
  };
}

export interface ReservationStats {
  totalReservations: number;
  confirmed: number;
  cancelled: number;
  pending: number;
  totalGuests: number;
  averagePartySize: number;
  byStatus: Record<string, number>;
  byDate: Array<{
    date: string;
    count: number;
    totalGuests: number;
  }>;
  peakHours: Array<{
    hour: string;
    count: number;
  }>;
}

const BASE_URL = '/reservations';

export const reservationService = {
  // Get all reservations with enhanced filtering and pagination
  async getReservations(params?: ReservationFilters): Promise<Reservation[] | PaginatedReservations> {
    const response = await api.get(BASE_URL, { params });
    // Check if response is paginated (has pagination property) or plain array (backward compatible)
    if (response.data && typeof response.data === 'object' && 'pagination' in response.data) {
      return response.data as PaginatedReservations;
    }
    return response.data as Reservation[];
  },

  // Get single reservation by ID
  async getReservationById(id: number): Promise<Reservation> {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new reservation
  async createReservation(data: CreateReservationInput): Promise<Reservation> {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // Update reservation
  async updateReservation(id: number, data: UpdateReservationInput): Promise<Reservation> {
    const response = await api.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  // Delete reservation
  async deleteReservation(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  // Cancel reservation (convenience method)
  async cancelReservation(id: number): Promise<Reservation> {
    return this.updateReservation(id, { status: ReservationStatus.CANCELLED });
  },

  // Get availability for a date with time slots
  async getAvailability(
    restaurantId: number,
    date: string,
    partySize?: number
  ): Promise<{
    date: string;
    partySize: number;
    timeSlots: Array<{
      timeSlot: string;
      available: boolean;
      currentBookings: number;
      capacity: number | null;
      remaining: number | null;
      canAccommodate: boolean;
    }>;
    allSlots: Array<{
      timeSlot: string;
      available: boolean;
      currentBookings: number;
      capacity: number | null;
      remaining: number | null;
    }>;
  }> {
    const params: any = { date };
    if (partySize) {
      params.partySize = partySize;
    }
    const response = await api.get(`/reservations/availability/${restaurantId}`, { params });
    return response.data;
  },

  // Get reservation statistics
  async getStats(params?: {
    startDate?: string;
    endDate?: string;
    restaurantId?: number;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ReservationStats> {
    const response = await api.get(`${BASE_URL}/stats`, { params });
    return response.data;
  }
}; 