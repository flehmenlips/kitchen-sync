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
        
        // Check if path starts with transformation parameters
        // Cloudinary transformations use specific keys (w, h, c, q, f, etc.)
        // Folder names like "seabreeze_farm" contain underscores but are NOT transformations
        const pathParts = pathAfterUpload.split('/');
        const firstPart = pathParts[0];
        
        // Valid Cloudinary transformation keys (commonly used in URLs)
        // Only include keys that are commonly used in transformation URLs and unlikely to conflict with folder names
        // Common keys: w (width), h (height), c (crop), q (quality), f (format), g (gravity)
        // Excluded overly broad single-letter keys (t, d, b, o, l, u, a) that could match folder names like "t_test", "o_old", "u_uploads", "a_archive"
        // Excluded ALL double-letter keys (fl, ar, br, bo, co, du, eo, so) that could match folder names like "fl_flags", "ar_architecture", "co_recipes"
        // Single-letter keys are safer because they're so short and commonly used in transformations that they're unlikely to be folder name prefixes
        const validTransformationKeys = [
          // Most common transformation keys (core thumbnail parameters)
          'w', 'h', 'c', 'q', 'f', 'g',
          // Less common but safe (unlikely to be folder names)
          'x', 'y', 'r', 'e'
        ];
        
        // Helper function to validate transformation value based on key
        const isValidTransformationValue = (key: string, value: string): boolean => {
          const lowerValue = value.toLowerCase();
          
          // Numeric keys: w, h, x, y, r (width, height, x-coord, y-coord, radius)
          // Accept numbers including negative and decimal values
          const numericKeys = ['w', 'h', 'x', 'y', 'r'];
          if (numericKeys.includes(key)) {
            return /^-?\d+(\.\d+)?$/.test(value);
          }
          
          // Crop mode (c): accepts specific crop keywords
          if (key === 'c') {
            const cropKeywords = ['fill', 'fit', 'limit', 'scale', 'thumb', 'pad', 'crop', 'lfill', 'lpad', 'imagga'];
            return cropKeywords.includes(lowerValue);
          }
          
          // Quality (q): accepts numbers or 'auto'
          if (key === 'q') {
            return /^-?\d+(\.\d+)?$/.test(value) || lowerValue === 'auto';
          }
          
          // Format (f): accepts format identifiers
          if (key === 'f') {
            const formatKeywords = ['auto', 'webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'tiff', 'pdf', 'ico', 'heic', 'heif'];
            return formatKeywords.includes(lowerValue);
          }
          
          // Gravity (g): accepts direction and face detection keywords
          if (key === 'g') {
            const gravityKeywords = ['north', 'south', 'east', 'west', 'center', 'north_east', 'north_west', 'south_east', 'south_west', 'face', 'faces', 'body'];
            return gravityKeywords.includes(lowerValue);
          }
          
          // Effect (e): accepts numeric values or effect keywords
          if (key === 'e') {
            // Check if it's numeric first
            if (/^-?\d+(\.\d+)?$/.test(value)) {
              return true;
            }
            // Common effect keywords
            const effectKeywords = ['blur', 'sharpen', 'grayscale', 'sepia', 'oil_paint', 'cartoonify', 'outline', 'blackwhite', 'negate', 'vignette', 'pixelate'];
            return effectKeywords.includes(lowerValue);
          }
          
          return false;
        };
        
        // Check if first part contains valid transformation keys AND values
        // Split by comma to handle multiple parameters (e.g., "w_200,h_200,c_fill")
        // Use .every() to ensure ALL parameters are valid transformations, not just one
        // This prevents false positives like "w_200,seabreeze_farm" from being treated as transformations
        const params = firstPart.split(',');
        const hasValidTransformationKeys = params.length > 0 && params.every(param => {
          // Each parameter should be in format: key_value
          const underscoreIndex = param.indexOf('_');
          if (underscoreIndex === -1) return false;
          
          const key = param.substring(0, underscoreIndex).toLowerCase();
          const value = param.substring(underscoreIndex + 1);
          
          // Must have valid key AND valid value
          return validTransformationKeys.includes(key) && isValidTransformationValue(key, value);
        });
        
        // Only consider it a transformation if:
        // - Contains valid transformation keys (not just any underscore)
        // - Contains only valid characters (letters, numbers, underscores, commas, colons, hyphens, dots for decimals)
        //   This prevents invalid formats like "w_200@special" from being treated as transformations
        //   Dots are allowed for decimal values in numeric transformations (e.g., r_10.5, x_100.5)
        // - No file extension (transformations don't have extensions - but dots in decimal values are OK)
        // - Has path parts after it (the actual public_id)
        const looksLikeTransformations = 
          hasValidTransformationKeys &&
          /^[a-z0-9_,:\-\.]+$/i.test(firstPart) &&
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

