import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import recipeRoutes from './routes/recipeRoutes';
import unitRoutes from './routes/unitRoutes'; // Import unit routes
import ingredientRoutes from './routes/ingredientRoutes'; // Import ingredient routes
import categoryRoutes from './routes/categoryRoutes'; // Import category routes
import ingredientCategoryRoutes from './routes/ingredientCategoryRoutes'; // Import ingredient category routes
import userRoutes from './routes/userRoutes'; // Import user routes
import { Request, Response, NextFunction } from 'express';

// Load environment variables
dotenv.config(); // Loads variables from .env file in the current directory (backend/)

const app = express();

// Middleware
app.use(cors({ 
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow frontend origin
    // credentials: true // Remove - not needed for Bearer token
})); 
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Routes
app.use('/api/users', userRoutes); // Mount user routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/units', unitRoutes); // Mount unit routes
app.use('/api/ingredients', ingredientRoutes); // Mount ingredient routes
app.use('/api/categories', categoryRoutes); // Mount category routes
app.use('/api/ingredient-categories', ingredientCategoryRoutes); // Mount ingredient category routes

// Basic route for testing
app.get('/', (req, res) => {
  res.send('KitchenSync Backend API Running...');
});

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