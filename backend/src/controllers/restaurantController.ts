import { Request, Response } from 'express';
import { PrismaClient, OnboardingStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import crypto from 'crypto';
import prisma from '../config/db';

// @desc    Create a new restaurant for logged-in user
// @route   POST /api/restaurants
// @access  Private
export const createRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Store user in const for TypeScript narrowing
    const user = req.user;

    const {
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      cuisine,
      description
    } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({ error: 'Restaurant name is required' });
      return;
    }

    // Ensure name is a string to prevent TypeError on toLowerCase()
    if (typeof name !== 'string') {
      res.status(400).json({ error: 'Restaurant name must be a string' });
      return;
    }

    // Generate base slug from name
    let baseSlug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Ensure slug is not empty
    if (!baseSlug) {
      baseSlug = 'restaurant';
    }
    
    // Generate unique slug by appending number if needed
    let slug = baseSlug;
    let counter = 1;
    let existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug }
    });
    
    console.log(`[RESTAURANT CREATE] Name: "${name}", Base slug: "${baseSlug}", Checking slug: "${slug}", Exists: ${!!existingRestaurant}`);
    
    while (existingRestaurant) {
      slug = `${baseSlug}-${counter}`;
      console.log(`[RESTAURANT CREATE] Slug "${baseSlug}" exists, trying: "${slug}"`);
      existingRestaurant = await prisma.restaurant.findUnique({
        where: { slug }
      });
      counter++;
      
      // Safety check to prevent infinite loop
      if (counter > 1000) {
        // Fallback to UUID-based slug
        const uuid = crypto.randomUUID().substring(0, 8);
        slug = `${baseSlug}-${uuid}`;
        console.log(`[RESTAURANT CREATE] Too many collisions, using UUID fallback slug: "${slug}"`);
        break;
      }
    }
    
    console.log(`[RESTAURANT CREATE] Final slug determined: "${slug}"`);

    // Create restaurant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Double-check slug uniqueness inside transaction to prevent race conditions
      const slugCheck = await tx.restaurant.findUnique({
        where: { slug }
      });
      
      if (slugCheck) {
        // If slug was taken between check and transaction, generate a new one
        let newSlug = slug;
        let counter = 1;
        while (await tx.restaurant.findUnique({ where: { slug: newSlug } })) {
          newSlug = `${baseSlug}-${counter}`;
          counter++;
          if (counter > 1000) {
            newSlug = `${baseSlug}-${crypto.randomUUID().substring(0, 8)}`;
            break;
          }
        }
        slug = newSlug;
        console.log(`Slug collision detected, using new slug: ${slug}`);
      }
      
      // 1. Create the restaurant
      console.log(`[RESTAURANT CREATE] About to create restaurant with slug: "${slug}", name: "${name}", email: "${email || user.email}"`);
      const restaurant = await tx.restaurant.create({
        data: {
          name,
          slug,
          email: email || user.email,
          phone: phone || null,
          address: address || null,
          city: city || null,
          state: state || null,
          zipCode: zipCode || null,
          cuisine: cuisine || null,
          description: description || null,
          isActive: true,
          // Platform fields
          onboardingStatus: OnboardingStatus.ACTIVE,
          ownerName: user.name || 'Restaurant Owner',
          ownerEmail: user.email,
          businessPhone: phone || null,
          businessAddress: address && city && state && zipCode 
            ? `${address}, ${city}, ${state} ${zipCode}` 
            : null,
          verifiedAt: new Date()
        }
      });

      // 2. Link user to restaurant as staff (OWNER role)
      await tx.restaurantStaff.create({
        data: {
          userId: user.id,
          restaurantId: restaurant.id,
          role: 'OWNER',
          isActive: true
        }
      });

      // 3. Create trial subscription
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      await tx.subscription.create({
        data: {
          restaurantId: restaurant.id,
          plan: SubscriptionPlan.STARTER,
          status: SubscriptionStatus.TRIAL,
          trialEndsAt: trialEndDate,
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndDate
        }
      });

      // 4. Create default prep columns (only if they don't already exist for this restaurant)
      const defaultColumns = ['To Do', 'In Progress', 'Done'];
      for (let i = 0; i < defaultColumns.length; i++) {
        // Check if this user already has a prep column with this name for this restaurant
        const existingColumn = await tx.prepColumn.findFirst({
          where: {
            userId: user.id,
            restaurantId: restaurant.id,
            name: defaultColumns[i]
          }
        });
        
        // Only create if it doesn't exist for this restaurant
        if (!existingColumn) {
          await tx.prepColumn.create({
            data: {
              restaurantId: restaurant.id,
              userId: user.id,
              name: defaultColumns[i],
              order: i,
              color: '#1976d2'
            }
          });
        }
      }

      return restaurant;
    });

    res.status(201).json({
      message: 'Restaurant created successfully',
      restaurant: result
    });
  } catch (error: any) {
    console.error('[RESTAURANT CREATE ERROR] ==========================================');
    console.error('[RESTAURANT CREATE ERROR] Error creating restaurant:', error);
    console.error('[RESTAURANT CREATE ERROR] Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    console.error('[RESTAURANT CREATE ERROR] ==========================================');
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'unknown';
      const modelName = error.meta?.modelName || 'unknown';
      
      // Handle PrepColumn unique constraint violation
      if (modelName === 'PrepColumn') {
        console.error(`[RESTAURANT CREATE ERROR] PrepColumn unique constraint violation on: ${field}`);
        res.status(400).json({ 
          error: 'Failed to create restaurant. Unable to create default prep columns due to a constraint violation. Please try again or contact support if the issue persists.' 
        });
        return;
      }
      
      // Handle Restaurant slug constraint violation
      if (modelName === 'Restaurant' && field === 'slug') {
        console.error(`[RESTAURANT CREATE ERROR] Restaurant slug constraint violation`);
        res.status(400).json({ 
          error: 'A restaurant with this name already exists. Please choose a different name.' 
        });
        return;
      }
      
      // Generic unique constraint violation
      res.status(400).json({ 
        error: `A ${modelName} with this ${field} already exists. Please choose a different ${field}.` 
      });
      return;
    }
    
    // Return more specific error message if available
    const errorMessage = error.message || 'Failed to create restaurant. Please try again.';
    res.status(500).json({ error: errorMessage });
  }
};

