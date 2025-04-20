import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcrypt';
import generateToken from '../utils/generateToken';
// Import Prisma namespace/types from default path
import { Prisma, PrismaClientKnownRequestError } from '@prisma/client';

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

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        if (user) {
            const token = generateToken(user.id);
            res.status(201).json({
                id: user.id,
                name: user.name,
                email: user.email,
                token: token,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        console.error('Register Error:', error);
        // Access error type via namespace
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') { 
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
        const user = await prisma.user.findUnique({ where: { email } });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = generateToken(user.id);
            res.status(200).json({
                id: user.id,
                name: user.name,
                email: user.email,
                token: token,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
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

// Potential future: Update user profile
// export const updateUserProfile = async (req: Request, res: Response): Promise<void> => { ... }; 