/**
 * Utility functions for generating asset thumbnail URLs
 * Handles both Cloudinary URLs and local storage URLs
 */

/**
 * Get a thumbnail URL for an asset
 * @param fileUrl - The full URL of the asset
 * @param cloudinaryPublicId - Optional Cloudinary public ID (for better transformation)
 * @param size - Thumbnail size (default: 200px)
 * @returns Thumbnail URL or original URL if transformation not possible
 */
export const getAssetThumbnailUrl = (
  fileUrl: string | null | undefined,
  cloudinaryPublicId?: string | null,
  size: number = 200
): string | undefined => {
  if (!fileUrl) return undefined;

  // If it's a Cloudinary URL, transform it to a thumbnail
  if (fileUrl.includes('res.cloudinary.com')) {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
      // We need to insert or replace transformations
      
      // Split by /upload/ to get the base URL and the path after upload
      const parts = fileUrl.split('/upload/');
      if (parts.length === 2) {
        const baseUrl = parts[0];
        const pathAfterUpload = parts[1];
        
        // Thumbnail transformation parameters
        // w_200,h_200,c_fill: width 200px, height 200px, crop mode fill
        // q_auto: automatic quality optimization
        // f_auto: automatic format optimization
        const thumbnailTransform = `w_${size},h_${size},c_fill,q_auto,f_auto`;
        
        // Check if there are existing transformations in the path
        // Transformations are typically before the filename and separated by /
        // Pattern: {transformations}/{public_id}.{format} or just {public_id}.{format}
        const pathParts = pathAfterUpload.split('/');
        
        // If the first part looks like transformations (contains underscores, commas, or common transform params)
        // Otherwise, it's likely the public_id directly
        const hasTransformations = pathParts[0].includes('_') && 
          (pathParts[0].includes('w_') || pathParts[0].includes('h_') || pathParts[0].includes('c_'));
        
        if (hasTransformations && pathParts.length > 1) {
          // Replace existing transformations with thumbnail transformations
          const publicIdAndFormat = pathParts.slice(1).join('/');
          return `${baseUrl}/upload/${thumbnailTransform}/${publicIdAndFormat}`;
        } else {
          // No existing transformations, insert thumbnail transformations
          return `${baseUrl}/upload/${thumbnailTransform}/${pathAfterUpload}`;
        }
      }
    } catch (error) {
      console.warn('Error transforming Cloudinary URL:', error);
    }
    
    // If we can't parse the URL, return original
    return fileUrl;
  }

  // If we have a Cloudinary public ID but not a full URL, construct thumbnail URL
  if (cloudinaryPublicId && !fileUrl.includes('res.cloudinary.com')) {
    // Extract cloud name from environment or use default
    // Note: This assumes the public ID format includes the cloud name
    // If not, we'd need to get it from config
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dhaacekdd';
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_${size},h_${size},c_fill,q_auto,f_auto/${cloudinaryPublicId}`;
  }

  // Return original URL if not Cloudinary or can't transform
  return fileUrl;
};

/**
 * Get a small thumbnail URL (120px) for use in lists
 */
export const getAssetThumbnailSmall = (
  fileUrl: string | null | undefined,
  cloudinaryPublicId?: string | null
): string | undefined => {
  return getAssetThumbnailUrl(fileUrl, cloudinaryPublicId, 120);
};

/**
 * Get a medium thumbnail URL (200px) for use in grids
 */
export const getAssetThumbnailMedium = (
  fileUrl: string | null | undefined,
  cloudinaryPublicId?: string | null
): string | undefined => {
  return getAssetThumbnailUrl(fileUrl, cloudinaryPublicId, 200);
};

/**
 * Get a large thumbnail URL (400px) for use in previews
 */
export const getAssetThumbnailLarge = (
  fileUrl: string | null | undefined,
  cloudinaryPublicId?: string | null
): string | undefined => {
  return getAssetThumbnailUrl(fileUrl, cloudinaryPublicId, 400);
};

