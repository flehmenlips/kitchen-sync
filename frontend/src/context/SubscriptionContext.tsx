import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { SubscriptionTier } from '../types/modules';
import { billingService, Subscription } from '../services/billingService';
import { useAuth } from './AuthContext';
import { useRestaurant } from './RestaurantContext';

interface SubscriptionContextProps {
  subscription: Subscription | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { currentRestaurant } = useRestaurant();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSubscription = async () => {
    if (!user || !currentRestaurant) {
      setSubscription(null);
      return;
    }

    try {
      setIsLoading(true);
      const data = await billingService.getSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // Create a default trial subscription if none exists
      setSubscription({
        id: 0,
        restaurantId: currentRestaurant.id,
        plan: 'TRIAL',
        status: 'TRIAL',
        enabledModules: ['cookbook', 'agilechef', 'menubuilder', 'tablefarm', 'chefrail', 'website'],
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAt: null,
        canceledAt: null,
        metadata: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch subscription when user or restaurant changes
  useEffect(() => {
    refreshSubscription();
  }, [user?.id, currentRestaurant?.id]);

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      isLoading,
      refreshSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}; 