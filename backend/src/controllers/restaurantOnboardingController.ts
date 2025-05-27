import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import generateToken from '../utils/generateToken';
import { Prisma, OnboardingStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { setupRestaurantDefaults } from '../utils/setupRestaurantDefaults';
import { emailService } from '../services/emailService';

interface RestaurantRegistrationData {
  // Owner info
  ownerName: string;
  email: string;
  password: string;
  
  // Restaurant info
  restaurantName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Business details
  cuisineType: string;
  seatingCapacity?: number;
  operatingHours?: string;
}

// @desc    Register a new restaurant with owner account
// @route   POST /api/restaurant-onboarding/register
// @access  Public
export const registerRestaurant = async (req: Request, res: Response): Promise<void> => {
  const data: RestaurantRegistrationData = req.body;
  
  // Validate required fields
  if (!data.email || !data.password || !data.restaurantName) {
    res.status(400).json({ message: 'Please provide all required fields' });
    return;
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      res.status(400).json({ message: 'An account with this email already exists' });
      return;
    }

    // Start a transaction to create everything atomically
    const result = await prisma.$transaction(async (tx) => {
      // 1. Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      // 2. Create the user as ADMIN (restaurant owner) - NOT verified yet
      const user = await tx.user.create({
        data: {
          name: data.ownerName,
          email: data.email,
          password: hashedPassword,
          role: 'ADMIN' // Restaurant owner gets ADMIN role for their restaurant only
        }
      });

      // 3. Create email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
      
      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: hashedToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      // 4. Create the restaurant (but not active until verified)
      const restaurant = await tx.restaurant.create({
        data: {
          name: data.restaurantName,
          slug: data.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          isActive: false, // Not active until email verified
          // Platform fields
          onboardingStatus: OnboardingStatus.PENDING, // Pending until verified
          ownerName: data.ownerName,
          ownerEmail: data.email,
          businessPhone: data.phone,
          businessAddress: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`,
          verifiedAt: null // Not verified yet
        }
      });

      // 5. Link user to restaurant as staff
      await tx.restaurantStaff.create({
        data: {
          userId: user.id,
          restaurantId: restaurant.id,
          isActive: false // Not active until verified
        }
      });

      // 6. Create trial subscription (but inactive)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

      await tx.subscription.create({
        data: {
          restaurantId: restaurant.id,
          plan: SubscriptionPlan.TRIAL,
          status: SubscriptionStatus.SUSPENDED, // Suspended until verified
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndDate,
          trialEndsAt: trialEndDate,
          seats: 5,
          billingEmail: data.email,
          billingName: data.ownerName
        }
      });

      // 7. Create restaurant settings
      await tx.restaurantSettings.create({
        data: {
          restaurantId: restaurant.id,
          websiteName: data.restaurantName,
          tagline: `Welcome to ${data.restaurantName}`,
          heroTitle: data.restaurantName,
          heroSubtitle: `Experience exceptional ${data.cuisineType} cuisine`,
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          openingHours: data.operatingHours ? parseOperatingHours(data.operatingHours) : getDefaultHours()
        }
      });

      // 8. Create default prep columns for AgileChef
      const prepColumns = ['To Do', 'In Progress', 'Ready', 'Done'];
      for (let i = 0; i < prepColumns.length; i++) {
        await tx.prepColumn.create({
          data: {
            name: prepColumns[i],
            order: i,
            userId: user.id
          }
        });
      }

      // 9. Log platform action if platform admin exists
      const platformAdmin = await tx.platformAdmin.findFirst();
      if (platformAdmin) {
        await tx.platformAction.create({
          data: {
            adminId: platformAdmin.id,
            action: 'RESTAURANT_SELF_SIGNUP',
            entityType: 'restaurant',
            entityId: restaurant.id,
            metadata: {
              restaurantName: data.restaurantName,
              ownerEmail: data.email,
              source: 'self_service',
              status: 'pending_verification'
            }
          }
        });
      }

      return { user, restaurant, verificationToken };
    });

    // 10. Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${result.verificationToken}`;
    await emailService.sendRestaurantVerificationEmail(
      data.email,
      data.ownerName,
      data.restaurantName,
      verificationUrl
    );

    // 11. Return success response (but don't log them in yet)
    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true
    });

  } catch (error) {
    console.error('Restaurant registration error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        res.status(400).json({ message: 'A restaurant with this information already exists' });
        return;
      }
    }
    
    res.status(500).json({ message: 'Failed to create restaurant account. Please try again.' });
  }
};

// Helper function to parse operating hours string
function parseOperatingHours(hoursString: string): any {
  // For now, return default hours
  // In a real implementation, you'd parse the string
  return getDefaultHours();
}

// Helper function for default hours
function getDefaultHours(): any {
  return {
    monday: { open: "11:00", close: "22:00" },
    tuesday: { open: "11:00", close: "22:00" },
    wednesday: { open: "11:00", close: "22:00" },
    thursday: { open: "11:00", close: "22:00" },
    friday: { open: "11:00", close: "23:00" },
    saturday: { open: "11:00", close: "23:00" },
    sunday: { open: "11:00", close: "21:00" }
  };
}

// @desc    Check if email is available
// @route   GET /api/restaurant-onboarding/check-email
// @access  Public
export const checkEmailAvailability = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    res.status(400).json({ message: 'Email is required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    res.json({ 
      available: !existingUser,
      message: existingUser ? 'This email is already registered' : 'Email is available'
    });
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({ message: 'Error checking email availability' });
  }
};

