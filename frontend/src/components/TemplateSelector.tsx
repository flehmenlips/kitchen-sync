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
  Alert
} from '@mui/material';
import { Star, Lock } from '@mui/icons-material';
import { templateService, WebsiteTemplate } from '../services/templateService';
import { useSnackbar } from '../context/SnackbarContext';

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onTemplateApplied: () => void;
  currentTemplate?: string;
  isPremiumUser?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onClose,
  onTemplateApplied,
  currentTemplate,
  isPremiumUser = false
}) => {
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WebsiteTemplate | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getActiveTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      showSnackbar('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setApplying(true);
      await templateService.applyTemplate(selectedTemplate.id);
      showSnackbar('Template applied successfully!', 'success');
      onTemplateApplied();
      onClose();
    } catch (error) {
      console.error('Error applying template:', error);
      showSnackbar('Failed to apply template', 'error');
    } finally {
      setApplying(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium':
        return 'secondary';
      case 'modern':
        return 'primary';
      case 'classic':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Choose a Website Template
        <Typography variant="body2" color="text.secondary">
          Select a template to customize the look and feel of your website
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {templates.map((template) => {
              const isLocked = template.isPremium && !isPremiumUser;
              const isCurrent = template.name === currentTemplate;
              
              return (
                <Grid item xs={12} md={6} lg={4} key={template.id}>
                  <Card
                    sx={{
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      opacity: isLocked ? 0.7 : 1,
                      border: selectedTemplate?.id === template.id ? 2 : 0,
                      borderColor: 'primary.main',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: !isLocked ? 'translateY(-4px)' : 'none',
                        boxShadow: !isLocked ? 4 : 1
                      }
                    }}
                    onClick={() => !isLocked && setSelectedTemplate(template)}
                  >
                    {template.thumbnail && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={template.thumbnail}
                        alt={template.displayName}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Typography variant="h6" gutterBottom>
                          {template.displayName}
                        </Typography>
                        {isLocked && <Lock fontSize="small" color="action" />}
                      </Box>
                      
                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={template.category}
                          size="small"
                          color={getCategoryColor(template.category)}
                        />
                        {template.isPremium && (
                          <Chip
                            icon={<Star fontSize="small" />}
                            label="Premium"
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        {isCurrent && (
                          <Chip
                            label="Current"
                            size="small"
                            color="success"
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {template.description}
                      </Typography>
                      
                      {template.features && template.features.length > 0 && (
                        <Box mt={2}>
                          <Typography variant="caption" color="text.secondary">
                            Features:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                            {template.features.slice(0, 3).map((feature, index) => (
                              <Chip
                                key={index}
                                label={feature.replace(/-/g, ' ')}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                            {template.features.length > 3 && (
                              <Typography variant="caption" color="text.secondary">
                                +{template.features.length - 3} more
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
        
        {selectedTemplate && selectedTemplate.isPremium && !isPremiumUser && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This is a premium template. Upgrade your subscription to use premium templates.
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleApplyTemplate}
          variant="contained"
          disabled={!selectedTemplate || applying || (selectedTemplate?.isPremium && !isPremiumUser)}
        >
          {applying ? 'Applying...' : 'Apply Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateSelector; 