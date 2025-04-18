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
import ClassIcon from '@mui/icons-material/Class'; // Icon for Ingredient Categories?
// TODO: Add icons for other modules later

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const mainNavItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Recipes', icon: <MenuBookIcon />, path: '/recipes' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/categories' }, // Recipe Categories
  { text: 'Ingredients', icon: <BlenderIcon />, path: '/ingredients' },
  { text: 'Ingr Categories', icon: <ClassIcon />, path: '/ingredient-categories' }, // Ingredient Categories
  { text: 'Units', icon: <ScaleIcon />, path: '/units' },
];

// Placeholder for other future sections
const otherNavItems: NavItem[] = [
    // { text: 'Prep Flow', icon: <SomeIcon />, path: '/prep' },
    // { text: 'Menus', icon: <SomeIcon />, path: '/menus' },
    // { text: 'Orders', icon: <SomeIcon />, path: '/orders' },
    // { text: 'KDS', icon: <SomeIcon />, path: '/kds' },
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
      {/* Add Categories link here if needed, or update mainNavItems */}
      {/* We added Categories to mainNavItems in a previous step */}
      {/* Render other sections if they exist */}
      {otherNavItems.length > 0 && <Divider />}
       {otherNavItems.length > 0 && (
          <List>
           {otherNavItems.map((item) => (
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
      )}
    </Box>
  );
} 