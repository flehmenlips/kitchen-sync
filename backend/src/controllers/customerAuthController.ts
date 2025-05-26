import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generateEmailVerificationToken,
  generatePasswordResetToken,
  getTokenExpiryDate,
  verifyRefreshToken,
  isTokenExpired
} from '../utils/tokenUtils';
import { emailService } from '../services/emailService';
import { CustomerAuthRequest } from '../middleware/authenticateCustomer';

const prisma = new PrismaClient();

export const customerAuthController = {
  // Customer registration
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, restaurantId = 1 } = req.body;

      // Validate input
      if (!email || !password || !firstName) {
        return res.status(400).json({ 
          error: 'Email, password, and first name are required' 
        });
      }

      // Check if customer already exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { email }
      });

      if (existingCustomer) {
        return res.status(409).json({ 
          error: 'An account with this email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create customer and related data in a transaction
      const customer = await prisma.$transaction(async (tx) => {
        // Create customer
        const newCustomer = await tx.customer.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            restaurantId
          }
        });

        // Create customer preferences
        await tx.customerPreferences.create({
          data: {
            customerId: newCustomer.id
          }
        });

        // Create customer-restaurant link
        await tx.customerRestaurant.create({
          data: {
            customerId: newCustomer.id,
            restaurantId: restaurantId
          }
        });

        // Generate email verification token
        const verificationToken = generateEmailVerificationToken();
        const expiresAt = getTokenExpiryDate(24); // 24 hours
        
        // Store verification token directly in customer record
        await tx.customer.update({
          where: { id: newCustomer.id },
          data: {
            emailVerificationToken: verificationToken,
            emailVerificationExpires: expiresAt
          }
        });

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/customer/verify-email?token=${verificationToken}`;
        await emailService.sendVerificationEmail(email, firstName, verificationUrl);

        return newCustomer;
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: customer.id,
        email: customer.email,
        isCustomer: true,
        role: 'CUSTOMER'
      });

      // Create session
      const session = await prisma.customerSession.create({
        data: {
          customerId: customer.id,
          token: generateRefreshToken({
            userId: customer.id,
            email: customer.email,
            isCustomer: true,
            tokenId: 0 // Will be updated
          }),
          expiresAt: getTokenExpiryDate(24 * 30) // 30 days
        }
      });

      // Update session with its own ID
      const updatedSession = await prisma.customerSession.update({
        where: { id: session.id },
        data: {
          token: generateRefreshToken({
            userId: customer.id,
            email: customer.email,
            isCustomer: true,
            tokenId: session.id
          })
        }
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: customer.id,
          email: customer.email,
          name: `${customer.firstName}${customer.lastName ? ' ' + customer.lastName : ''}`,
          firstName: customer.firstName,
          lastName: customer.lastName,
          isCustomer: true,
          emailVerified: customer.emailVerified
        },
        accessToken,
        refreshToken: updatedSession.token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register customer' });
    }
  },

  // Customer login
  async login(req: Request, res: Response) {
    try {
      const { email, password, rememberMe } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email and password are required' 
        });
      }

      // Find customer
      const customer = await prisma.customer.findUnique({
        where: { email },
        include: { 
          customerPreferences: true,
          restaurantLinks: true
        }
      });

      if (!customer) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, customer.password);
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // Update last login
      await prisma.customer.update({
        where: { id: customer.id },
        data: { lastLogin: new Date() }
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: customer.id,
        email: customer.email,
        isCustomer: true,
        role: 'CUSTOMER'
      });

      let refreshTokenResponse = null;
      
      if (rememberMe) {
        // Create session for "remember me" functionality
        const session = await prisma.customerSession.create({
          data: {
            customerId: customer.id,
            token: '', // Temporary
            expiresAt: getTokenExpiryDate(24 * 30) // 30 days
          }
        });

        // Update with actual token containing the session ID
        const updatedSession = await prisma.customerSession.update({
          where: { id: session.id },
          data: {
            token: generateRefreshToken({
              userId: customer.id,
              email: customer.email,
              isCustomer: true,
              tokenId: session.id
            })
          }
        });

        refreshTokenResponse = updatedSession.token;
      }

      res.json({
        message: 'Login successful',
        user: {
          id: customer.id,
          email: customer.email,
          name: `${customer.firstName}${customer.lastName ? ' ' + customer.lastName : ''}`,
          firstName: customer.firstName,
          lastName: customer.lastName,
          isCustomer: true,
          emailVerified: customer.emailVerified,
          restaurantLinks: customer.restaurantLinks
        },
        accessToken,
        refreshToken: refreshTokenResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  },

  // Verify email
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ 
          error: 'Verification token is required' 
        });
      }

      // Find customer with this token
      const customer = await prisma.customer.findFirst({
        where: { 
          emailVerificationToken: token,
          emailVerificationExpires: {
            gt: new Date()
          }
        }
      });

      if (!customer) {
        return res.status(404).json({ 
          error: 'Invalid or expired verification token' 
        });
      }

      // Update customer
      await prisma.customer.update({
        where: { id: customer.id },
        data: { 
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null
        }
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(
        customer.email,
        customer.firstName || 'Customer'
      );

      res.json({
        message: 'Email verified successfully',
        user: {
          id: customer.id,
          email: customer.email,
          name: `${customer.firstName}${customer.lastName ? ' ' + customer.lastName : ''}`,
          firstName: customer.firstName,
          lastName: customer.lastName,
          isCustomer: true,
          emailVerified: true
        }
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Failed to verify email' });
    }
  },

  // Request password reset
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ 
          error: 'Email is required' 
        });
      }

      // Find customer
      const customer = await prisma.customer.findUnique({
        where: { email }
      });

      // Always return success to prevent email enumeration
      if (!customer) {
        return res.json({
          message: 'If an account exists with this email, you will receive password reset instructions.'
        });
      }

      // Create password reset token
      const resetToken = generatePasswordResetToken();
      const expiresAt = getTokenExpiryDate(2); // 2 hours
      
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: expiresAt
        }
      });

      // Send password reset email
      const resetUrl = `${process.env.FRONTEND_URL}/customer/reset-password?token=${resetToken}`;
      await emailService.sendPasswordResetEmail(
        customer.email,
        customer.firstName || 'Customer',
        resetUrl
      );

      res.json({
        message: 'If an account exists with this email, you will receive password reset instructions.'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ 
          error: 'Token and new password are required' 
        });
      }

      // Find customer with valid token
      const customer = await prisma.customer.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date()
          }
        }
      });

      if (!customer) {
        return res.status(404).json({ 
          error: 'Invalid or expired reset token' 
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await prisma.$transaction(async (tx) => {
        // Update customer password
        await tx.customer.update({
          where: { id: customer.id },
          data: { 
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpires: null
          }
        });

        // Invalidate all sessions for security
        await tx.customerSession.deleteMany({
          where: { customerId: customer.id }
        });
      });

      res.json({
        message: 'Password reset successfully. Please login with your new password.'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  },

  // Refresh access token
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          error: 'Refresh token is required' 
        });
      }

      // Verify refresh token
      let payload;
      try {
        payload = verifyRefreshToken(refreshToken);
      } catch (error) {
        return res.status(401).json({ 
          error: 'Invalid refresh token' 
        });
      }

      // Find session in database
      const session = await prisma.customerSession.findUnique({
        where: { id: payload.tokenId },
        include: { customer: true }
      });

      if (!session || session.token !== refreshToken) {
        return res.status(401).json({ 
          error: 'Invalid refresh token' 
        });
      }

      // Check if session is expired
      if (isTokenExpired(session.expiresAt)) {
        await prisma.customerSession.delete({
          where: { id: session.id }
        });
        return res.status(401).json({ 
          error: 'Refresh token has expired' 
        });
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: session.customer.id,
        email: session.customer.email,
        isCustomer: true,
        role: 'CUSTOMER'
      });

      res.json({
        message: 'Access token refreshed',
        user: {
          id: session.customer.id,
          email: session.customer.email,
          name: `${session.customer.firstName}${session.customer.lastName ? ' ' + session.customer.lastName : ''}`,
          firstName: session.customer.firstName,
          lastName: session.customer.lastName,
          isCustomer: true,
          emailVerified: session.customer.emailVerified
        },
        accessToken
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  },

  // Logout
  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Delete session if provided
        try {
          const payload = verifyRefreshToken(refreshToken);
          await prisma.customerSession.delete({
            where: { id: payload.tokenId }
          });
        } catch (error) {
          // Ignore errors - token might be invalid or already deleted
        }
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  },

  // Get customer profile
  async getProfile(req: CustomerAuthRequest, res: Response) {
    try {
      const customerId = req.customer?.id || req.customerUser!.userId;

      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          customerPreferences: true,
          restaurantLinks: {
            include: {
              restaurant: true
            }
          }
        }
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({
        user: {
          id: customer.id,
          email: customer.email,
          name: `${customer.firstName}${customer.lastName ? ' ' + customer.lastName : ''}`,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
          isCustomer: true,
          emailVerified: customer.emailVerified,
          phoneVerified: false, // Customer model doesn't have this field yet
          marketingOptIn: customer.customerPreferences?.marketingOptIn || false,
          dietaryRestrictions: customer.customerPreferences?.dietaryRestrictions,
          specialRequests: customer.customerPreferences?.notes, // Using notes field
          vipStatus: customer.restaurantLinks?.[0]?.vipStatus || false
        },
        recentReservations: []  // TODO: Add actual reservations
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  // Update customer profile
  async updateProfile(req: CustomerAuthRequest, res: Response) {
    try {
      const customerId = req.customer?.id || req.customerUser!.userId;
      const { 
        firstName, 
        lastName, 
        phone,
        preferences 
      } = req.body;

      // Update customer and preferences in transaction
      const updatedCustomer = await prisma.$transaction(async (tx) => {
        // Update customer basic info
        const customer = await tx.customer.update({
          where: { id: customerId },
          data: {
            firstName,
            lastName,
            phone
          }
        });

        // Update preferences if provided
        if (preferences) {
          await tx.customerPreferences.upsert({
            where: { customerId },
            create: {
              customerId,
              ...preferences
            },
            update: preferences
          });
        }

        return customer;
      });

      // Fetch complete updated profile
      const completeProfile = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          customerPreferences: true,
          restaurantLinks: {
            include: {
              restaurant: true
            }
          }
        }
      });

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: completeProfile!.id,
          email: completeProfile!.email,
          name: `${completeProfile!.firstName}${completeProfile!.lastName ? ' ' + completeProfile!.lastName : ''}`,
          firstName: completeProfile!.firstName,
          lastName: completeProfile!.lastName,
          phone: completeProfile!.phone,
          isCustomer: true,
          emailVerified: completeProfile!.emailVerified,
          phoneVerified: false,
          marketingOptIn: completeProfile!.customerPreferences?.marketingOptIn || false,
          dietaryRestrictions: completeProfile!.customerPreferences?.dietaryRestrictions,
          specialRequests: completeProfile!.customerPreferences?.notes,
          vipStatus: completeProfile!.restaurantLinks?.[0]?.vipStatus || false
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}; 