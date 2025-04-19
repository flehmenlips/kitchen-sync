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
  const [isLoading, setIsLoading] = useState(true); // Start loading initially to check auth status

  // Check login status on initial load
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Cookie should be sent automatically if it exists due to httpOnly
        const profile = await getProfile(); 
        setUser(profile);
      } catch (error) {
        // Expected if user is not logged in (API returns 401)
        console.log('No active session found or failed to fetch profile.');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUserStatus();
  }, []);

  const login = useCallback(async (credentials: UserCredentials) => {
     setIsLoading(true);
    try {
      const loggedInUser = await apiLogin(credentials);
      setUser(loggedInUser);
    } catch (error) { 
      setUser(null); // Ensure user is null on failed login
      throw error; // Re-throw for the form to handle
    } finally {
        setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // Don't show loading indicator for logout
    // setIsLoading(true);
    
    // Set user state to null immediately for faster UI update
    setUser(null); 
    
    try {
      // Still call the backend to invalidate the cookie/session server-side
      await apiLogout();
      console.log('Logout API call successful');
    } catch (error) {
        // Log the error but don't necessarily throw or block UI update
        console.error("Backend logout failed (user state already cleared):", error);
        // Optionally show a Snackbar error here if needed
        // showSnackbar('Logout failed on server, please clear cookies if issues persist.', 'warning');
    } finally {
        // setIsLoading(false);
    }
  }, []); // Add showSnackbar if using it in catch

  const register = useCallback(async (userData: UserCredentials) => {
      setIsLoading(true);
    try {
      const newUser = await apiRegister(userData);
      setUser(newUser); // Automatically log in user after registration
    } catch (error) {
       setUser(null); 
      throw error; // Re-throw for the form to handle
    } finally {
        setIsLoading(false);
    }
  }, []);

  // Display a loading indicator ONLY while checking initial auth status
  if (isLoading) { // Simplified loading check
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