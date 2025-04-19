import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { UserProfile, getProfile, login as apiLogin, logout as apiLogout, register as apiRegister, UserCredentials } from '../services/apiService';
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Still true initially

  // Check login status on initial load
  useEffect(() => {
    const checkUserStatus = async () => {
      console.log('[AuthContext] Checking user status...');
      try {
        const profile = await getProfile(); 
        console.log('[AuthContext] Profile fetched:', profile);
        setUser(profile);
      } catch (error) {
        console.log('[AuthContext] checkUserStatus error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
         console.log('[AuthContext] checkUserStatus finished, isLoading: false');
      }
    };
    checkUserStatus();
  }, []);

  const login = useCallback(async (credentials: UserCredentials) => {
    console.log('[AuthContext] login called');
    // setIsLoading(true); // Loading state is handled by the component calling login
    try {
      const loggedInUser = await apiLogin(credentials);
      setUser(loggedInUser);
    } catch (error) { 
      setUser(null); 
      throw error; 
    } finally {
       // setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('[AuthContext] logout called');
    // Set user state to null immediately for faster UI update
    setUser(null); 
    console.log('[AuthContext] User state set to null');
    
    try {
      // Still call the backend to invalidate the cookie/session server-side
      await apiLogout();
      console.log('Logout API call successful');
    } catch (error) {
        console.error("Backend logout failed:", error);
    }
    // No need to set loading state for logout
  }, []); 

  const register = useCallback(async (userData: UserCredentials) => {
    console.log('[AuthContext] register called');
    // setIsLoading(true); // Component handles loading
    try {
      const newUser = await apiRegister(userData);
      setUser(newUser); 
    } catch (error) {
       setUser(null); 
      throw error; 
    } finally {
       // setIsLoading(false);
    }
  }, []);

  // Log context value changes
  useEffect(() => {
     console.log("[AuthContext] Provider value changed - User:", user, "isLoading:", isLoading);
  }, [user, isLoading]);

  // Display a loading indicator ONLY while checking initial auth status
  // This prevents rendering the app before we know if user is logged in or not
  if (isLoading) { 
     return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}; 