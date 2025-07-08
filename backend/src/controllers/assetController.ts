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
import { uploadToLocal, deleteFromLocal, listLocalAssets } from '../services/localStorageService';

const prisma = new PrismaClient();

// Storage mode configuration
const STORAGE_MODE = process.env.ASSET_STORAGE_MODE || 'cloudinary';
const USE_LOCAL_STORAGE = STORAGE_MODE === 'local' || process.env.NODE_ENV === 'development';

console.log(`🔧 Asset storage mode: ${USE_LOCAL_STORAGE ? 'LOCAL' : 'CLOUDINARY'}`);

// Use require for multer to avoid TypeScript issues temporarily
const multer = require('multer');

/**
 * PRODUCTION COMPATIBILITY HELPER - RAW SQL VERSION
 * Uses raw SQL to bypass Prisma schema validation for production compatibility
 */
const createProductionSafeAsset = async (assetData: any) => {
  // Only use fields that exist in production database
  const productionSafeData = {
    id: assetData.id || `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generate UUID-like ID
    restaurantId: assetData.restaurantId,
    assetType: assetData.assetType,
    fileName: assetData.fileName,
    fileUrl: assetData.fileUrl,
    fileSize: assetData.fileSize || null,
    mimeType: assetData.mimeType || null,
    dimensions: assetData.dimensions || null,
    altText: assetData.altText || null,
    isPrimary: assetData.isPrimary || false,
    cloudinaryPublicId: assetData.cloudinaryPublicId || null, // Store Cloudinary public ID
  };
  
  console.log('🔧 Creating production-safe asset with RAW SQL:', {
    fileName: productionSafeData.fileName,
    assetType: productionSafeData.assetType,
    cloudinaryPublicId: productionSafeData.cloudinaryPublicId,
    fieldsUsed: Object.keys(productionSafeData)
  });
  
  // Use raw SQL to bypass Prisma schema validation
  const query = `
    INSERT INTO brand_assets (
      id, restaurant_id, asset_type, file_name, file_url, 
      file_size, mime_type, dimensions, alt_text, is_primary,
      cloudinary_public_id, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, NOW(), NOW()
    ) RETURNING *
  `;
  
  const values = [
    productionSafeData.id,
    productionSafeData.restaurantId,
    productionSafeData.assetType,
    productionSafeData.fileName,
    productionSafeData.fileUrl,
    productionSafeData.fileSize,
    productionSafeData.mimeType,
    productionSafeData.dimensions ? JSON.stringify(productionSafeData.dimensions) : null,
    productionSafeData.altText,
    productionSafeData.isPrimary,
    productionSafeData.cloudinaryPublicId
  ];
  
  console.log('🔧 Executing raw SQL with values:', values);
  
  const result = await prisma.$queryRawUnsafe(query, ...values);
  console.log('✅ Raw SQL asset creation successful:', result);
  
  return Array.isArray(result) ? result[0] : result;
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
      cloudinaryPublicId: true, // Include cloudinaryPublicId for delete operations
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

    // Upload to storage (Cloudinary or Local based on configuration)
    let uploadResult;
    
    if (USE_LOCAL_STORAGE) {
      console.log('[AssetController] Using LOCAL storage mode');
      uploadResult = await uploadToLocal(req.file, `restaurants/${restaurantId}/assets`);
      console.log('[AssetController] Local upload result:', uploadResult);
    } else {
      console.log('[AssetController] Using CLOUDINARY storage mode');
      if (!tempPath) {
        throw new Error('Temp file path is required for Cloudinary upload');
      }
      uploadResult = await uploadImage(tempPath, `restaurants/${restaurantId}/assets`);
      console.log('[AssetController] Cloudinary upload result:', uploadResult);
    }

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
      fileUrl: uploadResult.url,
      fileSize: ('bytes' in uploadResult ? uploadResult.bytes : req.file.size) || req.file.size,
      mimeType: req.file.mimetype,
      altText: altText || req.file.originalname,
      isPrimary: false,
      dimensions: null,
      cloudinaryPublicId: uploadResult.publicId // Store the public ID (for both Cloudinary and local)
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
  const restaurantId = parseInt(req.params.restaurantId);
  const { id } = req.params;
  const { fileName, altText } = req.body;

  // Verify the asset belongs to this restaurant
  const existingAsset = await prisma.brandAsset.findFirst({
    where: {
      id: id,
      restaurantId: restaurantId
    }
  });

  if (!existingAsset) {
    return res.status(404).json({ error: 'Asset not found or access denied' });
  }

  const asset = await prisma.brandAsset.update({
    where: { id: id },
    data: {
      ...(fileName && { fileName }),
      ...(altText !== undefined && { altText })
    }
  });

  res.json(asset);
});

// Delete asset with enhanced security and Cloudinary cleanup
export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = parseInt(req.params.restaurantId);
  const { id } = req.params;

  // Get the asset with ownership validation
  const asset = await prisma.brandAsset.findFirst({
    where: {
      id: id,
      restaurantId: restaurantId // Ensure it belongs to this restaurant
    }
  });

  if (!asset) {
    return res.status(404).json({ error: 'Asset not found or access denied' });
  }

  try {
    // Delete from Cloudinary if cloudinaryPublicId exists
    if (asset.cloudinaryPublicId) {
      try {
        await deleteImage(asset.cloudinaryPublicId, restaurantId);
        console.log(`🗑️ Deleted from Cloudinary: ${asset.cloudinaryPublicId}`);
      } catch (cloudinaryError) {
        console.warn('Warning: Could not delete from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    } else {
      console.log('⚠️ No cloudinaryPublicId found, skipping Cloudinary deletion');
    }
    
    // Delete from database
    await prisma.brandAsset.delete({
      where: { id: id }
    });

    console.log(`✅ Deleted asset ${asset.fileName} for restaurant ${restaurantId}`);

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

// Basic folder management for current schema
export const getFolders = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = parseInt(req.params.restaurantId);

  try {
    // Check if AssetFolder table exists in production
    const folders = await prisma.assetFolder.findMany({
      where: { restaurantId },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            assets: true,
            subFolders: true
          }
        }
      }
    });

    res.json(folders);
  } catch (error: any) {
    // If AssetFolder table doesn't exist in production, return empty array with a note
    console.log('[AssetController] AssetFolder table not available in production schema');
    res.json([]);
  }
});

export const createFolder = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = parseInt(req.params.restaurantId);
  const { name, parentFolderId, colorHex = '#1976d2', description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  try {
    const folder = await prisma.assetFolder.create({
      data: {
        restaurantId,
        name,
        parentFolderId: parentFolderId || null,
        colorHex,
        description: description || null,
        sortOrder: 0,
        isSystemFolder: false
      },
      include: {
        _count: {
          select: {
            assets: true,
            subFolders: true
          }
        }
      }
    });

    res.status(201).json(folder);
  } catch (error: any) {
    console.error('[AssetController] Create folder error:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'A folder with this name already exists' });
    } else {
      res.status(501).json({ error: 'Folder management not available in production schema' });
    }
  }
});

export const updateFolder = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = parseInt(req.params.restaurantId);
  const { id } = req.params;
  const { name, colorHex, description, sortOrder } = req.body;

  try {
    // Verify ownership
    const existingFolder = await prisma.assetFolder.findFirst({
      where: {
        id: id,
        restaurantId: restaurantId
      }
    });

    if (!existingFolder) {
      return res.status(404).json({ error: 'Folder not found or access denied' });
    }

    const folder = await prisma.assetFolder.update({
      where: { id: id },
      data: {
        ...(name && { name }),
        ...(colorHex && { colorHex }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder })
      },
      include: {
        _count: {
          select: {
            assets: true,
            subFolders: true
          }
        }
      }
    });

    res.json(folder);
  } catch (error: any) {
    console.error('[AssetController] Update folder error:', error);
    res.status(501).json({ error: 'Folder management not available in production schema' });
  }
});

export const deleteFolder = asyncHandler(async (req: Request, res: Response) => {
  const restaurantId = parseInt(req.params.restaurantId);
  const { id } = req.params;
  const { force = false, moveAssetsToParent = false } = req.query;

  try {
    // Verify ownership and check for assets/subfolders
    const folder = await prisma.assetFolder.findFirst({
      where: {
        id: id,
        restaurantId: restaurantId
      },
      include: {
        _count: {
          select: {
            assets: true,
            subFolders: true
          }
        },
        parentFolder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!folder) {
      return res.status(404).json({ error: 'Folder not found or access denied' });
    }

    // Handle folder with contents
    if (folder._count.assets > 0 || folder._count.subFolders > 0) {
      if (moveAssetsToParent === 'true') {
        // Move assets to parent folder (or null for root)
        if (folder._count.assets > 0) {
          await prisma.brandAsset.updateMany({
            where: { folderId: id },
            data: { folderId: folder.parentFolderId }
          });
        }
        
        // Move subfolders to parent folder (or null for root)
        if (folder._count.subFolders > 0) {
          await prisma.assetFolder.updateMany({
            where: { parentFolderId: id },
            data: { parentFolderId: folder.parentFolderId }
          });
        }
        
        console.log(`[AssetController] Moved ${folder._count.assets} assets and ${folder._count.subFolders} subfolders to parent`);
      } else if (force !== 'true') {
        return res.status(400).json({ 
          error: 'Cannot delete folder that contains assets or subfolders.',
          details: {
            assets: folder._count.assets,
            subFolders: folder._count.subFolders,
            parentFolder: folder.parentFolder?.name || 'Root',
            suggestions: [
              'Use ?moveAssetsToParent=true to move contents to parent folder',
              'Use ?force=true to delete folder and all contents permanently'
            ]
          }
        });
      }
      // If force=true, we'll delete the folder and cascade will handle the contents
    }

    await prisma.assetFolder.delete({
      where: { id: id }
    });

    const action = moveAssetsToParent === 'true' ? 'moved contents and deleted' : 
                   force === 'true' ? 'force deleted' : 'deleted';
    
    res.json({ 
      message: `Folder ${action} successfully`,
      details: {
        folderName: folder.name,
        assetsAffected: folder._count.assets,
        subfoldersAffected: folder._count.subFolders,
        action
      }
    });
  } catch (error: any) {
    console.error('[AssetController] Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export const trackAssetUsage = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ error: 'Asset usage tracking not yet implemented' });
});

/**
 * Import ALL existing assets from Cloudinary for a restaurant (historical import)
 * This scans the entire Cloudinary account and imports assets not in database
 * FIXED: Now properly filters out demo/sample assets
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
      select: { id: true, fileName: true, cloudinaryPublicId: true }
    });

    const existingPublicIds = new Set(
      existingAssets
        .map(asset => asset.cloudinaryPublicId)
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

    // ENHANCED FILTERING: Filter out assets already in database and demo assets
    const assetsToImport = allAssets.filter(asset => {
      // Skip if already imported (check by public_id)
      if (existingPublicIds.has(asset.public_id)) {
        return false;
      }
      
      // Skip Cloudinary sample/demo assets (ENHANCED FILTERING)
      if (asset.public_id.startsWith('samples/') || 
          asset.public_id.startsWith('demo_') ||
          asset.public_id.startsWith('cld-sample') ||
          asset.public_id === 'sample' ||
          asset.public_id.includes('sample-') ||
          asset.public_id.includes('cloudinary-') ||
          asset.original_filename?.includes('sample') ||
          asset.original_filename?.includes('demo')) {
        console.log(`🚫 Skipping demo/sample asset: ${asset.public_id}`);
        return false;
      }
      
      // For Restaurant 2 (Coq au Vin), only import assets that are likely legitimate:
      // - Assets in restaurant-specific folders
      // - Assets in content-blocks, recipe-photos folders
      // - Assets from known business partners (seabreeze_farm, neverstill)
      if (restaurantId === 2) {
        const isRestaurantSpecific = asset.public_id.startsWith('restaurants/2/');
        const isContentBlock = asset.public_id.startsWith('content-blocks/');
        const isRecipePhoto = asset.public_id.startsWith('recipe-photos/');
        const isRestaurantSetting = asset.public_id.startsWith('restaurant-settings/');
        const isMenuLogo = asset.public_id.startsWith('menu-logos/');
        const isBusinessPartner = asset.public_id.startsWith('seabreeze_farm/') || 
                                 asset.public_id.startsWith('neverstill/');
        
        const isLegitimate = isRestaurantSpecific || isContentBlock || isRecipePhoto || 
                           isRestaurantSetting || isMenuLogo || isBusinessPartner;
        
        if (!isLegitimate) {
          console.log(`🚫 Skipping non-restaurant asset: ${asset.public_id}`);
          return false;
        }
      }
      
      console.log(`✅ Including asset: ${asset.public_id} (${asset.assetType})`);
      return true;
    });

    console.log(`📥 Importing ${assetsToImport.length} historical assets`);

    // Special case: No assets to import (everything already imported)
    if (assetsToImport.length === 0) {
      console.log(`✅ All legitimate Cloudinary assets already imported! Database has ${existingAssets.length} assets.`);
      
      return res.json({
        success: true,
        message: `🎉 Import check complete! All your legitimate Cloudinary assets are already in your Asset Library.`,
        imported: 0,
        totalCloudinary: allAssets.length,
        totalDatabase: existingAssets.length,
        skipped: allAssets.length - assetsToImport.length,
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
          dimensions: null,
          cloudinaryPublicId: asset.public_id // Store the public ID for future reference
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
      message: `🎉 Historical import complete! Successfully imported ${importedAssets.length} legitimate assets from your Cloudinary account`,
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
        successfullyImported: importedAssets.length,
        demoAssetsSkipped: allAssets.length - assetsToImport.length - existingAssets.length
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