import { api } from './api';

export interface TimeSlotCapacity {
  id: number;
  restaurantId: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  timeSlot: string; // "18:00"
  maxCovers: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlotCapacityData {
  restaurantId: number;
  dayOfWeek: number;
  timeSlot: string;
  maxCovers: number;
  isActive?: boolean;
}

export interface AvailabilityResult {
  date: string;
  timeSlot: string;
  maxCapacity: number | null;
  currentBookings: number;
  remaining: number | null;
  available: boolean;
}

export interface TimeSlotAvailability {
  timeSlot: string;
  available: boolean;
  currentBookings: number;
  capacity: number | null;
  remaining: number | null;
  canAccommodate: boolean;
}

export interface AvailabilityResponse {
  date: string;
  partySize: number;
  timeSlots: TimeSlotAvailability[];
  allSlots: Array<{
    timeSlot: string;
    available: boolean;
    currentBookings: number;
    capacity: number | null;
    remaining: number | null;
  }>;
}

const BASE_URL = '/time-slot-capacity';

export const timeSlotCapacityService = {
  // Get time slot capacities for a restaurant
  async getTimeSlotCapacities(
    restaurantId: number,
    params?: { dayOfWeek?: number; timeSlot?: string }
  ): Promise<TimeSlotCapacity[]> {
    const response = await api.get(`${BASE_URL}/${restaurantId}`, { params });
    return response.data;
  },

  // Get availability for a specific date and time slot
  async getAvailability(
    restaurantId: number,
    date: string,
    timeSlot: string
  ): Promise<AvailabilityResult> {
    const response = await api.get(`${BASE_URL}/${restaurantId}/availability`, {
      params: { date, timeSlot }
    });
    return response.data;
  },

  // Create or update a single time slot capacity
  async upsertTimeSlotCapacity(
    data: TimeSlotCapacityData
  ): Promise<TimeSlotCapacity> {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  // Bulk create/update time slot capacities
  async bulkUpsertTimeSlotCapacities(
    restaurantId: number,
    capacities: Array<{
      dayOfWeek: number;
      timeSlot: string;
      maxCovers: number;
      isActive?: boolean;
    }>
  ): Promise<{ message: string; capacities: TimeSlotCapacity[] }> {
    const response = await api.post(`${BASE_URL}/bulk`, {
      restaurantId,
      capacities
    });
    return response.data;
  },

  // Delete a time slot capacity
  async deleteTimeSlotCapacity(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  }
};

