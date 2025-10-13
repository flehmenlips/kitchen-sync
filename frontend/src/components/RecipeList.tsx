import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getRecipes } from '../services/apiService';
import { useMobileResponsive, mobileResponsiveStyles, MOBILE_CONSTANTS } from '../utils/mobileUtils';

// Import MUI components
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

// Define a recipe type for this component to avoid conflicts
interface RecipeListItem {
  id: number;
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  category?: {
    id: number;
    name: string;
  } | null;
}

// Type for grouped data
interface GroupedRecipes {
  [categoryName: string]: RecipeListItem[];
}

const UNCATEGORIZED_KEY = 'Uncategorized';
const LOCAL_STORAGE_KEY = 'kitchenSyncRecipeCategoryState'; // Define key
const VIEW_MODE_KEY = 'kitchenSyncRecipeViewMode'; // View mode preference

// Cloudinary transformation function for thumbnails
const getThumbUrl = (photoUrl: string | null | undefined): string | undefined => {
  if (!photoUrl) return undefined;
  
  // If it's a Cloudinary URL, transform it
  if (photoUrl.includes('res.cloudinary.com')) {
    // Extract the base URL and transformation path
    const parts = photoUrl.split('/upload/');
    if (parts.length === 2) {
      // Insert thumbnail transformation parameters
      // w_80,h_80,c_fill: width 80px, height 80px, crop mode fill
      // q_auto: automatic quality optimization
      return `${parts[0]}/upload/w_80,h_80,c_fill,q_auto/${parts[1]}`;
    }
  }
  
  // Return original URL if not Cloudinary or can't parse
  return photoUrl;
};

