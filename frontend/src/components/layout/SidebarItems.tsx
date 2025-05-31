import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';

// Import Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook'; // For Recipes
import ScaleIcon from '@mui/icons-material/Scale'; // For Units
import BlenderIcon from '@mui/icons-material/Blender'; // For Ingredients
import CategoryIcon from '@mui/icons-material/Category'; // Import Category icon
import ClassIcon from '@mui/icons-material/Class'; // Icon for Ingredient Categories
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'; // For Menu Builder
import BugReportIcon from '@mui/icons-material/BugReport'; // For Issues
import AssignmentIcon from '@mui/icons-material/Assignment'; // For Prep Board

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const mainNavItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Recipes', icon: <MenuBookIcon />, path: '/recipes' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' }, // Recipe Categories
  { text: 'Ingredients', icon: <BlenderIcon />, path: '/ingredients' },
  { text: 'Ingr Categories', icon: <ClassIcon />, path: '/ingredient-categories' }, // Ingredient Categories
  { text: 'Units', icon: <ScaleIcon />, path: '/units' },
];

// Tools and modules section
const toolsNavItems: NavItem[] = [
  { text: 'Menu Builder', icon: <RestaurantMenuIcon />, path: '/menus' },
  { text: 'Prep Board', icon: <AssignmentIcon />, path: '/prep' },
  { text: 'Issue Tracker', icon: <BugReportIcon />, path: '/issues' },
];

export const SidebarItems: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Box>
      <List>
        {mainNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path}
              selected={currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        {toolsNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path}
              selected={currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 