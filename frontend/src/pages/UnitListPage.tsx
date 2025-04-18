import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getUnits, UnitOfMeasure, deleteUnit } from '../services/apiService';

// Import MUI components
import Container from '@mui/material/Container';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Stack from '@mui/material/Stack';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import ListItemIcon from '@mui/material/ListItemIcon';

// Type for grouped data
interface GroupedUnits {
  [unitType: string]: UnitOfMeasure[];
}

const OTHER_TYPE_KEY = 'Other / Unspecified';
const LOCAL_STORAGE_KEY_UNITS = 'kitchenSyncUnitTypeState';

const UnitListPage: React.FC = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<UnitOfMeasure | null>(null);
  const { showSnackbar } = useSnackbar();

  // State for collapse state, loaded from localStorage
  const [openTypes, setOpenTypes] = useState<{ [key: string]: boolean }>(() => {
      try {
        const savedState = localStorage.getItem(LOCAL_STORAGE_KEY_UNITS);
        return savedState ? JSON.parse(savedState) : {};
    } catch (error) { return {}; }
  });

  useEffect(() => {
    fetchUnits();
  }, []);

   const fetchUnits = async () => {
      try {
        setLoading(true);
        const data = await getUnits();
        setUnits(data);
        setError(null);
        // Initialize open state for types not in storage
        setOpenTypes(prevState => {
             const newState = { ...prevState };
             let updated = false;
             const allTypeNames = new Set<string>([OTHER_TYPE_KEY]);
             data.forEach(unit => { allTypeNames.add(unit.type || OTHER_TYPE_KEY); });
             allTypeNames.forEach(typeName => {
                 if (!(typeName in newState)) {
                     newState[typeName] = true; // Default new types to open
                     updated = true;
                 }
             });
             return updated ? newState : prevState;
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch units. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

  // Save open state to localStorage
   useEffect(() => {
      if (Object.keys(openTypes).length > 0 && !loading) {
        try {
             localStorage.setItem(LOCAL_STORAGE_KEY_UNITS, JSON.stringify(openTypes));
        } catch (error) {
            console.error('Failed to save open types to localStorage:', error);
        }
      }
  }, [openTypes, loading]);

  // Group units by type
  const groupedUnits = useMemo(() => {
    return units.reduce<GroupedUnits>((acc, unit) => {
      const typeName = unit.type || OTHER_TYPE_KEY;
      if (!acc[typeName]) acc[typeName] = [];
      acc[typeName].push(unit);
      return acc;
    }, {});
  }, [units]);

  // Sort type names
  const sortedTypeNames = useMemo(() => {
      return Object.keys(groupedUnits).sort((a, b) => {
          if (a === OTHER_TYPE_KEY) return 1;
          if (b === OTHER_TYPE_KEY) return -1;
          return a.localeCompare(b);
      });
  }, [groupedUnits]);

  const handleTypeClick = (typeName: string) => {
    setOpenTypes(prev => ({ ...prev, [typeName]: !prev[typeName] }));
  };

  const handleDeleteClick = (unit: UnitOfMeasure) => {
    setDialogError(null);
    setUnitToDelete(unit);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUnitToDelete(null);
    setDialogError(null);
  };

  const handleConfirmDelete = async () => {
    if (!unitToDelete) return;
    const unitId = unitToDelete.id;

    setIsDeleting(true);
    setDialogError(null);

    try {
        await deleteUnit(unitId);
        console.log('Unit deleted successfully');
        setUnits(prevUnits => prevUnits.filter(u => u.id !== unitId));
        handleCloseDialog();
    } catch (err: any) {
        console.error('Failed to delete unit:', err);
        const backendErrorMsg = err.response?.data?.message || err.message || 'Failed to delete unit.';
        const isInUse = backendErrorMsg.toLowerCase().includes('currently used') || 
                        backendErrorMsg.toLowerCase().includes('foreign key constraint'); 
        
        const displayError = isInUse 
            ? "This unit is in use in one or more recipes and cannot be deleted. Please remove it from all recipes before deleting." 
            : `Error: ${backendErrorMsg}`;

        setDialogError(displayError);
    } finally {
         setIsDeleting(false);
    }
  };

  if (loading) {
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
    <Container maxWidth="md" sx={{ mt: 2 }}>
         <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link component={RouterLink} underline="hover" color="inherit" to="/">
                KitchenSync
            </Link>
            <Typography color="text.primary">Units of Measure</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
                Units of Measure
            </Typography>
            <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                component={RouterLink} 
                to="/units/new"
            >
                Add Unit
            </Button>
        </Box>
      
        {units.length === 0 && !loading ? (
            <Typography sx={{ mt: 2 }}>No units found.</Typography>
        ) : (
             <List component="nav" aria-labelledby="unit-list-subheader">
                {sortedTypeNames.map((typeName) => (
                    <React.Fragment key={typeName}>
                        <ListItemButton onClick={() => handleTypeClick(typeName)}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <ScienceIcon fontSize="small" />
                            </ListItemIcon>
                           <ListItemText primary={typeName} primaryTypographyProps={{ fontWeight: 'medium' }} />
                           {!!openTypes[typeName] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={!!openTypes[typeName]} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 4 }}>
                            {groupedUnits[typeName].map((unit) => (
                                <ListItem 
                                    key={unit.id} 
                                    disablePadding
                                    secondaryAction={
                                        <Stack direction="row" spacing={0.5}>
                                            <IconButton edge="end" component={RouterLink} to={`/units/${unit.id}/edit`} size="small" title="Edit Unit">
                                                <EditIcon fontSize="small"/>
                                             </IconButton>
                                             <IconButton edge="end" onClick={() => handleDeleteClick(unit)} disabled={isDeleting && unitToDelete?.id === unit.id} color="error" size="small" title="Delete Unit">
                                                  <DeleteIcon fontSize="small"/>
                                             </IconButton>
                                        </Stack>
                                    }
                                >
                                    <ListItemButton component={RouterLink} to={`/units/${unit.id}/edit`} sx={{ pr: 15 }}>
                                        <ListItemText
                                            primary={`${unit.name}${unit.abbreviation ? ` (${unit.abbreviation})` : ''}`}
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

        {unitToDelete && (
            <ConfirmationDialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                contentText={`Are you sure you want to delete the unit "${unitToDelete?.name || ''}"? This action cannot be undone.`}
                errorText={dialogError}
                isProcessing={isDeleting}
                confirmText="Delete"
            />
        )}
    </Container>
  );
};

import { useSnackbar } from '../context/SnackbarContext';

export default UnitListPage; 