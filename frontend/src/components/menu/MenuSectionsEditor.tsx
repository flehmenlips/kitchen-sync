import React, { useState } from 'react';
import { 
  Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails, 
  TextField, IconButton, List, ListItem, Divider, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { MenuSection, MenuItem } from '../../services/apiService';

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
  onSave: (itemData: { name: string; description: string; price: string; active: boolean }) => void;
  initialData?: { name: string; description: string; price: string; active: boolean };
  title: string;
}

const SectionDialog: React.FC<SectionDialogProps> = ({ 
  open, onClose, onSave, initialData, title 
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [active, setActive] = useState(initialData?.active !== false);

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

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, description, price, active });
    onClose();
  };

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
        active: itemData.active
      };
    } else {
      // Add new item
      const newItem: MenuItem = {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        active: itemData.active,
        position: items.length
      };
      items.push(newItem);
    }
    
    section.items = items;
    newSections[currentSectionIndex] = section;
    onChange(newSections);
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
        visibleSections.map((section, sectionIndex) => (
          <Accordion 
            key={section.id || `new-section-${sectionIndex}`}
            expanded={expandedSection === `section-${sectionIndex}`}
            onChange={handleSectionChange(`section-${sectionIndex}`)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`section-${sectionIndex}-content`}
              id={`section-${sectionIndex}-header`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary' }} />
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
                  <List sx={{ width: '100%' }}>
                    {section.items.filter(item => !item.deleted).map((item, itemIndex) => {
                      // Find the actual index in the original array for editing/deleting
                      const actualItemIndex = section.items.findIndex(i => 
                        item.id ? i.id === item.id : i === item
                      );
                      
                      return (
                        <React.Fragment key={item.id || `new-item-${itemIndex}`}>
                          <ListItem
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              py: 1,
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}>
                              <DragIndicatorIcon sx={{ mt: 0.5, mr: 1, color: 'text.secondary' }} />
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
                      );
                    })}
                  </List>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
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
            active: sections[currentSectionIndex].items[currentItemIndex].active !== false
          } : undefined
        }
        title={editMode ? "Edit Item" : "Add Item"}
      />
    </Box>
  );
};

export default MenuSectionsEditor; 