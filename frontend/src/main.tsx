import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import MUI Theme components
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from './context/SnackbarContext';
import { AuthProvider } from './context/AuthContext';

// Define a basic theme (can be customized later)
const theme = createTheme({
  palette: {
    // mode: 'dark', // Uncomment for dark mode
    primary: {
      main: '#3f51b5', // Example primary color
    },
    secondary: {
      main: '#f50057', // Example secondary color
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalize CSS and apply baseline styles */} 
      <SnackbarProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  // </React.StrictMode>,
)
