import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Skeleton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  MenuBook as MenuBookIcon,
  EventSeat as EventSeatIcon,
  AccountCircle as AccountIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { restaurantSettingsService, RestaurantSettings, NavigationItem } from '../../services/restaurantSettingsService';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { buildCustomerUrl } from '../../utils/subdomain';

const CustomerLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, logout } = useCustomerAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Create custom theme based on settings
  const customTheme = React.useMemo(() => {
    if (!settings) return theme;
    
    return createTheme({
      ...theme,
      palette: {
        ...theme.palette,
        primary: {
          main: settings.primaryColor || '#1976d2',
        },
        secondary: {
          main: settings.secondaryColor || '#dc004e',
        },
        text: {
          ...theme.palette.text,
          primary: settings.accentColor || '#333333',
        }
      },
      typography: {
        ...theme.typography,
        fontFamily: settings.fontPrimary || 'Roboto, sans-serif',
        h1: {
          fontFamily: settings.fontSecondary || settings.fontPrimary || 'Playfair Display, serif',
        },
        h2: {
          fontFamily: settings.fontSecondary || settings.fontPrimary || 'Playfair Display, serif',
        },
        h3: {
          fontFamily: settings.fontSecondary || settings.fontPrimary || 'Playfair Display, serif',
        },
        h4: {
          fontFamily: settings.fontSecondary || settings.fontPrimary || 'Playfair Display, serif',
        },
        h5: {
          fontFamily: settings.fontSecondary || settings.fontPrimary || 'Playfair Display, serif',
        },
        h6: {
          fontFamily: settings.fontSecondary || settings.fontPrimary || 'Playfair Display, serif',
        },
      }
    });
  }, [settings, theme]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await restaurantSettingsService.getPublicSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching restaurant settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    handleUserMenuClose();
    navigate(buildCustomerUrl());
  };

  // Icon mapping for navigation items
  const getNavigationIcon = (iconName?: string) => {
    switch (iconName) {
      case 'home': return <HomeIcon />;
      case 'menu_book': return <MenuBookIcon />;
      case 'event_seat': return <EventSeatIcon />;
      default: return <HomeIcon />;
    }
  };

  // Get navigation items from settings or use defaults
  const getNavigationItems = () => {
    try {
      // Check if navigation is enabled and we have custom navigation items
      if (settings?.navigationEnabled !== false && settings?.navigationItems) {
        // Ensure navigationItems is an array
        const navigationItems = Array.isArray(settings.navigationItems) 
          ? settings.navigationItems 
          : (settings.navigationItems ? JSON.parse(settings.navigationItems) : []);
        
        if (navigationItems && navigationItems.length > 0) {
          // Use custom navigation items from settings
          return navigationItems
            .filter(item => item && item.isActive)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map(item => ({
              text: String(item.label || 'Nav Item'),
              path: buildCustomerUrl(String(item.path || '').replace('/', '')),
              icon: getNavigationIcon(item.icon)
            }));
        }
      }
    } catch (error) {
      console.error('Error processing navigation items:', error);
    }
    
    // Fallback to default navigation items
    return [
      { text: 'Home', path: buildCustomerUrl(), icon: <HomeIcon /> },
      { text: 'Menu', path: buildCustomerUrl('menu'), icon: <MenuBookIcon /> },
      { text: 'Make Reservation', path: buildCustomerUrl('reservations/new'), icon: <EventSeatIcon /> },
    ];
  };

  const navigationItems = getNavigationItems();

  const formatFooterText = (text: string) => {
    const currentYear = new Date().getFullYear();
    return text.replace('{year}', currentYear.toString());
  };

  const formatAddress = () => {
    if (!settings) return '';
    const parts = [
      settings.contactAddress,
      settings.contactCity,
      settings.contactState,
      settings.contactZip
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Header */}
        <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'text.primary' }}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={() => setMobileMenuOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box
              component={Link}
              to="/customer"
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexGrow: 1,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              {settings?.logoUrl ? (
                <Box
                  component="img"
                  src={settings.logoUrl}
                  alt={settings.websiteName || 'Restaurant Logo'}
                  sx={{ height: 40, mr: 2 }}
                />
              ) : (
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
                  {loading ? (
                    <Skeleton width={200} />
                  ) : (
                    settings?.websiteName || 'Seabreeze Kitchen'
                  )}
                </Typography>
              )}
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}

            {user ? (
              <>
                <IconButton onClick={handleUserMenuOpen}>
                  <AccountIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleUserMenuClose}
                >
                  <MenuItem onClick={() => {
                    handleUserMenuClose();
                    navigate(buildCustomerUrl('dashboard'));
                  }}>
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleUserMenuClose();
                    navigate(buildCustomerUrl('profile'));
                  }}>
                    My Profile
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleUserMenuClose();
                    navigate(buildCustomerUrl('reservations'));
                  }}>
                    My Reservations
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    Sign Out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(buildCustomerUrl('login'))}
                >
                  Sign In
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(buildCustomerUrl('register'))}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        >
          <Box sx={{ width: 250 }}>
            <List>
              <ListItem>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {settings?.websiteName || 'Restaurant'}
                </Typography>
              </ListItem>
              <Divider />
              {navigationItems.map((item) => (
                <ListItem
                  key={item.path}
                  button
                  component={Link}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
              {user && (
                <>
                  <Divider />
                  <ListItem
                    button
                    component={Link}
                    to="/customer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ListItemIcon><AccountIcon /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/customer/profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ListItemIcon><AccountIcon /></ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to="/customer/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ListItemIcon><EventSeatIcon /></ListItemIcon>
                    <ListItemText primary="My Reservations" />
                  </ListItem>
                  <Divider />
                  <ListItem button onClick={handleLogout}>
                    <ListItemText primary="Sign Out" />
                  </ListItem>
                </>
              )}
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            backgroundColor: theme.palette.grey[100],
            py: 6,
            mt: 'auto',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4}>
              {/* Contact Info */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  {settings?.contactCardTitle || 'Contact Us'}
                </Typography>
                {settings?.contactPhone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">{settings.contactPhone}</Typography>
                  </Box>
                )}
                {settings?.contactEmail && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 18 }} />
                    <Typography variant="body2">{settings.contactEmail}</Typography>
                  </Box>
                )}
                {formatAddress() && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <LocationIcon sx={{ mr: 1, fontSize: 18, mt: 0.2 }} />
                    <Typography variant="body2">{formatAddress()}</Typography>
                  </Box>
                )}
              </Grid>

              {/* Hours */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  {settings?.hoursCardTitle || 'Opening Hours'}
                </Typography>
                {settings?.openingHours && typeof settings.openingHours === 'object' ? (
                  Object.entries(settings.openingHours).map(([day, hours]) => (
                    <Typography key={day} variant="body2" sx={{ mb: 0.5 }}>
                      <strong>{day}:</strong> {hours as string}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2">
                    Please contact us for current hours
                  </Typography>
                )}
              </Grid>

              {/* Social Media */}
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Follow Us
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {settings?.facebookUrl && (
                    <IconButton
                      component={Link}
                      to={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <FacebookIcon />
                    </IconButton>
                  )}
                  {settings?.instagramUrl && (
                    <IconButton
                      component={Link}
                      to={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <InstagramIcon />
                    </IconButton>
                  )}
                  {settings?.twitterUrl && (
                    <IconButton
                      component={Link}
                      to={settings.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <TwitterIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            </Grid>

            {/* Copyright */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="body2" color="text.secondary" align="center">
              {settings?.footerText ? 
                formatFooterText(settings.footerText) : 
                `© ${new Date().getFullYear()} ${settings?.websiteName || 'Restaurant'}. All rights reserved.`
              }
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CustomerLayout; 