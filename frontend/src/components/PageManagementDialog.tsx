import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Chip,
  Box,
  Divider,
  Alert
} from '@mui/material';
import { useSnackbar } from '../context/SnackbarContext';
import { 
  Page, 
  CreatePageRequest, 
  UpdatePageRequest, 
  pageService, 
  PAGE_TEMPLATES, 
  PAGE_TEMPLATE_LABELS 
} from '../services/pageService';

interface PageManagementDialogProps {
  open: boolean;
  onClose: () => void;
  page?: Page | null;
  onSave: (page: Page) => void;
}

interface FormData {
  name: string;
  slug: string;
  title: string;
  description: string;
  template: string;
  isActive: boolean;
  metaTitle: string;
  metaKeywords: string;
}

const PageManagementDialog: React.FC<PageManagementDialogProps> = ({
  open,
  onClose,
  page,
  onSave
}) => {
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [slugManual, setSlugManual] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    title: '',
    description: '',
    template: PAGE_TEMPLATES.DEFAULT,
    isActive: true,
    metaTitle: '',
    metaKeywords: ''
  });

  const isEditing = !!page;

  // Initialize form data when dialog opens
  useEffect(() => {
    if (open) {
      if (page) {
        setFormData({
          name: page.name,
          slug: page.slug,
          title: page.title || '',
          description: page.description || '',
          template: page.template,
          isActive: page.isActive,
          metaTitle: page.metaTitle || '',
          metaKeywords: page.metaKeywords || ''
        });
        setSlugManual(true); // Don't auto-generate when editing
      } else {
        setFormData({
          name: '',
          slug: '',
          title: '',
          description: '',
          template: PAGE_TEMPLATES.DEFAULT,
          isActive: true,
          metaTitle: '',
          metaKeywords: ''
        });
        setSlugManual(false);
      }
    }
  }, [open, page]);

  // Auto-generate slug from name if not manually set
  useEffect(() => {
    if (!slugManual && formData.name) {
      setFormData(prev => ({
        ...prev,
        slug: pageService.generateSlug(formData.name)
      }));
    }
  }, [formData.name, slugManual]);

  const handleStringChange = (field: 'name' | 'slug' | 'title' | 'description' | 'template' | 'metaTitle' | 'metaKeywords', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark slug as manual if user edits it
    if (field === 'slug') {
      setSlugManual(true);
    }
  };

  const handleBooleanChange = (field: 'isActive', value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showSnackbar('Page name is required', 'error');
      return;
    }

    if (!formData.slug.trim()) {
      showSnackbar('Page slug is required', 'error');
      return;
    }

    try {
      setLoading(true);

      let savedPage: Page;
      
      if (isEditing && page) {
        const updateData: UpdatePageRequest = {
          name: formData.name,
          slug: formData.slug,
          title: formData.title || undefined,
          description: formData.description || undefined,
          template: formData.template,
          isActive: formData.isActive,
          metaTitle: formData.metaTitle || undefined,
          metaKeywords: formData.metaKeywords || undefined
        };
        savedPage = await pageService.updatePage(page.id, updateData);
        showSnackbar('Page updated successfully', 'success');
      } else {
        const createData: CreatePageRequest = {
          name: formData.name,
          slug: formData.slug,
          title: formData.title || undefined,
          description: formData.description || undefined,
          template: formData.template,
          isActive: formData.isActive,
          metaTitle: formData.metaTitle || undefined,
          metaKeywords: formData.metaKeywords || undefined
        };
        savedPage = await pageService.createPage(createData);
        showSnackbar('Page created successfully', 'success');
      }

      onSave(savedPage);
      onClose();
    } catch (error: any) {
      console.error('Error saving page:', error);
      showSnackbar(error.response?.data?.error || 'Failed to save page', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditing ? 'Edit Page' : 'Create New Page'}
        {page?.isSystem && (
          <Chip
            label="System Page"
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Page Name"
              value={formData.name}
              onChange={(e) => handleStringChange('name', e.target.value)}
              helperText="Display name for the page"
              disabled={loading}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL Slug"
              value={formData.slug}
              onChange={(e) => handleStringChange('slug', e.target.value)}
              helperText="URL path (e.g., 'gallery' for /gallery)"
              disabled={loading || (page?.isSystem && page.slug)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Template</InputLabel>
              <Select
                value={formData.template}
                onChange={(e) => handleStringChange('template', e.target.value)}
                disabled={loading}
              >
                {Object.entries(PAGE_TEMPLATE_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleBooleanChange('isActive', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Active"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Page Title"
              value={formData.title}
              onChange={(e) => handleStringChange('title', e.target.value)}
              helperText="Optional title (defaults to page name)"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Page Description"
              value={formData.description}
              onChange={(e) => handleStringChange('description', e.target.value)}
              helperText="Brief description of the page content"
              disabled={loading}
            />
          </Grid>

          {/* SEO Settings */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>SEO Settings</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meta Title"
              value={formData.metaTitle}
              onChange={(e) => handleStringChange('metaTitle', e.target.value)}
              helperText="SEO title for search engines (defaults to page name)"
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Meta Keywords"
              value={formData.metaKeywords}
              onChange={(e) => handleStringChange('metaKeywords', e.target.value)}
              helperText="SEO keywords separated by commas"
              disabled={loading}
            />
          </Grid>

          {/* Preview */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Preview</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                backgroundColor: 'grey.50'
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                {formData.title || formData.name || 'Page Name'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                URL: /{formData.slug || 'page-slug'}
              </Typography>
              <Typography variant="body2">
                {formData.description || 'Page description will appear here'}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={PAGE_TEMPLATE_LABELS[formData.template as keyof typeof PAGE_TEMPLATE_LABELS]}
                  size="small"
                  variant="outlined"
                />
                {!formData.isActive && (
                  <Chip
                    label="Inactive"
                    size="small"
                    color="warning"
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
            </Box>
          </Grid>

          {page?.isSystem && (
            <Grid item xs={12}>
              <Alert severity="info">
                This is a system page. You can customize its content and settings, but it cannot be deleted.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Saving...' : (isEditing ? 'Update Page' : 'Create Page')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PageManagementDialog; 