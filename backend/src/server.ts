import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // Add path module
import recipeRoutes from './routes/recipeRoutes';
import unitRoutes from './routes/unitRoutes'; // Import unit routes
import ingredientRoutes from './routes/ingredientRoutes'; // Import ingredient routes
import categoryRoutes from './routes/categoryRoutes'; // Import category routes
import ingredientCategoryRoutes from './routes/ingredientCategoryRoutes'; // Import ingredient category routes
import userRoutes from './routes/userRoutes'; // Import user routes
import dashboardRoutes from './routes/dashboardRoutes'; // <-- Import dashboard routes
import issueRoutes from './routes/issueRoutes';
import prepTaskRoutes from './routes/prepTaskRoutes';
import prepColumnRoutes from './routes/prepColumnRoutes';
import menuRoutes from './routes/menuRoutes'; // Import menu routes
import reservationRoutes from './routes/reservationRoutes'; // Import reservation routes
import orderRoutes from './routes/orderRoutes'; // Import order routes
import restaurantSettingsRoutes from './routes/restaurantSettingsRoutes';
import contentBlockRoutes from './routes/contentBlockRoutes';
import customerAuthRoutes from './routes/customerAuthRoutes'; // Import customer auth routes
import customerReservationRoutes from './routes/customerReservationRoutes'; // Import customer reservation routes
import adminRoutes from './routes/adminRoutes'; // Import admin routes
import platformRoutes from './routes/platformRoutes'; // Import platform routes
import restaurantOnboardingRoutes from './routes/restaurantOnboardingRoutes'; // Import restaurant onboarding routes
import subscriptionRoutes from './routes/subscriptionRoutes'; // Import subscription routes
import templateRoutes from './routes/templateRoutes'; // Import template routes
import restaurantTemplateRoutes from './routes/restaurantTemplateRoutes'; // Import restaurant template routes
import pageRoutes from './routes/pageRoutes'; // Import page routes
import websiteBuilderRoutes from './routes/websiteBuilderRoutes'; // Import website builder routes
import themingRoutes from './routes/themingRoutes'; // Import theming routes
import assetRoutes from './routes/assetRoutes'; // Import asset routes
import { Request, Response, NextFunction } from 'express';
import { protect } from './middleware/authMiddleware';
import { setRestaurantContext } from './middleware/restaurantContext';

// Load environment variables
dotenv.config(); // Loads variables from .env file in the current directory (backend/)

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://kitchen-sync-app.onrender.com',
    'https://kitchensync.app', // Add your custom domain if you have one
    // New domains
    'https://kitchensync.restaurant',
    'https://www.kitchensync.restaurant',
    'https://api.kitchensync.restaurant'
];

// Helper function to check if origin is a valid subdomain
const isValidSubdomain = (origin: string): boolean => {
    // Pattern to match any subdomain of kitchensync.restaurant
    const subdomainPattern = /^https:\/\/([a-z0-9-]+\.)?kitchensync\.restaurant$/;
    // Pattern to match Render preview URLs (kitchen-sync-app-pr-*.onrender.com)
    const renderPreviewPattern = /^https:\/\/kitchen-sync-app-pr-[\d]+\.onrender\.com$/;
    
    return subdomainPattern.test(origin) || renderPreviewPattern.test(origin);
};

app.use(cors({ 
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // Check static allowed origins
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } 
        // Check if it's a valid subdomain
        else if (isValidSubdomain(origin)) {
            callback(null, true);
        }
        // Allow all origins in development
        else if (process.env.NODE_ENV === 'development') {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true // Enable credentials for authentication
})); 

// Optional: Add subdomain logging middleware
app.use((req, res, next) => {
    const host = req.get('host');
    if (host && process.env.NODE_ENV !== 'development') {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'kitchensync' && subdomain !== 'www' && subdomain !== 'api') {
            console.log(`[Subdomain Request] Restaurant: ${subdomain}, Path: ${req.path}`);
        }
    }
    next();
});

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')?.substring(0, 50)}...`);
    next();
});

// Conditional JSON body parser - skip for Stripe webhooks
app.use((req, res, next) => {
  if (req.originalUrl === '/api/platform/webhooks/stripe') {
    // Skip JSON body parser for Stripe webhooks
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Health check endpoint - MUST be before static files
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), deployment: 'routing-fix-v4' });
});

// Test endpoint to verify routing fix - MUST be before static files
app.get('/api/test-routing', (req, res) => {
  res.json({ 
    message: 'API routing is working correctly!', 
    timestamp: new Date().toISOString(),
    deployment: 'routing-fix-v4'
  });
});

// ALL API Routes - MUST be before static files
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/auth/customer', customerAuthRoutes); // Mount customer auth routes
app.use('/api/customer/reservations', customerReservationRoutes); // Mount customer reservation routes
app.use('/api/restaurant-onboarding', restaurantOnboardingRoutes); // Mount restaurant onboarding routes
app.use('/api/subscription', subscriptionRoutes); // Mount subscription routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/units', unitRoutes); // Mount unit routes
app.use('/api/ingredients', ingredientRoutes); // Mount ingredient routes
app.use('/api/categories', categoryRoutes); // Mount category routes
app.use('/api/ingredient-categories', ingredientCategoryRoutes); // Mount ingredient category routes
app.use('/api/dashboard', dashboardRoutes); // <-- Mount dashboard routes
app.use('/api/issues', issueRoutes);
app.use('/api/prep-tasks', prepTaskRoutes);
app.use('/api/prep-columns', prepColumnRoutes);
app.use('/api/menus', menuRoutes); // Mount menu routes
app.use('/api/reservations', reservationRoutes); // Mount reservation routes
app.use('/api/orders', orderRoutes); // Mount order routes
app.use('/api/restaurant', restaurantSettingsRoutes); // Mount restaurant settings routes
app.use('/api/content-blocks', contentBlockRoutes); // Mount content block routes
app.use('/api/pages', pageRoutes); // Mount page routes
app.use('/api/website-builder', websiteBuilderRoutes); // Mount website builder routes
app.use('/api/admin', adminRoutes); // Mount admin routes
app.use('/api/platform', platformRoutes); // Mount platform routes
app.use('/api/templates', templateRoutes); // Mount template routes
app.use('/api/restaurant-templates', restaurantTemplateRoutes); // Mount restaurant template routes
app.use('/api/theming', themingRoutes); // Mount theming routes
app.use('/api/assets', assetRoutes); // Mount asset routes

// Serve static files ONLY for non-API routes (AFTER API routes)
app.use((req, res, next) => {
  // Skip static file serving for API routes and health check
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }
  // Serve static files for everything else
  express.static(path.join(__dirname, '../public'))(req, res, next);
});

// Serve React app for all other NON-API routes (must be after API routes)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Double-check we're not serving HTML for API routes
    if (req.path.startsWith('/api/') || req.path === '/health') {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
} else {
  // In development, just show a message for non-API routes
  app.get('/', (req, res) => {
    res.send('KitchenSync Backend API Running...');
  });
}

// --- Error Handling Middleware --- 
// Not found handler (if route doesn't exist)
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// General error handler (catches errors passed via next(error))
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // Default to 500 if status code not already set (e.g., by auth middleware)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        // Provide stack trace only in development
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
});

// Read port from environment variables or default to 3001
const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log('🎯 FINAL FIX v6 - Frontend API URLs corrected to point to api.kitchensync.restaurant');
}); 