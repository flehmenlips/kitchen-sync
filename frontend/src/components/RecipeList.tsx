import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getRecipes } from '../services/apiService';

// Import MUI components
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ListItemButton from '@mui/material/ListItemButton'; // For clickable list items
import Button from '@mui/material/Button'; // Import Button
import AddIcon from '@mui/icons-material/Add'; // Import an icon
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Collapse from '@mui/material/Collapse'; // For collapsible sections
import ListSubheader from '@mui/material/ListSubheader'; // For category headers
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder'; // Optional icon for categories
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import RestaurantIcon from '@mui/icons-material/Restaurant';

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
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

  // Group recipes by category using useMemo for efficiency
  const groupedRecipes = useMemo(() => {
    return recipes.reduce<GroupedRecipes>((acc, recipe) => {
      const categoryName = recipe.category?.name || UNCATEGORIZED_KEY;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(recipe);
      return acc;
    }, {});
  }, [recipes]);

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
    <Box sx={{ width: '100%', maxWidth: 800, margin: 'auto', mt: 2 }}> {/* Basic container */} 
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h2">
          Recipes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined"
            startIcon={<FileUploadIcon />}
            component={RouterLink}
            to="/recipes/import"
          >
            Import Recipe
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            component={RouterLink} 
            to="/recipes/new"
          >
            Add Recipe
          </Button>
        </Box>
      </Box>
      {recipes.length === 0 && !loading ? (
        <Typography sx={{ mt: 2 }}>No recipes found.</Typography>
      ) : (
        <List
            sx={{ width: '100%', bgcolor: 'background.paper' }} 
            component="nav"
            aria-labelledby="recipe-list-subheader"
        >
          {sortedCategoryNames.map((categoryName) => (
            <React.Fragment key={categoryName}>
              <ListItemButton onClick={() => handleCategoryClick(categoryName)}>
                 {/* Optional Icon */}
                 {/* <ListItemIcon><FolderIcon /></ListItemIcon> */}
                <ListItemText primary={categoryName} primaryTypographyProps={{ fontWeight: 'medium' }} />
                {!!openCategories[categoryName] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={!!openCategories[categoryName]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}> {/* Indent recipes */} 
                  {groupedRecipes[categoryName].map((recipe) => (
                    <ListItem key={recipe.id} disablePadding>
                      <ListItemButton component={RouterLink} to={`/recipes/${recipe.id}`}>
                        <ListItemAvatar>
                          {recipe.photoUrl ? (
                            <Avatar 
                              src={getThumbUrl(recipe.photoUrl)} 
                              alt={recipe.name}
                              variant="rounded"
                              sx={{ width: 56, height: 56 }}
                            />
                          ) : (
                            <Avatar 
                              variant="rounded"
                              sx={{ width: 56, height: 56, bgcolor: 'primary.light' }}
                            >
                              <RestaurantIcon />
                            </Avatar>
                          )}
                        </ListItemAvatar>
                        <ListItemText
                          primary={recipe.name}
                          secondary={recipe.description || ''}
                          secondaryTypographyProps={{ 
                            noWrap: true, 
                            sx: { display: 'block' } 
                          }}
                          sx={{ ml: 1 }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RecipeList; 