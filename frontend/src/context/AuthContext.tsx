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
        return storedUserInfo ? JSON.parse(storedUserInfo).user : null;
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
      console.log("AuthContext: Login attempt with", credentials.email);
      const response: AuthResponse = await apiLogin(credentials);
      console.log("AuthContext: Login response:", response);
      
      // Generate a temporary debug token if missing from response
      let token = response.token;
      if (!token) {
        console.error("AuthContext: No token in response, using DEVELOPMENT debug token");
        // Only use this in development for testing!
        if (process.env.NODE_ENV !== 'production') {
          token = `debug_token_${Date.now()}_${response.id}`;
          console.log("Created debug token:", token);
        } else {
          throw new Error("No authentication token received from server");
        }
      }
      
      // Store the complete user profile and token
      const userInfo = {
        user: {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role || 'USER', // Default to USER if not provided
          company: response.company,
          position: response.position,
          phone: response.phone,
          address: response.address,
          bio: response.bio,
          createdAt: response.createdAt || new Date().toISOString(),
          updatedAt: response.updatedAt || new Date().toISOString()
        },
        token: token
      };
      
      // Log what we're saving to localStorage
      console.log("AuthContext: Saving to localStorage:", JSON.stringify({
        ...userInfo,
        token: userInfo.token ? "[TOKEN EXISTS]" : "[TOKEN MISSING]"
      }));
      
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
      setUser(userInfo.user);
      
      // Verify storage worked
      const storedData = localStorage.getItem(USER_INFO_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        console.log("AuthContext: Verification - token exists in storage:", !!parsed.token);
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
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