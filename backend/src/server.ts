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
import commentRoutes from './routes/commentRoutes';
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
    return subdomainPattern.test(origin);
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

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve React app build files (if in production)
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
}

// Routes
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
app.use('/api/issues', commentRoutes); // Mount comment routes under issues
app.use('/api/prep-tasks', prepTaskRoutes);
app.use('/api/prep-columns', prepColumnRoutes);
app.use('/api/menus', menuRoutes); // Mount menu routes
app.use('/api/reservations', reservationRoutes); // Mount reservation routes
app.use('/api/orders', orderRoutes); // Mount order routes
app.use('/api/restaurant', restaurantSettingsRoutes); // Mount restaurant settings routes
app.use('/api/content-blocks', contentBlockRoutes); // Mount content block routes
app.use('/api/admin', adminRoutes); // Mount admin routes
app.use('/api/platform', platformRoutes); // Mount platform routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes (must be after API routes)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
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
}); 