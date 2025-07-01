import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  List,
  ListItem,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Divider,
  TextField,
  Avatar,
  Rating,
  ListItemIcon,
  Chip
} from '@mui/material';
import { ContentBlock, BLOCK_TYPES } from '../../services/contentBlockService';
import { CheckCircle, EventSeat, LocationOn, Instagram, Star } from '@mui/icons-material';
import { useParallax } from '../../hooks/useParallax';
import { useVideoBackground } from '../../hooks/useVideoBackground';

interface ContentBlockRendererProps {
  blocks: ContentBlock[];
}

// ===== UNIVERSAL STYLING INTERFACES =====
interface UniversalCustomStyles {
  backgroundColor?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
  boxShadow?: string;
  margin?: string;
  padding?: string;
  borderRadius?: string;
  height?: string;
  overlayOpacity?: string;
  overlayColor?: string;
  textAlign?: string;
  justifyContent?: string;
  alignItems?: string;
}

interface UniversalTypographySettings {
  // Title Typography
  titleFontFamily?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  titleColor?: string;
  titleTextShadow?: string;
  titleLineHeight?: string;
  titleLetterSpacing?: string;
  
  // Subtitle Typography  
  subtitleFontFamily?: string;
  subtitleFontSize?: string;
  subtitleFontWeight?: string;
  subtitleColor?: string;
  subtitleTextShadow?: string;
  subtitleLineHeight?: string;
  subtitleLetterSpacing?: string;
  
  // Content Typography
  contentFontFamily?: string;
  contentFontSize?: string;
  contentFontWeight?: string;
  contentColor?: string;
  contentLineHeight?: string;
  contentLetterSpacing?: string;
  
  // Text Shadow Mode
  textShadowMode?: 'none' | 'light' | 'medium' | 'heavy' | 'custom' | 'default';
  customTextShadow?: string;
}

interface UniversalSettings extends UniversalTypographySettings {
  // Visual settings
  backgroundType?: 'color' | 'image' | 'gradient' | 'video';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  
  // Video background
  videoUrl?: string;
  videoUrlWebm?: string;
  videoFallbackImage?: string;
  videoAutoplay?: string;
  videoLoop?: string;
  videoMuted?: string;
  videoPlaybackRate?: string;
  videoQuality?: string;
  videoMobileBehavior?: string;
  
  // Parallax
  parallaxMode?: string;
  parallaxIntensity?: string;
  parallaxPerformance?: string;
  
  // Mobile responsiveness
  mobileTitleFontSize?: string;
  mobileSubtitleFontSize?: string;
  mobileContentFontSize?: string;
  mobilePadding?: string;
  mobileMargin?: string;
  mobileTextAlign?: string;
  
  // Advanced styling
  overlayOpacity?: string;
  overlayColor?: string;
  heightMode?: string;
  customHeight?: string;
  textAlign?: string;
  justifyContent?: string;
  alignItems?: string;
  
  // Button styling properties
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonFontSize?: string;
  buttonFontWeight?: string;
  buttonBorderRadius?: string;
  buttonHoverColor?: string;
  
  // Image styling properties
  shadowLevel?: number;
  imageMaxWidth?: string;
  hoverEffect?: 'none' | 'zoom' | 'lift' | 'scale';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  
  // Features block styling properties
  gridColumns?: number;
  gridSpacing?: number;
  cardStyle?: 'elevated' | 'flat' | 'outlined';
  cardPadding?: number;
  iconPosition?: 'top' | 'left';
  iconSize?: string;
  iconColor?: string;
  featureTitleFontFamily?: string;
  featureTitleFontSize?: string;
  featureTitleFontWeight?: string;
  featureTitleColor?: string;
  featureDescriptionFontFamily?: string;
  featureDescriptionFontSize?: string;
  featureDescriptionFontWeight?: string;
  featureDescriptionColor?: string;
}

// ===== UNIVERSAL HELPER FUNCTIONS =====

/**
 * Parse block settings and styles safely
 */
const parseBlockSettings = (block: ContentBlock): { styles: UniversalCustomStyles; settings: UniversalSettings } => {
  let styles: UniversalCustomStyles = {};
  let settings: UniversalSettings = {};
  
  if (block.settings) {
    try {
      const parsedSettings = typeof block.settings === 'string' ? JSON.parse(block.settings) : block.settings;
      styles = parsedSettings.styles || {};
      settings = { ...parsedSettings, ...styles }; // Merge for backward compatibility
    } catch (e) {
      console.error('Failed to parse block settings:', e);
    }
  }
  
  // Also check block.styles for direct styling
  if (block.styles) {
    styles = { ...styles, ...block.styles };
  }
  
  return { styles, settings };
};

/**
 * Get font family string for CSS
 */
const getFontFamily = (fontFamily?: string): string | undefined => {
  if (!fontFamily || fontFamily === 'default') return undefined;
  
  // Handle Google Fonts and system fonts
  const fontMap: Record<string, string> = {
    'playfair': '"Playfair Display", serif',
    'montserrat': '"Montserrat", sans-serif',
    'dancing': '"Dancing Script", cursive',
    'roboto-slab': '"Roboto Slab", serif',
    'oswald': '"Oswald", sans-serif',
    'lora': '"Lora", serif',
    'poppins': '"Poppins", sans-serif',
    'open-sans': '"Open Sans", sans-serif',
    'lato': '"Lato", sans-serif',
    'source-sans': '"Source Sans Pro", sans-serif',
    'nunito': '"Nunito", sans-serif',
    'inter': '"Inter", sans-serif',
    'raleway': '"Raleway", sans-serif'
  };
  
  return fontMap[fontFamily] || fontFamily;
};

/**
 * Get text shadow CSS value
 */
const getTextShadow = (mode?: string, customShadow?: string): string => {
  switch (mode) {
    case 'none':
      return 'none';
    case 'light':
      return '1px 1px 2px rgba(0,0,0,0.3)';
    case 'medium':
      return '2px 2px 4px rgba(0,0,0,0.5)';
    case 'heavy':
      return '3px 3px 6px rgba(0,0,0,0.7)';
    case 'custom':
      return customShadow || '2px 2px 4px rgba(0,0,0,0.5)';
    case 'default':
    default:
      return '2px 2px 4px rgba(0,0,0,0.5)';
  }
};

