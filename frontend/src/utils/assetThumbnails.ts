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
        
        // Check if there are existing transformations in the path
        // Transformations come right after /upload/ and before the public_id
        // They typically contain parameters like w_, h_, c_, etc.
        const pathParts = pathAfterUpload.split('/');
        
        // Check if first part looks like transformations
        // Cloudinary transformations can be:
        // - Single parameter: w_200, h_300, c_fill, q_auto, f_auto
        // - Multiple parameters: w_200,h_200,c_fill,q_auto,f_auto
        // They must:
        // 1. Match the pattern of transformation parameters (key_value pairs)
        // 2. Have values that look like transformation values (numbers or keywords like auto, fill, limit)
        // 3. Not contain file extensions (transformations don't have extensions)
        // 4. Not look like folder names (which typically have arbitrary text values)
        const firstPart = pathParts[0];
        const hasFileExtension = /\.(jpg|jpeg|png|gif|webp|svg|mp4|mov|pdf|doc|docx)$/i.test(firstPart);
        
        // Pattern for transformation parameters
        // Cloudinary transformations use 1-2 letter keys (w, h, c, q, f, g, etc.) followed by values
        // Values can be: numbers, or specific keywords (auto, fill, limit, face, etc.)
        // Single parameter: w_200, h_300, c_fill, q_auto, f_auto, g_face
        // Multiple parameters: w_200,h_200,c_fill,q_auto,f_auto
        
        // Helper function to split parameters, handling RGB values that contain commas
        // RGB values have the format rgb:255,255,255, so we need to detect when commas are part of RGB vs parameter separators
        const splitParams = (paramString: string): string[] => {
          const params: string[] = [];
          let i = 0;
          
          while (i < paramString.length) {
            // Find the next parameter: key_value format
            // Key is 1-2 letters followed by underscore
            const keyMatch = paramString.substring(i).match(/^([a-z]{1,2})_/i);
            if (!keyMatch) break;
            
            const keyEnd = i + keyMatch[0].length;
            let valueEnd = keyEnd;
            
            // Check if this is an RGB value (rgb:255,255,255)
            const rgbMatch = paramString.substring(keyEnd).match(/^rgb:\d+,\d+,\d+/i);
            if (rgbMatch) {
              // This is an RGB value, include the entire RGB value
              valueEnd = keyEnd + rgbMatch[0].length;
            } else {
              // Find the end of this parameter (next comma or end of string)
              const nextComma = paramString.indexOf(',', keyEnd);
              valueEnd = nextComma === -1 ? paramString.length : nextComma;
            }
            
            // Extract this parameter
            const param = paramString.substring(i, valueEnd);
            params.push(param);
            
            // Move past this parameter and the comma (if any)
            i = valueEnd;
            if (i < paramString.length && paramString[i] === ',') {
              i++; // Skip the comma
            }
          }
          
          return params;
        };
        
        // Check if it matches the basic structure: key_value pairs
        // Single parameter pattern: 1-2 letters, underscore, then value (no commas except for RGB)
        // Must allow: negative numbers (-), decimals (.), hex colors (#), and colons (:) for RGB
        // Note: - must be at the end of character class to avoid being interpreted as a range
        const singleParamPatternNoComma = /^[a-z]{1,2}_[a-z0-9_:#.\-]+$/i;
        
        // Single parameter with RGB value pattern (rgb:255,255,255)
        // RGB values contain commas but are still single parameters
        // RGB values are 0-255 integers, so no decimals or negatives needed here
        const singleParamPatternRgb = /^[a-z]{1,2}_rgb:\d+,\d+,\d+$/i;
        
        // Multiple parameters pattern: comma-separated key_value pairs
        // We'll use smart parsing instead of regex to handle RGB values correctly
        const hasMultipleParams = firstPart.includes(',');
        
        // Check if it's a single parameter (either no commas, or RGB with commas)
        const isRgbSingleParam = singleParamPatternRgb.test(firstPart);
        const isSingleParamNoComma = !hasMultipleParams && singleParamPatternNoComma.test(firstPart);
        const matchesSingleParam = isSingleParamNoComma || isRgbSingleParam;
        
        // Multiple parameters: has commas and is NOT an RGB single param
        const matchesMultiParam = hasMultipleParams && !isRgbSingleParam;
        
        // Additional validation: check if keys and values look like transformation parameters
        // This distinguishes transformations from folder names
        // Transformation keys are limited to known Cloudinary transformation parameters
        // Transformation values are typically: numbers, or short keywords (auto, fill, limit, face, etc.)
        // Folder names are typically: longer arbitrary text (restaurants, weather_photos, config_files)
        let hasValidTransformationKeyAndValue = false;
        if (matchesSingleParam || matchesMultiParam) {
          // Use smart splitting that handles RGB values correctly
          // Prioritize multi-param parsing when commas are present (unless it's RGB)
          const params = matchesMultiParam ? splitParams(firstPart) : [firstPart];
          
          // Critical: Empty arrays return true for .every(), which would cause false positives
          // We must have at least one parameter to consider it a transformation
          if (params.length === 0) {
            hasValidTransformationKeyAndValue = false;
          } else {
            // Valid Cloudinary transformation keys (single and double letter)
            // Common single-letter keys: w (width), h (height), c (crop), q (quality), f (format), 
            //                           g (gravity), x (x coordinate), y (y coordinate), r (radius),
            //                           a (angle), e (effect), t (transformation), d (default image),
            //                           b (background), o (opacity), l (overlay), u (underlay)
            // Common double-letter keys: fl (flags), ar (aspect ratio), br (brightness), bo (border),
            //                            co (color), du (duration), eo (end offset), so (start offset)
            const validTransformationKeys = [
              'w', 'h', 'c', 'q', 'f', 'g', 'x', 'y', 'r', 'a', 'e', 't', 'd', 'b', 'o', 'l', 'u',
              'fl', 'ar', 'br', 'bo', 'co', 'du', 'eo', 'so'
            ];
            
            hasValidTransformationKeyAndValue = params.every(param => {
              const underscoreIndex = param.indexOf('_');
              if (underscoreIndex === -1) return false;
              
              // Extract and validate the key part (before the underscore)
              const keyPart = param.substring(0, underscoreIndex).toLowerCase();
              if (!validTransformationKeys.includes(keyPart)) {
                return false; // Invalid transformation key
              }
              
              // Extract and validate the value part (after the underscore)
              const valuePart = param.substring(underscoreIndex + 1);
              
              // Reject if value contains spaces or path separators (not valid in transformations)
              if (/[\s\/\\]/.test(valuePart)) return false;
              
              // Key-specific validation: ensure values are valid for their corresponding keys
              // This prevents invalid combinations like c_north (north is only valid for gravity g)
              // Cloudinary supports negative values (e.g., a_-45 for rotation) and decimal values (e.g., ar_1.5 for aspect ratio)
              const isNumber = /^-?\d+(\.\d+)?$/.test(valuePart);
              
              // Keys that only accept numbers (including negative and decimal values)
              const numericOnlyKeys = ['w', 'h', 'x', 'y', 'r', 'a', 'br', 'du', 'eo', 'so', 'ar'];
              if (numericOnlyKeys.includes(keyPart)) {
                return isNumber;
              }
              
              // Keys that accept numbers or 'auto'
              if (keyPart === 'q' || keyPart === 'o') {
                return isNumber || valuePart.toLowerCase() === 'auto';
              }
              
              // Crop mode (c): accepts specific crop keywords
              if (keyPart === 'c') {
                const cropKeywords = ['fill', 'fit', 'limit', 'scale', 'thumb', 'pad', 'crop', 'lfill', 'lpad', 'imagga'];
                return cropKeywords.includes(valuePart.toLowerCase());
              }
              
              // Format (f): accepts format identifiers
              // Common formats: auto, webp, png, jpg, jpeg, gif, svg, bmp, tiff, pdf, etc.
              if (keyPart === 'f') {
                const formatKeywords = ['auto', 'webp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'tiff', 'pdf', 'ico', 'heic', 'heif'];
                return formatKeywords.includes(valuePart.toLowerCase());
              }
              
              // Gravity (g): accepts direction and face detection keywords
              if (keyPart === 'g') {
                const gravityKeywords = ['north', 'south', 'east', 'west', 'center', 'north_east', 'north_west', 'south_east', 'south_west', 'face', 'faces', 'body'];
                return gravityKeywords.includes(valuePart.toLowerCase());
              }
              
              // Effect (e): accepts common effect identifiers
              // Common effects: blur, sharpen, grayscale, sepia, oil_paint, cartoonify, etc.
              // Also accepts numeric values for some effects
              if (keyPart === 'e') {
                const effectKeywords = ['blur', 'sharpen', 'grayscale', 'sepia', 'oil_paint', 'cartoonify', 'outline', 'blackwhite', 'negate', 'vignette', 'pixelate', 'art', 'al_dente', 'athena', 'audrey', 'aurora', 'daguerre', 'eucalyptus', 'fes', 'frost', 'hairspray', 'hokusai', 'incognito', 'linen', 'peacock', 'primavera', 'quartz', 'red_rock', 'refresh', 'sizzle', 'sonnet', 'ukulele', 'zorro'];
                return isNumber || effectKeywords.includes(valuePart.toLowerCase());
              }
              
              // Background (b): accepts 'auto' and color values
              // Color values can be hex (#fff, #ffffff), rgb (rgb:255,255,255), or named colors
              if (keyPart === 'b') {
                if (valuePart.toLowerCase() === 'auto') return true;
                // Accept hex colors (#fff, #ffffff), rgb format (rgb:255,255,255), or short alphanumeric (likely color codes)
                const isHexColor = /^#[0-9a-f]{3,6}$/i.test(valuePart);
                const isRgbColor = /^rgb:[0-9]{1,3},[0-9]{1,3},[0-9]{1,3}$/i.test(valuePart);
                // Accept short alphanumeric strings (likely color identifiers) but reject long ones (likely folder names)
                const isShortColorId = /^[a-z0-9_]{1,20}$/i.test(valuePart) && valuePart.length <= 20;
                return isHexColor || isRgbColor || isShortColorId;
              }
              
              // Flags (fl): accepts flag names
              // Common flags: progressive, immutable_cache, keep_iptc, keep_attribution, etc.
              if (keyPart === 'fl') {
                const flagKeywords = ['progressive', 'immutable_cache', 'keep_iptc', 'keep_attribution', 'strip_profile', 'force_strip', 'preserve_transparency', 'lossy', 'lossless', 'tiff8_lzw', 'getinfo', 'no_overflow', 'no_stream', 'no_metadata', 'mono', 'clip', 'clip_evenodd', 'splice', 'layer_apply', 'flatten', 'ignore_mask_channels', 'immutable', 'relative', 'region_relative', 'page_relative', 'tiled', 'tile', 'attachment', 'download', 'inline', 'no_style'];
                return flagKeywords.includes(valuePart.toLowerCase()) || /^[a-z0-9_]{1,30}$/i.test(valuePart);
              }
              
              // Overlay (l) and Underlay (u): accepts image identifiers
              // These can be complex (image:logo, text:Hello, image:my-logo, etc.) but we'll accept alphanumeric/underscore/hyphen patterns
              // Being conservative - accept short identifiers to avoid folder name false positives
              if (keyPart === 'l' || keyPart === 'u') {
                // Accept short alphanumeric/underscore/hyphen patterns (likely image/text identifiers)
                // Reject if too long (likely folder names)
                // Note: hyphen must be at the end of character class to avoid being interpreted as a range
                return /^[a-z0-9_:\-]{1,50}$/i.test(valuePart) && valuePart.length <= 50;
              }
              
              // Transformation (t): accepts transformation names
              // These can be predefined transformation names or custom names (may contain hyphens)
              if (keyPart === 't') {
                // Accept short alphanumeric/underscore/hyphen patterns (transformation names)
                // Note: hyphen must be at the end of character class to avoid being interpreted as a range
                return /^[a-z0-9_\-]{1,50}$/i.test(valuePart) && valuePart.length <= 50;
              }
              
              // Default image (d): accepts image identifiers
              // May contain hyphens (e.g., my-image, default-logo)
              if (keyPart === 'd') {
                // Accept short alphanumeric/underscore/hyphen patterns (image identifiers)
                // Note: hyphen must be at the end of character class to avoid being interpreted as a range
                return /^[a-z0-9_\-]{1,50}$/i.test(valuePart) && valuePart.length <= 50;
              }
              
              // Border (bo): accepts border specifications
              // Format: width_px_solid_color (e.g., 5px_solid_black)
              // May contain hyphens in color names or specifications
              if (keyPart === 'bo') {
                // Accept border specifications or short identifiers (may contain hyphens)
                // Note: hyphen must be at the end of character class to avoid being interpreted as a range
                return /^[a-z0-9_\-]{1,50}$/i.test(valuePart) && valuePart.length <= 50;
              }
              
              // Color (co): accepts color values
              // Similar to background - hex, rgb, or named colors
              if (keyPart === 'co') {
                const isHexColor = /^#[0-9a-f]{3,6}$/i.test(valuePart);
                const isRgbColor = /^rgb:[0-9]{1,3},[0-9]{1,3},[0-9]{1,3}$/i.test(valuePart);
                const isShortColorId = /^[a-z0-9_]{1,20}$/i.test(valuePart) && valuePart.length <= 20;
                return isHexColor || isRgbColor || isShortColorId;
              }
              
              // Fallback: if key is not recognized, reject
              return false;
            });
          }
        }
        
        // Only consider it a transformation if:
        // - It matches single or multiple parameter pattern
        // - Keys are valid Cloudinary transformation keys (w, h, c, q, f, etc.)
        // - Values look like valid transformation values (not arbitrary folder names)
        // - It doesn't have a file extension
        // - There are more path parts after it (the actual public_id)
        const looksLikeTransformations = 
          (matchesSingleParam || matchesMultiParam) &&
          hasValidTransformationKeyAndValue &&
          !hasFileExtension &&
          pathParts.length > 1;
        
        if (looksLikeTransformations) {
          // Replace existing transformations with thumbnail transformations
          // Reconstruct the path with the public_id and any subfolders
          const publicIdAndFormat = pathParts.slice(1).join('/');
          return `${baseUrl}/upload/${thumbnailTransform}/${publicIdAndFormat}`;
        } else {
          // No existing transformations, insert thumbnail transformations
          return `${baseUrl}/upload/${thumbnailTransform}/${pathAfterUpload}`;
        }
      }
    } catch (error) {
      console.warn('Error transforming Cloudinary URL:', error, fileUrl);
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

