/**
 * Asset Controller - Production Compatible Version
 * This version is specifically configured for production database schema
 * which does not include enhanced fields like tags, description, folderId, etc.
 * Last updated: 2025-01-03 for production schema compatibility
 * 
 * DEPLOYMENT VERSION: v3.9.2-production-runtime-fix
 * BUILD TIMESTAMP: 2025-01-03T06:45:00Z
 * 
 * CRITICAL: This version uses runtime field filtering for production
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadImage, deleteImage, listRestaurantAssets, validateAssetOwnership } from '../services/cloudinaryService';

const prisma = new PrismaClient();

// Use require for multer to avoid TypeScript issues temporarily
const multer = require('multer');

/**
 * PRODUCTION COMPATIBILITY HELPER
 * Filters out enhanced schema fields that don't exist in production
 */
const createProductionSafeAsset = async (assetData: any) => {
  // Only use fields that exist in production database
  const productionSafeData = {
    id: assetData.id,
    restaurantId: assetData.restaurantId,
    assetType: assetData.assetType,
    fileName: assetData.fileName,
    fileUrl: assetData.fileUrl,
    fileSize: assetData.fileSize || null,
    mimeType: assetData.mimeType || null,
    dimensions: assetData.dimensions || null,
    altText: assetData.altText || null,
    isPrimary: assetData.isPrimary || false,
    // Explicitly exclude enhanced fields: tags, description, folderId, etc.
  };
  
  console.log('🔧 Creating production-safe asset:', {
    fileName: productionSafeData.fileName,
    assetType: productionSafeData.assetType,
    fieldsUsed: Object.keys(productionSafeData)
  });
  
  return await prisma.brandAsset.create({
    data: productionSafeData
  });
};

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for assets
const fileFilter = (req: any, file: any, cb: any) => {
  // Accept images, videos, and documents
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('application/')) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported! Please upload images, videos, or documents.'));
  }
};

// Configure multer for asset uploads
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Get all assets for a restaurant with filtering, search, and pagination
export const getAssets = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = parseInt(req.params.restaurantId);
  const {
    assetType,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  console.log('[AssetController] getAssets called for restaurantId:', restaurantId);
  console.log('[AssetController] Query params:', { assetType, search, page, limit, sortBy, sortOrder });

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  // Build where conditions
  const where: any = {
    restaurantId,
  };

  if (assetType) {
    // Handle case insensitive asset type filtering by using Prisma's insensitive mode
    where.assetType = {
      equals: assetType as string,
      mode: 'insensitive'
    };
  }

  if (search) {
    where.OR = [
      { fileName: { contains: search as string, mode: 'insensitive' } },
      { altText: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  console.log('[AssetController] Where conditions:', JSON.stringify(where, null, 2));
  console.log('[AssetController] About to query database...');

  // Validate sortBy field to prevent Prisma errors
  const validSortFields = ['createdAt', 'fileName', 'fileSize', 'updatedAt'];
  const safeSortBy = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
  const safeSortOrder = (sortOrder === 'asc' || sortOrder === 'desc') ? sortOrder : 'desc';

  console.log('[AssetController] Using safe sort:', { safeSortBy, safeSortOrder });

  try {
    // Use basic select fields that work in production
    const selectFields = {
      id: true,
      restaurantId: true,
      assetType: true,
      fileName: true,
      fileUrl: true,
      fileSize: true,
      mimeType: true,
      altText: true,
      isPrimary: true,
      createdAt: true,
      updatedAt: true
      // All enhanced fields (tags, description, folderId, etc.) disabled for production
    };

    console.log('[AssetController] Executing enhanced query with params:', { 
      where: JSON.stringify(where), 
      safeSortBy, 
      safeSortOrder, 
      skip, 
      limit: parseInt(limit as string) 
    });

    const [assets, totalCount] = await Promise.all([
      prisma.brandAsset.findMany({
        where,
        select: selectFields,
        orderBy: {
          [safeSortBy]: safeSortOrder
        },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.brandAsset.count({ where })
    ]);

    console.log('[AssetController] Query results:', assets.length, 'assets found');
    console.log('[AssetController] Assets:', assets.map(a => ({ fileName: a.fileName, id: a.id })));

    res.json({
      assets,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit as string))
      }
    });
  } catch (dbError: any) {
    console.error('[AssetController] Database query error:', dbError);
    console.error('[AssetController] Where conditions that failed:', where);
    console.error('[AssetController] Sort parameters that failed:', { safeSortBy, safeSortOrder });
    
    // Fallback to basic query if enhanced query fails
    try {
      console.log('[AssetController] Attempting fallback with basic fields...');
      
      const basicSelectFields = {
        id: true,
        restaurantId: true,
        assetType: true,
        fileName: true,
        fileUrl: true,
        fileSize: true,
        mimeType: true,
        altText: true,
        isPrimary: true,
        createdAt: true,
        updatedAt: true
      };

      const [fallbackAssets, fallbackCount] = await Promise.all([
        prisma.brandAsset.findMany({
          where,
          select: basicSelectFields,
          orderBy: {
            [safeSortBy]: safeSortOrder
          },
          skip,
          take: parseInt(limit as string)
        }),
        prisma.brandAsset.count({ where })
      ]);

      console.log('[AssetController] Fallback query successful:', fallbackAssets.length, 'assets found');

      res.json({
        assets: fallbackAssets,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: fallbackCount,
          pages: Math.ceil(fallbackCount / parseInt(limit as string))
        }
      });
    } catch (fallbackError: any) {
      console.error('[AssetController] Fallback query also failed:', fallbackError);
      
      res.status(500).json({
        error: 'Database query failed',
        message: fallbackError.message || 'Unknown database error',
        details: 'Check server logs for more information'
      });
    }
  }
});

