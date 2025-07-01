import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  Stack,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  DragIndicator as DragIcon,
  ViewHeadline as TextIcon,
  Image as ImageIcon,
  SmartButton as ButtonIcon,
  ContactMail as ContactIcon,
  Schedule as HoursIcon,
  PhotoLibrary as GalleryIcon,
  Star as FeaturesIcon,
  Campaign as CTAIcon,
  Map as MapIcon,
  Restaurant as MenuIcon,
  Article as HeroIcon,
  PlayCircleOutlined,
  Share,
  ReceiptLong,
  Email,
  EventSeat,
  Star
} from '@mui/icons-material';
// Content block types with their metadata and visual information
const CONTENT_BLOCK_TYPES: Record<string, BlockType[]> = {
  // Layout blocks
  layout: [
    {
      id: 'hero',
      name: 'Hero Section',
      description: 'Large banner with image, title, and call-to-action',
      icon: <HeroIcon />,
      color: '#1976d2',
      preview: 'Hero with image background and prominent CTA button'
    },
    {
      id: 'features',
      name: 'Features Grid',
      description: 'Showcase key features or services in a grid layout',
      icon: <FeaturesIcon />,
      color: '#7b1fa2',
      preview: 'Three-column feature grid with icons'
    },
    {
      id: 'spacer',
      name: 'Spacer/Divider',
      description: 'Add spacing or visual dividers between sections',
      icon: <DragIcon />,
      color: '#757575',
      preview: 'Spacing control with optional divider line'
    }
  ],
  // Content blocks
  content: [
    {
      id: 'text',
      name: 'Text Block',
      description: 'Rich text content with formatting options',
      icon: <TextIcon />,
      color: '#388e3c',
      preview: 'Formatted text with headings and paragraphs'
    },
    {
      id: 'about',
      name: 'About Section',
      description: 'Rich content section with title and optional image',
      icon: <TextIcon />,
      color: '#2e7d32',
      preview: 'About section with image and description'
    },
    {
      id: 'contact',
      name: 'Contact Info',
      description: 'Display contact information and hours',
      icon: <ContactIcon />,
      color: '#f57c00',
      preview: 'Contact details with phone, email, and address'
    },
    {
      id: 'hours',
      name: 'Opening Hours',
      description: 'Business hours display',
      icon: <HoursIcon />,
      color: '#5d4037',
      preview: 'Weekly schedule with opening times'
    },
    {
      id: 'testimonials',
      name: 'Customer Testimonials',
      description: 'Display customer reviews and testimonials',
      icon: <Star />,
      color: '#ff6f00',
      preview: 'Customer reviews with ratings and photos'
    }
  ],
  // Media blocks
  media: [
    {
      id: 'image',
      name: 'Image Block',
      description: 'Single image with optional caption',
      icon: <ImageIcon />,
      color: '#0097a7',
      preview: 'Large image with caption below'
    },
    {
      id: 'gallery',
      name: 'Photo Gallery',
      description: 'Multiple images in a grid layout',
      icon: <GalleryIcon />,
      color: '#00695c',
      preview: 'Grid of photos with lightbox viewing'
    },
    {
      id: 'video',
      name: 'Video Block',
      description: 'Embed videos from YouTube, Vimeo, or upload directly',
      icon: <PlayCircleOutlined />,
      color: '#d32f2f',
      preview: 'Responsive video player with controls'
    },
    {
      id: 'social_feed',
      name: 'Social Media Feed',
      description: 'Display Instagram or Facebook posts',
      icon: <Share />,
      color: '#e91e63',
      preview: 'Live social media posts in grid layout'
    }
  ],
  // Interactive blocks
  interactive: [
    {
      id: 'button',
      name: 'Button',
      description: 'Call-to-action button with custom styling',
      icon: <ButtonIcon />,
      color: '#d32f2f',
      preview: 'Styled button with hover effects'
    },
    {
      id: 'cta',
      name: 'Call-to-Action',
      description: 'Prominent section to drive user action',
      icon: <CTAIcon />,
      color: '#c2185b',
      preview: 'Eye-catching CTA with background and button'
    },
    {
      id: 'menu_display',
      name: 'Menu Display',
      description: 'Dynamic restaurant menu with categories and items',
      icon: <MenuIcon />,
      color: '#689f38',
      preview: 'Menu items with prices and descriptions'
    },
    {
      id: 'pricing_menu',
      name: 'Pricing Menu',
      description: 'Display services or items with pricing',
      icon: <ReceiptLong />,
      color: '#5e35b1',
      preview: 'Pricing table with sortable items'
    },
    {
      id: 'map_location',
      name: 'Location Map',
      description: 'Interactive map showing business location',
      icon: <MapIcon />,
      color: '#303f9f',
      preview: 'Interactive map with location marker'
    },
    {
      id: 'newsletter',
      name: 'Newsletter Signup',
      description: 'Email capture form with marketing consent',
      icon: <Email />,
      color: '#1565c0',
      preview: 'Email signup form with privacy compliance'
    },
    {
      id: 'reservation_widget',
      name: 'Reservation Widget',
      description: 'Embedded table booking form',
      icon: <EventSeat />,
      color: '#8d6e63',
      preview: 'Table booking form with availability'
    }
  ]
};

