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
  
  // Video block properties
  controls?: boolean;
  aspectRatio?: string;
  showCustomControls?: boolean;
  
  // Testimonial block properties
  layout?: string;
  showStars?: boolean;
  showPhotos?: boolean;
  starColor?: string;
  starSize?: string;
  maxTestimonials?: number;
  animationEffect?: string;
  autoRotate?: string;
  rotationSpeed?: string;
  photoSize?: number;
  
  // Contact block properties
  showMap?: boolean;
  showContactForm?: boolean;
  showSocialLinks?: boolean;
  mapHeight?: string;
  formStyle?: string;
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  website?: string;
  socialLinks?: Record<string, string>;
  
  // Gallery block properties
  galleryLayout?: string;
  imageSpacing?: number;
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  showCaptions?: boolean;
  lightboxEnabled?: boolean;
  imageAspectRatio?: string;
  hoverOverlay?: boolean;
  filterEnabled?: boolean;
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
  const safeRender = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
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
        // Enhanced HTML block with universal styling system
        const { styles: htmlStyles, settings: htmlSettings } = parseBlockSettings(block);
        const htmlContainerStyles = getContainerStyles(htmlStyles, htmlSettings);
        const htmlTitleTypography = getTitleTypographyStyles(htmlSettings);
        const htmlContentTypography = getContentTypographyStyles(htmlSettings);
        
        return (
          <Box sx={htmlContainerStyles}>
            <Container maxWidth="lg">
              {block.title && (
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom 
                  sx={{
                    textAlign: htmlSettings.textAlign || 'center',
                    ...htmlTitleTypography
                  }}
                >
                  {safeRender(block.title)}
                </Typography>
              )}
              {block.content && (
                <Box 
                  dangerouslySetInnerHTML={{ __html: safeRender(block.content) }} 
                  sx={{
                    textAlign: htmlSettings.textAlign || 'left',
                    ...htmlContentTypography,
                    '& *': {
                      fontFamily: htmlContentTypography.fontFamily || 'inherit',
                      fontSize: htmlContentTypography.fontSize || 'inherit',
                      fontWeight: htmlContentTypography.fontWeight || 'inherit',
                      color: htmlContentTypography.color || 'inherit',
                      lineHeight: htmlContentTypography.lineHeight || 'inherit',
                      letterSpacing: htmlContentTypography.letterSpacing || 'inherit'
                    }
                  }}
                />
              )}
            </Container>
          </Box>
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
          mobileBehavior: heroSettings.videoMobileBehavior || 'video'
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

            {/* Mobile Debug Info - Temporary */}
            {process.env.NODE_ENV === 'development' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  zIndex: 3,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: 1,
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  maxWidth: '200px'
                }}
              >
                📱 Mobile: {video.isMobile ? 'YES' : 'NO'}<br/>
                🎬 Show Video: {video.showVideo ? 'YES' : 'NO'}<br/>
                🖼️ Show Fallback: {video.showFallback ? 'YES' : 'NO'}<br/>
                🎯 Behavior: {videoOptions.mobileBehavior}<br/>
                📺 Loaded: {video.isVideoLoaded ? 'YES' : 'NO'}
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
        // Enhanced CONTACT block with universal styling system
        const { styles: contactStyles, settings: contactSettings } = parseBlockSettings(block);
        const contactContainerStyles = getContainerStyles(contactStyles, contactSettings);
        const contactTitleTypography = getTitleTypographyStyles(contactSettings);
        const contactContentTypography = getContentTypographyStyles(contactSettings);
        
        // Advanced contact settings with defaults
        const contactLayout = contactSettings.layout || 'two-column';
        const showMap = contactSettings.showMap !== false;
        const showContactForm = contactSettings.showContactForm || false;
        const showSocialLinks = contactSettings.showSocialLinks || false;
        const mapHeight = contactSettings.mapHeight || '300px';
        const formStyle = contactSettings.formStyle || 'standard';
        
        // Parse additional contact data from settings
        const contactData = {
          phone: contactSettings.phone || '',
          email: contactSettings.email || '',
          address: contactSettings.address || '',
          hours: contactSettings.hours || '',
          website: contactSettings.website || '',
          socialLinks: contactSettings.socialLinks || {}
        };

        return (
          <Box sx={contactContainerStyles}>
            <Container maxWidth="lg">
              {block.title && (
                <Typography 
                  variant="h4" 
                  component="h2" 
                  gutterBottom 
                  sx={{
                    textAlign: contactSettings.textAlign || 'center',
                    mb: 4,
                    ...contactTitleTypography
                  }}
                >
                  {safeRender(block.title)}
                </Typography>
              )}
              
              <Grid container spacing={4}>
                {/* Contact Information Section */}
                <Grid item xs={12} md={contactLayout === 'single-column' ? 12 : 6}>
                  <Paper 
                    elevation={contactSettings.cardStyle === 'flat' ? 0 : 2} 
                    sx={{ 
                      p: 4, 
                      height: '100%',
                      border: contactSettings.cardStyle === 'outlined' ? '2px solid' : 'none',
                      borderColor: contactSettings.cardStyle === 'outlined' ? 'primary.main' : 'transparent'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{
                        color: contactSettings.titleColor || 'text.primary',
                        fontWeight: 600
                      }}
                    >
                      Get in Touch
                    </Typography>
                    
                    {/* Contact Content */}
                    {block.content && (
                      <Typography 
                        variant="body1" 
                        paragraph
                        sx={{
                          ...contactContentTypography,
                          mb: 3
                        }}
                        dangerouslySetInnerHTML={{ __html: safeRender(block.content) }}
                      />
                    )}
                    
                    {/* Contact Details */}
                    <Box sx={{ mb: 3 }}>
                      {contactData.phone && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>📞</Typography>
                          <Typography variant="body1">
                            <Link href={`tel:${contactData.phone}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                              {safeRender(contactData.phone)}
                            </Link>
                          </Typography>
                        </Box>
                      )}
                      
                      {contactData.email && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>📧</Typography>
                          <Typography variant="body1">
                            <Link href={`mailto:${contactData.email}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                              {safeRender(contactData.email)}
                            </Link>
                          </Typography>
                        </Box>
                      )}
                      
                      {contactData.address && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>📍</Typography>
                          <Typography variant="body1">
                            {safeRender(contactData.address)}
                          </Typography>
                        </Box>
                      )}
                      
                      {contactData.hours && (
                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 0.5 }}>🕒</Typography>
                          <Typography variant="body1">
                            {safeRender(contactData.hours)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    {/* Social Links */}
                    {showSocialLinks && contactData.socialLinks && Object.keys(contactData.socialLinks).length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                          Follow Us
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          {Object.entries(contactData.socialLinks).map(([platform, url]: [string, any]) => (
                            url && (
                              <Button
                                key={platform}
                                component={Link}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outlined"
                                size="small"
                                sx={{ textTransform: 'capitalize' }}
                              >
                                {platform}
                              </Button>
                            )
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {/* CTA Button */}
                    {block.buttonText && block.buttonLink && (
                      <Button
                        component={Link}
                        href={safeRender(block.buttonLink)}
                        variant="contained"
                        sx={{ 
                          mt: 3,
                          backgroundColor: contactSettings.buttonBackgroundColor || 'primary.main',
                          color: contactSettings.buttonTextColor || 'white',
                          '&:hover': {
                            backgroundColor: contactSettings.buttonHoverColor || 'primary.dark'
                          }
                        }}
                      >
                        {safeRender(block.buttonText)}
                      </Button>
                    )}
                  </Paper>
                </Grid>
                
                {/* Map/Image Section */}
                {contactLayout !== 'single-column' && (block.imageUrl || (showMap && contactData.address)) && (
                  <Grid item xs={12} md={6}>
                    <Paper 
                      elevation={3} 
                      sx={{ 
                        overflow: 'hidden', 
                        borderRadius: 2, 
                        height: '100%',
                        minHeight: mapHeight
                      }}
                    >
                      {block.imageUrl ? (
                        <img
                          src={safeRender(block.imageUrl)}
                          alt={safeRender(block.title) || 'Contact us'}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover', 
                            display: 'block' 
                          }}
                        />
                      ) : showMap && contactData.address ? (
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(contactData.address)}`}
                          width="100%"
                          height="100%"
                          style={{ border: 0, minHeight: mapHeight }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Location Map"
                        />
                      ) : (
                        <Box 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: 'grey.100',
                            minHeight: mapHeight
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            🗺️ Map placeholder - Add address to display map
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                )}
                
                {/* Contact Form Section */}
                {showContactForm && (
                  <Grid item xs={12}>
                    <Paper 
                      elevation={2} 
                      sx={{ 
                        p: 4, 
                        mt: 2,
                        border: contactSettings.cardStyle === 'outlined' ? '2px solid' : 'none',
                        borderColor: contactSettings.cardStyle === 'outlined' ? 'primary.main' : 'transparent'
                      }}
                    >
                      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Send us a Message
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Name"
                            variant={formStyle === 'filled' ? 'filled' : 'outlined'}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            variant={formStyle === 'filled' ? 'filled' : 'outlined'}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Subject"
                            variant={formStyle === 'filled' ? 'filled' : 'outlined'}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Message"
                            multiline
                            rows={4}
                            variant={formStyle === 'filled' ? 'filled' : 'outlined'}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            size="large"
                            sx={{
                              backgroundColor: contactSettings.buttonBackgroundColor || 'primary.main',
                              color: contactSettings.buttonTextColor || 'white'
                            }}
                          >
                            Send Message
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Container>
          </Box>
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

      case 'gallery':
        return renderGalleryBlock(block);

      case 'spacer':
        return renderSpacerBlock(block);

      default:
        return null;
    }
  };

  const renderVideoBlock = (block: ContentBlock) => {
    // Enhanced VIDEO block with universal styling system
    const { styles: videoStyles, settings: videoSettings } = parseBlockSettings(block);
    const videoContainerStyles = getContainerStyles(videoStyles, videoSettings);
    const videoTitleTypography = getTitleTypographyStyles(videoSettings);
    const videoContentTypography = getContentTypographyStyles(videoSettings);
    
    const { title, videoUrl, content } = block;
    
    // Video control settings with defaults
    const autoplay = videoSettings.videoAutoplay === 'true' || false;
    const loop = videoSettings.videoLoop === 'true' || false;
    const muted = videoSettings.videoMuted === 'true' || true; // Default muted for autoplay
    const controls = videoSettings.controls !== false; // Default to true
    const aspectRatio = videoSettings.aspectRatio || '16:9';
    const playbackRate = videoSettings.videoPlaybackRate || '1';
    const quality = videoSettings.videoQuality || 'auto';
    const mobileBehavior = videoSettings.videoMobileBehavior || 'autoplay';
    const thumbnailUrl = videoSettings.videoFallbackImage;
    const showCustomControls = videoSettings.showCustomControls || false;
    
    // Extract video ID from URL for embedding
    const getEmbedUrl = (url: string) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = url.includes('youtu.be') 
          ? url.split('youtu.be/')[1]?.split('?')[0]
          : url.split('v=')[1]?.split('&')[0];
        const params = new URLSearchParams({
          autoplay: autoplay ? '1' : '0',
          controls: controls ? '1' : '0',
          loop: loop ? '1' : '0',
          muted: muted ? '1' : '0',
          playsinline: '1',
          rel: '0',
          modestbranding: '1'
        });
        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
        const params = new URLSearchParams({
          autoplay: autoplay ? '1' : '0',
          loop: loop ? '1' : '0',
          muted: muted ? '1' : '0',
          playsinline: '1',
          title: '0',
          byline: '0',
          portrait: '0'
        });
        return `https://player.vimeo.com/video/${videoId}?${params.toString()}`;
      }
      return url;
    };

    if (!videoUrl) {
      return (
        <Box sx={videoContainerStyles}>
          <Container maxWidth="lg">
            <Box sx={{ 
              p: 4, 
              textAlign: 'center', 
              bgcolor: 'grey.100', 
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'grey.300'
            }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                🎥 Video Block
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No video URL provided. Add a YouTube or Vimeo URL to display your video.
              </Typography>
            </Box>
          </Container>
        </Box>
      );
    }

    const aspectRatioMap: Record<string, string> = {
      '16:9': '56.25%',
      '4:3': '75%',
      '3:2': '66.67%',
      '1:1': '100%',
      '21:9': '42.86%',
      'auto': 'auto'
    };

    return (
      <Box sx={videoContainerStyles}>
        <Container maxWidth="lg">
          {title && (
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{
                textAlign: videoSettings.textAlign || 'center',
                ...videoTitleTypography
              }}
            >
              {safeRender(title)}
            </Typography>
          )}
          {content && (
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                textAlign: videoSettings.textAlign || 'center',
                ...videoContentTypography
              }}
            >
              {safeRender(content)}
            </Typography>
          )}
          
          {/* Video Container with Advanced Styling */}
          <Box 
            sx={{ 
              position: 'relative',
              paddingBottom: aspectRatioMap[aspectRatio],
              height: aspectRatio === 'auto' ? 'auto' : 0,
              overflow: 'hidden',
              borderRadius: videoStyles.borderRadius || 2,
              boxShadow: videoSettings.shadowLevel || 3,
              border: videoStyles.borderWidth && parseInt(videoStyles.borderWidth) > 0 ? 
                `${videoStyles.borderWidth} ${videoStyles.borderStyle || 'solid'} ${videoStyles.borderColor || '#000000'}` : 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: videoSettings.hoverEffect === 'zoom' ? 'scale(1.02)' : 
                          videoSettings.hoverEffect === 'lift' ? 'translateY(-4px)' : 'none',
                boxShadow: videoSettings.hoverEffect ? '0 12px 30px rgba(0,0,0,0.15)' : undefined
              },
              // Thumbnail overlay before play
              ...(thumbnailUrl && !autoplay && {
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                '&::before': {
                  content: '"▶"',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '4rem',
                  color: 'white',
                  textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  zIndex: 1,
                  cursor: 'pointer'
                }
              })
            }}
          >
            <iframe
              src={getEmbedUrl(videoUrl)}
              title={safeRender(title) || 'Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              style={{
                position: aspectRatio === 'auto' ? 'static' : 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: aspectRatio === 'auto' ? '400px' : '100%',
                borderRadius: 'inherit'
              }}
            />
            
            {/* Custom Video Overlay Controls (if enabled) */}
            {showCustomControls && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '&:hover': {
                    opacity: 1
                  }
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Quality: {quality} | Rate: {playbackRate}x
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {autoplay && (
                    <Chip label="Auto" size="small" color="primary" variant="outlined" />
                  )}
                  {loop && (
                    <Chip label="Loop" size="small" color="secondary" variant="outlined" />
                  )}
                  {muted && (
                    <Chip label="Muted" size="small" color="default" variant="outlined" />
                  )}
                </Box>
              </Box>
            )}
          </Box>
          
          {/* Mobile-specific notice */}
          {mobileBehavior === 'click-to-play' && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: { xs: 'block', md: 'none' }, 
                textAlign: 'center', 
                mt: 1, 
                fontStyle: 'italic' 
              }}
            >
              Tap video to play on mobile devices
            </Typography>
          )}
        </Container>
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
    // Enhanced TESTIMONIALS block with universal styling system
    const { styles: testimonialStyles, settings: testimonialSettings } = parseBlockSettings(block);
    const testimonialContainerStyles = getContainerStyles(testimonialStyles, testimonialSettings);
    const testimonialTitleTypography = getTitleTypographyStyles(testimonialSettings);
    const testimonialContentTypography = getContentTypographyStyles(testimonialSettings);
    
    const { title, content } = block;
    
    // Advanced testimonial settings with defaults
    const layout = testimonialSettings.layout || 'carousel';
    const showStars = testimonialSettings.showStars !== false;
    const showPhotos = testimonialSettings.showPhotos !== false; // Default to true for better visual
    const cardStyle = testimonialSettings.cardStyle || 'elevated';
    const cardPadding = testimonialSettings.cardPadding || 3;
    const starColor = testimonialSettings.starColor || '#FFD700'; // Gold
    const maxTestimonials = testimonialSettings.maxTestimonials || 3;
    const animationEffect = testimonialSettings.animationEffect || 'none';
    const autoRotate = testimonialSettings.autoRotate === 'true' || false;
    const rotationSpeed = parseInt(testimonialSettings.rotationSpeed || '5000'); // 5 seconds

    // Mock testimonials data - in real app, this would come from API
    const mockTestimonials = [
      {
        id: 1,
        name: 'Sarah Johnson',
        content: 'Amazing food and excellent service! The atmosphere is perfect for a romantic dinner. Every dish was crafted to perfection.',
        rating: 5,
        photo: '/api/placeholder/80/80',
        position: 'Food Blogger',
        location: 'New York, NY'
      },
      {
        id: 2,
        name: 'Mike Chen',
        content: 'Best restaurant in town! Fresh ingredients and creative dishes that never disappoint. The chef truly understands flavor.',
        rating: 5,
        photo: '/api/placeholder/80/80',
        position: 'Chef',
        location: 'Los Angeles, CA'
      },
      {
        id: 3,
        name: 'Emily Davis',
        content: 'Wonderful experience from start to finish. Highly recommend the chef\'s special! Outstanding service and ambiance.',
        rating: 5,
        photo: '/api/placeholder/80/80',
        position: 'Food Critic',
        location: 'Chicago, IL'
      },
      {
        id: 4,
        name: 'James Wilson',
        content: 'Incredible dining experience! The attention to detail in every course was remarkable. Will definitely return.',
        rating: 5,
        photo: '/api/placeholder/80/80',
        position: 'Restaurant Owner',
        location: 'Miami, FL'
      }
    ].slice(0, maxTestimonials);

    const StarRating = ({ rating }: { rating: number }) => (
      <Box display="flex" gap={0.5} justifyContent={testimonialSettings.textAlign === 'center' ? 'center' : 'flex-start'}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            sx={{
              color: star <= rating ? starColor : '#E0E0E0',
              fontSize: testimonialSettings.starSize || '1.2rem',
              filter: star <= rating ? 'drop-shadow(0 0 2px rgba(255,215,0,0.3))' : 'none'
            }}
          />
        ))}
      </Box>
    );

    // Card styling based on cardStyle setting
    const getCardStyles = () => {
      const baseStyles = {
        height: '100%',
        p: cardPadding,
        transition: 'all 0.3s ease',
        borderRadius: testimonialStyles.borderRadius || 2,
        border: testimonialStyles.borderWidth && parseInt(testimonialStyles.borderWidth) > 0 ? 
          `${testimonialStyles.borderWidth} ${testimonialStyles.borderStyle || 'solid'} ${testimonialStyles.borderColor || '#E0E0E0'}` : 'none'
      };

      switch (cardStyle) {
        case 'flat':
          return {
            ...baseStyles,
            elevation: 0,
            backgroundColor: testimonialStyles.backgroundColor || 'grey.50',
            '&:hover': {
              backgroundColor: 'grey.100',
              transform: animationEffect === 'lift' ? 'translateY(-4px)' : 'none'
            }
          };
        case 'outlined':
          return {
            ...baseStyles,
            elevation: 0,
            border: '1px solid',
            borderColor: 'grey.300',
            '&:hover': {
              borderColor: 'primary.main',
              transform: animationEffect === 'lift' ? 'translateY(-4px)' : 'none',
              boxShadow: animationEffect === 'shadow' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
            }
          };
        default: // elevated
          return {
            ...baseStyles,
            elevation: 2,
            '&:hover': {
              elevation: 6,
              transform: animationEffect === 'lift' ? 'translateY(-4px)' : 
                        animationEffect === 'scale' ? 'scale(1.02)' : 'none',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }
          };
      }
    };

    return (
      <Box sx={testimonialContainerStyles}>
        <Container maxWidth="lg">
          {title && (
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{
                textAlign: testimonialSettings.textAlign || 'center',
                mb: 3,
                ...testimonialTitleTypography
              }}
            >
              {safeRender(title)}
            </Typography>
          )}
          {content && (
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                textAlign: testimonialSettings.textAlign || 'center',
                maxWidth: 600,
                mx: 'auto',
                ...testimonialContentTypography
              }}
            >
              {safeRender(content)}
            </Typography>
          )}
          
          {layout === 'grid' ? (
            <Grid container spacing={testimonialSettings.gridSpacing || 3}>
              {mockTestimonials.map((testimonial, index) => (
                <Grid item xs={12} sm={6} md={maxTestimonials <= 2 ? 6 : 4} key={testimonial.id}>
                  <Card sx={getCardStyles()}>
                    <CardContent sx={{ p: 0 }}>
                      {/* Star Rating */}
                      {showStars && (
                        <Box sx={{ mb: 2 }}>
                          <StarRating rating={testimonial.rating} />
                        </Box>
                      )}
                      
                      {/* Testimonial Content */}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 3, 
                          fontStyle: 'italic',
                          fontSize: testimonialSettings.contentFontSize || '1rem',
                          lineHeight: 1.6,
                          textAlign: testimonialSettings.textAlign || 'left',
                          '&::before': { content: '"\\201C"', fontSize: '1.5em', color: 'primary.main' },
                          '&::after': { content: '"\\201D"', fontSize: '1.5em', color: 'primary.main' }
                        }}
                      >
                        {testimonial.content}
                      </Typography>
                      
                      {/* Author Info */}
                      <Box display="flex" alignItems="center" gap={2}>
                        {showPhotos && (
                          <Avatar 
                            src={testimonial.photo} 
                            alt={testimonial.name}
                            sx={{ 
                              width: testimonialSettings.photoSize || 50,
                              height: testimonialSettings.photoSize || 50,
                              border: '2px solid',
                              borderColor: 'primary.light'
                            }}
                          />
                        )}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                            {testimonial.name}
                          </Typography>
                          {testimonial.position && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {testimonial.position}
                            </Typography>
                          )}
                          {testimonial.location && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {testimonial.location}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Carousel/List Layout
            <Box sx={{ textAlign: testimonialSettings.textAlign || 'center' }}>
              {mockTestimonials.map((testimonial, index) => (
                <Paper 
                  key={testimonial.id} 
                  sx={{ 
                    p: 4, 
                    mb: 3, 
                    maxWidth: 700, 
                    mx: 'auto',
                    ...getCardStyles(),
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': testimonialStyles.backgroundColor ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: `linear-gradient(90deg, ${starColor}, transparent)`
                    } : {}
                  }}
                >
                  {/* Star Rating */}
                  {showStars && (
                    <Box sx={{ mb: 3 }}>
                      <StarRating rating={testimonial.rating} />
                    </Box>
                  )}
                  
                  {/* Testimonial Content */}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 3, 
                      fontStyle: 'italic',
                      fontSize: testimonialSettings.contentFontSize || '1.1rem',
                      lineHeight: 1.6,
                      fontWeight: 400,
                      textAlign: testimonialSettings.textAlign || 'center',
                      '&::before': { content: '"\\201C"', fontSize: '2em', color: 'primary.main', verticalAlign: 'top' },
                      '&::after': { content: '"\\201D"', fontSize: '2em', color: 'primary.main', verticalAlign: 'top' }
                    }}
                  >
                    {testimonial.content}
                  </Typography>
                  
                  {/* Author Info */}
                  <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                    {showPhotos && (
                      <Avatar 
                        src={testimonial.photo} 
                        alt={testimonial.name}
                        sx={{ 
                          width: testimonialSettings.photoSize || 60,
                          height: testimonialSettings.photoSize || 60,
                          border: '3px solid',
                          borderColor: 'primary.light',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    )}
                    <Box textAlign="left">
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                        {testimonial.name}
                      </Typography>
                      {testimonial.position && (
                        <Typography variant="body2" color="text.secondary" display="block">
                          {testimonial.position}
                        </Typography>
                      )}
                      {testimonial.location && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          📍 {testimonial.location}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
          
          {/* Auto-rotation indicator */}
          {autoRotate && layout === 'carousel' && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                display: 'block', 
                textAlign: 'center', 
                mt: 2, 
                fontStyle: 'italic' 
              }}
            >
              ↻ Auto-rotating every {rotationSpeed/1000}s
            </Typography>
          )}
        </Container>
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

  const renderGalleryBlock = (block: ContentBlock) => {
    // Enhanced GALLERY block with universal styling system
    const { styles: galleryStyles, settings: gallerySettings } = parseBlockSettings(block);
    const galleryContainerStyles = getContainerStyles(galleryStyles, gallerySettings);
    const galleryTitleTypography = getTitleTypographyStyles(gallerySettings);
    const galleryContentTypography = getContentTypographyStyles(gallerySettings);
    
    const { title, content } = block;
    
    // Gallery settings
    const layout = gallerySettings.galleryLayout || 'grid';
    const imageSpacing = gallerySettings.imageSpacing || 20;
    const columnsDesktop = gallerySettings.columnsDesktop || 3;
    const columnsTablet = gallerySettings.columnsTablet || 2;
    const columnsMobile = gallerySettings.columnsMobile || 1;
    const showCaptions = gallerySettings.showCaptions || false;
    const lightboxEnabled = gallerySettings.lightboxEnabled || false;
    const imageAspectRatio = gallerySettings.imageAspectRatio || '16:9';
    const hoverOverlay = gallerySettings.hoverOverlay || false;
    const filterEnabled = gallerySettings.filterEnabled || false;
    
    // Mock gallery items
    const mockGalleryItems = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      image: `/api/placeholder/300/200`,
      caption: `Gallery item ${i + 1}`
    }));
    
    return (
      <Box sx={galleryContainerStyles}>
        <Container maxWidth="lg">
          {title && (
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom 
              sx={{
                textAlign: gallerySettings.textAlign || 'center',
                ...galleryTitleTypography
              }}
            >
              {safeRender(title)}
            </Typography>
          )}
          {content && (
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 3, 
                textAlign: gallerySettings.textAlign || 'center',
                ...galleryContentTypography
              }}
            >
              {safeRender(content)}
            </Typography>
          )}
          
          {layout === 'grid' ? (
            <Grid container spacing={imageSpacing}>
              {mockGalleryItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Box 
                    sx={{ 
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: galleryStyles.borderRadius || 2,
                      boxShadow: gallerySettings.shadowLevel || 3,
                      border: galleryStyles.borderWidth && parseInt(galleryStyles.borderWidth) > 0 ? 
                        `${galleryStyles.borderWidth} ${galleryStyles.borderStyle || 'solid'} ${galleryStyles.borderColor || '#000000'}` : 'none',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: gallerySettings.hoverEffect === 'zoom' ? 'scale(1.02)' : 
                                  gallerySettings.hoverEffect === 'lift' ? 'translateY(-4px)' : 'none',
                        boxShadow: gallerySettings.hoverEffect ? '0 12px 30px rgba(0,0,0,0.15)' : undefined
                      },
                      ...(hoverOverlay && {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.5)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          '&:hover': { opacity: 1 }
                        }
                      })
                    }}
                  >
                    <img
                      src={safeRender(item.image)}
                      alt={safeRender(item.caption) || 'Gallery item'}
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        display: 'block',
                        objectFit: gallerySettings.objectFit || 'cover'
                      }}
                    />
                    {showCaptions && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(0,0,0,0.5)',
                          p: 1,
                          color: 'white',
                          textAlign: 'center'
                        }}
                      >
                        {safeRender(item.caption)}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            // Carousel/List Layout
            <Box sx={{ textAlign: gallerySettings.textAlign || 'center' }}>
              {mockGalleryItems.map((item) => (
                <Box key={item.id} sx={{ mb: imageSpacing }}>
                  <Box 
                    sx={{ 
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: galleryStyles.borderRadius || 2,
                      boxShadow: gallerySettings.shadowLevel || 3,
                      border: galleryStyles.borderWidth && parseInt(galleryStyles.borderWidth) > 0 ? 
                        `${galleryStyles.borderWidth} ${galleryStyles.borderStyle || 'solid'} ${galleryStyles.borderColor || '#000000'}` : 'none',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: gallerySettings.hoverEffect === 'zoom' ? 'scale(1.02)' : 
                                  gallerySettings.hoverEffect === 'lift' ? 'translateY(-4px)' : 'none',
                        boxShadow: gallerySettings.hoverEffect ? '0 12px 30px rgba(0,0,0,0.15)' : undefined
                      },
                      ...(hoverOverlay && {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.5)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          '&:hover': { opacity: 1 }
                        }
                      })
                    }}
                  >
                    <img
                      src={safeRender(item.image)}
                      alt={safeRender(item.caption) || 'Gallery item'}
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        display: 'block',
                        objectFit: gallerySettings.objectFit || 'cover'
                      }}
                    />
                    {showCaptions && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'rgba(0,0,0,0.5)',
                          p: 1,
                          color: 'white',
                          textAlign: 'center'
                        }}
                      >
                        {safeRender(item.caption)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Container>
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
    <Box>
      {blocks.map((block) => (
        <Box key={block.id}>
          {renderBlock(block)}
        </Box>
      ))}
    </Box>
  );
};

export default ContentBlockRenderer; 