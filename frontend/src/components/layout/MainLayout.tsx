import React, { useState } from 'react';
import { useLocation, Link as RouterLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/user';
import RestaurantSelector from '../common/RestaurantSelector';
import { SidebarItems } from './SidebarItems';
import { modules } from '../../types/modules';

// MUI Components
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    useTheme,
    Divider,
    Tooltip,
    Avatar,
    Badge,
    useMediaQuery,
    Collapse,
} from '@mui/material';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Logout from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PaymentIcon from '@mui/icons-material/Payment';

// Constants - Mobile-optimized sizing
const DRAWER_WIDTH = 280;
const MOBILE_APPBAR_HEIGHT = 56; // Standard mobile AppBar height
const MOBILE_TOUCH_TARGET = 48; // Minimum touch target size per Material Design

const MainLayout: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user, logout } = useAuth();
    const location = useLocation();
    
    // State
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Handlers
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleProfileClose = () => setAnchorEl(null);
    const handleLogout = async () => {
        handleProfileClose();
        await logout();
    };

    // Auto-close mobile drawer when navigating (better UX)
    React.useEffect(() => {
        if (isMobile && mobileOpen) {
            setMobileOpen(false);
        }
    }, [location.pathname]);

    // Determine if current path is under a module
    const getCurrentModule = () => {
        return modules.find(module => 
            location.pathname.startsWith(module.path) ||
            module.subModules?.some(item => location.pathname.startsWith(item.path))
        );
    };

    const drawer = (
        <Box>
            {/* Mobile-optimized header */}
            <Toolbar sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start',
                px: 2,
                background: theme.palette.primary.main,
                color: 'white',
                minHeight: isMobile ? `${MOBILE_APPBAR_HEIGHT}px !important` : '64px !important'
            }}>
                {/* KitchenSync Logo - Responsive sizing */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    flexGrow: 1,
                    gap: 1
                }}>
                    <img 
                        src="/logo-white.svg" 
                        alt="KitchenSync Logo" 
                        style={{ 
                            height: isMobile ? '28px' : '32px',
                            width: 'auto'
                        }}
                    />
                    <Typography 
                        variant={isMobile ? "subtitle1" : "h6"}
                        noWrap 
                        component="div" 
                        sx={{ 
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                        }}
                    >
                        KitchenSync
                    </Typography>
                </Box>
                {isMobile && (
                    <IconButton 
                        onClick={handleDrawerToggle} 
                        sx={{ 
                            color: 'white',
                            minWidth: MOBILE_TOUCH_TARGET,
                            minHeight: MOBILE_TOUCH_TARGET,
                            p: 1.5
                        }}
                        size="large"
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Toolbar>
            <Divider />
            
            {/* Module-based navigation - Mobile optimized */}
            <Box sx={{ 
                px: isMobile ? 1 : 0,
                '& .MuiListItemButton-root': {
                    minHeight: isMobile ? MOBILE_TOUCH_TARGET : 'auto',
                    borderRadius: isMobile ? 2 : 0,
                    mx: isMobile ? 1 : 0,
                    mb: isMobile ? 0.5 : 0,
                    '&:hover': {
                        backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                    }
                },
                '& .MuiListItemIcon-root': {
                    minWidth: isMobile ? 44 : 56,
                },
                '& .MuiListItemText-primary': {
                    fontSize: isMobile ? '0.95rem' : '1rem',
                    fontWeight: isMobile ? 500 : 400,
                }
            }}>
                <SidebarItems />
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            {/* Admin sections - Mobile optimized */}
            <List sx={{ 
                px: isMobile ? 1 : 0,
                '& .MuiListItemButton-root': {
                    minHeight: isMobile ? MOBILE_TOUCH_TARGET : 'auto',
                    borderRadius: isMobile ? 2 : 0,
                    mx: isMobile ? 1 : 0,
                    mb: isMobile ? 0.5 : 0,
                },
                '& .MuiListItemIcon-root': {
                    minWidth: isMobile ? 44 : 56,
                }
            }}>
                {/* Admin Dashboard - Only visible to admin/owner */}
                {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/admin-dashboard">
                                <ListItemIcon>
                                    <AdminPanelSettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Admin Dashboard" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/settings/billing">
                                <ListItemIcon>
                                    <PaymentIcon />
                                </ListItemIcon>
                                <ListItemText primary="Billing & Subscription" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />
            
            {/* Top App Bar - Mobile optimized */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    height: isMobile ? MOBILE_APPBAR_HEIGHT : 64,
                }}
            >
                <Toolbar sx={{
                    minHeight: isMobile ? `${MOBILE_APPBAR_HEIGHT}px !important` : '64px !important',
                    px: isMobile ? 1 : 3,
                }}>
                    {/* Mobile menu button - Enhanced touch target */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ 
                            mr: isMobile ? 1 : 2, 
                            display: { md: 'none' },
                            minWidth: MOBILE_TOUCH_TARGET,
                            minHeight: MOBILE_TOUCH_TARGET,
                            p: 1.5
                        }}
                        size={isMobile ? "large" : "medium"}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Current Module Title - Responsive typography */}
                    <Typography 
                        variant={isMobile ? "h6" : "h6"} 
                        noWrap 
                        component="div" 
                        sx={{ 
                            flexGrow: 1,
                            fontSize: isMobile ? '1.1rem' : '1.25rem',
                            fontWeight: isMobile ? 600 : 500,
                        }}
                    >
                        {getCurrentModule()?.name || 'Dashboard'}
                    </Typography>

                    {/* Restaurant Selector - Mobile responsive */}
                    <Box sx={{ 
                        mr: isMobile ? 0.5 : 2,
                        '& .MuiSelect-select': {
                            fontSize: isMobile ? '0.875rem' : '1rem',
                        }
                    }}>
                        <RestaurantSelector />
                    </Box>

                    {/* User Menu - Mobile optimized */}
                    {user && (
                        <>
                            <Tooltip title="Account settings">
                                <IconButton 
                                    onClick={handleProfileClick} 
                                    sx={{ 
                                        ml: isMobile ? 0.5 : 2,
                                        minWidth: MOBILE_TOUCH_TARGET,
                                        minHeight: MOBILE_TOUCH_TARGET,
                                        p: isMobile ? 1 : 0.5
                                    }}
                                    size={isMobile ? "large" : "small"}
                                >
                                    <Avatar sx={{ 
                                        width: isMobile ? 36 : 32, 
                                        height: isMobile ? 36 : 32, 
                                        bgcolor: 'secondary.main',
                                        fontSize: isMobile ? '1.1rem' : '1rem'
                                    }}>
                                        {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleProfileClose}
                                onClick={handleProfileClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                sx={{
                                    '& .MuiMenuItem-root': {
                                        minHeight: isMobile ? MOBILE_TOUCH_TARGET : 'auto',
                                        fontSize: isMobile ? '0.95rem' : '0.875rem',
                                        px: isMobile ? 2 : 1.5,
                                    }
                                }}
                            >
                                <MenuItem component={RouterLink} to="/profile">
                                    <ListItemIcon sx={{ minWidth: isMobile ? 44 : 40 }}>
                                        <PersonIcon fontSize="small" />
                                    </ListItemIcon>
                                    Profile
                                </MenuItem>

                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon sx={{ minWidth: isMobile ? 44 : 40 }}>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Sidebar Navigation - Mobile optimized */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer - Enhanced */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: isSmallMobile ? '100vw' : DRAWER_WIDTH,
                            maxWidth: '100vw'
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: DRAWER_WIDTH 
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content - Mobile optimized */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: isMobile ? 2 : 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: `${isMobile ? MOBILE_APPBAR_HEIGHT : 64}px`,
                    backgroundColor: theme.palette.grey[100],
                    minHeight: '100vh'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout; 