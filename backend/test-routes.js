const express = require('express');

// Test each route file individually
const routeFiles = [
  './dist/routes/userRoutes.js',
  './dist/routes/customerAuthRoutes.js',
  './dist/routes/customerReservationRoutes.js',
  './dist/routes/restaurantOnboardingRoutes.js',
  './dist/routes/subscriptionRoutes.js',
  './dist/routes/recipeRoutes.js',
  './dist/routes/unitRoutes.js',
  './dist/routes/ingredientRoutes.js',
  './dist/routes/categoryRoutes.js',
  './dist/routes/ingredientCategoryRoutes.js',
  './dist/routes/dashboardRoutes.js',
  './dist/routes/issueRoutes.js',
  './dist/routes/prepTaskRoutes.js',
  './dist/routes/prepColumnRoutes.js',
  './dist/routes/menuRoutes.js',
  './dist/routes/reservationRoutes.js',
  './dist/routes/orderRoutes.js',
  './dist/routes/restaurantSettingsRoutes.js',
  './dist/routes/contentBlockRoutes.js',
  './dist/routes/adminRoutes.js',
  './dist/routes/platformRoutes.js'
];

console.log('Testing routes...\n');

for (const routeFile of routeFiles) {
  try {
    console.log(`Testing ${routeFile}...`);
    const app = express();
    const routes = require(routeFile).default;
    app.use('/test', routes);
    console.log(`✓ ${routeFile} loaded successfully\n`);
  } catch (error) {
    console.error(`✗ ${routeFile} failed with error:`);
    console.error(error.message);
    console.error('\n');
  }
} 