const RecipeList: React.FC = () => {
  const { isMobile } = useMobileResponsive();
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>(() => {
    try {
      const savedViewMode = localStorage.getItem(VIEW_MODE_KEY);
      return (savedViewMode as 'list' | 'cards') || 'list';
    } catch (error) {
      console.error("Error reading view mode from localStorage:", error);
      return 'list';
    }
  });
  // State to track open/closed categories
  const [openCategories, setOpenCategories] = useState<{ [key: string]: boolean }>(() => {
    try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedState) {
            return JSON.parse(savedState);
        }
    } catch (error) {
        console.error("Error reading category state from localStorage:", error);
    }
    return {}; // Return empty initially, will be populated after fetch
  });

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await getRecipes();
        
        // Map the API response to our RecipeListItem type
        const recipeItems: RecipeListItem[] = data.map(recipe => {
          // Type safety: Handle potential missing or different structures
          const item: RecipeListItem = {
            id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id,
            name: recipe.name,
            description: recipe.description || null,
            photoUrl: recipe.photoUrl || null
          };
          
          // Only add category if it exists in the response
          if ('category' in recipe && recipe.category) {
            // Ensure category has the expected structure
            const cat = recipe.category as any;
            if (cat && typeof cat === 'object' && 'id' in cat && 'name' in cat) {
              item.category = {
                id: cat.id,
                name: cat.name
              };
            }
          }
          
          return item;
        });
        
        setRecipes(recipeItems);
        setError(null);

        // Initialize state only if not loaded from storage OR if new categories appear
        setOpenCategories(prevState => {
             const loadedFromStorage = Object.keys(prevState).length > 0;
             const newState = { ...prevState }; // Start with potentially loaded state
             let updated = false;

             // Ensure all current categories have an entry (defaulting to true if new)
             const allCategoryNames = new Set<string>([UNCATEGORIZED_KEY]); // Include Uncategorized
             recipeItems.forEach(recipe => {
                 const categoryName = recipe.category?.name || UNCATEGORIZED_KEY;
                 allCategoryNames.add(categoryName);
             });

             allCategoryNames.forEach(categoryName => {
                 if (!(categoryName in newState)) {
                     newState[categoryName] = true; // Default new categories to open
                     updated = true;
                 }
             });
             
             // If nothing was loaded and we didn't add anything, default all to true
             if (!loadedFromStorage && !updated && recipeItems.length > 0) { // Only default if data was actually fetched
                 allCategoryNames.forEach(name => newState[name] = true);
                 updated = true;
             }

             return updated ? newState : prevState;
        });

      } catch (err) {
        console.error(err);
        setError('Failed to fetch recipes. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []); // Fetch only on mount

  // Effect to save state to Local Storage whenever it changes
  useEffect(() => {
      // Avoid saving the initial empty state before categories are loaded/initialized
      if (Object.keys(openCategories).length > 0 && !loading) { // Only save if not loading and state is populated
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(openCategories));
        } catch (error) {
            console.error("Error saving category state to localStorage:", error);
        }
      }
  }, [openCategories, loading]); // Add loading dependency

  // Effect to save view mode to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_MODE_KEY, viewMode);
    } catch (error) {
      console.error("Error saving view mode to localStorage:", error);
    }
  }, [viewMode]);

  // Filter recipes based on search query
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    
    const query = searchQuery.toLowerCase();
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(query) ||
      recipe.description?.toLowerCase().includes(query) ||
      recipe.category?.name.toLowerCase().includes(query)
    );
  }, [recipes, searchQuery]);

  // Group recipes by category using useMemo for efficiency
  const groupedRecipes = useMemo(() => {
    return filteredRecipes.reduce<GroupedRecipes>((acc, recipe) => {
      const categoryName = recipe.category?.name || UNCATEGORIZED_KEY;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(recipe);
      return acc;
    }, {});
  }, [filteredRecipes]);

  // Sort category names (optional, puts Uncategorized last)
  const sortedCategoryNames = useMemo(() => {
      return Object.keys(groupedRecipes).sort((a, b) => {
          if (a === UNCATEGORIZED_KEY) return 1;
          if (b === UNCATEGORIZED_KEY) return -1;
          return a.localeCompare(b);
      });
  }, [groupedRecipes]);

  const handleCategoryClick = (categoryName: string) => {
    setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  if (loading) {
    // Center the loading spinner
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  return (
    <Box sx={mobileResponsiveStyles.container(isMobile)} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50"> 
      {/* Header Section - Remise-inspired with glass-morphism */}
      <Box className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl mb-6 p-6 border border-white/20">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
          mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
          <Box className="flex items-center gap-3">
            <Box className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <RestaurantIcon sx={{ fontSize: isMobile ? 28 : 32, color: 'white' }} />
            </Box>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="h2"
              className="font-bold text-gray-900"
          sx={mobileResponsiveStyles.typography.h4}
        >
              Recipe Collection
        </Typography>
          </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: isMobile ? 1 : 2, 
          flexDirection: isMobile ? 'column' : 'row',
            width: isMobile ? '100%' : 'auto',
            alignItems: isMobile ? 'stretch' : 'center'
          }}>
            {/* View Mode Toggle - Remise-inspired */}
            <Box sx={{ 
              display: 'flex', 
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px', 
              padding: '4px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
            }}>
              <Button
                onClick={() => setViewMode('list')}
                sx={{
                  background: viewMode === 'list' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : '#6b7280',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: 'auto',
                  '&:hover': {
                    background: viewMode === 'list' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(59, 130, 246, 0.1)',
                    color: viewMode === 'list' ? 'white' : '#3b82f6'
                  }
                }}
              >
                <ViewListIcon sx={{ fontSize: 18 }} />
                {!isMobile && 'List'}
              </Button>
              <Button
                onClick={() => setViewMode('cards')}
                sx={{
                  background: viewMode === 'cards' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'transparent',
                  color: viewMode === 'cards' ? 'white' : '#6b7280',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  minWidth: 'auto',
                  '&:hover': {
                    background: viewMode === 'cards' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'rgba(59, 130, 246, 0.1)',
                    color: viewMode === 'cards' ? 'white' : '#3b82f6'
                  }
                }}
              >
                <ViewModuleIcon sx={{ fontSize: 18 }} />
                {!isMobile && 'Cards'}
              </Button>
            </Box>
          <Button 
            variant="outlined"
              size={isMobile ? "medium" : "medium"}
            startIcon={<FileUploadIcon />}
            component={RouterLink}
            to="/recipes/import"
              className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 rounded-xl"
              sx={{ 
                ...mobileResponsiveStyles.button(isMobile),
                borderWidth: 2,
                borderRadius: 3,
                fontWeight: 600
              }}
            fullWidth={isMobile}
          >
            Import Recipe
          </Button>
          <Button 
            variant="contained" 
              size={isMobile ? "medium" : "medium"}
            startIcon={<AddIcon />} 
            component={RouterLink} 
            to="/recipes/new"
              className="hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600"
              sx={{ 
                ...mobileResponsiveStyles.button(isMobile),
                borderRadius: 3,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                }
              }}
            fullWidth={isMobile}
          >
            Add Recipe
          </Button>
        </Box>
      </Box>

        {/* Search Bar - Remise-inspired with modern styling */}
        <TextField
          fullWidth
          placeholder="Search recipes by name, description, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/80 backdrop-blur-sm"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-blue-500" sx={{ fontSize: 24 }} />
              </InputAdornment>
            ),
            className: "rounded-xl"
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              '& fieldset': {
                borderWidth: 2,
                borderColor: 'rgba(59, 130, 246, 0.2)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)',
              },
              '&:hover fieldset': {
                borderColor: '#3b82f6',
              },
              '&.Mui-focused': {
                backgroundColor: 'white',
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 35px rgba(59, 130, 246, 0.2)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6 !important',
                borderWidth: '2px !important',
              },
            },
          }}
        />

        {/* Search Results Count */}
        {searchQuery && (
          <Box className="mt-3 flex items-center gap-2">
            <Chip 
              label={`${filteredRecipes.length} result${filteredRecipes.length !== 1 ? 's' : ''}`}
              size="small"
              className="bg-blue-50 text-blue-700"
            />
            {filteredRecipes.length < recipes.length && (
              <Typography variant="caption" className="text-gray-500">
                of {recipes.length} total recipes
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Empty State - Remise-inspired elegant design */}
      {filteredRecipes.length === 0 && !loading ? (
        <Box className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-12 text-center border border-white/20 transform transition-all duration-500 hover:scale-105">
          <Box className="bg-gradient-to-br from-blue-500 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <RestaurantIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
          <Typography variant="h5" className="text-gray-900 mb-3 font-bold">
            {searchQuery ? 'No recipes found' : 'Start Your Culinary Journey'}
          </Typography>
          <Typography variant="body1" className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search terms or browse all recipes' 
              : 'Build your professional recipe collection and streamline your kitchen operations'}
          </Typography>
          {!searchQuery && (
            <Button 
              variant="contained" 
              size="large"
              startIcon={<AddIcon />} 
              component={RouterLink} 
              to="/recipes/new"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                }
              }}
            >
              Create Your First Recipe
            </Button>
          )}
        </Box>
      ) : viewMode === 'cards' ? (
        // Card View - Remise-inspired grid layout
        <Grid container spacing={3}>
          {sortedCategoryNames.map((categoryName) => (
            <Grid item xs={12} key={categoryName}>
              <Box 
                className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <ListItemButton 
                  onClick={() => handleCategoryClick(categoryName)}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                  sx={{
                    minHeight: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
                    py: isMobile ? 2 : 1.5,
                    px: isMobile ? 3 : 2,
                    borderBottom: '1px solid',
                    borderColor: 'rgba(59, 130, 246, 0.1)'
                  }}
                >
                  <ListItemIcon>
                    <Box className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-md">
                      <FolderIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={categoryName} 
                    primaryTypographyProps={{ 
                      fontWeight: 700,
                      fontSize: isMobile ? '1.1rem' : '1rem',
                      className: 'text-gray-900'
                    }} 
                  />
                  <Chip 
                    label={groupedRecipes[categoryName].length}
                    size="small"
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold mr-3 shadow-sm"
                    sx={{
                      borderRadius: 2,
                      fontWeight: 600
                    }}
                  />
                  {!!openCategories[categoryName] ? 
                    <ExpandLess sx={{ color: '#8b5cf6' }} /> : 
                    <ExpandMore sx={{ color: '#3b82f6' }} />
                  }
                </ListItemButton>
                <Collapse in={!!openCategories[categoryName]} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      {groupedRecipes[categoryName].map((recipe) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                          <Card 
                            component={RouterLink} 
                            to={`/recipes/${recipe.id}`}
                            sx={{
                              height: '100%',
                              background: 'rgba(255, 255, 255, 0.7)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '16px',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              '&:hover': {
                                transform: 'translateY(-8px)',
                                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                                borderColor: 'rgba(59, 130, 246, 0.3)'
                              }
                            }}
                          >
                            {recipe.photoUrl ? (
                              <CardMedia
                                component="img"
                                height="200"
                                image={getThumbUrl(recipe.photoUrl)}
                                alt={recipe.name}
                                sx={{
                                  objectFit: 'cover',
                                  borderRadius: '16px 16px 0 0'
                                }}
                              />
                            ) : (
                              <Box 
                                sx={{ 
                                  height: 200,
                                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '16px 16px 0 0'
                                }}
                              >
                                <RestaurantIcon sx={{ fontSize: 64, color: 'white' }} />
                              </Box>
                            )}
                            <CardContent sx={{ p: 3 }}>
                              <Typography 
                                variant="h6" 
                                component="h3"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '1.1rem',
                                  color: '#1f2937',
                                  mb: 1,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical'
                                }}
                              >
                                {recipe.name}
                              </Typography>
                              <Typography 
                                variant="body2"
                                sx={{
                                  color: '#6b7280',
                                  fontSize: '0.85rem',
                                  lineHeight: 1.5,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  hyphens: 'auto'
                                }}
                              >
                                {recipe.description || 'No description available'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Collapse>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        // List View - Enhanced with better description wrapping
        <Box className="space-y-4">
          {sortedCategoryNames.map((categoryName) => (
            <Box 
              key={categoryName} 
              className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl overflow-hidden border border-white/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <ListItemButton 
                onClick={() => handleCategoryClick(categoryName)}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                sx={{
                  minHeight: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
                  py: isMobile ? 2 : 1.5,
                  px: isMobile ? 3 : 2,
                  borderBottom: '1px solid',
                  borderColor: 'rgba(59, 130, 246, 0.1)'
                }}
              >
                <ListItemIcon>
                  <Box className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-md">
                    <FolderIcon sx={{ color: 'white', fontSize: 20 }} />
                  </Box>
                </ListItemIcon>
                <ListItemText 
                  primary={categoryName} 
                  primaryTypographyProps={{ 
                    fontWeight: 700,
                    fontSize: isMobile ? '1.1rem' : '1rem',
                    className: 'text-gray-900'
                  }} 
                />
                <Chip 
                  label={groupedRecipes[categoryName].length}
                  size="small"
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold mr-3 shadow-sm"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                />
                {!!openCategories[categoryName] ? 
                  <ExpandLess sx={{ color: '#8b5cf6' }} /> : 
                  <ExpandMore sx={{ color: '#3b82f6' }} />
                }
              </ListItemButton>
              <Collapse in={!!openCategories[categoryName]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding className="bg-gradient-to-b from-gray-50 to-white p-2">  
                  {groupedRecipes[categoryName].map((recipe) => (
                    <ListItem key={recipe.id} disablePadding className="mb-2 last:mb-0">
                      <ListItemButton 
                        component={RouterLink} 
                        to={`/recipes/${recipe.id}`}
                        className="hover:bg-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-transparent hover:border-blue-100"
                        sx={{
                          minHeight: isMobile ? MOBILE_CONSTANTS.TOUCH_TARGET_SIZE : 'auto',
                          py: isMobile ? 2.5 : 2,
                          px: isMobile ? 3 : 2.5,
                          borderRadius: 3,
                        }}
                      >
                        <ListItemAvatar>
                          {recipe.photoUrl ? (
                            <Avatar 
                              src={getThumbUrl(recipe.photoUrl)} 
                              alt={recipe.name}
                              variant="rounded"
                              className="shadow-xl ring-2 ring-white transition-transform duration-300 hover:scale-110"
                              sx={{ 
                                width: isMobile ? 72 : 64, 
                                height: isMobile ? 72 : 64,
                                borderRadius: isMobile ? 2.5 : 2
                              }}
                            />
                          ) : (
                            <Avatar 
                              variant="rounded"
                              className="bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl ring-2 ring-white transition-transform duration-300 hover:scale-110"
                              sx={{ 
                                width: isMobile ? 72 : 64, 
                                height: isMobile ? 72 : 64, 
                                borderRadius: isMobile ? 2.5 : 2
                              }}
                            >
                              <RestaurantIcon sx={{ fontSize: isMobile ? '2.2rem' : '1.8rem', color: 'white' }} />
                            </Avatar>
                          )}
                        </ListItemAvatar>
                        <ListItemText
                          primary={recipe.name}
                          secondary={recipe.description || 'No description available'}
                          primaryTypographyProps={{
                            fontSize: isMobile ? '1.1rem' : '1rem',
                            fontWeight: 700,
                            className: 'text-gray-900'
                          }}
                          secondaryTypographyProps={{ 
                            noWrap: false, // Allow wrapping for descriptions
                            className: 'text-gray-600',
                            sx: { 
                              display: 'block',
                              fontSize: isMobile ? '0.9rem' : '0.85rem',
                              lineHeight: isMobile ? 1.5 : 1.4,
                              maxHeight: isMobile ? '3em' : 'auto',
                              overflow: isMobile ? 'hidden' : 'visible',
                              fontWeight: 500,
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              hyphens: 'auto'
                            } 
                          }}
                          sx={{ ml: isMobile ? 2 : 1.5 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RecipeList; 