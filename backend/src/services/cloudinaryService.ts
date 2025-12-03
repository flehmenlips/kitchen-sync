import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file to Cloudinary with restaurant-specific folder isolation
 * @param filePath Local path to the file to upload
 * @param folder Restaurant-specific folder (format: restaurants/{restaurantId}/assets)
 * @returns Promise with the upload result
 */
export const uploadImage = async (filePath: string, folder: string = 'recipe-photos'): Promise<{url: string, publicId: string}> => {
  try {
    // Validate folder format for security
    if (folder.startsWith('restaurants/') && !folder.match(/^restaurants\/\d+\/[a-zA-Z0-9_-]+$/)) {
      throw new Error('Invalid folder format. Must be restaurants/{restaurantId}/{subfolder}');
    }
    
    // Upload the image
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto', // Support images, videos, and documents
      access_mode: 'public' // Ensure public access for web display
    });
    
    console.log(`Uploaded to Cloudinary: ${result.public_id} in folder: ${folder}`);
    
    // Delete the local file after successful upload
    try {
      await unlinkAsync(filePath);
      console.log(`Deleted local file: ${filePath}`);
    } catch (error) {
      console.warn(`Warning: Could not delete local file ${filePath}`, error);
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Lists all assets in a restaurant-specific folder
 * @param restaurantId The restaurant ID for folder isolation
 * @param maxResults Maximum number of results to return (default: 100)
 * @returns Promise with array of Cloudinary assets
 */
export const listRestaurantAssets = async (restaurantId: number, maxResults: number = 100): Promise<any[]> => {
  try {
    const folderPrefix = `restaurants/${restaurantId}/`;
    
    // Search for all assets in the restaurant's folder
    const result = await cloudinary.search
      .expression(`folder:${folderPrefix}*`)
      .sort_by('created_at', 'desc')
      .max_results(maxResults)
      .execute();
    
    console.log(`Found ${result.resources.length} existing assets for restaurant ${restaurantId}`);
    
    return result.resources.map((asset: any) => ({
      publicId: asset.public_id,
      url: asset.secure_url,
      fileName: asset.filename || asset.public_id.split('/').pop(),
      fileSize: asset.bytes,
      mimeType: asset.format ? `${asset.resource_type}/${asset.format}` : 'unknown',
      assetType: asset.resource_type,
      createdAt: asset.created_at,
      width: asset.width,
      height: asset.height,
      folder: asset.folder
    }));
  } catch (error) {
    console.error(`Error listing assets for restaurant ${restaurantId}:`, error);
    throw error;
  }
};

/**
 * Validates that a public_id belongs to a specific restaurant (security check)
 * @param publicId The Cloudinary public ID to validate
 * @param restaurantId The restaurant ID that should own this asset
 * @returns boolean indicating if the asset belongs to the restaurant
 */
export const validateAssetOwnership = (publicId: string, restaurantId: number): boolean => {
  const expectedPrefix = `restaurants/${restaurantId}/`;
  return publicId.startsWith(expectedPrefix);
};

/**
 * Deletes an image from Cloudinary with optional ownership validation
 * @param publicId The public ID of the image to delete
 * @param restaurantId Optional restaurant ID for security validation (for new assets)
 */
export const deleteImage = async (publicId: string, restaurantId?: number): Promise<void> => {
  if (!publicId) {
    console.warn('No publicId provided for deletion, skipping');
    return;
  }
  
  // Security check: ensure the asset belongs to the restaurant (only for new assets with restaurant folder structure)
  if (restaurantId && publicId.startsWith('restaurants/') && !validateAssetOwnership(publicId, restaurantId)) {
    throw new Error(`Security violation: Asset ${publicId} does not belong to restaurant ${restaurantId}`);
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image from Cloudinary: ${publicId}, result: ${result.result}`);
  } catch (error) {
    console.error(`Error deleting image from Cloudinary (${publicId}):`, error);
    throw error;
  }
};

/**
 * Migrates an asset from old folder structure to new standardized structure
 * @param publicId Current public ID of the asset
 * @param restaurantId Restaurant ID
 * @param targetSubfolder Target subfolder within restaurants/{id}/assets/
 * @returns New public ID after migration
 */
export const migrateAssetFolder = async (
  publicId: string,
  restaurantId: number,
  targetSubfolder: string = 'general'
): Promise<string> => {
  try {
    const newPublicId = `restaurants/${restaurantId}/assets/${targetSubfolder}/${publicId.split('/').pop()}`;
    
    // Use Cloudinary's rename API to move the asset
    const result = await cloudinary.uploader.rename(publicId, newPublicId);
    
    if (result.public_id) {
      console.log(`✅ Migrated asset: ${publicId} → ${result.public_id}`);
      return result.public_id;
    } else {
      throw new Error('Migration failed: No public_id returned');
    }
  } catch (error: any) {
    // If asset already exists at destination, that's okay
    if (error.message?.includes('already exists')) {
      console.log(`ℹ️ Asset already exists at destination: ${publicId}`);
      return `restaurants/${restaurantId}/assets/${targetSubfolder}/${publicId.split('/').pop()}`;
    }
    console.error(`Error migrating asset ${publicId}:`, error);
    throw error;
  }
};

/**
 * Migrates all assets for a restaurant to standardized folder structure
 * @param restaurantId Restaurant ID
 * @param folderMapping Map of old folder patterns to new subfolder names
 * @returns Migration results
 */
export const migrateRestaurantAssets = async (
  restaurantId: number,
  folderMapping: Record<string, string> = {}
): Promise<{
  migrated: number;
  failed: number;
  skipped: number;
  details: Array<{ oldPublicId: string; newPublicId: string; status: string }>;
}> => {
  const results = {
    migrated: 0,
    failed: 0,
    skipped: 0,
    details: [] as Array<{ oldPublicId: string; newPublicId: string; status: string }>
  };

  try {
    // FIXED: Search specifically for restaurant's folder instead of all folders
    // This ensures we get the correct assets even in multi-tenant environments
    const restaurantFolderPrefix = `restaurants/${restaurantId}/`;
    const allAssets = await cloudinary.search
      .expression(`folder:${restaurantFolderPrefix}*`)
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();

    // Filter assets that belong to this restaurant
    // IMPORTANT: Only migrate assets that explicitly belong to this restaurant
    // to prevent cross-tenant data corruption in multi-tenant system
    const restaurantAssets = allAssets.resources.filter((asset: any) => {
      const publicId = asset.public_id;
      
      // Already in new structure
      if (publicId.startsWith(`restaurants/${restaurantId}/assets/`)) {
        return false; // Skip, already migrated
      }
      
      // Only migrate assets that explicitly belong to this restaurant
      // Do NOT use global folder patterns (content-blocks/, recipe-photos/, etc.)
      // as they are shared across restaurants and would cause data corruption
      const isRestaurantAsset = publicId.startsWith(`restaurants/${restaurantId}/`);
      
      return isRestaurantAsset;
    });

    console.log(`Found ${restaurantAssets.length} assets to migrate for restaurant ${restaurantId}`);

    // Determine target subfolder based on current folder
    const getTargetSubfolder = (publicId: string): string => {
      // Check folder mapping first
      for (const [pattern, subfolder] of Object.entries(folderMapping)) {
        if (publicId.includes(pattern)) {
          return subfolder;
        }
      }
      
      // Default mapping based on folder patterns
      if (publicId.includes('content-blocks')) return 'content-blocks';
      if (publicId.includes('recipe-photos') || publicId.includes('recipe')) return 'recipes';
      if (publicId.includes('restaurant-settings') || publicId.includes('menu-logos')) return 'branding';
      if (publicId.includes('restaurants/')) {
        // Extract subfolder from existing structure
        // Format: restaurants/{id}/{subfolder}/{filename} or restaurants/{id}/{filename}
        const parts = publicId.split('/');
        // Check if there's an actual subfolder (parts.length > 3 means: restaurants, id, subfolder, filename)
        if (parts.length > 3) {
          return parts[parts.length - 2] || 'general';
        }
        // If directly in restaurant folder (restaurants/{id}/{filename}), use 'general'
      }
      
      return 'general';
    };

    // Migrate each asset
    for (const asset of restaurantAssets) {
      try {
        const targetSubfolder = getTargetSubfolder(asset.public_id);
        const newPublicId = await migrateAssetFolder(asset.public_id, restaurantId, targetSubfolder);
        
        results.migrated++;
        results.details.push({
          oldPublicId: asset.public_id,
          newPublicId,
          status: 'success'
        });
      } catch (error: any) {
        results.failed++;
        results.details.push({
          oldPublicId: asset.public_id,
          newPublicId: '',
          status: `error: ${error.message}`
        });
      }
    }

    console.log(`Migration complete: ${results.migrated} migrated, ${results.failed} failed, ${results.skipped} skipped`);
    return results;
  } catch (error) {
    console.error('Error migrating restaurant assets:', error);
    throw error;
  }
};

export default {
  uploadImage,
  deleteImage,
  listRestaurantAssets,
  validateAssetOwnership,
  migrateAssetFolder,
  migrateRestaurantAssets
}; 