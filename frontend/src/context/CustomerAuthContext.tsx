import React, { createContext, useContext, useState, useEffect } from 'react';
import { customerAuthService, AuthResponse } from '../services/customerAuthService';

interface CustomerAuthContextType {
  user: AuthResponse['user'] | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};

interface CustomerAuthProviderProps {
  children: React.ReactNode;
}

export const CustomerAuthProvider: React.FC<CustomerAuthProviderProps> = ({ children }) => {
  // Initialize state from storage to avoid losing auth on route changes
  const [user, setUser] = useState<AuthResponse['user'] | null>(() => {
    const currentUser = customerAuthService.getCurrentUser();
    return currentUser;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth on mount
    customerAuthService.initializeAuth();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = customerAuthService.getCurrentUser();
      
      if (currentUser) {
        // Check if we should refresh the token
        const refreshToken = customerAuthService.getRefreshToken();
        if (refreshToken) {
          try {
            const response = await customerAuthService.refreshToken();
            if (response) {
              setUser(response.user);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Still set the user even if refresh fails - they might still have a valid access token
            setUser(currentUser);
          }
        } else {
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await customerAuthService.login({ email, password, rememberMe });
    setUser(response.user);
  };

  const logout = async () => {
    await customerAuthService.logout();
    setUser(null);
  };

  const refreshAuth = () => {
    const currentUser = customerAuthService.getCurrentUser();
    setUser(currentUser);
  };

  const value: CustomerAuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshAuth
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}; 