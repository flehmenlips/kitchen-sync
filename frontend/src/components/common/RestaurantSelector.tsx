import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Typography,
  Box,
  CircularProgress,
  Chip
} from '@mui/material';
import { Business } from '@mui/icons-material';
import { useRestaurant } from '../../context/RestaurantContext';

const RestaurantSelector: React.FC = () => {
  const { currentRestaurant, restaurants, isLoading, setCurrentRestaurant } = useRestaurant();

  if (isLoading) {
    return <CircularProgress size={20} />;
  }

  if (restaurants.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No restaurants assigned
      </Typography>
    );
  }

  // If only one restaurant, just show it as a chip
  if (restaurants.length === 1) {
    return (
      <Chip
        icon={<Business />}
        label={restaurants[0].name}
        color="primary"
        variant="outlined"
      />
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <Select
        value={currentRestaurant?.id || ''}
        onChange={(e) => {
          const restaurant = restaurants.find(r => r.id === Number(e.target.value));
          setCurrentRestaurant(restaurant || null);
        }}
        displayEmpty
        startAdornment={<Business sx={{ mr: 1, color: 'text.secondary' }} />}
        sx={{
          backgroundColor: 'background.paper',
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center'
          }
        }}
      >
        <MenuItem value="" disabled>
          <em>Select Restaurant</em>
        </MenuItem>
        {restaurants.map((restaurant) => (
          <MenuItem key={restaurant.id} value={restaurant.id}>
            <Box>
              <Typography variant="body2">{restaurant.name}</Typography>
              {!restaurant.isActive && (
                <Typography variant="caption" color="text.secondary">
                  (Inactive)
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default RestaurantSelector; 