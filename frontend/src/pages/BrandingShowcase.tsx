// BrandingShowcase.tsx - Demo page for KitchenSync branding
import React from 'react';
import { KitchenSyncLogo } from '../components/common/KitchenSyncLogo';
import { Box, Typography, Container, Paper } from '@mui/material';

const BrandingShowcase: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" className="text-gray-900 font-bold mb-8 text-center">
        KitchenSync Brand Identity Guide
      </Typography>

      {/* Light Background Variants */}
      <Paper className="p-8 mb-6 bg-white shadow-xl rounded-2xl">
        <Typography variant="h5" className="text-gray-900 font-semibold mb-6">
          Light Background Variants
        </Typography>
        
        <Box className="space-y-8">
          {/* XLarge Dark */}
          <Box>
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wider mb-2 block">
              XLarge - Dark (Hero/Landing Pages) - Circular logo 15% larger
            </Typography>
            <KitchenSyncLogo size="xlarge" variant="dark" showIcon />
          </Box>

          {/* Large Dark */}
          <Box>
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wider mb-2 block">
              Large - Dark (Page Headers)
            </Typography>
            <KitchenSyncLogo size="large" variant="dark" showIcon />
          </Box>

          {/* Medium Dark */}
          <Box>
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wider mb-2 block">
              Medium - Dark (Navigation, Cards)
            </Typography>
            <KitchenSyncLogo size="medium" variant="dark" />
          </Box>

          {/* Small Dark */}
          <Box>
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wider mb-2 block">
              Small - Dark (Buttons, Compact Spaces)
            </Typography>
            <KitchenSyncLogo size="small" variant="dark" />
          </Box>

          {/* Gradient Variant */}
          <Box>
            <Typography variant="caption" className="text-gray-500 uppercase tracking-wider mb-2 block">
              Gradient (Special Emphasis)
            </Typography>
            <KitchenSyncLogo size="large" variant="gradient" showIcon />
          </Box>
        </Box>
      </Paper>

      {/* Dark Background Variants */}
      <Paper 
        className="p-8 mb-6 shadow-xl rounded-2xl"
        sx={{ 
          background: 'linear-gradient(135deg, #1f2937 0%, #1e40af 50%, #7c3aed 100%)'
        }}
      >
        <Typography variant="h5" className="text-white font-semibold mb-6">
          Dark Background Variants
        </Typography>
        
        <Box className="space-y-8">
          {/* XLarge Light */}
          <Box>
            <Typography variant="caption" className="text-blue-200 uppercase tracking-wider mb-2 block">
              XLarge - Light (Login/Hero on Dark)
            </Typography>
            <KitchenSyncLogo size="xlarge" variant="light" showIcon />
          </Box>

          {/* Large Light */}
          <Box>
            <Typography variant="caption" className="text-blue-200 uppercase tracking-wider mb-2 block">
              Large - Light (Headers on Dark)
            </Typography>
            <KitchenSyncLogo size="large" variant="light" />
          </Box>

          {/* Medium Light */}
          <Box>
            <Typography variant="caption" className="text-blue-200 uppercase tracking-wider mb-2 block">
              Medium - Light (Sidebar, Navigation on Dark)
            </Typography>
            <KitchenSyncLogo size="medium" variant="light" />
          </Box>
        </Box>
      </Paper>

      {/* Usage Guidelines */}
      <Paper className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl rounded-2xl">
        <Typography variant="h5" className="text-gray-900 font-semibold mb-4">
          Usage Guidelines
        </Typography>
        
        <Box className="space-y-4">
          <Box>
            <Typography variant="subtitle2" className="text-gray-900 font-semibold mb-1">
              🎯 Primary Wordmark
            </Typography>
            <Typography variant="body2" className="text-gray-700">
              The rotated "K" represents a table, symbolizing KitchenSync's focus on restaurant operations. 
              Use the wordmark consistently across all platforms and materials.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" className="text-gray-900 font-semibold mb-1">
              📐 Size Guidelines
            </Typography>
            <Typography variant="body2" className="text-gray-700">
              • <strong>XLarge</strong>: Login pages, landing pages, hero sections<br/>
              • <strong>Large</strong>: Page headers, marketing materials<br/>
              • <strong>Medium</strong>: Navigation bars, sidebars, cards<br/>
              • <strong>Small</strong>: Buttons, compact UI elements, mobile views
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" className="text-gray-900 font-semibold mb-1">
              🎨 Color Variants
            </Typography>
            <Typography variant="body2" className="text-gray-700">
              • <strong>Light</strong>: Use on dark backgrounds (navigation, login)<br/>
              • <strong>Dark</strong>: Use on light backgrounds (pages, cards)<br/>
              • <strong>Gradient</strong>: Special emphasis, premium features, CTAs
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" className="text-gray-900 font-semibold mb-1">
              🖼️ Icon Usage
            </Typography>
            <Typography variant="body2" className="text-gray-700">
              The table icon can be shown alongside the wordmark for extra branding impact in 
              hero sections and landing pages. Omit in compact spaces like navigation bars.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BrandingShowcase;

