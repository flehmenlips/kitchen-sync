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

// Constants
const DRAWER_WIDTH = 280;

const MainLayout: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

    // Determine if current path is under a module
    const getCurrentModule = () => {
        return modules.find(module => 
            location.pathname.startsWith(module.path) ||
            module.subModules?.some(item => location.pathname.startsWith(item.path))
        );
    };

    const drawer = (
        <Box>
            <Toolbar sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'flex-end',
                px: [1],
                background: theme.palette.primary.main,
                color: 'white'
            }}>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, ml: 2 }}>
                    KitchenSync
                </Typography>
                {isMobile && (
                    <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
                        <ChevronLeftIcon />
                    </IconButton>
                )}
            </Toolbar>
            <Divider />
            
            {/* Module-based navigation */}
            <SidebarItems />
            
            <Divider sx={{ my: 1 }} />
            
            <List>
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
            
            {/* Top App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Current Module Title */}
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {getCurrentModule()?.name || 'Dashboard'}
                    </Typography>

                    {/* Restaurant Selector */}
                    <Box sx={{ mr: 2 }}>
                        <RestaurantSelector />
                    </Box>

                    {/* User Menu */}
                    {user && (
                        <>
                            <Tooltip title="Account settings">
                                <IconButton onClick={handleProfileClick} size="small" sx={{ ml: 2 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
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
                            >
                                <MenuItem disabled sx={{ fontStyle: 'italic' }}>
                                    {user.email}
                                </MenuItem>
                                <MenuItem disabled sx={{ color: 'text.secondary' }}>
                                    Role: {user.role?.charAt(0) + user.role?.slice(1).toLowerCase() || 'User'}
                                </MenuItem>
                                <Divider />
                                <MenuItem component={RouterLink} to="/profile">
                                    <ListItemIcon>
                                        <PersonIcon fontSize="small" />
                                    </ListItemIcon>
                                    Profile Settings
                                </MenuItem>
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" />
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            {/* Sidebar Navigation */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { 
                            boxSizing: 'border-box', 
                            width: DRAWER_WIDTH 
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

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: '64px', // Height of AppBar
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