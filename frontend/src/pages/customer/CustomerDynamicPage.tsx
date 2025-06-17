import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Skeleton,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { unifiedContentService, UnifiedRestaurantContent } from '../../services/unifiedContentService';
import { pageService, Page } from '../../services/pageService';
import { getCurrentRestaurantSlug } from '../../utils/subdomain';

const CustomerDynamicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<UnifiedRestaurantContent | null>(null);
  const [pageData, setPageData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      console.log('[CustomerDynamicPage] Fetching page for slug:', slug);
      console.log('[CustomerDynamicPage] Current URL:', window.location.href);
      console.log('[CustomerDynamicPage] URL search params:', window.location.search);
      
      // Get restaurant slug from current context
      const restaurantSlug = getCurrentRestaurantSlug();
      console.log('[CustomerDynamicPage] Restaurant slug:', restaurantSlug);
      
      // Debug subdomain detection
      const params = new URLSearchParams(window.location.search);
      const restaurantParam = params.get('restaurant');
      console.log('[CustomerDynamicPage] Restaurant query param:', restaurantParam);
      
      // TEMPORARY: Use restaurant param as fallback
      const finalRestaurantSlug = restaurantSlug || restaurantParam;
      console.log('[CustomerDynamicPage] Final restaurant slug:', finalRestaurantSlug);
      
      if (!finalRestaurantSlug || !slug) {
        console.error('[CustomerDynamicPage] Missing restaurant slug or page slug', {
          restaurantSlug,
          finalRestaurantSlug,
          restaurantParam,
          slug,
          url: window.location.href,
          params: window.location.search
        });
        setLoading(false);
        return;
      }

      // Fetch the page directly using the public API
      const pageResponse = await pageService.getPublicPageBySlug(finalRestaurantSlug, slug);
      console.log('[CustomerDynamicPage] Fetched page data:', pageResponse);
      setPageData(pageResponse);
      
      // Also get unified content for context (optional - fallback if page fetch fails)
      try {
        const unifiedContent = await unifiedContentService.getUnifiedContent('home');
        console.log('[CustomerDynamicPage] Fetched unified content for context:', unifiedContent);
        setContent(unifiedContent);
      } catch (contextError) {
        console.warn('[CustomerDynamicPage] Failed to fetch unified content context:', contextError);
      }
      
    } catch (error) {
      console.error('[CustomerDynamicPage] Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Skeleton variant="text" height={60} width="60%" />
        <Skeleton variant="text" height={30} width="80%" />
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="rectangular" height={200} />
        </Box>
      </Container>
    );
  }

  if (!pageData) {
    return (
      <Container maxWidth="lg" sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1">
          The requested page "{slug}" could not be found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {pageData.title || pageData.name}
        </Typography>
        {pageData.template && pageData.template !== 'default' && (
          <Chip label={`Template: ${pageData.template}`} size="small" sx={{ mb: 2 }} />
        )}
      </Box>
      
      {pageData.description && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              {pageData.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Future: This is where page content blocks would be rendered */}
      <Box sx={{ mt: 4, p: 3, backgroundColor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Page Content
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This page is live and accessible via: /{pageData.slug}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Content blocks and advanced page content will be available in future updates.
        </Typography>
      </Box>
    </Container>
  );
};

export default CustomerDynamicPage; 