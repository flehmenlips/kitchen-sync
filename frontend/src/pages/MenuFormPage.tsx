import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Paper, TextField, Button, CircularProgress,
  Divider, Grid, IconButton, Tabs, Tab, Alert, FormControlLabel, Switch,
  Select, MenuItem as MuiMenuItem, InputLabel, FormControl
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { createMenu, getMenuById, updateMenu, MenuFormData, Menu } from '../services/apiService';
import MenuSectionsEditor from '../components/menu/MenuSectionsEditor';

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
      id={`menu-tabpanel-${index}`}
      aria-labelledby={`menu-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const MenuFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  
  const [menu, setMenu] = useState<MenuFormData>({
    name: '',
    title: '',
    subtitle: '',
    font: 'Playfair Display',
    layout: 'single',
    showDollarSign: true,
    showDecimals: true,
    showSectionDividers: true,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#333333',
    sections: []
  });

  // Load menu data if editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchMenu = async () => {
        try {
          setLoading(true);
          const menuData = await getMenuById(parseInt(id));
          
          // Convert Menu to MenuFormData format
          setMenu({
            name: menuData.name,
            title: menuData.title || '',
            subtitle: menuData.subtitle || '',
            font: menuData.font || 'Playfair Display',
            layout: menuData.layout || 'single',
            showDollarSign: menuData.showDollarSign,
            showDecimals: menuData.showDecimals,
            showSectionDividers: menuData.showSectionDividers,
            backgroundColor: menuData.backgroundColor || '#ffffff',
            textColor: menuData.textColor || '#000000',
            accentColor: menuData.accentColor || '#333333',
            sections: menuData.sections || []
          });
          
          setError(null);
        } catch (err) {
          console.error(`Error fetching menu #${id}:`, err);
          setError("Failed to load menu data. Please try again.");
        } finally {
          setLoading(false);
        }
      };

      fetchMenu();
    }
  }, [id, isEditing]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs differently
    const inputValue = type === 'checkbox' ? checked : value;
    
    setMenu(prev => ({
      ...prev,
      [name]: inputValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Basic validation
      if (!menu.name) {
        setError("Menu name is required");
        setSaving(false);
        return;
      }
      
      if (isEditing && id) {
        await updateMenu(parseInt(id), menu);
      } else {
        await createMenu(menu);
      }
      
      // Navigate back to menu list after success
      navigate('/menus');
      
    } catch (err) {
      console.error("Error saving menu:", err);
      setError("Failed to save menu. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton 
          edge="start" 
          sx={{ mr: 2 }} 
          onClick={() => navigate('/menus')}
          aria-label="back to menus"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Edit Menu' : 'Create New Menu'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="menu form tabs">
            <Tab label="Basic Information" />
            <Tab label="Layout & Style" />
            <Tab label="Content" />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Menu Name"
                  name="name"
                  value={menu.name}
                  onChange={handleInputChange}
                  helperText="Internal name for this menu"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Menu Title"
                  name="title"
                  value={menu.title || ''}
                  onChange={handleInputChange}
                  helperText="Main title displayed on the menu"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Menu Subtitle"
                  name="subtitle"
                  value={menu.subtitle || ''}
                  onChange={handleInputChange}
                  helperText="Subtitle or tagline"
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle1" gutterBottom>
              Layout & Style settings will be implemented in the next phase
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <MenuSectionsEditor 
              sections={menu.sections || []}
              onChange={(newSections) => setMenu(prev => ({ ...prev, sections: newSections }))}
            />
          </TabPanel>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              sx={{ mr: 2 }}
              onClick={() => navigate('/menus')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Saving...
                </>
              ) : isEditing ? 'Update Menu' : 'Create Menu'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default MenuFormPage; 