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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:13',message:'getAssetThumbnailUrl entry',data:{fileUrl:fileUrl?.substring(0,100),cloudinaryPublicId,size,hasFileUrl:!!fileUrl,envVar:import.meta.env.VITE_CLOUDINARY_CLOUD_NAME},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
  // #endregion
  
  if (!fileUrl) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:20',message:'No fileUrl provided',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.debug('[Thumbnail] No fileUrl provided');
    return undefined;
  }

  // Ensure fileUrl is a string (handle edge cases)
  const urlString = String(fileUrl).trim();
  if (!urlString) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:27',message:'Empty fileUrl after trimming',data:{originalFileUrl:fileUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.debug('[Thumbnail] Empty fileUrl after trimming');
    return undefined;
  }

  // If it's a Cloudinary URL, transform it to a thumbnail
  if (urlString.includes('res.cloudinary.com')) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:31',message:'Cloudinary URL detected',data:{urlString:urlString.substring(0,150),size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
    // #endregion
    try {
      // Cloudinary URL format: 
      // https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/{public_id}.{format}
      // or: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{public_id}.{format}
      
      // Split by /upload/ to get the base URL and the path after upload
      const parts = urlString.split('/upload/');
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
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:145',message:'Replaced transformations',data:{original:urlString.substring(0,150),thumbnail:thumbnailUrl.substring(0,150)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
          // #endregion
          console.debug('[Thumbnail] Replaced transformations:', { original: urlString, thumbnail: thumbnailUrl });
          return thumbnailUrl;
        } else {
          // No existing transformations, insert thumbnail transformations
          const thumbnailUrl = `${baseUrl}/upload/${thumbnailTransform}/${pathAfterUpload}`;
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:152',message:'Added transformations',data:{original:urlString.substring(0,150),thumbnail:thumbnailUrl.substring(0,150)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
          // #endregion
          console.debug('[Thumbnail] Added transformations:', { original: urlString, thumbnail: thumbnailUrl });
          return thumbnailUrl;
        }
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:159',message:'Error transforming Cloudinary URL',data:{error:String(error),urlString:urlString.substring(0,150)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.warn('[Thumbnail] Error transforming Cloudinary URL:', error, urlString);
    }
    
    // If we can't parse the URL, return original
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:165',message:'Returning original URL (parse failed)',data:{urlString:urlString.substring(0,150)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,E'})}).catch(()=>{});
    // #endregion
    console.debug('[Thumbnail] Returning original URL (not Cloudinary or parse failed):', urlString);
    return urlString;
  }

  // If we have a Cloudinary public ID but not a full URL, construct thumbnail URL
  if (cloudinaryPublicId && !urlString.includes('res.cloudinary.com')) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:169',message:'Constructing from public ID',data:{cloudinaryPublicId,urlString:urlString.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'})}).catch(()=>{});
    // #endregion
    // Extract cloud name from environment variable (Vite uses import.meta.env.VITE_ prefix)
    // If not set, return undefined to prevent constructing URLs with wrong cloud name
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:173',message:'VITE_CLOUDINARY_CLOUD_NAME not set',data:{cloudinaryPublicId,urlString:urlString.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      console.warn('[Thumbnail] VITE_CLOUDINARY_CLOUD_NAME not set, cannot construct Cloudinary thumbnail URL', {
        cloudinaryPublicId,
        fileUrl: urlString
      });
      // Return original URL as fallback instead of undefined
      return urlString;
    }
    const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${size},h_${size},c_fill,q_auto,f_auto/${cloudinaryPublicId}`;
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:181',message:'Constructed thumbnail from public ID',data:{cloudinaryPublicId,thumbnailUrl:thumbnailUrl.substring(0,150)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,D'})}).catch(()=>{});
    // #endregion
    console.debug('[Thumbnail] Constructed from public ID:', { cloudinaryPublicId, thumbnailUrl });
    return thumbnailUrl;
  }

  // Return original URL if not Cloudinary or can't transform
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/ff149c4b-a3fe-4d61-90af-9a16d2e3cd27',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'assetThumbnails.ts:186',message:'Returning original URL (not Cloudinary)',data:{urlString:urlString.substring(0,150),hasCloudinaryPublicId:!!cloudinaryPublicId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return urlString;
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

