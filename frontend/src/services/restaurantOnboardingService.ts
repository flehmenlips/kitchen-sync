import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://kitchensync.restaurant/api'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');

interface RestaurantRegistrationData {
  // Owner info
  ownerName: string;
  email: string;
  password: string;
  
  // Restaurant info
  restaurantName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Business details
  cuisineType: string;
  seatingCapacity?: number;
  operatingHours?: string;
}

interface RestaurantRegistrationResponse {
  message: string;
  requiresVerification?: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    token: string;
  };
  restaurant?: {
    id: number;
    name: string;
    slug: string;
  };
}

// Create a separate axios instance for onboarding (no auth needed)
const onboardingApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerRestaurant = async (data: RestaurantRegistrationData): Promise<RestaurantRegistrationResponse> => {
  try {
    const response = await onboardingApi.post('/restaurant-onboarding/register', data);
    return response.data;
  } catch (error) {
    console.error('Restaurant registration error:', error);
    throw error;
  }
};

export const checkEmailAvailability = async (email: string): Promise<{ available: boolean; message: string }> => {
  try {
    const response = await onboardingApi.get('/restaurant-onboarding/check-email', {
      params: { email }
    });
    return response.data;
  } catch (error) {
    console.error('Email check error:', error);
    throw error;
  }
}; 