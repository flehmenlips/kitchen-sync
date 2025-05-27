import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import apiService from '../services/apiService';
import { useAuth } from './AuthContext';

interface Restaurant {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

interface RestaurantContextProps {
  currentRestaurant: Restaurant | null;
  restaurants: Restaurant[];
  isLoading: boolean;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  refreshRestaurants: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextProps | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

interface RestaurantProviderProps {
  children: ReactNode;
}

const CURRENT_RESTAURANT_KEY = 'kitchenSyncCurrentRestaurant';

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentRestaurant, setCurrentRestaurantState] = useState<Restaurant | null>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_RESTAURANT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const setCurrentRestaurant = (restaurant: Restaurant | null) => {
    setCurrentRestaurantState(restaurant);
    if (restaurant) {
      localStorage.setItem(CURRENT_RESTAURANT_KEY, JSON.stringify(restaurant));
      // Set restaurant context in API service
      apiService.defaults.headers.common['X-Restaurant-Id'] = restaurant.id.toString();
    } else {
      localStorage.removeItem(CURRENT_RESTAURANT_KEY);
      delete apiService.defaults.headers.common['X-Restaurant-Id'];
    }
  };

  const refreshRestaurants = async () => {
    if (!user) {
      setRestaurants([]);
      setCurrentRestaurant(null);
      return;
    }

    try {
      setIsLoading(true);
      // Get user's restaurant assignments
      const response = await apiService.get('/user/restaurants');
      const userRestaurants = response.data.restaurants || [];
      
      setRestaurants(userRestaurants);

      // If user only has one restaurant, auto-select it
      if (userRestaurants.length === 1 && !currentRestaurant) {
        setCurrentRestaurant(userRestaurants[0]);
      }
      
      // Validate current restaurant is still accessible
      if (currentRestaurant && !userRestaurants.find((r: Restaurant) => r.id === currentRestaurant.id)) {
        setCurrentRestaurant(null);
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch restaurants when user changes
  useEffect(() => {
    refreshRestaurants();
  }, [user?.id]);

  // Set initial restaurant context in API if we have one stored
  useEffect(() => {
    if (currentRestaurant) {
      apiService.defaults.headers.common['X-Restaurant-Id'] = currentRestaurant.id.toString();
    }
  }, []);

  return (
    <RestaurantContext.Provider value={{
      currentRestaurant,
      restaurants,
      isLoading,
      setCurrentRestaurant,
      refreshRestaurants
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}; 