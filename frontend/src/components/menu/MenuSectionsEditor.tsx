import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails, 
  TextField, IconButton, List, ListItem, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Switch, Autocomplete,
  CircularProgress, Tooltip, Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  RestaurantMenu as RecipeIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { MenuSection, MenuItem, getRecipes } from '../../services/apiService';

// Local interface to avoid type conflicts
interface MenuRecipe {
  id: number;
  name: string;
  description?: string | null;
  photoUrl?: string | null;
}

interface MenuSectionsEditorProps {
  sections: MenuSection[];
  onChange: (sections: MenuSection[]) => void;
}

interface SectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (sectionData: { name: string; active: boolean }) => void;
  initialData?: { name: string; active: boolean };
  title: string;
}

interface ItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (itemData: { name: string; description: string; price: string; active: boolean; recipeId: number | null }) => void;
  initialData?: { name: string; description: string; price: string; active: boolean; recipeId: number | null };
  title: string;
}

const SectionDialog: React.FC<SectionDialogProps> = ({ 
  open, onClose, onSave, initialData, title 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [active, setActive] = useState(initialData?.active !== false);

  // Reset form values when initialData changes or dialog opens/closes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setActive(initialData.active !== false);
    } else {
      setName('');
      setActive(true);
    }
  }, [initialData, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, active });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Section Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <FormControlLabel
          control={
            <Switch 
              checked={active} 
              onChange={(e) => setActive(e.target.checked)} 
            />
          }
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary" disabled={!name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ItemDialog: React.FC<ItemDialogProps> = ({ 
  open, onClose, onSave, initialData, title 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [active, setActive] = useState(initialData?.active !== false);
  const [recipeId, setRecipeId] = useState<number | null>(initialData?.recipeId || null);
  const [recipes, setRecipes] = useState<MenuRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [importDescription, setImportDescription] = useState(true);
  const [useRecipeName, setUseRecipeName] = useState(false);

  // Reset form values when initialData changes or dialog opens/closes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description);
      setPrice(initialData.price);
      setActive(initialData.active !== false);
      setRecipeId(initialData.recipeId);
    } else {
      // Reset to defaults when adding a new item
      setName('');
      setDescription('');
      setPrice('');
      setActive(true);
      setRecipeId(null);
    }
    // Reset import options
    setImportDescription(true);
    setUseRecipeName(false);
  }, [initialData, open]);

  // Load recipes when dialog opens
  useEffect(() => {
    if (open) {
      const fetchRecipes = async () => {
        try {
          setLoading(true);
          const data = await getRecipes();
          
          // Convert to our local MenuRecipe interface
          const mappedRecipes: MenuRecipe[] = data.map(recipe => ({
            id: typeof recipe.id === 'string' ? parseInt(recipe.id, 10) : recipe.id,
            name: recipe.name,
            description: recipe.description,
            photoUrl: recipe.photoUrl
          }));
          
          setRecipes(mappedRecipes);
        } catch (error) {
          console.error('Error fetching recipes:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchRecipes();
    }
  }, [open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, description, price, active, recipeId });
    onClose();
  };

  // Find selected recipe object based on recipeId
  const selectedRecipe = recipes.find(recipe => recipe.id === recipeId) || null;

  // Update name and description when a recipe is selected and import options are checked
  useEffect(() => {
    if (selectedRecipe) {
      if (useRecipeName) {
        setName(selectedRecipe.name);
      }
      if (importDescription && selectedRecipe.description) {
        setDescription(selectedRecipe.description);
      }
    }
  }, [selectedRecipe, useRecipeName, importDescription]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Item Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextField
          margin="dense"
          label="Price"
          fullWidth
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        <Box sx={{ mt: 2, mb: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Link to Recipe (Optional)
          </Typography>
          <Autocomplete
            id="recipe-selector"
            options={recipes}
            value={selectedRecipe}
            loading={loading}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Recipe"
                margin="dense"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            onChange={(event, newValue) => {
              setRecipeId(newValue ? newValue.id : null);
            }}
          />
        </Box>
        
        {selectedRecipe && (
          <Box sx={{ mt: 2, mb: 1, p: 2, bgcolor: 'background.paper', border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Recipe Import Options
            </Typography>
            <FormControlLabel
              control={
                <Switch 
                  checked={useRecipeName} 
                  onChange={(e) => setUseRecipeName(e.target.checked)} 
                />
              }
              label="Use Recipe Name For Menu Item"
            />
            <FormControlLabel
              control={
                <Switch 
                  checked={importDescription} 
                  onChange={(e) => setImportDescription(e.target.checked)} 
                />
              }
              label="Import Recipe Description"
            />
          </Box>
        )}
        
        <FormControlLabel
          control={
            <Switch 
              checked={active} 
              onChange={(e) => setActive(e.target.checked)} 
            />
          }
          label="Active"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary" disabled={!name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MenuSectionsEditor: React.FC<MenuSectionsEditorProps> = ({ sections, onChange }) => {
  const [expandedSection, setExpandedSection] = useState<string | false>(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleSectionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const handleAddSection = () => {
    setEditMode(false);
    setCurrentSectionIndex(null);
    setSectionDialogOpen(true);
  };

  const handleEditSection = (index: number) => {
    setEditMode(true);
    setCurrentSectionIndex(index);
    setSectionDialogOpen(true);
  };

  const handleDeleteSection = (index: number) => {
    const newSections = [...sections];
    if (newSections[index].id) {
      newSections[index] = { ...newSections[index], deleted: true };
    } else {
      newSections.splice(index, 1);
    }
    onChange(newSections);
  };

  const handleSaveSectionDialog = (sectionData: { name: string; active: boolean }) => {
    const newSections = [...sections];
    
    if (editMode && currentSectionIndex !== null) {
      // Edit existing section
      newSections[currentSectionIndex] = {
        ...newSections[currentSectionIndex],
        name: sectionData.name,
        active: sectionData.active
      };
    } else {
      // Add new section
      const newSection: MenuSection = {
        name: sectionData.name,
        active: sectionData.active,
        position: sections.length,
        items: []
      };
      newSections.push(newSection);
    }
    
    onChange(newSections);
  };

  const handleAddItem = (sectionIndex: number) => {
    setEditMode(false);
    setCurrentSectionIndex(sectionIndex);
    setCurrentItemIndex(null);
    setItemDialogOpen(true);
  };

  const handleEditItem = (sectionIndex: number, itemIndex: number) => {
    setEditMode(true);
    setCurrentSectionIndex(sectionIndex);
    setCurrentItemIndex(itemIndex);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    const section = { ...newSections[sectionIndex] };
    
    if (section.items[itemIndex].id) {
      // Mark existing item as deleted
      section.items[itemIndex] = { ...section.items[itemIndex], deleted: true };
    } else {
      // Remove new item that hasn't been saved yet
      section.items.splice(itemIndex, 1);
    }
    
    newSections[sectionIndex] = section;
    onChange(newSections);
  };

  const handleSaveItemDialog = (itemData: { 
    name: string; 
    description: string; 
    price: string;
    active: boolean;
    recipeId: number | null;
  }) => {
    if (currentSectionIndex === null) return;
    
    const newSections = [...sections];
    const section = { ...newSections[currentSectionIndex] };
    const items = [...section.items];
    
    if (editMode && currentItemIndex !== null) {
      // Edit existing item
      items[currentItemIndex] = {
        ...items[currentItemIndex],
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        active: itemData.active,
        recipeId: itemData.recipeId
      };
    } else {
      // Add new item
      const newItem: MenuItem = {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        active: itemData.active,
        position: items.length,
        recipeId: itemData.recipeId
      };
      items.push(newItem);
    }
    
    section.items = items;
    newSections[currentSectionIndex] = section;
    onChange(newSections);
  };

  // Handle drag and drop for sections
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    // If there's no destination or the item is dropped in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    if (type === 'section') {
      // We're moving a section
      const newSections = [...sections.filter(section => !section.deleted)];
      const [removed] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, removed);
      
      // Update positions
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        position: index
      }));
      
      // Combine with deleted sections which should remain at the end
      const deletedSections = sections.filter(section => section.deleted);
      onChange([...updatedSections, ...deletedSections]);
    } else if (type === 'item') {
      // We're moving an item within a section
      const sourceSectionId = source.droppableId;
      const destSectionId = destination.droppableId;
      
      const sectionIndex = parseInt(sourceSectionId.replace('section-', ''));
      const newSections = [...sections];
      
      const section = {...newSections[sectionIndex]};
      const visibleItems = section.items.filter(item => !item.deleted);
      
      // Move the item
      const [removed] = visibleItems.splice(source.index, 1);
      visibleItems.splice(destination.index, 0, removed);
      
      // Update positions
      const updatedItems = visibleItems.map((item, index) => ({
        ...item,
        position: index
      }));
      
      // Combine with deleted items which should remain at the end
      const deletedItems = section.items.filter(item => item.deleted);
      section.items = [...updatedItems, ...deletedItems];
      
      newSections[sectionIndex] = section;
      onChange(newSections);
    }
  };

  // Filter out deleted sections
  const visibleSections = sections.filter(section => !section.deleted);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Menu Sections</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleAddSection}
        >
          Add Section
        </Button>
      </Box>

      {visibleSections.length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 3 }}>
          No sections added yet. Click "Add Section" to create your first menu section.
        </Typography>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="menu-sections" type="section">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {visibleSections.map((section, sectionIndex) => (
                  <Draggable 
                    key={section.id ? `section-${section.id}` : `new-section-${sectionIndex}`}
                    draggableId={section.id ? `section-${section.id}` : `new-section-${sectionIndex}`}
                    index={sectionIndex}
                  >
                    {(provided, snapshot) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        elevation={snapshot.isDragging ? 3 : 0}
                        sx={{ 
                          mb: 2,
                          borderRadius: 1,
                          transition: 'all 0.3s',
                          transform: snapshot.isDragging ? 'scale(1.01)' : 'none'
                        }}
                      >
                        <Accordion 
                          expanded={expandedSection === `section-${sectionIndex}`}
                          onChange={handleSectionChange(`section-${sectionIndex}`)}
                          sx={{ 
                            boxShadow: 'none',
                            '&:before': {
                              display: 'none'
                            }
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`section-${sectionIndex}-content`}
                            id={`section-${sectionIndex}-header`}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Box 
                                {...provided.dragHandleProps} 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  cursor: 'grab'
                                }}
                              >
                                <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
                              </Box>
                              <Typography sx={{ flexGrow: 1 }}>{section.name}</Typography>
                              <Box sx={{ display: 'flex', ml: 1 }}>
                                {!section.active && (
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      mr: 2, 
                                      color: 'text.secondary',
                                      alignSelf: 'center' 
                                    }}
                                  >
                                    (Inactive)
                                  </Typography>
                                )}
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSection(sectionIndex);
                                  }}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(sectionIndex);
                                  }}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1">Items</Typography>
                                <Button 
                                  size="small" 
                                  startIcon={<AddIcon />}
                                  onClick={() => handleAddItem(sectionIndex)}
                                >
                                  Add Item
                                </Button>
                              </Box>
                              
                              {/* Filter out deleted items */}
                              {section.items.filter(item => !item.deleted).length === 0 ? (
                                <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                                  No items in this section. Click "Add Item" to add menu items.
                                </Typography>
                              ) : (
                                <Droppable 
                                  droppableId={`section-${sectionIndex}`} 
                                  type="item"
                                >
                                  {(provided) => (
                                    <List 
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      sx={{ width: '100%' }}
                                    >
                                      {section.items
                                        .filter(item => !item.deleted)
                                        .map((item, itemIndex) => {
                                        // Find the actual index in the original array for editing/deleting
                                        const actualItemIndex = section.items.findIndex(i => 
                                          item.id ? i.id === item.id : i === item
                                        );
                                        
                                        return (
                                          <Draggable
                                            key={item.id ? `item-${item.id}` : `new-item-${itemIndex}`}
                                            draggableId={item.id ? `item-${item.id}` : `new-item-${itemIndex}`}
                                            index={itemIndex}
                                          >
                                            {(provided, snapshot) => (
                                              <React.Fragment>
                                                <ListItem
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    py: 1,
                                                    borderRadius: 1,
                                                    backgroundColor: snapshot.isDragging ? 'rgba(0, 0, 0, 0.07)' : 'transparent',
                                                    '&:hover': {
                                                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                    }
                                                  }}
                                                >
                                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}>
                                                    <Box 
                                                      {...provided.dragHandleProps}
                                                      sx={{ 
                                                        cursor: 'grab', 
                                                        display: 'flex', 
                                                        alignItems: 'center' 
                                                      }}
                                                    >
                                                      <DragIndicatorIcon sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
                                                    </Box>
                                                    <Box>
                                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Typography variant="subtitle2">{item.name}</Typography>
                                                        {!item.active && (
                                                          <Typography 
                                                            variant="caption" 
                                                            sx={{ ml: 1, color: 'text.secondary' }}
                                                          >
                                                            (Inactive)
                                                          </Typography>
                                                        )}
                                                      </Box>
                                                      {item.description && (
                                                        <Typography variant="body2" color="text.secondary">
                                                          {item.description}
                                                        </Typography>
                                                      )}
                                                    </Box>
                                                  </Box>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                                    {item.price && (
                                                      <Typography sx={{ mr: 2 }}>${item.price}</Typography>
                                                    )}
                                                    {item.recipeId && (
                                                      <Tooltip title="Linked to Recipe">
                                                        <RecipeIcon 
                                                          fontSize="small" 
                                                          color="primary" 
                                                          sx={{ mr: 2 }}
                                                        />
                                                      </Tooltip>
                                                    )}
                                                    <IconButton 
                                                      size="small" 
                                                      onClick={() => handleEditItem(sectionIndex, actualItemIndex)}
                                                      sx={{ mr: 1 }}
                                                    >
                                                      <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton 
                                                      size="small" 
                                                      onClick={() => handleDeleteItem(sectionIndex, actualItemIndex)}
                                                      color="error"
                                                    >
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  </Box>
                                                </ListItem>
                                                <Divider component="li" />
                                              </React.Fragment>
                                            )}
                                          </Draggable>
                                        );
                                      })}
                                      {provided.placeholder}
                                    </List>
                                  )}
                                </Droppable>
                              )}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Section Dialog */}
      <SectionDialog
        open={sectionDialogOpen}
        onClose={() => setSectionDialogOpen(false)}
        onSave={handleSaveSectionDialog}
        initialData={
          editMode && currentSectionIndex !== null ? {
            name: sections[currentSectionIndex].name,
            active: sections[currentSectionIndex].active !== false
          } : undefined
        }
        title={editMode ? "Edit Section" : "Add Section"}
      />

      {/* Item Dialog */}
      <ItemDialog
        open={itemDialogOpen}
        onClose={() => setItemDialogOpen(false)}
        onSave={handleSaveItemDialog}
        initialData={
          editMode && currentSectionIndex !== null && currentItemIndex !== null ? {
            name: sections[currentSectionIndex].items[currentItemIndex].name,
            description: sections[currentSectionIndex].items[currentItemIndex].description || '',
            price: sections[currentSectionIndex].items[currentItemIndex].price || '',
            active: sections[currentSectionIndex].items[currentItemIndex].active !== false,
            recipeId: sections[currentSectionIndex].items[currentItemIndex].recipeId || null
          } : undefined
        }
        title={editMode ? "Edit Item" : "Add Item"}
      />
    </Box>
  );
};

export default MenuSectionsEditor; 