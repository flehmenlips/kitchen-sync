import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import { useSubscription } from '../../context/SubscriptionContext';
import { getAccessibleModules, Module, SubModule } from '../../types/modules';
import Tooltip from '@mui/material/Tooltip';

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
  const { subscription } = useSubscription();
  const [openModules, setOpenModules] = React.useState<string[]>([]);

  // Get accessible modules based on subscription
  const accessibleModules = getAccessibleModules(
    subscription?.plan || 'TRIAL',
    subscription?.enabledModules
  );

  const handleModuleClick = (moduleId: string) => {
    setOpenModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const renderSubModule = (subModule: SubModule, isAccessible: boolean) => (
    <ListItem key={subModule.id} disablePadding sx={{ pl: 4 }}>
      <ListItemButton 
        component={isAccessible ? RouterLink : 'div'} 
        to={isAccessible ? subModule.path : undefined}
        selected={isAccessible && currentPath === subModule.path}
        disabled={!isAccessible}
      >
        <ListItemIcon>
          {isAccessible ? <subModule.icon /> : <LockIcon color="disabled" />}
        </ListItemIcon>
        <ListItemText 
          primary={subModule.name} 
          sx={{ opacity: isAccessible ? 1 : 0.5 }}
        />
      </ListItemButton>
    </ListItem>
  );

  const renderModule = (module: Module) => {
    const isAccessible = accessibleModules.some(m => m.id === module.id);
    const hasSubModules = module.subModules && module.subModules.length > 0;
    const isOpen = openModules.includes(module.id);
    const isActive = currentPath === module.path || 
      (module.subModules?.some(sub => currentPath.startsWith(sub.path)) ?? false);

    const moduleButton = (
      <ListItemButton 
        component={isAccessible && !hasSubModules ? RouterLink : 'div'} 
        to={isAccessible && !hasSubModules ? module.path : undefined}
        selected={isAccessible && isActive}
        disabled={!isAccessible}
        onClick={hasSubModules ? () => handleModuleClick(module.id) : undefined}
      >
        <ListItemIcon>
          {isAccessible ? <module.icon /> : <LockIcon color="disabled" />}
        </ListItemIcon>
        <ListItemText 
          primary={module.name}
          secondary={!isAccessible && module.requiredTier[0] ? `Requires ${module.requiredTier[0]}` : undefined}
          sx={{ opacity: isAccessible ? 1 : 0.5 }}
        />
        {hasSubModules && (isOpen ? <ExpandLess /> : <ExpandMore />)}
      </ListItemButton>
    );

    return (
      <React.Fragment key={module.id}>
        <ListItem disablePadding>
          {!isAccessible && module.type === 'optional' ? (
            <Tooltip title={`This module requires ${module.requiredTier[0]} plan`} placement="right">
              {moduleButton}
            </Tooltip>
          ) : (
            moduleButton
          )}
        </ListItem>
        {hasSubModules && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {module.subModules!.map(subModule => 
                renderSubModule(subModule, isAccessible)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  // Separate modules by type
  const coreModules = accessibleModules.filter(m => m.type === 'core');
  const optionalModules = accessibleModules.filter(m => m.type === 'optional');
  
  return (
    <Box>
      <List>
        {coreModules.map(module => renderModule(module))}
      </List>
      
      {optionalModules.length > 0 && (
        <>
          <Divider />
          <List>
            {optionalModules.map(module => renderModule(module))}
          </List>
        </>
      )}
    </Box>
  );
} 