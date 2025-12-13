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
  if (!fileUrl) {
    console.debug('[Thumbnail] No fileUrl provided');
    return undefined;
  }

  // If it's a Cloudinary URL, transform it to a thumbnail
  if (fileUrl.includes('res.cloudinary.com')) {
    try {
      // Cloudinary URL format: 
      // https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
      // or: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{public_id}.{format}
      
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
        
        // Simplified approach: Check if path starts with transformation parameters
        // Cloudinary transformations typically start with patterns like w_, h_, c_, etc.
        // and contain underscores and commas, but no file extensions
        const pathParts = pathAfterUpload.split('/');
        const firstPart = pathParts[0];
        
        // Simple check: if first part looks like transformations (contains underscore and no file extension)
        // Transformation patterns: w_200, h_300, w_200,h_200,c_fill, etc.
        const looksLikeTransformations = 
          firstPart.includes('_') && 
          !firstPart.includes('.') && 
          /^[a-z0-9_,:\-]+$/i.test(firstPart) &&
          pathParts.length > 1;
        
        if (looksLikeTransformations) {
          // Replace existing transformations with thumbnail transformations
          // Reconstruct the path with the public_id and any subfolders
          const publicIdAndFormat = pathParts.slice(1).join('/');
          const thumbnailUrl = `${baseUrl}/upload/${thumbnailTransform}/${publicIdAndFormat}`;
          console.debug('[Thumbnail] Replaced transformations:', { original: fileUrl, thumbnail: thumbnailUrl });
          return thumbnailUrl;
        } else {
          // No existing transformations, insert thumbnail transformations
          const thumbnailUrl = `${baseUrl}/upload/${thumbnailTransform}/${pathAfterUpload}`;
          console.debug('[Thumbnail] Added transformations:', { original: fileUrl, thumbnail: thumbnailUrl });
          return thumbnailUrl;
        }
      }
    } catch (error) {
      console.warn('[Thumbnail] Error transforming Cloudinary URL:', error, fileUrl);
    }
    
    // If we can't parse the URL, return original
    console.debug('[Thumbnail] Returning original URL (not Cloudinary or parse failed):', fileUrl);
    return fileUrl;
  }

  // If we have a Cloudinary public ID but not a full URL, construct thumbnail URL
  if (cloudinaryPublicId && !fileUrl.includes('res.cloudinary.com')) {
    // Extract cloud name from environment variable (Vite uses import.meta.env.VITE_ prefix)
    // If not set, return undefined to prevent constructing URLs with wrong cloud name
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.warn('[Thumbnail] VITE_CLOUDINARY_CLOUD_NAME not set, cannot construct Cloudinary thumbnail URL', {
        cloudinaryPublicId,
        fileUrl
      });
      return undefined;
    }
    const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${size},h_${size},c_fill,q_auto,f_auto/${cloudinaryPublicId}`;
    console.debug('[Thumbnail] Constructed from public ID:', { cloudinaryPublicId, thumbnailUrl });
    return thumbnailUrl;
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

