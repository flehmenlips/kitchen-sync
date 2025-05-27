import { platformApi } from './platformAuthService';

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Platform fields
  ownerEmail?: string;
  ownerName?: string;
  businessPhone?: string;
  businessAddress?: string;
  taxId?: string;
  onboardingStatus: string;
  verifiedAt?: string;
  suspendedAt?: string;
  suspendedReason?: string;
  
  // Relations
  subscription?: Subscription;
  _count?: {
    staff: number;
    reservations: number;
    orders: number;
    customers: number;
  };
}

export interface Subscription {
  id: number;
  plan: string;
  status: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  seats: number;
}

export interface RestaurantNote {
  id: number;
  note: string;
  isInternal: boolean;
  createdAt: string;
  admin: {
    id: number;
    name: string;
    email: string;
  };
}

export interface RestaurantListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  plan?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RestaurantListResponse {
  restaurants: Restaurant[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RestaurantAnalytics {
  reservationStats: Array<{
    status: string;
    _count: number;
  }>;
  orderStats: {
    _sum: { totalAmount: number | null };
    _count: number;
    _avg: { totalAmount: number | null };
  };
  activeStaff: number;
  growthMetrics: Array<{
    month: string;
    reservations: string;
  }>;
}

export interface PlatformAnalytics {
  restaurantsByStatus: Array<{
    onboardingStatus: string;
    _count: number;
  }>;
  subscriptionsByPlan: Array<{
    plan: string;
    _count: number;
  }>;
  mrr: number;
  recentSignups: number;
  recentActivity: Array<{
    id: number;
    action: string;
    entityType?: string;
    entityId?: number;
    createdAt: string;
    admin: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

const restaurantService = {
  // Get list of restaurants
  async getRestaurants(params?: RestaurantListParams): Promise<RestaurantListResponse> {
    const response = await platformApi.get<RestaurantListResponse>('/restaurants', { params });
    return response.data;
  },

  // Get single restaurant
  async getRestaurant(id: number) {
    const response = await platformApi.get(`/restaurants/${id}`);
    return response.data;
  },

  // Update restaurant
  async updateRestaurant(id: number, data: Partial<Restaurant>) {
    const response = await platformApi.put(`/restaurants/${id}`, data);
    return response.data;
  },

  // Verify restaurant
  async verifyRestaurant(id: number, notes?: string) {
    const response = await platformApi.post(`/restaurants/${id}/verify`, { notes });
    return response.data;
  },

  // Suspend restaurant
  async suspendRestaurant(id: number, reason: string) {
    const response = await platformApi.post(`/restaurants/${id}/suspend`, { reason });
    return response.data;
  },

  // Unsuspend restaurant
  async unsuspendRestaurant(id: number, notes?: string) {
    const response = await platformApi.post(`/restaurants/${id}/unsuspend`, { notes });
    return response.data;
  },

  // Add note to restaurant
  async addRestaurantNote(id: number, note: string, isInternal = true) {
    const response = await platformApi.post(`/restaurants/${id}/notes`, { note, isInternal });
    return response.data;
  },

  // Get restaurant analytics
  async getRestaurantAnalytics(id: number, startDate?: string, endDate?: string): Promise<RestaurantAnalytics> {
    const response = await platformApi.get<RestaurantAnalytics>(`/restaurants/${id}/analytics`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get platform analytics
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const response = await platformApi.get<PlatformAnalytics>('/analytics');
    return response.data;
  },
};

export default restaurantService; 