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

const BASE_URL = '/reservations';

export const reservationService = {
  // Get all reservations with optional filters
  async getReservations(params?: { date?: string; status?: string }): Promise<Reservation[]> {
    const response = await api.get(BASE_URL, { params });
    return response.data;
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
  }
}; 