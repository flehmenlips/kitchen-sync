import { customerApi } from './customerApi';

export interface ReservationFormData {
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  notes?: string;
  specialRequests?: string;
  customerPhone?: string;
}

export interface Reservation {
  id: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerId?: number;
  restaurantId: number;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  restaurant?: {
    id: number;
    name: string;
    phone?: string;
    address?: string;
  };
}

export const customerReservationService = {
  // Get all reservations for the current customer
  async getMyReservations(): Promise<Reservation[]> {
    const response = await customerApi.get('/customer/reservations');
    return response.data;
  },

  // Get a specific reservation
  async getReservation(id: number): Promise<Reservation> {
    const response = await customerApi.get(`/customer/reservations/${id}`);
    return response.data;
  },

  // Create a new reservation
  async createReservation(data: ReservationFormData): Promise<{ message: string; reservation: Reservation }> {
    const response = await customerApi.post('/customer/reservations', data);
    return response.data;
  },

  // Update a reservation
  async updateReservation(id: number, data: Partial<ReservationFormData>): Promise<{ message: string; reservation: Reservation }> {
    const response = await customerApi.put(`/customer/reservations/${id}`, data);
    return response.data;
  },

  // Cancel a reservation
  async cancelReservation(id: number): Promise<{ message: string; reservation: Reservation }> {
    const response = await customerApi.put(`/customer/reservations/${id}/cancel`);
    return response.data;
  }
}; 