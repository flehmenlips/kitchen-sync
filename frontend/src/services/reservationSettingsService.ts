import { api } from './api';

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface ReservationSettings {
  id: number;
  restaurantId: number;
  operatingHours: OperatingHours;
  minPartySize: number;
  maxPartySize: number;
  defaultDuration: number;
  advanceBookingDays: number;
  minAdvanceHours: number;
  timeSlotInterval: number;
  seatingIntervals?: string[];
  maxCoversPerSlot?: number;
  allowOverbooking: boolean;
  overbookingPercentage: number;
  cancellationPolicy?: string;
  cancellationHours: number;
  requireCreditCard: boolean;
  requireDeposit: boolean;
  depositAmount?: number;
  autoConfirm: boolean;
  sendConfirmation: boolean;
  sendReminder: boolean;
  reminderHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationSettingsData {
  operatingHours?: OperatingHours;
  minPartySize?: number;
  maxPartySize?: number;
  defaultDuration?: number;
  advanceBookingDays?: number;
  minAdvanceHours?: number;
  timeSlotInterval?: number;
  seatingIntervals?: string[];
  maxCoversPerSlot?: number;
  allowOverbooking?: boolean;
  overbookingPercentage?: number;
  cancellationPolicy?: string;
  cancellationHours?: number;
  requireCreditCard?: boolean;
  requireDeposit?: boolean;
  depositAmount?: number;
  autoConfirm?: boolean;
  sendConfirmation?: boolean;
  sendReminder?: boolean;
  reminderHours?: number;
}

const BASE_URL = '/api/reservation-settings';

export const reservationSettingsService = {
  // Get reservation settings for a restaurant
  async getReservationSettings(restaurantId: number): Promise<ReservationSettings> {
    const response = await api.get(`${BASE_URL}/${restaurantId}`);
    return response.data;
  },

  // Create or update reservation settings
  async upsertReservationSettings(
    restaurantId: number,
    data: ReservationSettingsData
  ): Promise<ReservationSettings> {
    const response = await api.post(BASE_URL, {
      restaurantId,
      ...data
    });
    return response.data;
  }
};

