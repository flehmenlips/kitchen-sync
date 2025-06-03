import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import KitchenIcon from '@mui/icons-material/Kitchen';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WebIcon from '@mui/icons-material/Web';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';
import BlenderIcon from '@mui/icons-material/Blender';
import ClassIcon from '@mui/icons-material/Class';
import ScaleIcon from '@mui/icons-material/Scale';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BugReportIcon from '@mui/icons-material/BugReport';

export type ModuleType = 'core' | 'optional';
export type SubscriptionTier = 'TRIAL' | 'FREE' | 'HOME' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface SubModule {
  id: string;
  name: string;
  icon: React.ComponentType;
  path: string;
}

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  requiredTier: SubscriptionTier[];
  icon: React.ComponentType;
  path: string;
  subModules?: SubModule[];
}

// Module definitions
export const modules: Module[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    type: 'core',
    requiredTier: ['TRIAL', 'FREE', 'HOME', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
    icon: DashboardIcon,
    path: '/dashboard'
  },
  {
    id: 'cookbook',
    name: 'CookBook',
    type: 'core',
    requiredTier: ['TRIAL', 'FREE', 'HOME', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
    icon: MenuBookIcon,
    path: '/recipes',
    subModules: [
      { id: 'recipes', name: 'Recipes', icon: MenuBookIcon, path: '/recipes' },
      { id: 'cookbook-settings', name: 'Settings', icon: SettingsIcon, path: '/cookbook/settings' }
    ]
  },
  {
    id: 'agilechef',
    name: 'AgileChef',
    type: 'core',
    requiredTier: ['TRIAL', 'FREE', 'HOME', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
    icon: KitchenIcon,
    path: '/prep',
    subModules: [
      { id: 'prep-board', name: 'Prep Board', icon: AssignmentIcon, path: '/prep' },
      { id: 'prep-settings', name: 'Settings', icon: SettingsIcon, path: '/prep/settings' }
    ]
  },
  {
    id: 'menubuilder',
    name: 'MenuBuilder',
    type: 'optional',
    requiredTier: ['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'],
    icon: RestaurantMenuIcon,
    path: '/menus',
    subModules: [
      { id: 'menus', name: 'Menus', icon: RestaurantMenuIcon, path: '/menus' },
      { id: 'menu-settings', name: 'Settings', icon: SettingsIcon, path: '/menus/settings' }
    ]
  },
  {
    id: 'tablefarm',
    name: 'TableFarm',
    type: 'optional',
    requiredTier: ['TRIAL', 'PROFESSIONAL', 'ENTERPRISE'],
    icon: TableRestaurantIcon,
    path: '/reservations',
    subModules: [
      { id: 'tables', name: 'Tables', icon: TableRestaurantIcon, path: '/tables' },
      { id: 'reservations', name: 'Reservations', icon: TableRestaurantIcon, path: '/reservations' },
      { id: 'tablefarm-settings', name: 'Settings', icon: SettingsIcon, path: '/tablefarm/settings' }
    ]
  },
  {
    id: 'chefrail',
    name: 'ChefRail',
    type: 'optional',
    requiredTier: ['TRIAL', 'PROFESSIONAL', 'ENTERPRISE'],
    icon: RestaurantIcon,
    path: '/orders',
    subModules: [
      { id: 'orders', name: 'Orders', icon: RestaurantIcon, path: '/orders' },
      { id: 'kitchen-display', name: 'Kitchen Display', icon: RestaurantIcon, path: '/kitchen' },
      { id: 'chefrail-settings', name: 'Settings', icon: SettingsIcon, path: '/chefrail/settings' }
    ]
  },
  {
    id: 'website',
    name: 'Website & Marketing',
    type: 'optional',
    requiredTier: ['TRIAL', 'PROFESSIONAL', 'ENTERPRISE'],
    icon: WebIcon,
    path: '/website',
    subModules: [
      { id: 'website-builder', name: 'Website Builder', icon: WebIcon, path: '/website' },
      { id: 'content-blocks', name: 'Content Blocks', icon: WebIcon, path: '/website/content' },
      { id: 'website-settings', name: 'Settings', icon: SettingsIcon, path: '/website/settings' }
    ]
  }
];

// Helper functions
export function getAccessibleModules(tier: SubscriptionTier, enabledModules?: string[]): Module[] {
  return modules.filter(module => {
    // Check if user's tier allows access
    if (!module.requiredTier.includes(tier)) {
      return false;
    }
    
    // For TRIAL, all modules are accessible
    if (tier === 'TRIAL') {
      return true;
    }
    
    // For optional modules, check if they're enabled
    if (module.type === 'optional' && module.id !== 'dashboard') {
      return enabledModules?.includes(module.id) ?? false;
    }
    
    return true;
  });
}

export function canAccessModule(moduleId: string, tier: SubscriptionTier, enabledModules?: string[]): boolean {
  const module = modules.find(m => m.id === moduleId);
  if (!module) return false;
  
  // Check tier requirement
  if (!module.requiredTier.includes(tier)) {
    return false;
  }
  
  // For TRIAL, all modules are accessible
  if (tier === 'TRIAL') {
    return true;
  }
  
  // For optional modules, check if enabled
  if (module.type === 'optional') {
    return enabledModules?.includes(moduleId) ?? false;
  }
  
  return true;
} 