// Upload new asset with enhanced database integration
export const uploadAsset = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = parseInt(req.params.restaurantId);
  const { description, altText, folderId, tags } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  let tempPath: string | null = null;

  try {
    // Determine asset type from MIME type and normalize to uppercase
    let assetType = 'OTHER';
    if (req.file.mimetype.startsWith('image/')) {
      assetType = 'IMAGE';
    } else if (req.file.mimetype.startsWith('video/')) {
      assetType = 'VIDEO';
    } else if (req.file.mimetype === 'application/pdf') {
      assetType = 'DOCUMENT';
    }

    // Write file to temp location for cloudinary upload
    const fs = require('fs');
    const path = require('path');
    tempPath = path.join(__dirname, '../../temp', `${Date.now()}-${req.file.originalname}`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    fs.writeFileSync(tempPath, req.file.buffer);

    // Upload to Cloudinary with restaurant-specific folder
    if (!tempPath) {
      throw new Error('Temp file path is null');
    }
    const cloudinaryResult = await uploadImage(tempPath, `restaurants/${restaurantId}/assets`);

    // Get folder path if folderId provided and validate it exists
    let folderPath = null;
    let validatedFolderId = null;
    
    if (folderId) {
      console.log('[AssetController] Checking folderId:', folderId);
      try {
        const folder = await prisma.assetFolder.findUnique({
          where: { id: folderId },
          select: { name: true, parentFolderId: true }
        });
        
        if (folder) {
          console.log('[AssetController] Valid folder found:', folder.name);
          validatedFolderId = folderId;
          folderPath = `/${folder.name}`;
        } else {
          console.log('[AssetController] Invalid folderId provided, uploading to root folder');
          // Don't fail the upload, just upload to root folder
          validatedFolderId = null;
          folderPath = null;
        }
      } catch (folderError) {
        console.log('[AssetController] Folder lookup failed, uploading to root folder');
        validatedFolderId = null;
        folderPath = null;
      }
    }

    // Parse tags if provided as string
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      } catch {
        parsedTags = typeof tags === 'string' ? [tags] : tags;
      }
    }

    console.log('[AssetController] Creating asset with production-safe fields');

    // Create asset record in database using production-safe helper
    const asset = await createProductionSafeAsset({
      id: undefined, // Let database generate ID
      restaurantId,
      assetType,
      fileName: req.file.originalname,
      fileUrl: cloudinaryResult.url,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      altText: altText || req.file.originalname,
      isPrimary: false,
      dimensions: null
    });

    // Clean up temp file
    if (tempPath && fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }

    res.status(201).json(asset);
  } catch (error) {
    console.error('Asset upload error:', error);
    
    // Clean up temp file on error
    if (tempPath) {
      try {
        const fs = require('fs');
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

// Update asset
export const updateAsset = asyncHandler(async (req: Request, res: Response) => {
  const { assetId } = req.params;
  const { fileName, altText } = req.body;

  const asset = await prisma.brandAsset.update({
    where: { id: assetId },
    data: {
      ...(fileName && { fileName }),
      ...(altText !== undefined && { altText })
    }
  });

  res.json(asset);
});

// Delete asset
export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const { assetId } = req.params;

  const asset = await prisma.brandAsset.findUnique({
    where: { id: assetId }
  });

  if (!asset) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  try {
    // For now, skip Cloudinary deletion since we need the public_id field
    // TODO: Implement when schema is migrated
    
    // Delete from database
    await prisma.brandAsset.delete({
      where: { id: assetId }
    });

    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Asset deletion error:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

// Simplified analytics for current schema
export const getAssetAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = parseInt(req.params.restaurantId);

  const [
    totalAssets,
    totalStorage,
    assetsByType
  ] = await Promise.all([
    // Total assets count
    prisma.brandAsset.count({
      where: { restaurantId }
    }),
    
    // Total storage used
    prisma.brandAsset.aggregate({
      where: { restaurantId },
      _sum: { fileSize: true }
    }),
    
    // Assets by type
    prisma.brandAsset.groupBy({
      by: ['assetType'],
      where: { restaurantId },
      _count: { id: true }
    })
  ]);

  res.json({
    overview: {
      totalAssets,
      totalStorage: totalStorage._sum.fileSize || 0,
      recentUploads: 0 // Simplified for now
    },
    distribution: {
      byType: assetsByType.map(item => ({
        type: item.assetType,
        count: item._count.id
      }))
    }
  });
});

// Placeholder functions for folder management (will implement after schema migration)
export const getFolders = asyncHandler(async (req: Request, res: Response) => {
  res.json([]); // Return empty array for now
});

export const createFolder = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Folder management not yet implemented' });
});

