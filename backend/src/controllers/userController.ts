import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken';
// Import Prisma namespace from default path
import { Prisma, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { setupUserDefaults } from '../utils/setupUserDefaults';

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        res.status(400).json({ message: 'Please provide email and password' });
        return;
    }

    try {
        // Check if user exists
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with default role
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER' // Add default role
            },
        });

        if (user) {
            // Set up default ingredients, units, and categories for the new user
            // Run this asynchronously so we don't delay the response
            // TODO: Call setupUserDefaults when user is assigned to a restaurant
            // setupUserDefaults(user.id, restaurantId).catch(err => {
            //     console.error(`Error setting up defaults for user ${user.id}:`, err);
            // });
            
            const token = generateToken(user.id, user.role);
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // Include role in response
                token: token,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        console.error('Register Error:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
             res.status(400).json({ message: 'Email address already registered' });
             return;
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Please provide email and password' });
        return;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                password: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                phone: true,
                isCustomer: true
            }
        });

        // Check if user exists
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Check if user has a password set (should not be null/undefined)
        if (!user.password) {
            console.error(`User ${user.id} (${user.email}) has no password set`);
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Ensure user has a role, use default if not set
        const userRole = user.role || 'USER';
        
        // If the user doesn't have a role in the database, update it
        if (!user.role) {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'USER' }
            });
            console.log(`Updated user ${user.id} with default role USER`);
        }
        
        // Generate JWT token with fallback for JWT_SECRET
        // Using inline jwt.sign instead of generateToken to ensure fallback works
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                role: userRole 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );
        
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: userRole,
            token: token,
            createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
            updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString(),
            phone: user.phone || undefined,
            isCustomer: user.isCustomer || false,
            // Optional fields that may not exist in User model
            company: undefined,
            position: undefined,
            address: undefined,
            bio: undefined
        });
    } catch (error) {
        console.error('Login Error:', error);
        console.error('Login Error Details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
        });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public (or Private if needed)
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    // No server-side action needed for stateless JWT logout
    res.status(200).json({ message: 'Logout endpoint called (no action needed)' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (requires auth middleware)
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    // User should be attached to req by auth middleware
    // We need to define an interface for the Request object that includes the user
    // For now, assume req.user exists and has the user data
    const user = (req as any).user; 

    if (user) {
         res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
        });
    } else {
        // This case shouldn't be reachable if middleware is working
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get user's restaurant assignments
// @route   GET /api/user/restaurants
// @access  Private
export const getUserRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Use raw SQL to avoid Prisma schema mismatch issues
    const assignments: any[] = await prisma.$queryRaw`
      SELECT 
        r.id,
        r.name,
        r.slug,
        r.is_active as "isActive"
      FROM restaurant_staff rs
      JOIN restaurants r ON rs.restaurant_id = r.id
      WHERE rs.user_id = ${req.user.id}
        AND rs.is_active = true
        AND r.is_active = true
    `;

    // Convert the raw result to match expected format
    const restaurants = assignments.map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      isActive: r.isActive
    }));

    res.json({ restaurants });
  } catch (error) {
    console.error('Get user restaurants error:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

// Potential future: Update user profile
// export const updateUserProfile = async (req: Request, res: Response): Promise<void> => { ... }; 