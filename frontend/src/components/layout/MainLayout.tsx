import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SidebarItems } from './SidebarItems'; // Import our navigation items
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import Button from '@mui/material/Button'; // Import Button
import Avatar from '@mui/material/Avatar'; // For user display
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Logout from '@mui/icons-material/Logout';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Link as RouterLink } from 'react-router-dom';
import Divider from '@mui/material/Divider';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const { user, logout, isLoading } = useAuth(); // Get user and logout function
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Log whenever MainLayout re-renders and show the current user state
  console.log("[MainLayout] Rendering - User:", user, "isLoading:", isLoading);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    try {
      await logout();
      // Maybe show snackbar on successful logout?
      // navigate('/login'); // Optionally redirect to login after logout
    } catch (error) {
      console.error("Logout failed in layout:", error);
      // Maybe show error snackbar?
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} // Ensure AppBar is above Drawer
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            KitchenSync
          </Typography>
          {/* User Info and Logout Button */} 
           {user ? (
             <>
              <Tooltip title="Account settings">
                <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
                   {/* Basic Avatar with first letter */} 
                   <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                        {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                    </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled sx={{ fontStyle: 'italic' }}>
                  {user.email}
                </MenuItem>
                {/* <MenuItem onClick={handleClose}> <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon> Profile </MenuItem> */}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
             </>
           ) : (
             // Show Login/Register buttons if not logged in and not loading
             !isLoading && (
                 <Button color="inherit" component={RouterLink} to="/login">Login</Button>
             )
           )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent" // Persistent drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar /> {/* Spacer to offset content below AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <SidebarItems />
        </Box>
      </Drawer>
      <Box 
        component="main" 
        sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}
      >
        <Toolbar /> {/* Another spacer for the main content area */}
        {/* Page content rendered here based on route */}
        <Outlet /> 
      </Box>
    </Box>
  );
}

export default MainLayout; 