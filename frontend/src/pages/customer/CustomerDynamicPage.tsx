import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { unifiedContentService, UnifiedRestaurantContent } from '../../services/unifiedContentService';

const CustomerDynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<UnifiedRestaurantContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPageData();
  }, [slug]);

  const fetchPageData = async () => {
    if (!slug) {
      setError('Page not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[CustomerDynamicPage] Fetching data for slug:', slug);
      const unifiedContent = await unifiedContentService.getUnifiedContent(slug);
      console.log('[CustomerDynamicPage] Received unified content:', unifiedContent);
      
      // Check if page has any content blocks
      if (!unifiedContent.contentBlocks || unifiedContent.contentBlocks.length === 0) {
        console.log('[CustomerDynamicPage] No content blocks found:', unifiedContent.contentBlocks);
        setError('Page not found or has no content');
        setLoading(false);
        return;
      }
      
      console.log('[CustomerDynamicPage] Content blocks found:', unifiedContent.contentBlocks.length);
      setContent(unifiedContent);
    } catch (error) {
      console.error('[CustomerDynamicPage] Error fetching page content:', error);
      setError('Failed to load page content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
          </Alert>
        </Box>
      </Container>
    );
  }

  if (!content) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h6" color="text.secondary">
            Page not found
          </Typography>
        </Box>
      </Container>
    );
  }

  console.log('[CustomerDynamicPage] Rendering with content:', content);
  console.log('[CustomerDynamicPage] Content blocks to render:', content?.contentBlocks);

  return (
    <Box>
      {/* Dynamic Content Blocks */}
      {content.contentBlocks && content.contentBlocks.map((block) => (
        <Box key={block.id} sx={{ mb: 4 }}>
          {block.blockType === 'text' && (
            <Container maxWidth="lg" sx={{ py: 4 }}>
              {block.title && (
                <Typography variant="h4" component="h2" gutterBottom align="center">
                  {block.title}
                </Typography>
              )}
              {block.subtitle && (
                <Typography variant="h6" color="text.secondary" gutterBottom align="center">
                  {block.subtitle}
                </Typography>
              )}
              {block.content && (
                <Typography variant="body1" paragraph>
                  {block.content}
                </Typography>
              )}
            </Container>
          )}
          
          {block.blockType === 'image' && (
            <Container maxWidth="lg" sx={{ py: 4 }}>
              {block.title && (
                <Typography variant="h4" component="h2" gutterBottom align="center">
                  {block.title}
                </Typography>
              )}
              {block.imageUrl && (
                <Box display="flex" justifyContent="center">
                  <img
                    src={block.imageUrl}
                    alt={block.title || 'Image'}
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                  />
                </Box>
              )}
            </Container>
          )}
          
          {block.blockType === 'hero' && (
            <Box
              sx={{
                position: 'relative',
                height: '500px',
                backgroundImage: block.imageUrl ? `url(${block.imageUrl})` : 'linear-gradient(to right, #1976d2, #42a5f5)',
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
                    {block.title}
                  </Typography>
                )}
                {block.subtitle && (
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      mb: 3,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}
                  >
                    {block.subtitle}
                  </Typography>
                )}
                {block.content && (
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      mb: 4,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      maxWidth: '600px'
                    }}
                  >
                    {block.content}
                  </Typography>
                )}
                {block.buttonText && block.buttonLink && (
                  <Button
                    component="a"
                    href={block.buttonLink.startsWith('http') ? block.buttonLink : `https://${block.buttonLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
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
                    {block.buttonText}
                  </Button>
                )}
              </Container>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default CustomerDynamicPage; 