export const updateFolder = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Folder management not yet implemented' });
});

export const deleteFolder = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Folder management not yet implemented' });
});

export const trackAssetUsage = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Asset usage tracking not yet implemented' });
});

/**
 * Import ALL existing assets from Cloudinary for a restaurant (historical import)
 * This scans the entire Cloudinary account and imports assets not in database
 */
export const importAllCloudinaryAssets = async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID required' });
    }

    console.log(`🔄 Starting COMPREHENSIVE Cloudinary import for restaurant ${restaurantId}`);

    // Get existing assets from database
    const existingAssets = await prisma.brandAsset.findMany({
      where: { restaurantId },
      select: { id: true, fileName: true }
    });

    const existingPublicIds = new Set(
      existingAssets
        .map(asset => asset.fileName)
        .filter(Boolean)
    );

    console.log(`💾 Found ${existingAssets.length} assets already in database`);

    // Import the configured Cloudinary library
    const { v2: cloudinary } = require('cloudinary');
    
    // Configure Cloudinary (should already be configured, but let's ensure it)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    let allAssets: any[] = [];

    // Get all images from Cloudinary
    try {
      console.log('📸 Fetching images from Cloudinary...');
      const imageResult = await cloudinary.api.resources({
        resource_type: 'image',
        max_results: 500,
        type: 'upload'
      });
      console.log(`📸 Found ${imageResult.resources.length} images in Cloudinary`);
      allAssets = allAssets.concat(imageResult.resources.map((asset: any) => ({
        ...asset,
        assetType: 'image'
      })));
    } catch (error: any) {
      console.log('⚠️ Could not fetch images:', error.message);
    }

    // Get all videos from Cloudinary
    try {
      console.log('🎥 Fetching videos from Cloudinary...');
      const videoResult = await cloudinary.api.resources({
        resource_type: 'video',
        max_results: 100,
        type: 'upload'
      });
      console.log(`🎥 Found ${videoResult.resources.length} videos in Cloudinary`);
      allAssets = allAssets.concat(videoResult.resources.map((asset: any) => ({
        ...asset,
        assetType: 'video'
      })));
    } catch (error: any) {
      console.log('⚠️ Could not fetch videos:', error.message);
    }

    console.log(`📁 Total assets found in Cloudinary: ${allAssets.length}`);

    // Filter out assets already in database and demo assets
    const assetsToImport = allAssets.filter(
      asset => !existingPublicIds.has(asset.public_id) && 
                !asset.public_id.startsWith('demo_') &&
                !asset.public_id.startsWith('restaurants/') // Exclude current restaurant-specific assets
    );

    console.log(`📥 Importing ${assetsToImport.length} historical assets`);

    // Special case: No assets to import (everything already imported)
    if (assetsToImport.length === 0) {
      console.log(`✅ All Cloudinary assets already imported! Database has ${existingAssets.length} assets.`);
      
      return res.json({
        success: true,
        message: `🎉 Import check complete! All your Cloudinary assets (${allAssets.length} total) are already in your Asset Library.`,
        imported: 0,
        totalCloudinary: allAssets.length,
        totalDatabase: existingAssets.length,
        skipped: 0,
        alreadyImported: allAssets.filter(asset => existingPublicIds.has(asset.public_id)).length,
        categories: {
          recipes: 0,
          contentBlocks: 0,
          videos: 0,
          other: 0
        },
        details: {
          existingInDb: existingAssets.length,
          foundInCloudinary: allAssets.length,
          eligibleForImport: 0,
          successfullyImported: 0,
          alreadyImported: allAssets.filter(asset => existingPublicIds.has(asset.public_id)).length,
          message: "No new assets to import - everything is already in your library!"
        }
      });
    }

    // TEMPORARILY DISABLED - Enhanced folder management not available in production schema
    // Get available folders for categorization
    // const assetFolders = await prisma.assetFolder.findMany({
    //   where: { restaurantId },
    //   orderBy: { name: 'asc' }
    // });

    // Create database entries for new assets
    const importedAssets = [];
    const importStats = {
      recipes: 0,
      contentBlocks: 0,
      videos: 0,
      other: 0
    };

    for (const asset of assetsToImport) {
      try {
        // TEMPORARILY DISABLED - Smart categorization based on folders
        // let folderId: string | null = null;
        let category = 'other';

        if (asset.public_id.includes('recipe') || asset.public_id.includes('food') || 
            asset.public_id.includes('cooking') || asset.public_id.includes('ingredient') ||
            (asset.original_filename && asset.original_filename.includes('recipe'))) {
          category = 'recipes';
          importStats.recipes++;
        } else if (asset.public_id.includes('content-block') || asset.public_id.includes('hero') ||
                   asset.public_id.includes('website') || asset.public_id.includes('dining') ||
                   (asset.original_filename && (asset.original_filename.includes('hero') || asset.original_filename.includes('dining')))) {
          category = 'contentBlocks';
          importStats.contentBlocks++;
        } else if (asset.assetType === 'video') {
          category = 'videos';
          importStats.videos++;
        } else {
          importStats.other++;
        }

        // Generate appropriate filename
        const originalName = asset.original_filename || asset.public_id.split('/').pop() || 'imported-asset';
        const fileExtension = asset.format ? `.${asset.format}` : '';
        const fileName = originalName.includes('.') ? originalName : `${originalName}${fileExtension}`;

        // Create asset with basic fields only (production-safe)
        const newAsset = await createProductionSafeAsset({
          id: undefined, // Let database generate ID
          restaurantId,
          fileName: fileName,
          fileUrl: asset.secure_url,
          fileSize: asset.bytes || 0,
          mimeType: asset.format ? `${asset.resource_type}/${asset.format}` : 'unknown',
          assetType: asset.assetType.toUpperCase(),
          isPrimary: false,
          altText: null,
          dimensions: null
        });

        importedAssets.push(newAsset);
        
        if (importedAssets.length % 10 === 0) {
          console.log(`📥 Imported ${importedAssets.length} assets so far...`);
        }

      } catch (assetError: any) {
        console.error(`❌ Error importing asset ${asset.public_id}:`, assetError.message);
        // Continue with other assets
      }
    }

    console.log(`✅ Successfully imported ${importedAssets.length} historical assets`);

    res.json({
      success: true,
      message: `🎉 Historical import complete! Successfully imported ${importedAssets.length} assets from your Cloudinary account`,
      imported: importedAssets.length,
      totalCloudinary: allAssets.length,
      totalDatabase: existingAssets.length + importedAssets.length,
      skipped: assetsToImport.length - importedAssets.length,
      categories: {
        recipes: importStats.recipes,
        contentBlocks: importStats.contentBlocks,
        videos: importStats.videos,
        other: importStats.other
      },
      details: {
        existingInDb: existingAssets.length,
        foundInCloudinary: allAssets.length,
        eligibleForImport: assetsToImport.length,
        successfullyImported: importedAssets.length
      }
    });

  } catch (error) {
    console.error('❌ Error in comprehensive Cloudinary import:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import assets from Cloudinary',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check server logs for more information'
    });
  }
};

