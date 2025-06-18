import { useTheme, useMediaQuery } from '@mui/material';

// Mobile touch target constants following Material Design guidelines
export const MOBILE_CONSTANTS = {
  TOUCH_TARGET_SIZE: 48, // Minimum touch target size (Material Design)
  SMALL_TOUCH_TARGET: 44, // For compact layouts
  MOBILE_APPBAR_HEIGHT: 56, // Standard mobile app bar
  MOBILE_PADDING: 16, // Standard mobile padding
  MOBILE_MARGIN: 8, // Standard mobile margin
  MOBILE_BORDER_RADIUS: 12, // Mobile-friendly border radius
};

// Custom hook for mobile-responsive design
export const useMobileResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeMobile = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isSmallMobile,
    isLargeMobile,
    isTablet,
    isDesktop,
    // Helper functions
    getResponsivePadding: () => isMobile ? 2 : 3,
    getResponsiveMargin: () => isMobile ? 1 : 2,
    getTouchTargetSize: () => isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 40,
    getAppBarHeight: () => isMobile ? MOBILE_CONSTANTS.MOBILE_APPBAR_HEIGHT : 64,
    getBorderRadius: () => isMobile ? MOBILE_CONSTANTS.MOBILE_BORDER_RADIUS : 8,
    getFontSize: (desktop: string, mobile: string) => isMobile ? mobile : desktop,
  };
};

// Mobile-optimized spacing helpers
export const getMobileSpacing = (isMobile: boolean) => ({
  padding: isMobile ? MOBILE_CONSTANTS.MOBILE_PADDING : 24,
  margin: isMobile ? MOBILE_CONSTANTS.MOBILE_MARGIN : 16,
  borderRadius: isMobile ? MOBILE_CONSTANTS.MOBILE_BORDER_RADIUS : 8,
});

// Touch-friendly component props generator
export const getTouchFriendlyProps = (isMobile: boolean) => ({
  minHeight: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
  minWidth: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
  padding: isMobile ? '12px' : '8px',
});

// Mobile-optimized breakpoint helpers
export const mobileBreakpoints = {
  up: (breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => `@media (min-width: ${getBreakpointValue(breakpoint)}px)`,
  down: (breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => `@media (max-width: ${getBreakpointValue(breakpoint) - 1}px)`,
  between: (start: 'xs' | 'sm' | 'md' | 'lg' | 'xl', end: 'xs' | 'sm' | 'md' | 'lg' | 'xl') => 
    `@media (min-width: ${getBreakpointValue(start)}px) and (max-width: ${getBreakpointValue(end) - 1}px)`,
};

function getBreakpointValue(breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): number {
  const values = {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  };
  return values[breakpoint];
}

// Mobile-specific SX props helpers
export const mobileResponsiveStyles = {
  // Container styles
  container: (isMobile: boolean) => ({
    width: '100%',
    px: { xs: 2, sm: 3, md: 4 },
    py: isMobile ? 2 : 3,
  }),
  
  // Button styles
  button: (isMobile: boolean) => ({
    minHeight: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
    fontSize: isMobile ? '0.9rem' : '0.875rem',
    px: isMobile ? 2 : 1.5,
    py: isMobile ? 1.5 : 1,
  }),
  
  // Icon button styles
  iconButton: (isMobile: boolean) => ({
    minWidth: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
    minHeight: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
    p: isMobile ? 1.5 : 1,
  }),
  
  // Card styles
  card: (isMobile: boolean) => ({
    borderRadius: isMobile ? MOBILE_CONSTANTS.MOBILE_BORDER_RADIUS : 2,
    m: isMobile ? 1 : 2,
    p: isMobile ? 2 : 3,
  }),
  
  // Typography styles
  typography: {
    h1: { fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } },
    h2: { fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } },
    h3: { fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } },
    h4: { fontSize: { xs: '1.25rem', sm: '1.5rem' } },
    h5: { fontSize: { xs: '1.125rem', sm: '1.25rem' } },
    h6: { fontSize: { xs: '1rem', sm: '1.125rem' } },
    body1: { fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: { xs: 1.5, sm: 1.6 } },
    body2: { fontSize: { xs: '0.85rem', sm: '0.875rem' } },
  },
  
  // Form styles
  textField: (isMobile: boolean) => ({
    '& .MuiInputBase-input': {
      fontSize: isMobile ? '16px' : '14px', // Prevent zoom on iOS
      py: isMobile ? 1.75 : 1.5,
    },
  }),
  
  // Table styles for mobile
  table: {
    root: {
      '& .MuiTableCell-root': {
        px: { xs: 1, sm: 2 },
        py: { xs: 1, sm: 1.5 },
        fontSize: { xs: '0.85rem', sm: '0.875rem' },
      },
    },
  },
  
  // Navigation styles
  navigation: (isMobile: boolean) => ({
    minHeight: isMobile ? MOBILE_CONSTANTS.MOBILE_APPBAR_HEIGHT : 64,
    px: isMobile ? 1 : 3,
    '& .MuiListItemButton-root': {
      minHeight: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
      borderRadius: isMobile ? 2 : 0,
    },
  }),
}; 