/**
 * Get responsive font size with mobile fallback
 */
const getResponsiveFontSize = (desktopSize?: string, mobileSize?: string): any => {
  if (!desktopSize) return undefined;
  
  if (mobileSize) {
    return {
      xs: mobileSize,
      sm: mobileSize,
      md: desktopSize
    };
  }
  
  return desktopSize;
};

/**
 * Filter out undefined values from object
 */
const filterUndefinedValues = (obj: Record<string, any>) => {
  const filtered: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

/**
 * Get typography styles for title elements
 */
const getTitleTypographyStyles = (settings: UniversalSettings) => {
  return filterUndefinedValues({
    fontFamily: getFontFamily(settings.titleFontFamily),
    fontSize: getResponsiveFontSize(settings.titleFontSize, settings.mobileTitleFontSize),
    fontWeight: settings.titleFontWeight,
    color: settings.titleColor,
    textShadow: getTextShadow(settings.textShadowMode, settings.customTextShadow),
    lineHeight: settings.titleLineHeight,
    letterSpacing: settings.titleLetterSpacing
  });
};

/**
 * Get typography styles for subtitle elements
 */
const getSubtitleTypographyStyles = (settings: UniversalSettings) => {
  return filterUndefinedValues({
    fontFamily: getFontFamily(settings.subtitleFontFamily),
    fontSize: getResponsiveFontSize(settings.subtitleFontSize, settings.mobileSubtitleFontSize),
    fontWeight: settings.subtitleFontWeight,
    color: settings.subtitleColor,
    textShadow: getTextShadow(settings.textShadowMode, settings.customTextShadow),
    lineHeight: settings.subtitleLineHeight,
    letterSpacing: settings.subtitleLetterSpacing
  });
};

/**
 * Get typography styles for content elements
 */
const getContentTypographyStyles = (settings: UniversalSettings) => {
  return filterUndefinedValues({
    fontFamily: getFontFamily(settings.contentFontFamily),
    fontSize: getResponsiveFontSize(settings.contentFontSize, settings.mobileContentFontSize),
    fontWeight: settings.contentFontWeight,
    color: settings.contentColor,
    lineHeight: settings.contentLineHeight,
    letterSpacing: settings.contentLetterSpacing
  });
};

/**
 * Get container styles with responsive padding and styling
 */
const getContainerStyles = (styles: UniversalCustomStyles, settings: UniversalSettings) => {
  const baseStyles: any = {
    py: 4, // Default padding
  };
  
  // Apply custom styles
  if (styles.backgroundColor) baseStyles.backgroundColor = styles.backgroundColor;
  if (styles.padding) baseStyles.p = parseInt(styles.padding) / 8; // Convert px to theme spacing
  if (styles.margin) baseStyles.m = parseInt(styles.margin) / 8;
  if (styles.borderRadius) baseStyles.borderRadius = styles.borderRadius;
  if (styles.boxShadow && styles.boxShadow !== 'none') baseStyles.boxShadow = styles.boxShadow;
  
  // Apply border if specified
  if (styles.borderWidth && parseInt(styles.borderWidth) > 0) {
    baseStyles.border = `${styles.borderWidth} ${styles.borderStyle || 'solid'} ${styles.borderColor || '#000000'}`;
  }
  
  // Mobile responsiveness
  if (settings.mobilePadding) {
    baseStyles.p = {
      xs: parseInt(settings.mobilePadding) / 8,
      md: baseStyles.p || 4
    };
  }
  
  if (settings.mobileMargin) {
    baseStyles.m = {
      xs: parseInt(settings.mobileMargin) / 8,
      md: baseStyles.m || 0
    };
  }
  
  return baseStyles;
};

const ContentBlockRenderer: React.FC<ContentBlockRendererProps> = ({ blocks }) => {
  // Safe rendering helper to prevent objects as React children
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') {
      if (Array.isArray(value)) return value.join(', ');
      if (value.toString && typeof value.toString === 'function') return value.toString();
      return JSON.stringify(value);
    }
    return String(value);
  };

  const renderBlock = (block: ContentBlock) => {
    switch (block.blockType) {
      case BLOCK_TYPES.TEXT:
        // Enhanced TEXT block with universal styling system
        const { styles: textStyles, settings: textSettings } = parseBlockSettings(block);
        const containerStyles = getContainerStyles(textStyles, textSettings);
        const titleTypography = getTitleTypographyStyles(textSettings);
        const subtitleTypography = getSubtitleTypographyStyles(textSettings);
        const contentTypography = getContentTypographyStyles(textSettings);
        
        return (
          <Box sx={containerStyles}>
            <Container maxWidth="lg">
              {block.title && (
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom 
                  sx={{
                    textAlign: textSettings.textAlign || 'center',
                    ...titleTypography
                  }}
                >
                  {safeRender(block.title)}
                </Typography>
              )}
              {block.subtitle && (
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  gutterBottom 
                  sx={{
                    textAlign: textSettings.textAlign || 'center',
                    ...subtitleTypography
                  }}
                >
                  {safeRender(block.subtitle)}
                </Typography>
              )}
              {block.content && (
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{
                    ...contentTypography,
                    textAlign: textSettings.textAlign || 'left'
                  }}
                  dangerouslySetInnerHTML={{ __html: safeRender(block.content) }}
                />
              )}
            </Container>
          </Box>
        );

      case BLOCK_TYPES.HTML:
        return (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {block.title && (
              <Typography variant="h4" component="h2" gutterBottom align="center">
                {safeRender(block.title)}
              </Typography>
            )}
            {block.content && (
              <Box dangerouslySetInnerHTML={{ __html: safeRender(block.content) }} />
            )}
          </Container>
        );

      case BLOCK_TYPES.IMAGE:
        // Enhanced IMAGE block with universal styling system
        const { styles: imageStyles, settings: imageSettings } = parseBlockSettings(block);
        const imageContainerStyles = getContainerStyles(imageStyles, imageSettings);
        const imageTitleTypography = getTitleTypographyStyles(imageSettings);
        
        return (
          <Box sx={imageContainerStyles}>
            <Container maxWidth="lg">
              {block.title && (
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom 
                  sx={{
                    textAlign: imageSettings.textAlign || 'center',
                    ...imageTitleTypography
                  }}
                >
                  {safeRender(block.title)}
                </Typography>
              )}
              {block.imageUrl && (
                <Box 
                  display="flex" 
                  justifyContent={imageSettings.textAlign === 'left' ? 'flex-start' : 
                                 imageSettings.textAlign === 'right' ? 'flex-end' : 'center'}
                >
                  <Paper 
                    elevation={imageSettings.shadowLevel || 3} 
                    sx={{ 
                      overflow: 'hidden', 
                      borderRadius: imageStyles.borderRadius || 2,
                      border: imageStyles.borderWidth && parseInt(imageStyles.borderWidth) > 0 ? 
                        `${imageStyles.borderWidth} ${imageStyles.borderStyle || 'solid'} ${imageStyles.borderColor || '#000000'}` : 'none',
                      maxWidth: imageSettings.imageMaxWidth || '100%',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: imageSettings.hoverEffect === 'zoom' ? 'scale(1.05)' : 
                                  imageSettings.hoverEffect === 'lift' ? 'translateY(-8px)' : 'none',
                        boxShadow: imageSettings.hoverEffect ? '0 8px 25px rgba(0,0,0,0.15)' : undefined
                      }
                    }}
                  >
                    <img
                      src={safeRender(block.imageUrl)}
                      alt={safeRender(block.title) || 'Image'}
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        display: 'block',
                        objectFit: imageSettings.objectFit || 'cover'
                      }}
                    />
                  </Paper>
                </Box>
              )}
              {block.subtitle && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 2, 
                    textAlign: imageSettings.textAlign || 'center',
                    fontStyle: 'italic'
                  }}
                >
                  {safeRender(block.subtitle)}
                </Typography>
              )}
            </Container>
          </Box>
        );

      case BLOCK_TYPES.CTA:
        // Enhanced CTA block with universal styling system
        const { styles: ctaStyles, settings: ctaSettings } = parseBlockSettings(block);
        const ctaContainerStyles = getContainerStyles(ctaStyles, ctaSettings);
        const ctaTitleTypography = getTitleTypographyStyles(ctaSettings);
        const ctaSubtitleTypography = getSubtitleTypographyStyles(ctaSettings);
        
        // Default CTA styling if no custom background is set
        const defaultCtaStyles = {
          backgroundColor: ctaStyles.backgroundColor || ctaSettings.backgroundColor || 'primary.main',
          color: 'white',
          py: 6,
          position: 'relative',
          overflow: 'hidden'
        };
        
        const finalCtaStyles = {
          ...defaultCtaStyles,
          ...ctaContainerStyles,
          textAlign: ctaSettings.textAlign || 'center'
        };
        
        // Button styling
        const buttonStyles = {
          backgroundColor: ctaSettings.buttonBackgroundColor || 'white',
          color: ctaSettings.buttonTextColor || 'primary.main',
          px: 4,
          py: 1.5,
          fontSize: ctaSettings.buttonFontSize || '1rem',
          fontWeight: ctaSettings.buttonFontWeight || '600',
          borderRadius: ctaSettings.buttonBorderRadius || '4px',
          textTransform: 'none' as const,
          '&:hover': {
            backgroundColor: ctaSettings.buttonHoverColor || 'grey.100',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          },
          transition: 'all 0.3s ease'
        };
        
        return (
          <Box sx={finalCtaStyles}>
            <Container maxWidth="lg">
              {block.title && (
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    ...ctaTitleTypography,
                    color: ctaSettings.titleColor || 'white'
                  }}
                >
                  {safeRender(block.title)}
                </Typography>
              )}
              {block.subtitle && (
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3,
                    ...ctaSubtitleTypography,
                    color: ctaSettings.subtitleColor || 'rgba(255,255,255,0.9)'
                  }}
                >
                  {safeRender(block.subtitle)}
                </Typography>
              )}
              {block.buttonText && block.buttonLink && (
                <Button
                  component={Link}
                  to={safeRender(block.buttonLink)}
                  variant="contained"
                  size="large"
                  sx={buttonStyles}
                >
                  {safeRender(block.buttonText)}
                </Button>
              )}
            </Container>
          </Box>
        );

      case BLOCK_TYPES.HERO:
        // Parse hero styles and settings
        interface HeroCustomStyles {
          backgroundColor?: string;
          borderWidth?: string;
          borderStyle?: string;
          borderColor?: string;
          boxShadow?: string;
          margin?: string;
          padding?: string;
          borderRadius?: string;
          height?: string;
          overlayOpacity?: string;
          overlayColor?: string;
          textAlign?: string;
          justifyContent?: string;
          alignItems?: string;
        }
        
        let heroStyles: HeroCustomStyles = {};
        let heroSettings: any = {};
        
        if (block.settings) {
          try {
            const settings = typeof block.settings === 'string' ? JSON.parse(block.settings) : block.settings;
            heroStyles = settings.styles || {};
            heroSettings = settings;
          } catch (e) {
            console.error('Failed to parse hero block settings:', e);
          }
        }

        // Determine height - support full screen, custom, or default
        const getHeroHeight = () => {
          if (heroSettings.heightMode === 'fullscreen') {
            return '100vh';
          } else if (heroSettings.heightMode === 'custom' && heroSettings.customHeight) {
            return heroSettings.customHeight;
          } else if (heroStyles.height) {
            return heroStyles.height;
          }
          return '500px'; // default
        };

        // Determine overlay settings
        const overlayOpacity = heroStyles.overlayOpacity || heroSettings.overlayOpacity || '0.4';
        const overlayColor = heroStyles.overlayColor || heroSettings.overlayColor || '#000000';

        // Determine text alignment and positioning
        const textAlign = heroStyles.textAlign || heroSettings.textAlign || 'center';
        const justifyContent = heroStyles.justifyContent || heroSettings.justifyContent || 'center';
        const alignItems = heroStyles.alignItems || heroSettings.alignItems || 'center';

        // Typography settings
        const getTitleFontFamily = () => {
          if (heroSettings.titleFontFamily && heroSettings.titleFontFamily !== 'default') {
            return heroSettings.titleFontFamily;
          }
          return undefined;
        };

        const getSubtitleFontFamily = () => {
          if (heroSettings.subtitleFontFamily && heroSettings.subtitleFontFamily !== 'default') {
            return heroSettings.subtitleFontFamily;
          }
          return undefined;
        };

        const getTextShadow = () => {
          switch (heroSettings.textShadowMode) {
            case 'none':
              return 'none';
            case 'light':
              return '1px 1px 2px rgba(0,0,0,0.3)';
            case 'medium':
              return '2px 2px 4px rgba(0,0,0,0.5)';
            case 'heavy':
              return '3px 3px 6px rgba(0,0,0,0.7)';
            case 'custom':
              return heroSettings.customTextShadow || '2px 2px 4px rgba(0,0,0,0.5)';
            case 'default':
            default:
              return '2px 2px 4px rgba(0,0,0,0.5)';
          }
        };

        // Parallax hook integration
        const parallaxOptions = {
          mode: heroSettings.parallaxMode || 'disabled',
          intensity: parseFloat(heroSettings.parallaxIntensity) || 0.5,
          performance: heroSettings.parallaxPerformance || 'auto'
        };
        
        const parallax = useParallax(parallaxOptions);

        // Video background hook integration
        const videoOptions = {
          videoUrl: heroSettings.videoUrl,
          videoUrlWebm: heroSettings.videoUrlWebm,
          fallbackImage: heroSettings.videoFallbackImage || block.imageUrl,
          autoplay: heroSettings.videoAutoplay || 'true',
          loop: heroSettings.videoLoop || 'true',
          muted: heroSettings.videoMuted || 'true',
          playbackRate: heroSettings.videoPlaybackRate || '1.0',
          quality: heroSettings.videoQuality || 'auto',
          mobileBehavior: heroSettings.videoMobileBehavior || 'fallback'
        };

        const video = useVideoBackground(videoOptions);

        // Determine background mode and source
        const backgroundType = heroSettings.backgroundType || 'image';
        const getBackgroundSource = () => {
          if (backgroundType === 'video' && video.showVideo) {
            return null; // Video will be rendered separately
          } else if (backgroundType === 'video' && video.showFallback) {
            return heroSettings.videoFallbackImage || block.imageUrl;
          } else if (backgroundType === 'image') {
            return block.imageUrl;
          } else if (backgroundType === 'gradient') {
            return null; // Pure gradient
          }
          return block.imageUrl; // Default fallback
        };

        const backgroundImage = getBackgroundSource();
        const showVideoElement = backgroundType === 'video' && video.showVideo;

        return (
          <Box
            ref={parallax.ref}
            sx={{
              position: 'relative',
              height: getHeroHeight(),
              backgroundImage: backgroundImage ? `url(${safeRender(backgroundImage)})` : 'linear-gradient(to right, #1976d2, #42a5f5)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: heroSettings.backgroundAttachment || (heroSettings.parallaxMode === 'disabled' ? 'scroll' : 'fixed'),
              display: 'flex',
              justifyContent: justifyContent,
              alignItems: alignItems,
              // Apply custom styles
              backgroundColor: heroStyles.backgroundColor || 'transparent',
              border: heroStyles.borderWidth && heroStyles.borderStyle ? 
                `${heroStyles.borderWidth} ${heroStyles.borderStyle} ${heroStyles.borderColor || '#000'}` : 
                'none',
              boxShadow: heroStyles.boxShadow || 'none',
              margin: heroStyles.margin || '0',
              borderRadius: heroStyles.borderRadius || '0px',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: `${overlayColor}`,
                opacity: parseFloat(overlayOpacity),
              }
            }}
          >
            {/* Video Background Element */}
            {showVideoElement && (
              <video
                ref={video.videoRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  zIndex: 0,
                  pointerEvents: 'none' // Prevent interference with content interaction
                }}
                playsInline
                disablePictureInPicture
                controlsList="nodownload"
                poster={heroSettings.videoFallbackImage || block.imageUrl}
              />
            )}

            {/* Video Controls Overlay (when not auto-playing) */}
            {showVideoElement && !video.isVideoPlaying && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  right: 20,
                  zIndex: 3,
                  display: 'flex',
                  gap: 1,
                  opacity: 0.8,
                  '&:hover': { opacity: 1 }
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    video.togglePlayPause();
                  }}
                  sx={{
                    minWidth: 'auto',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.9)'
                    }
                  }}
                >
                  ▶️
                </Button>
              </Box>
            )}

            {/* Video Error Display */}
            {showVideoElement && video.videoError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  zIndex: 3,
                  backgroundColor: 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  padding: 1,
                  borderRadius: 1,
                  fontSize: '0.8rem'
                }}
              >
                🎬 {video.videoError}
              </Box>
            )}

            <Container 
              maxWidth={heroSettings.containerWidth || "lg"} 
              sx={{ 
                position: 'relative', 
                zIndex: 1,
                textAlign: textAlign,
                padding: heroStyles.padding || undefined
              }}
            >
              {block.title && (
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    color: heroSettings.titleColor || 'white',
                    fontFamily: getTitleFontFamily(),
                    fontWeight: heroSettings.titleFontWeight || 'bold',
                    fontSize: heroSettings.titleFontSize || undefined,
                    mb: 2,
                    textShadow: getTextShadow()
                  }}
                >
                  {safeRender(block.title)}
                </Typography>
              )}
              {block.subtitle && (
                <Typography
                  variant="h5"
                  sx={{
                    color: heroSettings.subtitleColor || 'white',
                    fontFamily: getSubtitleFontFamily(),
                    fontWeight: heroSettings.subtitleFontWeight || 'normal',
                    fontSize: heroSettings.subtitleFontSize || undefined,
                    mb: 4,
                    textShadow: getTextShadow()
                  }}
                >
                  {safeRender(block.subtitle)}
                </Typography>
              )}
              {block.buttonText && block.buttonLink && (
                <Button
                  component={Link}
                  to={safeRender(block.buttonLink)}
                  variant={heroSettings.buttonVariant || "contained"}
                  size={heroSettings.buttonSize || "large"}
                  sx={{
                    backgroundColor: heroSettings.buttonColor || 'primary.main',
                    color: heroSettings.buttonTextColor || 'white',
                    px: heroSettings.buttonPaddingX || 4,
                    py: heroSettings.buttonPaddingY || 1.5,
                    fontSize: heroSettings.buttonFontSize || '1.1rem',
                    borderRadius: heroSettings.buttonRadius || undefined,
                    '&:hover': {
                      backgroundColor: heroSettings.buttonHoverColor || 'primary.dark',
                    }
                  }}
                >
                  {safeRender(block.buttonText)}
                </Button>
              )}
            </Container>
          </Box>
        );

      case BLOCK_TYPES.MENU_PREVIEW:
        return (
          <Container maxWidth="lg" sx={{ py: 6 }}>
            {block.title && (
              <Typography variant="h4" component="h2" gutterBottom align="center">
                {safeRender(block.title)}
              </Typography>
            )}
            {block.subtitle && (
              <Typography variant="h6" color="text.secondary" gutterBottom align="center" sx={{ mb: 4 }}>
                {safeRender(block.subtitle)}
              </Typography>
            )}
            {block.content && (
              <Typography 
                variant="body1" 
                paragraph 
                align="center" 
                sx={{ mb: 4 }}
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )}
            <Box sx={{ textAlign: 'center' }}>
              {block.buttonText && block.buttonLink && (
                <Button
                  component={Link}
                  to={safeRender(block.buttonLink)}
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }}
                >
                  {safeRender(block.buttonText)}
                </Button>
              )}
            </Box>
          </Container>
        );

      case 'about':
        // Parse styles from block.settings.styles
        interface CustomStyles {
          backgroundColor?: string;
          borderWidth?: string;
          borderStyle?: string;
          borderColor?: string;
          boxShadow?: string;
          margin?: string;
          padding?: string;
          borderRadius?: string;
        }
        
        let customStyles: CustomStyles = {};
        if (block.settings) {
          try {
            const settings = typeof block.settings === 'string' ? JSON.parse(block.settings) : block.settings;
            customStyles = settings.styles || {};
          } catch (e) {
            console.error('Failed to parse about block settings:', e);
          }
        }

        // Apply layout from settings
        let layout = 'image-right'; // default
        if (block.settings) {
          try {
            const settings = typeof block.settings === 'string' ? JSON.parse(block.settings) : block.settings;
            layout = settings.layout || 'image-right';
          } catch (e) {
            console.error('Failed to parse about block layout:', e);
          }
        }

        const imageFirst = layout === 'image-left';

        return (
          <Container 
            maxWidth="lg" 
            sx={{ 
              py: 6,
              // Apply custom styles
              backgroundColor: customStyles.backgroundColor || 'transparent',
              border: customStyles.borderWidth && customStyles.borderStyle ? 
                `${customStyles.borderWidth} ${customStyles.borderStyle} ${customStyles.borderColor || '#000'}` : 
                'none',
              boxShadow: customStyles.boxShadow || 'none',
              margin: customStyles.margin || 'auto',
              padding: customStyles.padding ? `${customStyles.padding} !important` : undefined,
              borderRadius: customStyles.borderRadius || '0px'
            }}
          >
            <Grid container spacing={4} alignItems="center" direction={imageFirst ? 'row' : 'row-reverse'}>
              <Grid item xs={12} md={block.imageUrl ? 6 : 12}>
                {block.title && (
                  <Typography variant="h4" component="h2" gutterBottom>
                    {safeRender(block.title)}
                  </Typography>
                )}
                {block.subtitle && (
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                    {safeRender(block.subtitle)}
                  </Typography>
                )}
                {block.content && (
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                  />
                )}
                {block.buttonText && block.buttonLink && (
                  <Button
                    component={Link}
                    to={safeRender(block.buttonLink)}
                    variant="contained"
                    sx={{ mt: 2 }}
                  >
                    {safeRender(block.buttonText)}
                  </Button>
                )}
              </Grid>
              {block.imageUrl && (
                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                    <img
                      src={safeRender(block.imageUrl)}
                      alt={safeRender(block.title) || 'About us'}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Container>
        );

      case BLOCK_TYPES.CONTACT:
        // Parse contact settings for better display options
        let contactSettings = {};
        try {
          contactSettings = block.settings ? JSON.parse(block.settings) : {};
        } catch (e) {
          console.error('Failed to parse contact settings:', e);
        }

        return (
          <Container maxWidth="lg" sx={{ py: 6 }}>
            {block.title && (
              <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
                {safeRender(block.title)}
              </Typography>
            )}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 4, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Get in Touch
                  </Typography>
                  
                  {/* Contact Information */}
                  {block.content && (
                    <Typography 
                      variant="body1" 
                      paragraph
                      dangerouslySetInnerHTML={{ __html: block.content }}
                    />
                  )}
                  
                  {/* Parse contact details from settings */}
                  {(contactSettings as any).phone && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1">
                        <strong>Phone:</strong> {safeRender((contactSettings as any).phone)}
                      </Typography>
                    </Box>
                  )}
                  
                  {(contactSettings as any).email && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1">
                        <strong>Email:</strong> {safeRender((contactSettings as any).email)}
                      </Typography>
                    </Box>
                  )}
                  
                  {(contactSettings as any).address && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                      <Typography variant="body1">
                        <strong>Address:</strong><br />
                        {safeRender((contactSettings as any).address)}
                      </Typography>
                    </Box>
                  )}
                  
                  {block.buttonText && block.buttonLink && (
                    <Button
                      component={Link}
                      to={safeRender(block.buttonLink)}
                      variant="contained"
                      sx={{ mt: 2 }}
                    >
                      {safeRender(block.buttonText)}
                    </Button>
                  )}
                </Paper>
              </Grid>
              
              {block.imageUrl && (
                <Grid item xs={12} md={6}>
                  <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2, height: '100%' }}>
                    <img
                      src={safeRender(block.imageUrl)}
                      alt={safeRender(block.title) || 'Contact us'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Container>
        );

      case BLOCK_TYPES.FEATURES:
        // Enhanced FEATURES block with universal styling system
        const { styles: featuresStyles, settings: featuresSettings } = parseBlockSettings(block);
        const featuresContainerStyles = getContainerStyles(featuresStyles, featuresSettings);
        const featuresTitleTypography = getTitleTypographyStyles(featuresSettings);
        const featuresSubtitleTypography = getSubtitleTypographyStyles(featuresSettings);
        
        // For features, we expect the content to be JSON with feature items
        let features = [];
        try {
          features = block.content ? JSON.parse(block.content) : [];
        } catch (e) {
          console.error('Failed to parse features content:', e);
        }
        
        // Grid layout options
        const gridColumns = featuresSettings.gridColumns || 3;
        const cardStyle = featuresSettings.cardStyle || 'elevated';
        const iconPosition = featuresSettings.iconPosition || 'top';
        
        // Card styling based on settings
        const getCardStyles = () => {
          const baseStyles = {
            height: '100%',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: featuresSettings.hoverEffect === 'lift' ? 'translateY(-8px)' : 
                        featuresSettings.hoverEffect === 'scale' ? 'scale(1.05)' : 'none',
              boxShadow: featuresSettings.hoverEffect ? '0 8px 25px rgba(0,0,0,0.15)' : undefined
            }
          };
          
          switch (cardStyle) {
            case 'flat':
              return { ...baseStyles, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.1)' };
            case 'outlined':
              return { ...baseStyles, boxShadow: 'none', border: '2px solid', borderColor: 'primary.main' };
            case 'elevated':
            default:
              return { ...baseStyles, boxShadow: 3 };
          }
        };
        
        return (
          <Box sx={featuresContainerStyles}>
            <Container maxWidth="lg">
              {block.title && (
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom 
                  sx={{
                    textAlign: featuresSettings.textAlign || 'center',
                    ...featuresTitleTypography
                  }}
                >
                  {safeRender(block.title)}
                </Typography>
              )}
              {block.subtitle && (
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  gutterBottom 
                  sx={{ 
                    mb: 4,
                    textAlign: featuresSettings.textAlign || 'center',
                    ...featuresSubtitleTypography
                  }}
                >
                  {safeRender(block.subtitle)}
                </Typography>
              )}
              <Grid container spacing={featuresSettings.gridSpacing || 4}>
                {features.map((feature: any, index: number) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={gridColumns === 2 ? 6 : gridColumns === 4 ? 6 : 12}
                    md={12 / gridColumns} 
                    key={index}
                  >
                    <Card sx={getCardStyles()}>
                      <CardContent 
                        sx={{ 
                          textAlign: featuresSettings.textAlign || 'center', 
                          p: featuresSettings.cardPadding || 3,
                          display: 'flex',
                          flexDirection: iconPosition === 'left' ? 'row' : 'column',
                          alignItems: iconPosition === 'left' ? 'flex-start' : 'center',
                          gap: iconPosition === 'left' ? 2 : 1
                        }}
                      >
                        {/* Feature Icon/Image */}
                        {feature.icon && (
                          <Box 
                            sx={{ 
                              fontSize: featuresSettings.iconSize || '3rem',
                              color: featuresSettings.iconColor || 'primary.main',
                              mb: iconPosition === 'top' ? 2 : 0,
                              flexShrink: 0
                            }}
                          >
                            {feature.icon}
                          </Box>
                        )}
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{
                              fontFamily: getFontFamily(featuresSettings.featureTitleFontFamily),
                              fontSize: featuresSettings.featureTitleFontSize || '1.25rem',
                              fontWeight: featuresSettings.featureTitleFontWeight || '600',
                              color: featuresSettings.featureTitleColor || 'text.primary',
                              textAlign: iconPosition === 'left' ? 'left' : 'inherit'
                            }}
                          >
                            {safeRender(feature.title)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              fontFamily: getFontFamily(featuresSettings.featureDescriptionFontFamily),
                              fontSize: featuresSettings.featureDescriptionFontSize || '0.875rem',
                              fontWeight: featuresSettings.featureDescriptionFontWeight || '400',
                              color: featuresSettings.featureDescriptionColor || 'text.secondary',
                              textAlign: iconPosition === 'left' ? 'left' : 'inherit'
                            }}
                          >
                            {safeRender(feature.description)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>
        );

      case 'video':
        return renderVideoBlock(block);

      case 'menu_display':
        return renderMenuDisplayBlock(block);

      case 'testimonials':
        return renderTestimonialsBlock(block);

      case 'newsletter':
        return renderNewsletterBlock(block);

      case 'map_location':
        return renderMapLocationBlock(block);

      case 'social_feed':
        return renderSocialFeedBlock(block);

      case 'reservation_widget':
        return renderReservationWidgetBlock(block);

      case 'pricing_menu':
        return renderPricingMenuBlock(block);

      case 'spacer':
        return renderSpacerBlock(block);

      default:
        return null;
    }
  };

  const renderVideoBlock = (block: ContentBlock) => {
    const { title, videoUrl, content, settings } = block;
    const autoplay = settings?.autoplay || false;
    const controls = settings?.controls !== false; // Default to true
    const aspectRatio = settings?.aspectRatio || '16:9';
    
    // Extract video ID from URL for embedding
    const getEmbedUrl = (url: string) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('youtu.be/')[1]?.split('?')[0]
          : url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&controls=${controls ? 1 : 0}`;
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1];
        return `https://player.vimeo.com/video/${videoId}?autoplay=${autoplay ? 1 : 0}`;
      }
      return url;
    };

    if (!videoUrl) {
      return (
        <Box sx={{ mb: 4, p: 4, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No video URL provided
          </Typography>
        </Box>
      );
    }

    const aspectRatioMap: Record<string, string> = {
      '16:9': '56.25%',
      '4:3': '75%',
      '1:1': '100%',
      'auto': 'auto'
    };

    return (
      <Box sx={{ mb: 4 }}>
        {title && (
          <Typography variant="h4" component="h2" gutterBottom align="center">
            {title}
          </Typography>
        )}
        {content && (
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {content}
          </Typography>
        )}
        <Box 
          sx={{ 
            position: 'relative',
            paddingBottom: aspectRatioMap[aspectRatio],
            height: aspectRatio === 'auto' ? 'auto' : 0,
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <iframe
            src={getEmbedUrl(videoUrl)}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: aspectRatio === 'auto' ? 'static' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: aspectRatio === 'auto' ? '400px' : '100%'
            }}
          />
        </Box>
      </Box>
    );
  };

  const renderMenuDisplayBlock = (block: ContentBlock) => {
    const { title, content, settings } = block;
    const layout = settings?.layout || 'list';
    const showPrices = settings?.showPrices !== false;
    const showDescriptions = settings?.showDescriptions !== false;
    const showImages = settings?.showImages || false;
    const maxItems = settings?.maxItems || 10;

    // This is a placeholder - in a real implementation, you'd fetch menu data
    const mockMenuItems = [
      {
        id: 1,
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon with lemon herb butter',
        price: 26.99,
        image: '/api/placeholder/300/200'
      },
      {
        id: 2,
        name: 'Beef Tenderloin',
        description: 'Premium cut with roasted vegetables',
        price: 34.99,
        image: '/api/placeholder/300/200'
      },
      {
        id: 3,
        name: 'Pasta Carbonara',
        description: 'Traditional Italian pasta with pancetta',
        price: 18.99,
        image: '/api/placeholder/300/200'
      }
    ].slice(0, maxItems);

    const getLayoutComponent = () => {
      switch (layout) {
        case 'grid':
          return (
            <Grid container spacing={3}>
              {mockMenuItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ height: '100%' }}>
                    {showImages && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={item.image}
                        alt={item.name}
                      />
                    )}
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" component="h3">
                          {item.name}
                        </Typography>
                        {showPrices && (
                          <Typography variant="h6" color="primary">
                            ${item.price}
                          </Typography>
                        )}
                      </Box>
                      {showDescriptions && (
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          );
        case 'cards':
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {mockMenuItems.map((item) => (
                <Card key={item.id}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3">
                          {item.name}
                        </Typography>
                        {showDescriptions && (
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                      {showPrices && (
                        <Typography variant="h5" color="primary">
                          ${item.price}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          );
        case 'minimal':
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {mockMenuItems.map((item) => (
                <Box key={item.id} display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" component="h3">
                    {item.name}
                  </Typography>
                  {showPrices && (
                    <Typography variant="h6" color="primary">
                      ${item.price}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          );
        default: // list
          return (
            <List>
              {mockMenuItems.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">{item.name}</Typography>
                        {showPrices && (
                          <Typography variant="h6" color="primary">
                            ${item.price}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={showDescriptions ? item.description : null}
                  />
                </ListItem>
              ))}
            </List>
          );
      }
    };

    return (
      <Box sx={{ mb: 4 }}>
        {title && (
          <Typography variant="h4" component="h2" gutterBottom align="center">
            {title}
          </Typography>
        )}
        {content && (
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {content}
          </Typography>
        )}
        {getLayoutComponent()}
      </Box>
    );
  };

  const renderTestimonialsBlock = (block: ContentBlock) => {
    const { title, content, settings } = block;
    const layout = settings?.layout || 'carousel';
    const showStars = settings?.showStars !== false;
    const showPhotos = settings?.showPhotos || false;

    // Mock testimonials data
    const mockTestimonials = [
      {
        id: 1,
        name: 'Sarah Johnson',
        content: 'Amazing food and excellent service! The atmosphere is perfect for a romantic dinner.',
        rating: 5,
        photo: '/api/placeholder/80/80'
      },
      {
        id: 2,
        name: 'Mike Chen',
        content: 'Best restaurant in town! Fresh ingredients and creative dishes that never disappoint.',
        rating: 5,
        photo: '/api/placeholder/80/80'
      },
      {
        id: 3,
        name: 'Emily Davis',
        content: 'Wonderful experience from start to finish. Highly recommend the chef\'s special!',
        rating: 5,
        photo: '/api/placeholder/80/80'
      }
    ];

    const StarRating = ({ rating }: { rating: number }) => (
      <Box display="flex" gap={0.5}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            sx={{
              color: star <= rating ? 'gold' : 'lightgray',
              fontSize: '1rem'
            }}
          />
        ))}
      </Box>
    );

    return (
      <Box sx={{ mb: 4 }}>
        {title && (
          <Typography variant="h4" component="h2" gutterBottom align="center">
            {title}
          </Typography>
        )}
        {content && (
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {content}
          </Typography>
        )}
        
        {layout === 'grid' ? (
          <Grid container spacing={3}>
            {mockTestimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <Card sx={{ height: '100%', p: 2 }}>
                  <CardContent>
                    {showStars && (
                      <Box sx={{ mb: 2 }}>
                        <StarRating rating={testimonial.rating} />
                      </Box>
                    )}
                    <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      {showPhotos && (
                        <Avatar src={testimonial.photo} alt={testimonial.name} />
                      )}
                      <Typography variant="subtitle2" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            {mockTestimonials.map((testimonial, index) => (
              <Paper key={testimonial.id} sx={{ p: 4, mb: 2, maxWidth: 600, mx: 'auto' }}>
                {showStars && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <StarRating rating={testimonial.rating} />
                  </Box>
                )}
                <Typography variant="h6" sx={{ mb: 2, fontStyle: 'italic' }}>
                  "{testimonial.content}"
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                  {showPhotos && (
                    <Avatar src={testimonial.photo} alt={testimonial.name} />
                  )}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {testimonial.name}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const renderNewsletterBlock = (block: ContentBlock) => {
    const { title, subtitle, content, settings } = block;
    const buttonText = settings?.buttonText || 'Subscribe';
    const placeholder = settings?.placeholder || 'Enter your email address';
    const consentText = settings?.consentText || 'By subscribing, you agree to receive marketing emails.';

    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle newsletter subscription here
      setSubscribed(true);
      setEmail('');
    };

    return (
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.lighter' }}>
          {title && (
            <Typography variant="h4" component="h2" gutterBottom>
              {title}
            </Typography>
          )}
          {(subtitle || content) && (
            <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
              {subtitle || content}
            </Typography>
          )}
          
          {subscribed ? (
            <Box sx={{ py: 2 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main">
                Thank you for subscribing!
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <Button type="submit" variant="contained" sx={{ mr: -1 }}>
                      {buttonText}
                    </Button>
                  )
                }}
              />
              {consentText && (
                <Typography variant="caption" color="text.secondary">
                  {consentText}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Box>
    );
  };

  const renderMapLocationBlock = (block: ContentBlock) => {
    const { title, content, settings } = block;
    const address = settings?.address || content;
    const mapHeight = parseInt(settings?.mapHeight || '400');
    const showDirections = settings?.showDirections !== false;

    // Create Google Maps embed URL
    const getMapEmbedUrl = (address: string) => {
      const encodedAddress = encodeURIComponent(address);
      return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodedAddress}`;
    };

    return (
      <Box sx={{ mb: 4 }}>
        {title && (
          <Typography variant="h4" component="h2" gutterBottom align="center">
            {title}
          </Typography>
        )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: mapHeight, bgcolor: 'grey.200', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Placeholder for map - replace with actual Google Maps embed */}
              <Typography color="text.secondary">
                🗺️ Interactive Map
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {address}
              </Typography>
              
              {showDirections && (
                <Button
                  variant="contained"
                  startIcon={<LocationOn />}
                  href={`https://maps.google.com/maps?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderSocialFeedBlock = (block: ContentBlock) => {
    const { title, content, settings } = block;
    const platform = settings?.platform || 'instagram';
    const username = settings?.username || 'restaurant';
    const postCount = settings?.postCount || 6;
    const layout = settings?.layout || 'grid';

    // Mock social posts
    const mockPosts = Array.from({ length: postCount }, (_, i) => ({
      id: i + 1,
      image: `/api/placeholder/300/300`,
      caption: `Great food and atmosphere! #restaurant #food #dining`,
      likes: Math.floor(Math.random() * 100) + 10
    }));

    return (
      <Box sx={{ mb: 4 }}>
        {title && (
          <Typography variant="h4" component="h2" gutterBottom align="center">
            {title}
          </Typography>
        )}
        {content && (
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {content}
          </Typography>
        )}
        
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Instagram />}
            href={`https://${platform}.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow @{username}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {mockPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image}
                  alt={`Social post ${post.id}`}
                />
                <CardContent sx={{ p: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    ❤️ {post.likes} likes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderReservationWidgetBlock = (block: ContentBlock) => {
    const { title, subtitle, content, settings } = block;
    const theme = settings?.theme || 'light';
    const showAvailability = settings?.showAvailability !== false;
    const defaultPartySize = settings?.defaultPartySize || 2;

    const [formData, setFormData] = useState({
      date: '',
      time: '',
      partySize: defaultPartySize,
      name: '',
      email: '',
      phone: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Handle reservation submission here
      console.log('Reservation submitted:', formData);
    };

    return (
      <Box sx={{ mb: 4 }}>
        {title && (
          <Typography variant="h4" component="h2" gutterBottom align="center">
            {title}
          </Typography>
        )}
        {(subtitle || content) && (
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {subtitle || content}
          </Typography>
        )}
        
        <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Party Size"
                  value={formData.partySize}
                  onChange={(e) => setFormData(prev => ({ ...prev, partySize: parseInt(e.target.value) }))}
                  SelectProps={{ native: true }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? 'Person' : 'People'}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="tel"
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<EventSeat />}
                >
                  Book Table
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderPricingMenuBlock = (block: ContentBlock) => {
    const { title, content, settings } = block;
    const layout = settings?.layout || 'table';
    const currency = settings?.currency || '$';
    const showImages = settings?.showImages || false;

    // Mock pricing data
    const mockItems = [
      { id: 1, name: 'Private Dining Room', description: 'Exclusive use of our private room', price: 150, image: '/api/placeholder/100/100' },
      { id: 2, name: 'Catering Service', description: 'Full catering for events', price: 45, unit: 'per person', image: '/api/placeholder/100/100' },
      { id: 3, name: 'Wine Tasting', description: 'Guided wine tasting experience', price: 85, image: '/api/placeholder/100/100' }
    ];

    return (
      <Box sx={{ mb: 4 }}>
        {title && (
          <Typography variant="h4" component="h2" gutterBottom align="center">
            {title}
          </Typography>
        )}
        {content && (
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
            {content}
          </Typography>
        )}
        
        {layout === 'table' ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell component="th" scope="row">
                      {item.name}
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">
                      {currency}{item.price} {item.unit || ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={3}>
            {mockItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card>
                  {showImages && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.image}
                      alt={item.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {currency}{item.price} {item.unit || ''}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderSpacerBlock = (block: ContentBlock) => {
    const { settings } = block;
    const height = settings?.height || 'medium';
    const showDivider = settings?.showDivider || false;
    const dividerStyle = settings?.dividerStyle || 'solid';

    const heightMap: Record<string, number> = {
      'small': 20,
      'medium': 40,
      'large': 60,
      'extra-large': 80
    };

    const dividerStyleMap: Record<string, string> = {
      'solid': 'solid',
      'dashed': 'dashed',
      'dotted': 'dotted',
      'gradient': 'solid'
    };

    return (
      <Box sx={{ 
        height: heightMap[height],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2
      }}>
        {showDivider && (
          <Divider 
            sx={{ 
              width: '100%',
              borderStyle: dividerStyleMap[dividerStyle],
              borderColor: dividerStyle === 'gradient' ? 'transparent' : 'divider',
              ...(dividerStyle === 'gradient' && {
                background: 'linear-gradient(90deg, transparent, currentColor, transparent)',
                height: '1px',
                border: 'none'
              })
            }} 
          />
        )}
      </Box>
    );
  };

  return (
    <>
      {blocks
        .filter(block => block.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(block => (
          <Box key={block.id}>
            {renderBlock(block)}
          </Box>
        ))}
    </>
  );
};

export default ContentBlockRenderer; 