import React, { useState, useEffect } from 'react';
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
  Alert
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

// Rich text editor modules configuration
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'link', 'image', 'color', 'background'
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement actual image upload
      console.log('Image upload:', file);
      // For now, create a placeholder URL
      const placeholderUrl = URL.createObjectURL(file);
      handleFieldChange('imageUrl', placeholderUrl);
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
              <Box sx={{ '& .ql-editor': { minHeight: '150px', backgroundColor: 'white' } }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
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
                    startIcon={<UploadIcon />}
                  >
                    Upload Image
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
              <Box sx={{ '& .ql-editor': { minHeight: '200px', backgroundColor: 'white' } }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
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
                    startIcon={<UploadIcon />}
                  >
                    Upload Image
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
              <Box sx={{ '& .ql-editor': { minHeight: '200px', backgroundColor: 'white' } }}>
                <ReactQuill
                  value={formData.content || ''}
                  onChange={(value) => handleFieldChange('content', value)}
                  modules={quillModules}
                  formats={quillFormats}
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
            disabled={saving}
            startIcon={<SaveIcon />}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

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