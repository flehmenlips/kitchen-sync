import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Define available menu fonts
export const menuFonts = {
  'Playfair Display': "'Playfair Display', serif",
  'Roboto': "'Roboto', sans-serif",
  'Lora': "'Lora', serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Oswald': "'Oswald', sans-serif"
};

// Mobile-first responsive breakpoints
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

// Mobile touch target constants
export const MOBILE_CONSTANTS = {
  TOUCH_TARGET_SIZE: 48, // Minimum touch target size (Material Design)
  SMALL_TOUCH_TARGET: 44, // For compact layouts
  MOBILE_APPBAR_HEIGHT: 56, // Standard mobile app bar
  MOBILE_PADDING: 16, // Standard mobile padding
  MOBILE_MARGIN: 8, // Standard mobile margin
};

// Create a theme instance with mobile-first approach
export const theme = createTheme({
  breakpoints,
  
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
  
  // Mobile-optimized typography
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
    
    // Mobile-friendly font sizes
    h1: {
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
      '@media (min-width:960px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
      '@media (min-width:960px)': {
        fontSize: '2.25rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      '@media (min-width:600px)': {
        fontSize: '1.75rem',
      },
      '@media (min-width:960px)': {
        fontSize: '2rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontSize: '1.125rem',
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      '@media (max-width:599px)': {
        fontSize: '0.95rem',
        lineHeight: 1.5,
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      '@media (max-width:599px)': {
        fontSize: '0.85rem',
      },
    },
    button: {
      fontSize: '0.875rem',
      '@media (max-width:599px)': {
        fontSize: '0.9rem',
      },
    },
  },
  
  // Mobile-optimized spacing
  spacing: (factor: number) => `${0.25 * factor}rem`,
  
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
        
        /* Mobile-first responsive utilities */
        .mobile-hidden {
          @media (max-width: 959px) {
            display: none !important;
          }
        }
        
        .desktop-hidden {
          @media (min-width: 960px) {
            display: none !important;
          }
        }
        
        /* Touch-friendly scrollbars */
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        
        *::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.3);
        }
        
        /* Prevent zoom on iOS inputs */
        @media screen and (max-width: 767px) {
          input[type="text"],
          input[type="email"],
          input[type="password"],
          input[type="number"],
          input[type="tel"],
          input[type="url"],
          input[type="search"],
          textarea,
          select {
            font-size: 16px !important;
          }
        }
      `,
    },
    
    // Mobile-optimized Button component
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: MOBILE_CONSTANTS.TOUCH_TARGET_SIZE,
          '@media (max-width: 599px)': {
            minHeight: MOBILE_CONSTANTS.TOUCH_TARGET_SIZE,
            fontSize: '0.9rem',
            padding: '12px 16px',
          },
        },
        sizeSmall: {
          '@media (max-width: 599px)': {
            minHeight: MOBILE_CONSTANTS.SMALL_TOUCH_TARGET,
            fontSize: '0.85rem',
            padding: '8px 12px',
          },
        },
        sizeLarge: {
          '@media (max-width: 599px)': {
            minHeight: 52,
            fontSize: '1rem',
            padding: '16px 24px',
          },
        },
      },
    },
    
    // Mobile-optimized IconButton component
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 599px)': {
            minWidth: MOBILE_CONSTANTS.TOUCH_TARGET_SIZE,
            minHeight: MOBILE_CONSTANTS.TOUCH_TARGET_SIZE,
            padding: '12px',
          },
        },
        sizeSmall: {
          '@media (max-width: 599px)': {
            minWidth: MOBILE_CONSTANTS.SMALL_TOUCH_TARGET,
            minHeight: MOBILE_CONSTANTS.SMALL_TOUCH_TARGET,
            padding: '10px',
          },
        },
        sizeLarge: {
          '@media (max-width: 599px)': {
            minWidth: 52,
            minHeight: 52,
            padding: '14px',
          },
        },
      },
    },
    
    // Mobile-optimized ListItemButton
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '@media (max-width: 599px)': {
            minHeight: MOBILE_CONSTANTS.TOUCH_TARGET_SIZE,
            paddingTop: 12,
            paddingBottom: 12,
          },
        },
      },
    },
    
    // Mobile-optimized Chip component
    MuiChip: {
      styleOverrides: {
        root: {
          '@media (max-width: 599px)': {
            height: 36,
            fontSize: '0.85rem',
          },
        },
        sizeSmall: {
          '@media (max-width: 599px)': {
            height: 28,
            fontSize: '0.8rem',
          },
        },
      },
    },
    
    // Mobile-optimized TextField
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            '@media (max-width: 599px)': {
              fontSize: '16px', // Prevent zoom on iOS
              padding: '14px 12px',
            },
          },
        },
      },
    },
    
    // Mobile-optimized TableCell for responsive tables
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width: 599px)': {
            padding: '8px',
            fontSize: '0.85rem',
          },
        },
      },
    },
    
    // Mobile-optimized AppBar
    MuiAppBar: {
      styleOverrides: {
        root: {
          '@media (max-width: 599px)': {
            height: MOBILE_CONSTANTS.MOBILE_APPBAR_HEIGHT,
          },
        },
      },
    },
    
    // Mobile-optimized Toolbar
    MuiToolbar: {
      styleOverrides: {
        root: {
          '@media (max-width: 599px)': {
            minHeight: `${MOBILE_CONSTANTS.MOBILE_APPBAR_HEIGHT}px !important`,
            paddingLeft: 8,
            paddingRight: 8,
          },
        },
      },
    },
    
    // Mobile-optimized Dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width: 599px)': {
            margin: 8,
            width: 'calc(100% - 16px)',
            maxHeight: 'calc(100% - 16px)',
          },
        },
      },
    },
    
    // Mobile-optimized Card
    MuiCard: {
      styleOverrides: {
        root: {
          '@media (max-width: 599px)': {
            borderRadius: 12,
          },
        },
      },
    },
  },
}); 