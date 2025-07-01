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
        return (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {block.title && (
              <Typography variant="h4" component="h2" gutterBottom align="center">
                {safeRender(block.title)}
              </Typography>
            )}
            {block.subtitle && (
              <Typography variant="h6" color="text.secondary" gutterBottom align="center">
                {safeRender(block.subtitle)}
              </Typography>
            )}
            {block.content && (
              <Typography variant="body1" paragraph>
                {safeRender(block.content)}
              </Typography>
            )}
          </Container>
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
        return (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {block.title && (
              <Typography variant="h4" component="h2" gutterBottom align="center">
                {safeRender(block.title)}
              </Typography>
            )}
            {block.imageUrl && (
              <Box display="flex" justifyContent="center">
                <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 2 }}>
                  <img
                    src={safeRender(block.imageUrl)}
                    alt={safeRender(block.title) || 'Image'}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Paper>
              </Box>
            )}
          </Container>
        );

      case BLOCK_TYPES.CTA:
        return (
          <Box sx={{ backgroundColor: 'primary.main', color: 'white', py: 6 }}>
            <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
              {block.title && (
                <Typography variant="h4" gutterBottom>
                  {safeRender(block.title)}
                </Typography>
              )}
              {block.subtitle && (
                <Typography variant="h6" sx={{ mb: 3 }}>
                  {safeRender(block.subtitle)}
                </Typography>
              )}
              {block.buttonText && block.buttonLink && (
                <Button
                  component={Link}
                  to={safeRender(block.buttonLink)}
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    }
                  }}
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
        // For features, we expect the content to be JSON with feature items
        let features = [];
        try {
          features = block.content ? JSON.parse(block.content) : [];
        } catch (e) {
          console.error('Failed to parse features content:', e);
        }
        

        
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
            <Grid container spacing={4}>
              {features.map((feature: any, index: number) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {safeRender(feature.title)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {safeRender(feature.description)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
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