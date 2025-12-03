import apiService from './apiService';

export interface RestaurantInfo {
  id: number;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  cuisine?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  openingHours?: any;
  ownerName?: string;
  ownerEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  website_builder_enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  modules?: {
    reservations: {
      enabled: boolean;
      restaurantId: number;
    };
    websiteBuilder: {
      enabled: boolean;
      restaurantId: number;
    };
  };
}

class RestaurantInfoService {
  async getRestaurantInfo(): Promise<RestaurantInfo> {
    const response = await apiService.get<RestaurantInfo>('/restaurant/info');
    return response.data;
  }

  async updateRestaurantInfo(info: Partial<RestaurantInfo>): Promise<RestaurantInfo> {
    const response = await apiService.put<RestaurantInfo>('/restaurant/info', info);
    return response.data;
  }
}

export const restaurantInfoService = new RestaurantInfoService();

