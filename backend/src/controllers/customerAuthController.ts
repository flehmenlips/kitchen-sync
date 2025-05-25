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
      const { email, password, name, phone } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({ 
          error: 'Email, password, and name are required' 
        });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({ 
          error: 'An account with this email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user and customer profile in a transaction
      const user = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            phone,
            isCustomer: true,
            role: 'USER'
          }
        });

        // Create customer profile
        await tx.customerProfile.create({
          data: {
            userId: newUser.id,
            emailVerified: false,
            phoneVerified: false
          }
        });

        // Create email verification token
        const verificationToken = generateEmailVerificationToken();
        await tx.emailVerificationToken.create({
          data: {
            userId: newUser.id,
            token: verificationToken,
            expiresAt: getTokenExpiryDate(24) // 24 hours
          }
        });

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await emailService.sendVerificationEmail(email, name, verificationUrl);

        return newUser;
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        isCustomer: true,
        role: user.role
      });

      // Create refresh token
      const refreshToken = await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: generateRefreshToken({
            userId: user.id,
            email: user.email,
            isCustomer: true,
            tokenId: 0 // Will be updated
          }),
          expiresAt: getTokenExpiryDate(24 * 30), // 30 days
          deviceInfo: req.headers['user-agent']
        }
      });

      // Update refresh token with its own ID
      const updatedRefreshToken = await prisma.refreshToken.update({
        where: { id: refreshToken.id },
        data: {
          token: generateRefreshToken({
            userId: user.id,
            email: user.email,
            isCustomer: true,
            tokenId: refreshToken.id
          })
        }
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isCustomer: user.isCustomer
        },
        accessToken,
        refreshToken: updatedRefreshToken.token
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
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

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: { customerProfile: true }
      });

      if (!user || !user.isCustomer) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Invalid email or password' 
        });
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        isCustomer: true,
        role: user.role
      });

      let refreshTokenResponse = null;
      
      if (rememberMe) {
        // Create refresh token for "remember me" functionality
        const refreshToken = await prisma.refreshToken.create({
          data: {
            userId: user.id,
            token: '', // Temporary
            expiresAt: getTokenExpiryDate(24 * 30), // 30 days
            deviceInfo: req.headers['user-agent']
          }
        });

        // Update with actual token containing the token ID
        const updatedRefreshToken = await prisma.refreshToken.update({
          where: { id: refreshToken.id },
          data: {
            token: generateRefreshToken({
              userId: user.id,
              email: user.email,
              isCustomer: true,
              tokenId: refreshToken.id
            })
          }
        });

        refreshTokenResponse = updatedRefreshToken.token;
      }

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isCustomer: user.isCustomer,
          emailVerified: user.customerProfile?.emailVerified || false
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

      // Find token
      const verificationToken = await prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!verificationToken) {
        return res.status(404).json({ 
          error: 'Invalid verification token' 
        });
      }

      // Check if token is expired
      if (isTokenExpired(verificationToken.expiresAt)) {
        return res.status(400).json({ 
          error: 'Verification token has expired' 
        });
      }

      // Check if already used
      if (verificationToken.usedAt) {
        return res.status(400).json({ 
          error: 'Verification token has already been used' 
        });
      }

      // Update token and customer profile
      await prisma.$transaction(async (tx) => {
        // Mark token as used
        await tx.emailVerificationToken.update({
          where: { id: verificationToken.id },
          data: { usedAt: new Date() }
        });

        // Update customer profile
        await tx.customerProfile.update({
          where: { userId: verificationToken.userId },
          data: { emailVerified: true }
        });
      });

      // Send welcome email
      await emailService.sendWelcomeEmail(
        verificationToken.user.email,
        verificationToken.user.name || 'Customer'
      );

      res.json({
        message: 'Email verified successfully',
        user: {
          id: verificationToken.user.id,
          email: verificationToken.user.email,
          name: verificationToken.user.name
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

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      // Always return success to prevent email enumeration
      if (!user || !user.isCustomer) {
        return res.json({
          message: 'If an account exists with this email, you will receive password reset instructions.'
        });
      }

      // Create password reset token
      const resetToken = generatePasswordResetToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: getTokenExpiryDate(2) // 2 hours
        }
      });

      // Send password reset email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await emailService.sendPasswordResetEmail(
        user.email,
        user.name || 'Customer',
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

      // Find token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!resetToken) {
        return res.status(404).json({ 
          error: 'Invalid reset token' 
        });
      }

      // Check if token is expired
      if (isTokenExpired(resetToken.expiresAt)) {
        return res.status(400).json({ 
          error: 'Reset token has expired' 
        });
      }

      // Check if already used
      if (resetToken.usedAt) {
        return res.status(400).json({ 
          error: 'Reset token has already been used' 
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and mark token as used
      await prisma.$transaction(async (tx) => {
        // Update user password
        await tx.user.update({
          where: { id: resetToken.userId },
          data: { password: hashedPassword }
        });

        // Mark token as used
        await tx.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() }
        });

        // Invalidate all refresh tokens for security
        await tx.refreshToken.deleteMany({
          where: { userId: resetToken.userId }
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

      // Find refresh token in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { id: payload.tokenId },
        include: { user: true }
      });

      if (!storedToken || storedToken.token !== refreshToken) {
        return res.status(401).json({ 
          error: 'Invalid refresh token' 
        });
      }

      // Check if token is expired
      if (isTokenExpired(storedToken.expiresAt)) {
        await prisma.refreshToken.delete({
          where: { id: storedToken.id }
        });
        return res.status(401).json({ 
          error: 'Refresh token has expired' 
        });
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        isCustomer: storedToken.user.isCustomer,
        role: storedToken.user.role
      });

      res.json({
        accessToken,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          name: storedToken.user.name,
          isCustomer: storedToken.user.isCustomer
        }
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
        // Delete refresh token if provided
        try {
          const payload = verifyRefreshToken(refreshToken);
          await prisma.refreshToken.delete({
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
      const userId = req.customerUser?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
          customerProfile: true,
          customerReservations: {
            orderBy: { reservationDate: 'desc' },
            take: 5
          }
        }
      });

      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          isCustomer: user.isCustomer,
          emailVerified: user.customerProfile?.emailVerified || false,
          phoneVerified: user.customerProfile?.phoneVerified || false,
          marketingOptIn: user.customerProfile?.marketingOptIn || false,
          dietaryRestrictions: user.customerProfile?.dietaryRestrictions,
          specialRequests: user.customerProfile?.specialRequests,
          vipStatus: user.customerProfile?.vipStatus || false
        },
        recentReservations: user.customerReservations
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  // Update customer profile
  async updateProfile(req: CustomerAuthRequest, res: Response) {
    try {
      const userId = req.customerUser?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { 
        name, 
        phone, 
        dietaryRestrictions, 
        specialRequests,
        marketingOptIn,
        preferredContactMethod
      } = req.body;

      // Update user and profile
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Update user
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            name,
            phone
          }
        });

        // Update customer profile
        await tx.customerProfile.update({
          where: { userId },
          data: {
            dietaryRestrictions,
            specialRequests,
            marketingOptIn,
            preferredContactMethod
          }
        });

        return user;
      });

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}; 