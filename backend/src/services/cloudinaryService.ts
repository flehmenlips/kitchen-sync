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
      .sort_by([['created_at', 'desc']])
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
 * Deletes an image from Cloudinary with ownership validation
 * @param publicId The public ID of the image to delete
 * @param restaurantId The restaurant ID for security validation
 */
export const deleteImage = async (publicId: string, restaurantId?: number): Promise<void> => {
  if (!publicId) {
    console.warn('No publicId provided for deletion, skipping');
    return;
  }
  
  // Security check: ensure the asset belongs to the restaurant
  if (restaurantId && !validateAssetOwnership(publicId, restaurantId)) {
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

export default {
  uploadImage,
  deleteImage,
  listRestaurantAssets,
  validateAssetOwnership
}; 