// @desc    Verify email and activate restaurant
// @route   POST /api/restaurant-onboarding/verify-email
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body;

  if (!token) {
    res.status(400).json({ message: 'Verification token is required' });
    return;
  }

  try {
    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the token
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        token: hashedToken,
        expiresAt: { gt: new Date() },
        usedAt: null
      },
      include: {
        user: true
      }
    });

    if (!verificationToken) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    // Update everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark token as used
      await tx.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() }
      });

      // 2. Find and activate the restaurant
      const restaurantStaff = await tx.restaurantStaff.findFirst({
        where: { userId: verificationToken.userId },
        include: { restaurant: true }
      });

      if (!restaurantStaff) {
        throw new Error('Restaurant not found');
      }

      // 3. Activate restaurant
      const restaurant = await tx.restaurant.update({
        where: { id: restaurantStaff.restaurantId },
        data: {
          isActive: true,
          onboardingStatus: OnboardingStatus.ACTIVE,
          verifiedAt: new Date()
        }
      });

      // 4. Activate restaurant staff link
      await tx.restaurantStaff.update({
        where: { id: restaurantStaff.id },
        data: { isActive: true }
      });

      // 5. Activate subscription
      await tx.subscription.updateMany({
        where: { restaurantId: restaurant.id },
        data: { status: SubscriptionStatus.TRIAL }
      });

      // 6. Log platform action
      const platformAdmin = await tx.platformAdmin.findFirst();
      if (platformAdmin) {
        await tx.platformAction.create({
          data: {
            adminId: platformAdmin.id,
            action: 'RESTAURANT_EMAIL_VERIFIED',
            entityType: 'restaurant',
            entityId: restaurant.id,
            metadata: {
              restaurantName: restaurant.name,
              ownerEmail: verificationToken.user.email
            }
          }
        });
      }

      return { user: verificationToken.user, restaurant };
    });

    // 7. Set up sample data asynchronously
    setupRestaurantDefaults(result.restaurant.id, result.user.id).catch(err => {
      console.error(`Error setting up defaults for restaurant ${result.restaurant.id}:`, err);
    });

    // 8. Send welcome email
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    await emailService.sendRestaurantWelcomeEmail(
      result.user.email,
      result.user.name!,
      result.restaurant.name,
      loginUrl
    );

    // 9. Generate token and return success
    const authToken = generateToken(result.user.id, result.user.role);
    
    res.status(200).json({
      message: 'Email verified successfully!',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        token: authToken
      },
      restaurant: {
        id: result.restaurant.id,
        name: result.restaurant.name,
        slug: result.restaurant.slug
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Failed to verify email. Please try again.' });
  }
}; 