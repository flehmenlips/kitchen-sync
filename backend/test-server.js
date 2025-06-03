require('dotenv').config();
const express = require('express');

console.log('Starting test server...');

try {
  const app = express();
  
  // Try mounting each route one by one
  console.log('Mounting routes...');
  
  const routes = [
    { path: '/api/users', module: './dist/routes/userRoutes.js' },
    { path: '/api/auth/customer', module: './dist/routes/customerAuthRoutes.js' },
    { path: '/api/customer/reservations', module: './dist/routes/customerReservationRoutes.js' },
    { path: '/api/restaurant-onboarding', module: './dist/routes/restaurantOnboardingRoutes.js' },
    { path: '/api/subscription', module: './dist/routes/subscriptionRoutes.js' },
    { path: '/api/recipes', module: './dist/routes/recipeRoutes.js' },
    { path: '/api/units', module: './dist/routes/unitRoutes.js' },
    { path: '/api/ingredients', module: './dist/routes/ingredientRoutes.js' },
    { path: '/api/categories', module: './dist/routes/categoryRoutes.js' },
    { path: '/api/ingredient-categories', module: './dist/routes/ingredientCategoryRoutes.js' },
    { path: '/api/dashboard', module: './dist/routes/dashboardRoutes.js' },
    { path: '/api/issues', module: './dist/routes/issueRoutes.js' },
    { path: '/api/prep-tasks', module: './dist/routes/prepTaskRoutes.js' },
    { path: '/api/prep-columns', module: './dist/routes/prepColumnRoutes.js' },
    { path: '/api/menus', module: './dist/routes/menuRoutes.js' },
    { path: '/api/reservations', module: './dist/routes/reservationRoutes.js' },
    { path: '/api/orders', module: './dist/routes/orderRoutes.js' },
    { path: '/api/restaurant', module: './dist/routes/restaurantSettingsRoutes.js' },
    { path: '/api/content-blocks', module: './dist/routes/contentBlockRoutes.js' },
    { path: '/api/admin', module: './dist/routes/adminRoutes.js' },
    { path: '/api/platform', module: './dist/routes/platformRoutes.js' }
  ];
  
  for (const route of routes) {
    try {
      console.log(`Mounting ${route.path}...`);
      const routeModule = require(route.module).default;
      app.use(route.path, routeModule);
      console.log(`✓ ${route.path} mounted successfully`);
    } catch (error) {
      console.error(`✗ Failed to mount ${route.path}:`);
      console.error(error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
  
  console.log('\nAll routes mounted successfully!');
  console.log('Starting server...');
  
  app.listen(3002, () => {
    console.log('Test server running on port 3002');
    console.log('No path-to-regexp errors detected!');
    process.exit(0);
  });
  
} catch (error) {
  console.error('Server startup error:');
  console.error(error.message);
  console.error(error.stack);
  process.exit(1);
} 