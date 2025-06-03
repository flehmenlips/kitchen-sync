import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  Alert,
  Button,
  Stack
} from '@mui/material';
import {
  Category as CategoryIcon,
  Blender as IngredientIcon,
  Class as IngredientCategoryIcon,
  Scale as UnitIcon,
  ArrowForward,
  Add,
  ArrowBack
} from '@mui/icons-material';

interface SettingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  addPath: string;
  count?: number;
}

const CookBookSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const settingItems: SettingItem[] = [
    {
      id: 'categories',
      title: 'Recipe Categories',
      description: 'Organize recipes by type (e.g., Appetizers, Main Courses, Desserts)',
      icon: <CategoryIcon />,
      path: '/categories',
      addPath: '/categories/new'
    },
    {
      id: 'ingredients',
      title: 'Ingredients',
      description: 'Manage your ingredient inventory and specifications',
      icon: <IngredientIcon />,
      path: '/ingredients',
      addPath: '/ingredients/new'
    },
    {
      id: 'ingredient-categories',
      title: 'Ingredient Categories',
      description: 'Group ingredients by type (e.g., Proteins, Vegetables, Dairy)',
      icon: <IngredientCategoryIcon />,
      path: '/ingredient-categories',
      addPath: '/ingredient-categories/new'
    },
    {
      id: 'units',
      title: 'Units of Measure',
      description: 'Define measurement units used in recipes (e.g., cups, grams, liters)',
      icon: <UnitIcon />,
      path: '/units',
      addPath: '/units/new'
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <IconButton onClick={() => navigate('/recipes')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" gutterBottom>
              CookBook Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage categories, ingredients, and units for your recipes
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        These settings help organize your recipe database. Changes here will affect how recipes are categorized and how ingredients are tracked.
      </Alert>

      <Paper sx={{ overflow: 'hidden' }}>
        <List sx={{ p: 0 }}>
          {settingItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider />}
              <ListItem
                disablePadding
                secondaryAction={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(item.addPath);
                      }}
                    >
                      Add New
                    </Button>
                    <IconButton
                      edge="end"
                      onClick={() => handleNavigate(item.path)}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemButton 
                  onClick={() => handleNavigate(item.path)}
                  sx={{ py: 3, px: 3 }}
                >
                  <ListItemIcon sx={{ minWidth: 56 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.light',
                        color: 'primary.main'
                      }}
                    >
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="h6" component="div">
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ mt: 3, p: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Quick Tips
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            • <strong>Categories</strong> help customers find recipes quickly on your menus
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>Ingredients</strong> track costs and manage inventory across recipes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>Ingredient Categories</strong> organize ingredients for easier selection
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • <strong>Units</strong> ensure consistent measurements across all recipes
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};

export default CookBookSettingsPage; 