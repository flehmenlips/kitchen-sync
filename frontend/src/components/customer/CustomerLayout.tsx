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
  MoreVert as MoreVertIcon,
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

  // Get navigation settings
  const navigationLayout = settings?.navigationLayout || 'topbar';
  const navigationAlignment = settings?.navigationAlignment || 'left';
  const navigationStyle = settings?.navigationStyle || 'modern';
  const mobileMenuStyle = settings?.mobileMenuStyle || 'hamburger';
  const isSidebarLayout = navigationLayout === 'sidebar';
  const isHybridLayout = navigationLayout === 'hybrid';
  const sidebarWidth = 240;

  // Helper function to get justifyContent based on alignment
  const getNavigationJustification = (alignment: string) => {
    switch (alignment) {
      case 'center': return 'center';
      case 'right': return 'flex-end';
      case 'justified': return 'space-evenly';
      case 'left':
      default: return 'flex-start';
    }
  };

  // Helper function to get button styles based on navigation style
  const getNavigationButtonStyles = (style: string) => {
    switch (style) {
      case 'minimal':
        return {
          textTransform: 'none' as const,
          fontWeight: 400,
          color: 'text.primary',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: 'transparent',
            textDecoration: 'underline',
          },
        };
      case 'classic':
        return {
          textTransform: 'uppercase' as const,
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.05em',
          color: 'text.primary',
          backgroundColor: 'transparent',
          border: '1px solid transparent',
          '&:hover': {
            backgroundColor: 'grey.100',
            borderColor: 'grey.300',
          },
        };
      case 'rounded':
        return {
          textTransform: 'none' as const,
          fontWeight: 500,
          borderRadius: '20px',
          px: 3,
          py: 1,
          backgroundColor: 'grey.100',
          color: 'text.primary',
          '&:hover': {
            backgroundColor: 'grey.200',
          },
        };
      case 'modern':
      default:
        return {
          // Default Material-UI button styling
          textTransform: 'none' as const,
          fontWeight: 500,
        };
    }
  };

  // Helper function to get mobile menu icon based on style
  const getMobileMenuIcon = (style: string) => {
    switch (style) {
      case 'dots':
        return <MoreVertIcon />;
      case 'hamburger':
      case 'slide':
      default:
        return <MenuIcon />;
    }
  };

  // Helper function to get mobile drawer anchor based on style
  const getMobileDrawerAnchor = (style: string) => {
    switch (style) {
      case 'slide':
        return 'right' as const;
      case 'hamburger':
      case 'dots':
      default:
        return 'left' as const;
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex', flexDirection: isSidebarLayout ? 'row' : 'column', minHeight: '100vh' }}>
        
        {/* Sidebar Navigation - Only for sidebar and hybrid layouts on desktop */}
        {(isSidebarLayout || isHybridLayout) && !isMobile && (
          <Drawer
            variant="permanent"
            anchor="left"
            sx={{
              width: sidebarWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: sidebarWidth,
                boxSizing: 'border-box',
                backgroundColor: 'white',
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <Box sx={{ overflow: 'auto' }}>
              {/* Sidebar Header with Logo */}
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box
                  component={Link}
                  to="/customer"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
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
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                      }}
                    >
                      {loading ? (
                        <Skeleton width={150} />
                      ) : (
                        settings?.websiteName || 'Seabreeze Kitchen'
                      )}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Sidebar Navigation Items */}
              <List sx={{ py: 1 }}>
                {navigationItems.map((item) => (
                  <ListItem
                    key={item.path}
                    button
                    component={Link}
                    to={item.path}
                    sx={{
                      mx: 1,
                      mb: 0.5,
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500,
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              {/* User Menu in Sidebar */}
              {user && (
                <>
                  <Divider sx={{ mx: 2 }} />
                  <List sx={{ py: 1 }}>
                    <ListItem
                      button
                      component={Link}
                      to={buildCustomerUrl('dashboard')}
                      sx={{
                        mx: 1,
                        mb: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <AccountIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Dashboard"
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    <ListItem
                      button
                      component={Link}
                      to={buildCustomerUrl('profile')}
                      sx={{
                        mx: 1,
                        mb: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <AccountIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="My Profile"
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    <ListItem
                      button
                      component={Link}
                      to={buildCustomerUrl('reservations')}
                      sx={{
                        mx: 1,
                        mb: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <EventSeatIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="My Reservations"
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                    <Divider sx={{ mx: 2, my: 1 }} />
                    <ListItem
                      button
                      onClick={handleLogout}
                      sx={{
                        mx: 1,
                        mb: 0.5,
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText 
                        primary="Sign Out"
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                        }}
                      />
                    </ListItem>
                  </List>
                </>
              )}
            </Box>
          </Drawer>
        )}

        {/* Main Content Area */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1,
          width: isSidebarLayout && !isMobile ? `calc(100% - ${sidebarWidth}px)` : '100%',
        }}>
          
          {/* Top Header - Show for topbar layout, or minimal header for sidebar/hybrid */}
          {(!isSidebarLayout || isMobile) && (
            <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'text.primary' }}>
              <Toolbar>
                {isMobile && (
                  <IconButton
                    edge="start"
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{ mr: 2 }}
                  >
                    {getMobileMenuIcon(mobileMenuStyle)}
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

                {!isMobile && navigationLayout === 'topbar' && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: navigationAlignment === 'justified' ? 0 : 2, 
                    mr: navigationAlignment === 'right' ? 0 : 2,
                    ml: navigationAlignment === 'left' ? 0 : 2,
                    justifyContent: getNavigationJustification(navigationAlignment),
                    flexGrow: navigationAlignment !== 'right' ? 1 : 0,
                    maxWidth: navigationAlignment === 'center' ? '600px' : 'none'
                  }}>
                    {navigationItems.map((item) => (
                      <Button
                        key={item.path}
                        component={Link}
                        to={item.path}
                        startIcon={item.icon}
                        sx={{
                          ...getNavigationButtonStyles(navigationStyle),
                          ...(navigationAlignment === 'justified' && {
                            flex: 1,
                            mx: 0.5
                          })
                        }}
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
          )}

          {/* For sidebar layout on desktop - minimal top bar */}
          {isSidebarLayout && !isMobile && (
            <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'text.primary', boxShadow: 1 }}>
              <Toolbar sx={{ minHeight: '48px !important', py: 0 }}>
                <Box sx={{ flexGrow: 1 }} />
                {user ? (
                  <>
                    <IconButton onClick={handleUserMenuOpen} size="small">
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
                      size="small"
                      onClick={() => navigate(buildCustomerUrl('login'))}
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate(buildCustomerUrl('register'))}
                    >
                      Sign Up
                    </Button>
                  </Box>
                )}
              </Toolbar>
            </AppBar>
                     )}

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
                {/* Restaurant Info */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    {settings?.websiteName || 'Seabreeze Kitchen'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {settings?.tagline || 'Delicious food, exceptional service'}
                  </Typography>
                  {settings?.contactPhone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {settings.contactPhone}
                      </Typography>
                    </Box>
                  )}
                  {settings?.contactEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {settings.contactEmail}
                      </Typography>
                    </Box>
                  )}
                  {formatAddress() && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {formatAddress()}
                      </Typography>
                    </Box>
                  )}
                </Grid>

                {/* Quick Links */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Quick Links
                  </Typography>
                  {navigationItems.map((item) => (
                    <Box key={item.path} sx={{ mb: 1 }}>
                      <Link
                        component={Link}
                        to={item.path}
                        color="text.secondary"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {item.text}
                      </Link>
                    </Box>
                  ))}
                </Grid>

                {/* Social Media */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    Follow Us
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {settings?.facebookUrl && (
                      <IconButton
                        component="a"
                        href={settings.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        <FacebookIcon />
                      </IconButton>
                    )}
                    {settings?.instagramUrl && (
                      <IconButton
                        component="a"
                        href={settings.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        <InstagramIcon />
                      </IconButton>
                    )}
                    {settings?.twitterUrl && (
                      <IconButton
                        component="a"
                        href={settings.twitterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        <TwitterIcon />
                      </IconButton>
                    )}
                  </Box>
                  {settings?.footerText && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      {formatFooterText(settings.footerText)}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Container>
          </Box>
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          anchor={getMobileDrawerAnchor(mobileMenuStyle)}
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
                    to={buildCustomerUrl('dashboard')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ListItemIcon><AccountIcon /></ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to={buildCustomerUrl('profile')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ListItemIcon><AccountIcon /></ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </ListItem>
                  <ListItem
                    button
                    component={Link}
                    to={buildCustomerUrl('reservations')}
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
      </Box>
    </ThemeProvider>
  );
};

export default CustomerLayout; 