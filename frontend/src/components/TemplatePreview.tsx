import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Close,
  Palette,
  TextFields,
  ViewModule,
  CheckCircle,
  ArrowBack
} from '@mui/icons-material';
import { RestaurantTemplate, LayoutConfig, ColorConfig, TypographyConfig } from '../services/restaurantTemplateService';

interface TemplatePreviewProps {
  open: boolean;
  template: RestaurantTemplate | null;
  onClose: () => void;
  onApply?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  open,
  template,
  onClose,
  onApply
}) => {
  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (template && open) {
      loadGoogleFonts(template.defaultTypography);
    }
  }, [template, open]);

  const loadGoogleFonts = async (typography: TypographyConfig) => {
    const fonts = [
      typography.headingFont.split(',')[0].trim(),
      typography.bodyFont.split(',')[0].trim()
    ];
    
    if (typography.accentFont) {
      fonts.push(typography.accentFont.split(',')[0].trim());
    }

    const fontPromises = fonts.map(font => {
      const fontName = font.replace(/\s+/g, '+');
      return new Promise<void>((resolve) => {
        if (!document.querySelector(`link[href*="${fontName}"]`)) {
          const link = document.createElement('link');
          link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;
          link.rel = 'stylesheet';
          link.onload = () => resolve();
          link.onerror = () => resolve();
          document.head.appendChild(link);
        } else {
          resolve();
        }
      });
    });

    await Promise.all(fontPromises);
    setFontsLoaded(true);
  };

  if (!template) return null;

  const colors = template.defaultColors;
  const typography = template.defaultTypography;
  const layout = template.layoutConfig;

  const previewStyles = {
    fontFamily: typography.bodyFont,
    color: colors.text,
    backgroundColor: colors.background
  };

  const headingStyles = {
    fontFamily: typography.headingFont,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary,
    lineHeight: typography.lineHeight.heading
  };

  const bodyStyles = {
    fontFamily: typography.bodyFont,
    fontWeight: typography.fontWeights.regular,
    color: colors.text,
    fontSize: typography.bodySize,
    lineHeight: typography.lineHeight.body
  };

  const getContainerMaxWidth = () => {
    switch (layout.containerMaxWidth) {
      case 'narrow': return '800px';
      case 'standard': return '1200px';
      case 'wide': return '1400px';
      case 'full': return '100%';
      default: return '1200px';
    }
  };

  const getSectionSpacing = () => {
    switch (layout.sectionSpacing) {
      case 'tight': return '2rem';
      case 'standard': return '4rem';
      case 'relaxed': return '6rem';
      case 'generous': return '8rem';
      default: return '4rem';
    }
  };

  const getBorderRadius = () => {
    switch (layout.borderRadius) {
      case 'none': return '0';
      case 'subtle': return '4px';
      case 'standard': return '8px';
      case 'rounded': return '16px';
      default: return '8px';
    }
  };

  const getShadow = () => {
    switch (layout.shadows) {
      case 'none': return 'none';
      case 'subtle': return '0 2px 4px rgba(0,0,0,0.1)';
      case 'standard': return '0 4px 8px rgba(0,0,0,0.15)';
      case 'dramatic': return '0 8px 16px rgba(0,0,0,0.2)';
      default: return '0 4px 8px rgba(0,0,0,0.15)';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: '95vw',
          height: '95vh',
          m: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: colors.primary, 
        color: colors.secondary,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" sx={{ fontFamily: typography.headingFont }}>
            {template.name} - Preview
          </Typography>
          <Chip 
            label={template.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            size="small"
            sx={{ bgcolor: colors.accent, color: colors.background }}
          />
        </Box>
        <IconButton onClick={onClose} sx={{ color: colors.secondary }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: colors.background }}>
        {!fontsLoaded ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ ...previewStyles, minHeight: '100%' }}>
            {/* Hero Section Preview */}
            <Box
              sx={{
                bgcolor: colors.primary,
                color: colors.secondary,
                py: getSectionSpacing(),
                px: 4,
                textAlign: 'center',
                backgroundImage: layout.heroStyle === 'fullscreen' 
                  ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920')`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  ...headingStyles,
                  fontSize: typography.headingSizes.h1,
                  color: colors.secondary,
                  mb: 2
                }}
              >
                Restaurant Name
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  ...bodyStyles,
                  fontSize: typography.headingSizes.h4,
                  color: colors.secondary,
                  opacity: 0.9
                }}
              >
                Experience Fine Dining at Its Best
              </Typography>
            </Box>

            {/* Content Section */}
            <Box
              sx={{
                maxWidth: getContainerMaxWidth(),
                mx: 'auto',
                px: 4,
                py: getSectionSpacing()
              }}
            >
              {/* About Section Preview */}
              <Grid container spacing={4} sx={{ mb: getSectionSpacing() }}>
                <Grid item xs={12} md={layout.aboutStyle === 'side-by-side' ? 6 : 12}>
                  <Typography
                    variant="h2"
                    sx={{
                      ...headingStyles,
                      fontSize: typography.headingSizes.h2,
                      mb: 2
                    }}
                  >
                    About Us
                  </Typography>
                  <Typography sx={bodyStyles} paragraph>
                    Discover our story and passion for exceptional cuisine. Our chefs combine traditional techniques 
                    with modern innovation to create unforgettable dining experiences.
                  </Typography>
                  <Typography sx={bodyStyles}>
                    We source the finest ingredients from local farms and trusted suppliers, ensuring every dish 
                    meets our high standards of quality and flavor.
                  </Typography>
                </Grid>
                {layout.aboutStyle === 'side-by-side' && (
                  <Grid item xs={12} md={6}>
                    <Paper
                      sx={{
                        height: '300px',
                        bgcolor: colors.surface,
                        borderRadius: getBorderRadius(),
                        boxShadow: getShadow(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography sx={{ color: colors.textSecondary }}>
                        Image Placeholder
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              {/* Menu Preview */}
              <Box sx={{ mb: getSectionSpacing() }}>
                <Typography
                  variant="h2"
                  sx={{
                    ...headingStyles,
                    fontSize: typography.headingSizes.h2,
                    mb: 4,
                    textAlign: 'center'
                  }}
                >
                  Our Menu
                </Typography>
                <Grid container spacing={3}>
                  {[1, 2, 3].map((item) => (
                    <Grid item xs={12} sm={6} md={layout.menuStyle === 'grid' ? 4 : 12} key={item}>
                      <Paper
                        sx={{
                          p: 3,
                          bgcolor: colors.surface,
                          borderRadius: getBorderRadius(),
                          boxShadow: getShadow(),
                          border: `1px solid ${colors.border}`,
                          '&:hover': {
                            boxShadow: layout.shadows === 'dramatic' 
                              ? '0 12px 24px rgba(0,0,0,0.25)' 
                              : getShadow()
                          }
                        }}
                      >
                        <Typography
                          variant="h5"
                          sx={{
                            ...headingStyles,
                            fontSize: typography.headingSizes.h5,
                            mb: 1,
                            color: colors.primary
                          }}
                        >
                          Menu Item {item}
                        </Typography>
                        <Typography sx={{ ...bodyStyles, color: colors.textSecondary, mb: 2 }}>
                          Description of this delicious menu item with fresh ingredients.
                        </Typography>
                        <Typography
                          sx={{
                            ...bodyStyles,
                            fontWeight: typography.fontWeights.bold,
                            color: colors.accent
                          }}
                        >
                          $24.99
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Color Palette Display */}
              <Divider sx={{ my: 4 }} />
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    ...headingStyles,
                    fontSize: typography.headingSizes.h3,
                    mb: 3
                  }}
                >
                  Color Palette
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(colors).map(([key, value]) => (
                    <Grid item xs={6} sm={4} md={3} key={key}>
                      <Box
                        sx={{
                          bgcolor: value,
                          height: '80px',
                          borderRadius: getBorderRadius(),
                          border: `1px solid ${colors.border}`,
                          display: 'flex',
                          alignItems: 'flex-end',
                          p: 1
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: key.includes('text') || key.includes('background') || key.includes('surface')
                              ? (value === '#ffffff' || value === '#fafafa' || value === '#f5f5f5' ? colors.text : colors.secondary)
                              : '#ffffff',
                            fontWeight: typography.fontWeights.bold
                          }}
                        >
                          {key}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Typography Display */}
              <Divider sx={{ my: 4 }} />
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    ...headingStyles,
                    fontSize: typography.headingSizes.h3,
                    mb: 3
                  }}
                >
                  Typography
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h1"
                    sx={{
                      ...headingStyles,
                      fontSize: typography.headingSizes.h1,
                      mb: 1
                    }}
                  >
                    Heading 1 - {typography.headingFont}
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      ...headingStyles,
                      fontSize: typography.headingSizes.h2,
                      mb: 1
                    }}
                  >
                    Heading 2 - {typography.headingFont}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      ...headingStyles,
                      fontSize: typography.headingSizes.h3,
                      mb: 1
                    }}
                  >
                    Heading 3 - {typography.headingFont}
                  </Typography>
                  <Typography sx={bodyStyles}>
                    Body text - {typography.bodyFont}. This is how your body text will appear throughout the website. 
                    The line height is set to {typography.lineHeight.body} for optimal readability.
                  </Typography>
                </Box>
              </Box>

              {/* Layout Features */}
              <Divider sx={{ my: 4 }} />
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    ...headingStyles,
                    fontSize: typography.headingSizes.h3,
                    mb: 3
                  }}
                >
                  Layout Features
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Chip label={`Hero: ${layout.heroStyle}`} sx={{ mb: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Chip label={`Menu: ${layout.menuStyle}`} sx={{ mb: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Chip label={`About: ${layout.aboutStyle}`} sx={{ mb: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Chip label={`Nav: ${layout.navigationStyle}`} sx={{ mb: 1 }} />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ bgcolor: colors.surface, px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close Preview
        </Button>
        {onApply && (
          <Button
            onClick={onApply}
            variant="contained"
            sx={{
              bgcolor: colors.primary,
              color: colors.secondary,
              '&:hover': {
                bgcolor: colors.accent
              }
            }}
            startIcon={<CheckCircle />}
          >
            Apply Template
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TemplatePreview;

