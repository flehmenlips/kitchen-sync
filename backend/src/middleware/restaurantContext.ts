import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

// Extend Express Request to include restaurant context
declare global {
  namespace Express {
    interface Request {
      restaurantId?: number;
      restaurantSlug?: string;
      isRestaurantOwner?: boolean;
      staffRestaurantIds?: number[];
    }
  }
}

/**
 * Middleware to set restaurant context for authenticated users
 * This ensures proper multi-tenant data isolation
 */
export const setRestaurantContext = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next();
    }

    // Get all restaurants this user has access to using raw SQL to avoid schema mismatch
    const staffAssignments: any[] = await prisma.$queryRaw`
      SELECT 
        rs.id,
        rs.user_id,
        rs.restaurant_id,
        rs.role,
        rs.is_active,
        r.id as restaurant_id,
        r.name as restaurant_name,
        r.slug as restaurant_slug,
        r.is_active as restaurant_is_active
      FROM restaurant_staff rs
      JOIN restaurants r ON rs.restaurant_id = r.id
      WHERE rs.user_id = ${req.user.id}
        AND rs.is_active = true
        AND r.is_active = true
    `;

    // Transform raw results to match expected structure
    const transformedAssignments = staffAssignments.map(sa => ({
      id: sa.id,
      userId: sa.user_id,
      restaurantId: sa.restaurant_id,
      role: sa.role,
      isActive: sa.is_active,
      restaurant: {
        id: sa.restaurant_id,
        name: sa.restaurant_name,
        slug: sa.restaurant_slug,
        isActive: sa.restaurant_is_active
      }
    }));

    if (transformedAssignments.length === 0) {
      // User has no restaurant access
      req.restaurantId = undefined;
      req.staffRestaurantIds = [];
      return next();
    }

    // Store all restaurant IDs user has access to
    req.staffRestaurantIds = transformedAssignments.map(sa => sa.restaurant.id);

    // Check for restaurant context in different places
    let restaurantId: number | undefined;

    // 1. Check header (for API requests)
    const headerRestaurantId = req.headers['x-restaurant-id'];
    if (headerRestaurantId) {
      restaurantId = parseInt(headerRestaurantId as string);
    }

    // 2. Check query parameter
    if (!restaurantId && req.query.restaurantId) {
      restaurantId = parseInt(req.query.restaurantId as string);
    }

    // 3. Check route parameter (e.g., /api/restaurants/:restaurantId/...)
    if (!restaurantId && req.params.restaurantId) {
      restaurantId = parseInt(req.params.restaurantId);
    }

    // 4. If user only has access to one restaurant, use that
    if (!restaurantId && transformedAssignments.length === 1) {
      restaurantId = transformedAssignments[0].restaurant.id;
    }

    // Validate the user has access to the requested restaurant
    if (restaurantId) {
      const hasAccess = transformedAssignments.some(sa => sa.restaurant.id === restaurantId);
      
      if (!hasAccess) {
        res.status(403).json({ error: 'Access denied to this restaurant' });
        return;
      }

      req.restaurantId = restaurantId;
      const assignment = transformedAssignments.find(sa => sa.restaurant.id === restaurantId);
      req.restaurantSlug = assignment?.restaurant.slug;
      
      // Check if user is owner (has SUPERADMIN role AND is assigned to this restaurant)
      req.isRestaurantOwner = req.user.role === 'SUPERADMIN' && hasAccess;
    }

    next();
  } catch (error) {
    console.error('Restaurant context middleware error:', error);
    res.status(500).json({ error: 'Failed to set restaurant context' });
  }
};

/**
 * Middleware to require restaurant context
 * Use this for endpoints that must have a restaurant selected
 */
export const requireRestaurantContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.restaurantId) {
    res.status(400).json({ 
      error: 'Restaurant context required',
      message: 'Please select a restaurant or provide restaurant ID'
    });
    return;
  }
  next();
};

/**
 * Helper function to get restaurant filter for Prisma queries
 * This ensures queries are properly scoped to the user's restaurant(s)
 */
export const getRestaurantFilter = (req: Request) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }

  // Platform admins should NOT see all data by default
  // They need to explicitly select a restaurant
  if (req.restaurantId) {
    return { restaurantId: req.restaurantId };
  }

  // If no specific restaurant selected but user has access to multiple
  if (req.staffRestaurantIds && req.staffRestaurantIds.length > 0) {
    return { restaurantId: { in: req.staffRestaurantIds } };
  }

  // No restaurant access
  return { restaurantId: -1 }; // Will match no records
}; 