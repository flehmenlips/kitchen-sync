import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Skeleton,
  Alert,
  Container,
  Chip,
  useTheme
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  Timer as TimerIcon,
  LocalOffer as TagIcon
} from '@mui/icons-material';
import { getMenus, Menu } from '../../services/apiService';
import { restaurantSettingsService, RestaurantSettings } from '../../services/restaurantSettingsService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`menu-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerMenuPage: React.FC = () => {
  const theme = useTheme();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  useEffect(() => {
    fetchMenusAndSettings();
  }, []);

  const fetchMenusAndSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch both menus and settings
      const [allMenus, settingsData] = await Promise.all([
        getMenus(),
        restaurantSettingsService.getPublicSettings()
      ]);
      
      setSettings(settingsData);
      
      // Filter menus based on activeMenuIds from settings
      let activeMenus = allMenus;
      
      if (settingsData.activeMenuIds && settingsData.activeMenuIds.length > 0) {
        // Only show menus that are in the activeMenuIds list
        activeMenus = allMenus.filter(menu => 
          settingsData.activeMenuIds!.includes(menu.id)
        );
      }
      
      // Further filter to only show non-archived menus with active sections
      const publicMenus = activeMenus
        .filter(menu => !menu.isArchived)
        .map(menu => ({
          ...menu,
          sections: menu.sections
            ?.filter(s => s.active && !s.deleted)
            .map(section => ({
              ...section,
              items: section.items?.filter(i => i.active && !i.deleted) || []
            })) || []
        }))
        .filter(menu => menu.sections.length > 0);
        
      setMenus(publicMenus);
    } catch (err) {
      console.error('Error fetching menus:', err);
      setError('Unable to load menu at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatPrice = (price: string | undefined, menu: Menu) => {
    if (!price) return '';
    const priceNum = parseFloat(price);
    const formatted = menu.showDecimals ? priceNum.toFixed(2) : Math.floor(priceNum).toString();
    return menu.showDollarSign ? `$${formatted}` : formatted;
  };

  const renderMenuItem = (item: any, menu: Menu) => {
    return (
      <Box key={item.id} sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: menu.font || 'inherit',
                fontWeight: 'medium',
                color: menu.textColor || 'inherit'
              }}
            >
              {item.name}
            </Typography>
            {item.description && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 0.5,
                  fontFamily: menu.font || 'inherit',
                  color: menu.textColor || 'text.secondary'
                }}
              >
                {item.description}
              </Typography>
            )}
          </Box>
          {item.price && (
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: menu.font || 'inherit',
                fontWeight: 'bold',
                color: menu.accentColor || theme.palette.primary.main
              }}
            >
              {formatPrice(item.price, menu)}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={30} sx={{ mt: 1 }} />
        </Box>
        <Paper sx={{ p: 3 }}>
          {[1, 2, 3].map(i => (
            <Box key={i} sx={{ mb: 3 }}>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="20%" height={25} sx={{ mt: 1 }} />
            </Box>
          ))}
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (menus.length === 0) {
    return (
      <Container maxWidth="md">
        <Box textAlign="center" sx={{ mt: 8 }}>
          <RestaurantIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Menus Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please check back later for our menu offerings.
          </Typography>
        </Box>
      </Container>
    );
  }

  // If only one menu, don't show tabs
  if (menus.length === 1) {
    const menu = menus[0];
    return (
      <Container maxWidth="md">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {menu.title && (
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontFamily: menu.font || 'inherit',
                color: menu.textColor || 'inherit'
              }}
            >
              {menu.title}
            </Typography>
          )}
          {menu.subtitle && (
            <Typography 
              variant="h5" 
              color="text.secondary"
              sx={{ 
                fontFamily: menu.font || 'inherit',
                color: menu.textColor || 'text.secondary'
              }}
            >
              {menu.subtitle}
            </Typography>
          )}
        </Box>

        <Paper 
          sx={{ 
            p: 4,
            backgroundColor: menu.backgroundColor || 'background.paper',
            color: menu.textColor || 'text.primary'
          }}
        >
          {menu.sections?.map((section, sectionIndex) => (
            <Box key={section.id || sectionIndex} sx={{ mb: 4 }}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  fontFamily: menu.font || 'inherit',
                  color: menu.accentColor || theme.palette.primary.main,
                  mb: 2
                }}
              >
                {section.name}
              </Typography>
              
              {menu.showSectionDividers && (
                <Divider 
                  sx={{ 
                    mb: 3,
                    borderColor: menu.accentColor || 'divider'
                  }} 
                />
              )}

              {section.items.map(item => renderMenuItem(item, menu))}
            </Box>
          ))}
        </Paper>
      </Container>
    );
  }

  // Multiple menus - show tabs
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Our Menus
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {menus.map((menu, index) => (
            <Tab key={menu.id} label={menu.name} />
          ))}
        </Tabs>
      </Paper>

      {menus.map((menu, index) => (
        <TabPanel key={menu.id} value={tabValue} index={index}>
          <Paper 
            sx={{ 
              p: 4,
              backgroundColor: menu.backgroundColor || 'background.paper',
              color: menu.textColor || 'text.primary'
            }}
          >
            {menu.title && (
              <Typography 
                variant="h4" 
                gutterBottom 
                align="center"
                sx={{ 
                  fontFamily: menu.font || 'inherit',
                  color: menu.textColor || 'inherit',
                  mb: 3
                }}
              >
                {menu.title}
              </Typography>
            )}

            {menu.sections?.map((section) => (
              <Box key={section.id} sx={{ mb: 4 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    fontFamily: menu.font || 'inherit',
                    color: menu.accentColor || theme.palette.primary.main,
                    mb: 2
                  }}
                >
                  {section.name}
                </Typography>
                
                {menu.showSectionDividers && (
                  <Divider 
                    sx={{ 
                      mb: 3,
                      borderColor: menu.accentColor || 'divider'
                    }} 
                  />
                )}

                {section.items.map(item => renderMenuItem(item, menu))}
              </Box>
            ))}
          </Paper>
        </TabPanel>
      ))}
    </Container>
  );
};

export default CustomerMenuPage; 