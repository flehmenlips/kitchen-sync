import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile, AuthResponse, UserCredentials } from '../types/user';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/apiService';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface AuthContextProps {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: UserCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: UserCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Key for localStorage
const USER_INFO_KEY = 'kitchenSyncUserInfo';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize user state from localStorage
  const [user, setUser] = useState<UserProfile | null>(() => {
      try {
        const storedUserInfo = localStorage.getItem(USER_INFO_KEY);
        if (storedUserInfo) {
          const parsed = JSON.parse(storedUserInfo);
          // Check if this is a customer user - they shouldn't be in the staff auth context
          if (parsed.user?.isCustomer) {
            localStorage.removeItem(USER_INFO_KEY);
            return null;
          }
          return parsed.user;
        }
        return null;
      } catch (error) { 
        console.error("Error reading user info from localStorage:", error);
        return null;
       }
  });
  const [isLoading, setIsLoading] = useState(false); // Only true initially if needed, handled by component now

  // No initial profile fetch needed if we store user info
  /* useEffect(() => { ... checkUserStatus ... }, []); */

  const login = useCallback(async (credentials: UserCredentials) => {
    try {
      const response: AuthResponse = await apiLogin(credentials);
      // Store the complete user profile
      const userInfo = {
        user: {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
          company: response.company,
          position: response.position,
          phone: response.phone,
          address: response.address,
          bio: response.bio,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        },
        token: response.token
      };
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      setUser(userInfo.user);
    } catch (error) {
      localStorage.removeItem(USER_INFO_KEY);
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null); 
    localStorage.removeItem(USER_INFO_KEY); // Remove stored info
    try {
      await apiLogout(); // Call backend logout (optional, but good practice)
    } catch (error) {
        console.error("Backend logout failed:", error);
    }
  }, []); 

  const register = useCallback(async (userData: UserCredentials) => {
    try {
      const response: AuthResponse = await apiRegister(userData);
      // Store the complete user profile
      const userInfo = {
        user: {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
          company: response.company,
          position: response.position,
          phone: response.phone,
          address: response.address,
          bio: response.bio,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt
        },
        token: response.token
      };
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      setUser(userInfo.user);
    } catch (error) {
      localStorage.removeItem(USER_INFO_KEY);
      setUser(null);
      throw error;
    }
  }, []);

  // No initial loading indicator needed here anymore
  // if (isLoading) { /* ... */ }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}; 