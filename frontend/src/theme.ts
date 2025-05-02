import { createTheme } from '@mui/material/styles';

// Define available menu fonts
export const menuFonts = {
  'Playfair Display': "'Playfair Display', serif",
  'Roboto': "'Roboto', sans-serif",
  'Lora': "'Lora', serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Oswald': "'Oswald', sans-serif"
};

// Create a theme instance
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#fff',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    background: {
      default: '#f5f5f5',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        /* Menu Font Import */
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;500;700&family=Oswald:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@300;400;500;700&display=swap');
        
        /* Menu Font Classes */
        .font-playfair {
          font-family: 'Playfair Display', serif !important;
        }
        
        .font-roboto {
          font-family: 'Roboto', sans-serif !important;
        }
        
        .font-lora {
          font-family: 'Lora', serif !important;
        }
        
        .font-montserrat {
          font-family: 'Montserrat', sans-serif !important;
        }
        
        .font-oswald {
          font-family: 'Oswald', sans-serif !important;
        }
      `,
    },
  },
}); 