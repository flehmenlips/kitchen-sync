import React from 'react';
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
  Paper
} from '@mui/material';
import { ContentBlock, BLOCK_TYPES } from '../../services/contentBlockService';

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
        return (
          <Box
            sx={{
              position: 'relative',
              height: '500px',
              backgroundImage: block.imageUrl ? `url(${safeRender(block.imageUrl)})` : 'linear-gradient(to right, #1976d2, #42a5f5)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
              }
            }}
          >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
              {block.title && (
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {safeRender(block.title)}
                </Typography>
              )}
              {block.subtitle && (
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    mb: 4,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
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
            </Container>
          </Box>
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

      default:
        return null;
    }
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