import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import { useSubscription } from '../../context/SubscriptionContext';
import { getAccessibleModules, Module, SubModule } from '../../types/modules';
import Tooltip from '@mui/material/Tooltip';

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
        className={isAccessible ? 'transition-all duration-300 hover:-translate-x-1' : ''}
        sx={{
          borderRadius: 2,
          mx: 0.5,
          mb: 0.5,
          minHeight: 44,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': isAccessible ? {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
            transform: 'translateX(4px)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.12)',
          } : {},
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
            borderLeft: '3px solid',
            borderColor: '#8b5cf6',
            fontWeight: 600,
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
            }
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 44 }}>
          {isAccessible ? (
            <Box className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg shadow-sm transition-transform duration-300 hover:scale-110">
              <Box component={module.icon} sx={{ fontSize: 18, color: 'white' }} />
            </Box>
          ) : (
            <Box className="bg-gray-200 p-1.5 rounded-lg">
              <LockIcon sx={{ fontSize: 18, color: '#9ca3af' }} />
            </Box>
          )}
        </ListItemIcon>
        <ListItemText 
          primary={module.name}
          secondary={!isAccessible && module.requiredTier[0] ? `Requires ${module.requiredTier[0]}` : undefined}
          primaryTypographyProps={{
            sx: { 
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem'
            }
          }}
          secondaryTypographyProps={{
            sx: { fontSize: '0.75rem' }
          }}
          sx={{ opacity: isAccessible ? 1 : 0.6 }}
        />
        {hasSubModules && (
          isOpen ? 
            <ExpandLess sx={{ color: '#8b5cf6' }} /> : 
            <ExpandMore sx={{ color: '#3b82f6' }} />
        )}
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
    <Box sx={{ px: 1 }}>
      {/* Core Modules Section */}
      <Box className="px-2 py-2 mb-1">
        <Typography variant="caption" className="text-gray-500 font-semibold uppercase tracking-wider" sx={{ fontSize: '0.7rem' }}>
          Core Modules
        </Typography>
      </Box>
      <List sx={{ py: 0 }}>
        {coreModules.map(module => renderModule(module))}
      </List>
      
      {/* Optional Modules Section */}
      {optionalModules.length > 0 && (
        <>
          <Divider sx={{ my: 2, borderColor: 'rgba(59, 130, 246, 0.1)' }} />
          <Box className="px-2 py-2 mb-1">
            <Typography variant="caption" className="text-gray-500 font-semibold uppercase tracking-wider" sx={{ fontSize: '0.7rem' }}>
              Premium Modules
            </Typography>
          </Box>
          <List sx={{ py: 0 }}>
            {optionalModules.map(module => renderModule(module))}
          </List>
        </>
      )}
    </Box>
  );
} 