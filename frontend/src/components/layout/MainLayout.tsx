import React, { useState } from 'react';
import { useLocation, Link as RouterLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RestaurantSelector from '../common/RestaurantSelector';
import { SidebarItems } from './SidebarItems';
import { modules } from '../../types/modules';
import { KitchenSyncLogo } from '../common/KitchenSyncLogo';

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
    useMediaQuery,
} from '@mui/material';

// MUI Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Logout from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PaymentIcon from '@mui/icons-material/Payment';
import RestaurantIcon from '@mui/icons-material/Restaurant';

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
        <Box className="h-full bg-gradient-to-b from-white to-gray-50">
            {/* Remise-inspired header with gradient */}
            <Toolbar sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-start',
                px: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                minHeight: isMobile ? `${MOBILE_APPBAR_HEIGHT}px !important` : '100px !important',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                }
            }}>
                       {/* KitchenSync Sidebar Logo - EXACT login page elements, scaled for sidebar */}
                       <Box sx={{ 
                           display: 'flex', 
                           alignItems: 'center', 
                           flexGrow: 1,
                           flexDirection: 'column',
                           gap: '8px'
                       }}>
                           {/* Top Logo - Scaled down version of login page */}
                           <div style={{
                               width: '36px',
                               height: '36px',
                               background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                               borderRadius: '8px',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                               position: 'relative',
                               overflow: 'hidden'
                           }}>
                               {/* Inner glow effect */}
                               <div style={{
                                   position: 'absolute',
                                   inset: '1px',
                                   background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                                   borderRadius: '7px',
                                   pointerEvents: 'none'
                               }}></div>
                               <img 
                                   src="/k-table-logo.svg" 
                                   alt="KitchenSync Logo" 
                                   style={{ 
                                       width: '22px', 
                                       height: '22px',
                                       filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                                       position: 'relative',
                                       zIndex: 1
                                   }}
                               />
                           </div>
                           
                           {/* Bottom Text - Scaled down KitchenSyncLogo component */}
                           <div style={{ 
                               display: 'flex',
                               justifyContent: 'center',
                               alignItems: 'center'
                           }}>
                               <KitchenSyncLogo size="sidebar" variant="light" showIcon />
                           </div>
                       </Box>
                {isMobile && (
                    <IconButton 
                        onClick={handleDrawerToggle} 
                        className="hover:bg-white/20 transition-all duration-300"
                        sx={{ 
                            color: 'white',
                            minWidth: MOBILE_TOUCH_TARGET,
                            minHeight: MOBILE_TOUCH_TARGET,
                            p: 1.5,
                            borderRadius: 2
                        }}
                        size="large"
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Toolbar>
            <Divider sx={{ borderColor: 'rgba(59, 130, 246, 0.1)' }} />
            
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
            
            <Divider sx={{ my: 2, borderColor: 'rgba(59, 130, 246, 0.1)' }} />
            
            {/* Admin sections - Remise-inspired premium styling */}
            <List sx={{ 
                px: isMobile ? 1.5 : 1,
                pb: 2,
                '& .MuiListItemButton-root': {
                    minHeight: isMobile ? MOBILE_TOUCH_TARGET : 48,
                    borderRadius: 2,
                    mx: isMobile ? 0.5 : 0.5,
                    mb: 0.75,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                    },
                    '&.Mui-selected': {
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
                        borderLeft: '3px solid',
                        borderColor: '#8b5cf6',
                        fontWeight: 600,
                        '&:hover': {
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
                        }
                    }
                },
                '& .MuiListItemIcon-root': {
                    minWidth: isMobile ? 44 : 48,
                    color: '#6366f1'
                },
                '& .MuiListItemText-primary': {
                    fontWeight: 500,
                    fontSize: '0.9rem'
                }
            }}>
                {/* Restaurant Settings - Available to all restaurant staff */}
                {user && (
                    <>
                        <Box className="px-2 py-1 mb-2">
                            <Typography variant="caption" className="text-gray-500 font-semibold uppercase tracking-wider" sx={{ fontSize: '0.7rem' }}>
                                Settings
                            </Typography>
                        </Box>
                        <ListItem disablePadding>
                            <ListItemButton 
                                component={RouterLink} 
                                to="/settings/restaurant"
                                selected={location.pathname === '/settings/restaurant'}
                            >
                                <ListItemIcon>
                                    <Box className="bg-gradient-to-br from-orange-500 to-red-600 p-1.5 rounded-lg shadow-sm">
                                        <RestaurantIcon sx={{ fontSize: 18, color: 'white' }} />
                                    </Box>
                                </ListItemIcon>
                                <ListItemText primary="Restaurant Management" />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}
                
                {/* Admin Dashboard - Only visible to admin/owner */}
                {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                    <>
                        <Box className="px-2 py-1 mb-2 mt-2">
                            <Typography variant="caption" className="text-gray-500 font-semibold uppercase tracking-wider" sx={{ fontSize: '0.7rem' }}>
                                Administration
                            </Typography>
                        </Box>
                        <ListItem disablePadding>
                            <ListItemButton 
                                component={RouterLink} 
                                to="/admin-dashboard"
                                selected={location.pathname === '/admin-dashboard'}
                            >
                                <ListItemIcon>
                                    <Box className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg shadow-sm">
                                        <AdminPanelSettingsIcon sx={{ fontSize: 18, color: 'white' }} />
                                    </Box>
                                </ListItemIcon>
                                <ListItemText primary="Admin Dashboard" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton 
                                component={RouterLink} 
                                to="/settings/billing"
                                selected={location.pathname === '/settings/billing'}
                            >
                                <ListItemIcon>
                                    <Box className="bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 rounded-lg shadow-sm">
                                        <PaymentIcon sx={{ fontSize: 18, color: 'white' }} />
                                    </Box>
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
            
            {/* Top App Bar - Remise-inspired modern styling */}
            <AppBar
                position="fixed"
                className="backdrop-blur-md"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    height: isMobile ? MOBILE_APPBAR_HEIGHT : 64,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(59, 130, 246, 0.08)',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
                    color: theme.palette.text.primary,
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

                    {/* User Menu - Remise-inspired premium styling */}
                    {user && (
                        <>
                            <Tooltip title="Account settings">
                                <IconButton 
                                    onClick={handleProfileClick} 
                                    className="hover:scale-110 transition-transform duration-300"
                                    sx={{ 
                                        ml: isMobile ? 0.5 : 2,
                                        minWidth: MOBILE_TOUCH_TARGET,
                                        minHeight: MOBILE_TOUCH_TARGET,
                                        p: isMobile ? 1 : 0.5
                                    }}
                                    size={isMobile ? "large" : "small"}
                                >
                                    <Avatar 
                                        className="shadow-lg ring-2 ring-white"
                                        sx={{ 
                                            width: isMobile ? 40 : 36, 
                                            height: isMobile ? 40 : 36, 
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                            fontSize: isMobile ? '1.1rem' : '1rem',
                                            fontWeight: 600
                                        }}
                                    >
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