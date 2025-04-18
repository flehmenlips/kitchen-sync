import React from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SidebarItems } from './SidebarItems'; // Import our navigation items

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} // Ensure AppBar is above Drawer
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            KitchenSync
          </Typography>
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