// Enhanced security for deleteAsset
export const deleteAssetSecure = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = parseInt(req.params.restaurantId);

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID required' });
    }

    // Get the asset with ownership validation
    const asset = await prisma.brandAsset.findFirst({
      where: {
        id: id,
        restaurantId // Ensure it belongs to this restaurant
      }
    });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found or access denied' });
    }

    // Additional security: validate Cloudinary ownership
    if (asset.cloudinaryPublicId && !validateAssetOwnership(asset.cloudinaryPublicId, restaurantId)) {
      console.error(`🚨 Security violation: Asset ${asset.cloudinaryPublicId} doesn't belong to restaurant ${restaurantId}`);
      return res.status(403).json({ message: 'Security violation: Asset ownership mismatch' });
    }

    // Delete from Cloudinary if it exists
    if (asset.cloudinaryPublicId) {
      try {
        await deleteImage(asset.cloudinaryPublicId, restaurantId);
      } catch (cloudinaryError) {
        console.warn('Warning: Could not delete from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await prisma.brandAsset.delete({
      where: { id: id }
    });

    console.log(`🗑️ Deleted asset ${asset.fileName} for restaurant ${restaurantId}`);

    res.json({ message: 'Asset deleted successfully' });

  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({
      message: 'Failed to delete asset',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Simple test endpoint to verify API routing and authentication
 */
export const testAssetApi = async (req: Request, res: Response) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    
    console.log(`🧪 Test API called for restaurant ${restaurantId}`);
    console.log(`🧪 User ID: ${req.user?.id}`);
    console.log(`🧪 Request headers:`, Object.keys(req.headers));
    
    res.json({
      success: true,
      message: 'Asset API is working correctly',
      restaurantId,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('❌ Test API error:', error);
    res.status(500).json({
      success: false,
      message: 'Test API failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Deployment verification endpoint - FORCE CACHE INVALIDATION
 */
export const verifyDeployment = async (req: Request, res: Response) => {
  res.json({
    deploymentVersion: 'v3.9.2-production-runtime-fix',
    buildTimestamp: '2025-01-03T06:45:00Z',
    schemaCompatibility: 'PRODUCTION_BASIC_FIELDS_ONLY',
    tagsFieldDisabled: true,
    enhancedFieldsDisabled: true,
    message: 'Asset Controller is production-compatible without enhanced schema fields'
  });
}; 