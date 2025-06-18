import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Star,
  Lock,
  Search,
  FilterList,
  Preview,
  Palette,
  AutoAwesome,
  Category,
  Close,
  CheckCircle,
  Visibility,
  PlayArrow
} from '@mui/icons-material';
import {
  restaurantTemplateService,
  RestaurantTemplate,
  TemplateCategory,
  TemplateRecommendation
} from '../services/restaurantTemplateService';
import { useSnackbar } from '../context/SnackbarContext';
import { useRestaurant } from '../context/RestaurantContext';

interface RestaurantTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onTemplateApplied: () => void;
  currentTemplate?: string;
}

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
      id={`template-tabpanel-${index}`}
      aria-labelledby={`template-tab-${index}`}
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

const RestaurantTemplateSelector: React.FC<RestaurantTemplateSelectorProps> = ({
  open,
  onClose,
  onTemplateApplied,
  currentTemplate
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState<RestaurantTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [recommendations, setRecommendations] = useState<TemplateRecommendation | null>(null);
  const [filteredTemplates, setFilteredTemplates] = useState<RestaurantTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RestaurantTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<RestaurantTemplate | null>(null);
  
  const { showSnackbar } = useSnackbar();
  const { currentRestaurant } = useRestaurant();

  useEffect(() => {
    if (open) {
      fetchTemplateData();
    }
  }, [open]);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, showPremiumOnly]);

  const fetchTemplateData = async () => {
    try {
      setLoading(true);
      
      // Fetch templates, categories, and recommendations in parallel
      const [templatesData, categoriesData, recommendationsData] = await Promise.all([
        restaurantTemplateService.getActiveTemplates(),
        restaurantTemplateService.getTemplateCategories(),
        restaurantTemplateService.getRecommendedTemplates().catch(() => null)
      ]);

      setTemplates(templatesData);
      setCategories(categoriesData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error fetching template data:', error);
      showSnackbar('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.features.some(feature => 
          restaurantTemplateService.getFeatureDisplayName(feature)
            .toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by premium status
    if (showPremiumOnly) {
      filtered = filtered.filter(template => template.isPremium);
    }

    setFilteredTemplates(filtered);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setApplying(true);
      await restaurantTemplateService.applyTemplate(selectedTemplate.id);
      showSnackbar(`${selectedTemplate.name} template applied successfully!`, 'success');
      onTemplateApplied();
      onClose();
    } catch (error) {
      console.error('Error applying template:', error);
      showSnackbar('Failed to apply template', 'error');
    } finally {
      setApplying(false);
    }
  };

  const handlePreviewTemplate = async (template: RestaurantTemplate) => {
    try {
      const previewData = await restaurantTemplateService.previewTemplate(template.id);
      window.open(previewData.previewUrl, '_blank');
    } catch (error) {
      console.error('Error generating preview:', error);
      showSnackbar('Failed to generate preview', 'error');
    }
  };

  const isTemplateAvailable = (template: RestaurantTemplate): boolean => {
    if (!recommendations) return true;
    return restaurantTemplateService.isTemplateAvailable(template, recommendations.planName);
  };

  const getTemplatePreviewImage = (template: RestaurantTemplate): string => {
    // Generate preview image URLs based on template category and style
    const categoryImages: Record<string, string> = {
      'fine-dining': '/template-previews/fine-dining-preview.jpg',
      'casual-dining': '/template-previews/casual-dining-preview.jpg',
      'cafe': '/template-previews/cafe-preview.jpg',
      'ethnic': '/template-previews/ethnic-preview.jpg',
      'fast-casual': '/template-previews/fast-casual-preview.jpg',
      'bakery': '/template-previews/bakery-preview.jpg',
      'bar': '/template-previews/bar-preview.jpg',
      'premium': '/template-previews/premium-preview.jpg',
      'sustainable': '/template-previews/sustainable-preview.jpg',
      'world-cuisine': '/template-previews/world-cuisine-preview.jpg'
    };
    
    return template.previewUrl || categoryImages[template.category] || '/template-previews/default-preview.jpg';
  };

  const renderTemplateCard = (template: RestaurantTemplate) => {
    const isLocked = !isTemplateAvailable(template);
    const isCurrent = template.id === currentTemplate;
    const isSelected = selectedTemplate?.id === template.id;

    return (
      <Grid item xs={12} sm={6} lg={4} key={template.id}>
        <Card
          sx={{
            cursor: isLocked ? 'not-allowed' : 'pointer',
            opacity: isLocked ? 0.7 : 1,
            border: isSelected ? 2 : 0,
            borderColor: 'primary.main',
            transition: 'all 0.3s ease',
            position: 'relative',
            '&:hover': {
              transform: !isLocked ? 'translateY(-4px)' : 'none',
              boxShadow: !isLocked ? 6 : 1
            }
          }}
          onClick={() => !isLocked && setSelectedTemplate(template)}
        >
          {/* Template Preview Image */}
          <CardMedia
            component="img"
            height="200"
            image={getTemplatePreviewImage(template)}
            alt={template.name}
            sx={{ objectFit: 'cover' }}
          />

          {/* Premium Badge */}
          {template.isPremium && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1
              }}
            >
              <Chip
                icon={<Star fontSize="small" />}
                label="Premium"
                size="small"
                color="secondary"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          )}

          {/* Lock Overlay */}
          {isLocked && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2
              }}
            >
              <Lock sx={{ fontSize: 48, color: 'white' }} />
            </Box>
          )}

          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
              <Typography variant="h6" gutterBottom>
                {template.name}
              </Typography>
              {isCurrent && (
                <Chip
                  icon={<CheckCircle fontSize="small" />}
                  label="Current"
                  size="small"
                  color="success"
                />
              )}
            </Box>

            {/* Category and Features */}
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
              <Chip
                label={restaurantTemplateService.getCategoryDisplayName(template.category)}
                size="small"
                color={restaurantTemplateService.getCategoryColor(template.category)}
              />
              {template.features.slice(0, 2).map((feature, index) => (
                <Chip
                  key={index}
                  label={restaurantTemplateService.getFeatureDisplayName(feature)}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
              {template.features.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{template.features.length - 2} more
                </Typography>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary" mb={2}>
              {template.description}
            </Typography>

            {/* Action Buttons */}
            <Box display="flex" gap={1} justifyContent="space-between">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Visibility />}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewTemplate(template);
                }}
                disabled={isLocked}
              >
                Preview
              </Button>
              
              {!isCurrent && (
                <Button
                  variant={isSelected ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={isSelected ? <CheckCircle /> : <PlayArrow />}
                  disabled={isLocked}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" component="div">
              Restaurant Templates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose from 15+ professional restaurant website templates
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Template Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab
              icon={<AutoAwesome />}
              label={
                <Badge badgeContent={recommendations?.recommended.length || 0} color="primary">
                  Recommended
                </Badge>
              }
            />
            <Tab icon={<Category />} label="All Templates" />
            <Tab icon={<Star />} label="Premium" />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Recommended Templates Tab */}
            <TabPanel value={activeTab} index={0}>
              <Box sx={{ px: 3, pb: 3 }}>
                {recommendations && (
                  <>
                    <Alert 
                      severity="info" 
                      sx={{ mb: 3 }}
                      icon={<AutoAwesome />}
                    >
                      <Typography variant="body1" fontWeight="medium">
                        Recommended for {recommendations.planName} Plan
                      </Typography>
                      <Typography variant="body2">
                        These templates are carefully selected based on your subscription plan 
                        and restaurant type. {recommendations.availableCount} of {recommendations.totalCount} templates available.
                      </Typography>
                    </Alert>
                    
                    <Grid container spacing={3}>
                      {recommendations.recommended.map(renderTemplateCard)}
                    </Grid>
                  </>
                )}
              </Box>
            </TabPanel>

            {/* All Templates Tab */}
            <TabPanel value={activeTab} index={1}>
              <Box sx={{ px: 3, pb: 3 }}>
                {/* Search and Filter Controls */}
                <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                  <TextField
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 250 }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      label="Category"
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant={showPremiumOnly ? 'contained' : 'outlined'}
                    startIcon={<Star />}
                    onClick={() => setShowPremiumOnly(!showPremiumOnly)}
                    size="small"
                  >
                    Premium Only
                  </Button>
                </Box>

                {/* Template Grid */}
                <Grid container spacing={3}>
                  {filteredTemplates.map(renderTemplateCard)}
                </Grid>

                {filteredTemplates.length === 0 && (
                  <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No templates found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search or filter criteria
                    </Typography>
                  </Box>
                )}
              </Box>
            </TabPanel>

            {/* Premium Templates Tab */}
            <TabPanel value={activeTab} index={2}>
              <Box sx={{ px: 3, pb: 3 }}>
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight="medium">
                    Premium Templates
                  </Typography>
                  <Typography variant="body2">
                    Premium templates are available with Professional and Enterprise plans. 
                    Upgrade your subscription to access advanced designs and features.
                  </Typography>
                </Alert>
                
                <Grid container spacing={3}>
                  {templates.filter(t => t.isPremium).map(renderTemplateCard)}
                </Grid>
              </Box>
            </TabPanel>
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Box display="flex" alignItems="center" gap={2}>
            {selectedTemplate && (
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Selected: <strong>{selectedTemplate.name}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedTemplate.description}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box display="flex" gap={2}>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            
            {selectedTemplate && (
              <Button
                onClick={handlePreviewTemplate.bind(null, selectedTemplate)}
                variant="outlined"
                startIcon={<Preview />}
              >
                Preview
              </Button>
            )}
            
            <Button
              onClick={handleApplyTemplate}
              variant="contained"
              disabled={!selectedTemplate || applying}
              startIcon={applying ? <CircularProgress size={16} /> : <Palette />}
            >
              {applying ? 'Applying...' : 'Apply Template'}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default RestaurantTemplateSelector; 