const CATEGORY_LABELS: Record<string, string> = {
  layout: 'Layout',
  content: 'Content',
  media: 'Media',
  interactive: 'Interactive'
};

interface BlockType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  color: string;
  preview: string;
}

interface DraggableBlockCardProps {
  block: BlockType;
  category: string;
}

const DraggableBlockCard: React.FC<DraggableBlockCardProps> = ({ block, category }) => {
  const [isDragging, setIsDragging] = useState(false);

  // Enhanced drag functionality with data transfer
  const handleDragStart = (event: React.DragEvent) => {
    setIsDragging(true);
    // Set the block type as drag data for the drop zone to receive
    event.dataTransfer.setData('text/plain', block.id);
    event.dataTransfer.setData('application/json', JSON.stringify({
      blockType: block.id,
      category: category,
      name: block.name
    }));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <Card 
      sx={{ 
        mb: 0.5,
        cursor: 'grab',
        opacity: isDragging ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 2,
          transform: 'translateY(-1px)'
        },
        '&:active': {
          cursor: 'grabbing'
        }
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DragIcon sx={{ color: 'grey.400', fontSize: '1.2rem' }} />
          
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: block.color,
              fontSize: '1rem'
            }}
          >
            {React.cloneElement(block.icon, { fontSize: 'small' })}
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                fontSize: '0.875rem',
                lineHeight: 1.2,
                mb: 0.5
              }}
            >
              {block.name}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.75rem',
                lineHeight: 1.2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {block.description}
            </Typography>
          </Box>
          
          <Chip 
            label={category} 
            size="small" 
            sx={{ 
              fontSize: '0.65rem',
              height: 20,
              bgcolor: `${block.color}20`,
              color: block.color,
              fontWeight: 500
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`block-palette-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface VisualBlockPaletteProps {
  onBlockDrop?: (blockType: string, category: string) => void;
}

const VisualBlockPalette: React.FC<VisualBlockPaletteProps> = ({ onBlockDrop }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = Object.keys(CONTENT_BLOCK_TYPES);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter blocks based on search term
  const getFilteredBlocks = (categoryBlocks: any[]) => {
    if (!searchTerm) return categoryBlocks;
    return categoryBlocks.filter(block => 
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <Paper sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Header */}
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Content Blocks
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
          Drag blocks to your page to build content
        </Typography>
        
        {/* Compact Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search blocks..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              fontSize: '0.875rem',
              height: 36
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Compact Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minWidth: 'auto',
              fontSize: '0.75rem',
              minHeight: 36,
              py: 1
            }
          }}
        >
          {categories.map((category, index) => (
            <Tab 
              key={category} 
              label={CATEGORY_LABELS[category]} 
              id={`block-palette-tab-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {/* Compact Block Lists */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {categories.map((category, index) => (
          <TabPanel key={category} value={activeTab} index={index}>
            <Box sx={{ px: 1.5, pb: 1.5 }}>
              {getFilteredBlocks(CONTENT_BLOCK_TYPES[category]).length === 0 ? (
                <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ py: 3, display: 'block' }}>
                  {searchTerm ? 'No blocks found matching your search.' : 'No blocks in this category.'}
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {getFilteredBlocks(CONTENT_BLOCK_TYPES[category]).map((block) => (
                    <DraggableBlockCard
                      key={block.id}
                      block={block}
                      category={category}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </TabPanel>
        ))}
      </Box>

      {/* Compact Footer tip */}
      <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          💡 Drag blocks to canvas • Click to expand details
        </Typography>
      </Box>
    </Paper>
  );
};

export default VisualBlockPalette; 