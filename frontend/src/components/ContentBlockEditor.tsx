import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { WBBlock } from '../services/websiteBuilderService';

interface ContentBlockEditorProps {
  block: WBBlock;
  onSave: (blockData: Partial<WBBlock>) => Promise<void>;
  onDelete: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  setIsEditing?: (editing: boolean) => void;
  dragHandleProps?: any;
}

// Rich text editor modules configuration - Enhanced for professional content editing
const quillModules = {
  toolbar: [
    // Text formatting
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    
    // Text styles
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    
    // Text alignment and direction
    [{ 'align': [] }],
    [{ 'direction': 'rtl' }],
    
    // Lists and indentation
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    
    // Links and media
    ['link', 'image', 'video'],
    
    // Advanced formatting
    ['blockquote', 'code-block'],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    
    // Cleanup
    ['clean']
  ],
  // Enhanced clipboard handling
  clipboard: {
    matchVisual: false,
  },
  // History module for undo/redo
  history: {
    delay: 1000,
    maxStack: 50,
    userOnly: true
  }
};

const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 
  'color', 'background',
  'align', 'direction',
  'list', 'bullet', 'indent',
  'link', 'image', 'video',
  'blockquote', 'code-block',
  'script',
  'clean'
];

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  block,
  onSave,
  onDelete,
  onCancel,
  isEditing = false,
  setIsEditing,
  dragHandleProps
}) => {
  const [editMode, setEditMode] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<Partial<WBBlock>>({
    title: block.title || '',
    subtitle: block.subtitle || '',
    content: block.content || '',
    imageUrl: block.imageUrl || '',
    buttonText: block.buttonText || '',
    buttonLink: block.buttonLink || '',
    buttonStyle: block.buttonStyle || 'primary',
    isActive: block.isActive ?? true,
    settings: block.settings || {}
  });

  useEffect(() => {
    setEditMode(isEditing);
  }, [isEditing]);

  // Auto-save functionality with debouncing
  const triggerAutoSave = useCallback(async (data: Partial<WBBlock>) => {
    if (!editMode || saving) return; // Don't auto-save if not in edit mode or already saving

    try {
      setAutoSaving(true);
      await onSave(data);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't show error for auto-save failures to avoid interrupting user
    } finally {
      setAutoSaving(false);
    }
  }, [editMode, saving, onSave]);

  // Debounced auto-save
  const scheduleAutoSave = useCallback((data: Partial<WBBlock>) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Schedule new auto-save after 3 seconds of inactivity
    autoSaveTimeoutRef.current = setTimeout(() => {
      triggerAutoSave(data);
    }, 3000);
  }, [triggerAutoSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(formData);
      setEditMode(false);
      setIsEditing?.(false);
    } catch (error) {
      console.error('Error saving block:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: block.title || '',
      subtitle: block.subtitle || '',
      content: block.content || '',
      imageUrl: block.imageUrl || '',
      buttonText: block.buttonText || '',
      buttonLink: block.buttonLink || '',
      buttonStyle: block.buttonStyle || 'primary',
      isActive: block.isActive ?? true,
      settings: block.settings || {}
    });
    setEditMode(false);
    setIsEditing?.(false);
    onCancel?.();
  };

  const handleFieldChange = (field: keyof WBBlock, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Trigger auto-save for content changes (but not for settings like isActive)
    if (editMode && ['title', 'subtitle', 'content', 'buttonText', 'buttonLink'].includes(field)) {
      scheduleAutoSave(newFormData);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setUploadingImage(true);
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file');
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image must be smaller than 5MB');
        }
        
        // Upload image using the existing restaurantSettingsService
        // For content blocks, we'll use a generic 'content' field
        const result = await fetch('/api/restaurant/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: (() => {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('field', 'content'); // Generic field for content blocks
            return formData;
          })(),
        });
        
        if (!result.ok) {
          throw new Error('Failed to upload image');
        }
        
        const data = await result.json();
        
        // Update the form data with the uploaded image URL
        handleFieldChange('imageUrl', data.imageUrl);
        
        console.log('Image uploaded successfully:', data.imageUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        // In a real app, you would show this error to the user
        alert(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setUploadingImage(false);
        // Clear the input value so the same file can be selected again
        event.target.value = '';
      }
    }
  };

  const getBlockTypeDisplay = (blockType: string) => {
    const types: Record<string, { label: string; color: string }> = {
      hero: { label: 'Hero Section', color: 'primary' },
      text: { label: 'Text Block', color: 'secondary' },
      image: { label: 'Image Block', color: 'success' },
      button: { label: 'Button', color: 'warning' },
      gallery: { label: 'Gallery', color: 'info' },
      contact: { label: 'Contact', color: 'error' },
      map: { label: 'Map', color: 'default' },
      features: { label: 'Features', color: 'primary' },
      cta: { label: 'Call to Action', color: 'secondary' }
    };
    return types[blockType] || { label: blockType, color: 'default' };
  };

  const renderBlockFields = () => {
    switch (block.blockType) {
      case 'hero':
        return (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hero Title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hero Subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>Hero Content</Typography>
              <Box sx={{ 
                '& .ql-editor': { 
                  minHeight: '150px', 
                  backgroundColor: 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  '@media (max-width: 768px)': {
                    fontSize: '16px', // Prevents zoom on iOS
                    minHeight: '120px'
                  }
                },
                '& .ql-toolbar': {
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: '#fafafa',
                  '@media (max-width: 768px)': {
                    fontSize: '12px',
                    padding: '8px'
                  }
                },
                '& .ql-container': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px'
                },
                '& .ql-toolbar .ql-stroke': {
                  fill: 'none',
                  stroke: '#444'
                },
                '& .ql-toolbar .ql-fill': {
                  fill: '#444',
                  stroke: 'none'
                },
                '& .ql-toolbar button': {
                  '@media (max-width: 768px)': {
                    width: '28px',
                    height: '28px',
                    padding: '4px'
                  }
                },
                '& .ql-toolbar button:hover': {
                  backgroundColor: '#e3f2fd'
                },
                '& .ql-toolbar button.ql-active': {
                  backgroundColor: '#1976d2',
                  color: 'white'
                }
              }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  placeholder="Enter your hero section content..."
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" gutterBottom>Hero Image</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <UploadIcon />}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {formData.imageUrl && (
                    <Box
                      component="img"
                      src={formData.imageUrl}
                      alt="Hero"
                      sx={{ height: 60, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText || ''}
                onChange={(e) => handleFieldChange('buttonText', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Button Link"
                value={formData.buttonLink || ''}
                onChange={(e) => handleFieldChange('buttonLink', e.target.value)}
              />
            </Grid>
          </>
        );

      case 'text':
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Section Title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>Content</Typography>
              <Box sx={{ 
                '& .ql-editor': { 
                  minHeight: '200px', 
                  backgroundColor: 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  '@media (max-width: 768px)': {
                    fontSize: '16px', // Prevents zoom on iOS
                    minHeight: '120px'
                  }
                },
                '& .ql-toolbar': {
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: '#fafafa',
                  '@media (max-width: 768px)': {
                    fontSize: '12px',
                    padding: '8px'
                  }
                },
                '& .ql-container': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px'
                },
                '& .ql-toolbar .ql-stroke': {
                  fill: 'none',
                  stroke: '#444'
                },
                '& .ql-toolbar .ql-fill': {
                  fill: '#444',
                  stroke: 'none'
                },
                '& .ql-toolbar button': {
                  '@media (max-width: 768px)': {
                    width: '28px',
                    height: '28px',
                    padding: '4px'
                  }
                },
                '& .ql-toolbar button:hover': {
                  backgroundColor: '#e3f2fd'
                },
                '& .ql-toolbar button.ql-active': {
                  backgroundColor: '#1976d2',
                  color: 'white'
                }
              }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  placeholder="Enter your content here..."
                />
              </Box>
            </Grid>
          </>
        );

      case 'image':
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image Caption"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" gutterBottom>Image</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <UploadIcon />}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  {formData.imageUrl && (
                    <Box
                      component="img"
                      src={formData.imageUrl}
                      alt="Content"
                      sx={{ height: 100, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Image Description"
                value={formData.content || ''}
                onChange={(e) => handleFieldChange('content', e.target.value)}
              />
            </Grid>
          </>
        );

      case 'button':
      case 'cta':
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Section Title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={formData.content || ''}
                onChange={(e) => handleFieldChange('content', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText || ''}
                onChange={(e) => handleFieldChange('buttonText', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Button Link"
                value={formData.buttonLink || ''}
                onChange={(e) => handleFieldChange('buttonLink', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Button Style</InputLabel>
                <Select
                  value={formData.buttonStyle || 'primary'}
                  onChange={(e) => handleFieldChange('buttonStyle', e.target.value)}
                  label="Button Style"
                >
                  <MenuItem value="primary">Primary</MenuItem>
                  <MenuItem value="secondary">Secondary</MenuItem>
                  <MenuItem value="outlined">Outlined</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </>
        );

      default:
        return (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>Content</Typography>
              <Box sx={{ 
                '& .ql-editor': { 
                  minHeight: '200px', 
                  backgroundColor: 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  '@media (max-width: 768px)': {
                    fontSize: '16px', // Prevents zoom on iOS
                    minHeight: '120px'
                  }
                },
                '& .ql-toolbar': {
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px 4px 0 0',
                  backgroundColor: '#fafafa',
                  '@media (max-width: 768px)': {
                    fontSize: '12px',
                    padding: '8px'
                  }
                },
                '& .ql-container': {
                  border: '1px solid #e0e0e0',
                  borderTop: 'none',
                  borderRadius: '0 0 4px 4px'
                },
                '& .ql-toolbar .ql-stroke': {
                  fill: 'none',
                  stroke: '#444'
                },
                '& .ql-toolbar .ql-fill': {
                  fill: '#444',
                  stroke: 'none'
                },
                '& .ql-toolbar button': {
                  '@media (max-width: 768px)': {
                    width: '28px',
                    height: '28px',
                    padding: '4px'
                  }
                },
                '& .ql-toolbar button:hover': {
                  backgroundColor: '#e3f2fd'
                },
                '& .ql-toolbar button.ql-active': {
                  backgroundColor: '#1976d2',
                  color: 'white'
                }
              }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  placeholder="Enter your block content..."
                />
              </Box>
            </Grid>
          </>
        );
    }
  };

  const renderPreview = () => {
    const blockTypeInfo = getBlockTypeDisplay(block.blockType);
    
    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            {dragHandleProps && (
              <IconButton size="small" {...dragHandleProps}>
                <DragIcon />
              </IconButton>
            )}
            <Chip 
              label={blockTypeInfo.label} 
              color={blockTypeInfo.color as any}
              size="small" 
            />
            <Typography variant="h6">
              {block.title || 'Untitled Block'}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  size="small"
                />
              }
              label="Active"
            />
            <IconButton size="small" onClick={() => setEditMode(true)}>
              <EditIcon />
            </IconButton>
            <IconButton size="small" onClick={onDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        {block.subtitle && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {block.subtitle}
          </Typography>
        )}

        {block.content && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            {block.content.replace(/<[^>]*>/g, '').substring(0, 100)}
            {block.content.length > 100 ? '...' : ''}
          </Typography>
        )}

        {block.imageUrl && (
          <Box sx={{ mb: 2 }}>
            <img
              src={block.imageUrl}
              alt={block.title || 'Content'}
              style={{ maxWidth: '200px', height: 'auto', borderRadius: 4 }}
            />
          </Box>
        )}

        {block.buttonText && (
          <Chip
            label={`Button: ${block.buttonText}`}
            variant="outlined"
            size="small"
          />
        )}
      </Box>
    );
  };

  if (!editMode) {
    return (
      <Paper sx={{ p: 3, mb: 2, opacity: formData.isActive ? 1 : 0.6 }}>
        {renderPreview()}
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mb: 2, border: '2px solid', borderColor: 'primary.main' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          {dragHandleProps && (
            <IconButton size="small" {...dragHandleProps}>
              <DragIcon />
            </IconButton>
          )}
          <Chip 
            label={getBlockTypeDisplay(block.blockType).label} 
            color="primary"
            size="small" 
          />
          <Typography variant="h6">Edit Block</Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            size="small"
            onClick={handleCancel}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            disabled={saving || autoSaving}
            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          >
            {saving ? 'Saving...' : autoSaving ? 'Auto-saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {/* Auto-save status indicator */}
      {editMode && (
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          {autoSaving && (
            <>
              <CircularProgress size={12} />
              <Typography variant="caption" color="text.secondary">
                Auto-saving...
              </Typography>
            </>
          )}
          {lastSaved && !autoSaving && (
            <Typography variant="caption" color="text.secondary">
              Last saved: {lastSaved.toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => handleFieldChange('isActive', e.target.checked)}
              />
            }
            label="Block Active"
          />
        </Grid>
        
        {renderBlockFields()}
      </Grid>
    </Paper>
  );
};

export default ContentBlockEditor; 