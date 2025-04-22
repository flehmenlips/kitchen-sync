import React, { useState } from 'react';
import { useLocation, Link as RouterLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types/user';

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
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import KitchenIcon from '@mui/icons-material/Kitchen';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import BlenderIcon from '@mui/icons-material/Blender';
import ScaleIcon from '@mui/icons-material/Scale';
import ListAltIcon from '@mui/icons-material/ListAlt';
import Logout from '@mui/icons-material/Logout';

// Constants
const DRAWER_WIDTH = 280;

// Module definitions
const KITCHEN_SYNC_MODULES = [
    {
        id: 'cookbook',
        name: 'CookBook',
        icon: <MenuBookIcon />,
        description: 'Recipe Management System',
        path: '/recipes',
        subItems: [
            { name: 'Recipes', icon: <ListAltIcon />, path: '/recipes' },
            { name: 'Categories', icon: <CategoryIcon />, path: '/categories' },
            { name: 'Ingredients', icon: <BlenderIcon />, path: '/ingredients' },
            { name: 'Units', icon: <ScaleIcon />, path: '/units' },
        ]
    },
    {
        id: 'agilechef',
        name: 'AgileChef',
        icon: <KitchenIcon />,
        description: 'Kitchen Prep Management',
        path: '/prep',
        comingSoon: true
    },
    {
        id: 'menubuilder',
        name: 'MenuBuilder',
        icon: <RestaurantMenuIcon />,
        description: 'Menu Design & Management',
        path: '/menus',
        comingSoon: true
    },
    {
        id: 'tablefarm',
        name: 'TableFarm',
        icon: <TableRestaurantIcon />,
        description: 'Reservation & Order System',
        path: '/tables',
        comingSoon: true
    },
    {
        id: 'chefrail',
        name: 'ChefRail',
        icon: <KitchenIcon />,
        description: 'Kitchen Display System',
        path: '/rail',
        comingSoon: true
    }
];

const MainLayout: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, logout } = useAuth();
    const location = useLocation();
    
    // State
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedModule, setExpandedModule] = useState<string | null>('cookbook');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Handlers
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleModuleClick = (moduleId: string) => {
        setExpandedModule(expandedModule === moduleId ? null : moduleId);
    };
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
        return KITCHEN_SYNC_MODULES.find(module => 
            location.pathname.startsWith(module.path) ||
            module.subItems?.some(item => location.pathname.startsWith(item.path))
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
            <List>
                <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/">
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>

                <Divider sx={{ my: 1 }} />

                {KITCHEN_SYNC_MODULES.map((module) => (
                    <React.Fragment key={module.id}>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => module.subItems ? handleModuleClick(module.id) : undefined}
                                {...(module.subItems ? {} : { 
                                    component: RouterLink,
                                    to: module.path 
                                })}
                                disabled={module.comingSoon}
                            >
                                <ListItemIcon>
                                    {module.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={module.name}
                                    secondary={module.comingSoon ? 'Coming Soon' : ''}
                                />
                                {module.subItems && (
                                    expandedModule === module.id ? <ExpandLess /> : <ExpandMore />
                                )}
                            </ListItemButton>
                        </ListItem>
                        {module.subItems && (
                            <Collapse in={expandedModule === module.id} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {module.subItems.map((item) => (
                                        <ListItemButton
                                            key={item.path}
                                            component={RouterLink}
                                            to={item.path}
                                            sx={{ pl: 4 }}
                                            selected={location.pathname === item.path}
                                        >
                                            <ListItemIcon>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText primary={item.name} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}

                {/* Admin Tools - Only visible to SuperAdmin */}
                {user?.role === 'SUPERADMIN' && (
                    <>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding>
                            <ListItemButton component={RouterLink} to="/issues">
                                <ListItemIcon>
                                    <Badge color="error" variant="dot">
                                        <BugReportIcon />
                                    </Badge>
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Issue Tracker" 
                                    secondary="Admin Only"
                                />
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
                                <Divider />
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