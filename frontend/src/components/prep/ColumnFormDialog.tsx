import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    Box,
    Alert,
    MenuItem,
    Select,
    Grid,
    Typography
} from '@mui/material';
import { PrepColumn, CreatePrepColumnInput, UpdatePrepColumnInput } from '../../types/prep';

// Predefined color palette
const colorOptions = [
    { name: 'Blue', value: '#1976d2' },
    { name: 'Red', value: '#d32f2f' },
    { name: 'Green', value: '#2e7d32' },
    { name: 'Orange', value: '#ed6c02' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Teal', value: '#009688' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Indigo', value: '#3f51b5' },
    { name: 'Yellow', value: '#ffc107' },
    { name: 'Cyan', value: '#00bcd4' },
    { name: 'Brown', value: '#795548' },
    { name: 'Grey', value: '#757575' }
];

interface ColumnFormDialogProps {
    open: boolean;
    onClose: () => void;
    column?: PrepColumn; // If provided, we're in edit mode
    onSave: (columnData: CreatePrepColumnInput | UpdatePrepColumnInput) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
}

const ColumnFormDialog: React.FC<ColumnFormDialogProps> = ({ 
    open, 
    onClose, 
    column, 
    onSave,
    isLoading = false,
    error = null
}) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#1976d2'); // Default blue
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (open) {
            // Initialize form with column data if in edit mode
            if (column) {
                setName(column.name);
                setColor(column.color || '#1976d2');
            } else {
                setName('');
                setColor('#1976d2');
            }
            setNameError('');
        }
    }, [open, column]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!name.trim()) {
            setNameError('Column name is required');
            return;
        }

        try {
            await onSave({ 
                name: name.trim(),
                color
            });
            onClose();
        } catch (err) {
            console.error('Error saving column:', err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {column ? 'Edit Column' : 'Create New Column'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <FormControl fullWidth margin="normal">
                        <TextField
                            autoFocus
                            label="Column Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (e.target.value.trim()) {
                                    setNameError('');
                                }
                            }}
                            error={!!nameError}
                            helperText={nameError}
                            disabled={isLoading}
                            fullWidth
                            margin="dense"
                        />
                    </FormControl>
                    
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="column-color-label">Column Color</InputLabel>
                        <Select
                            labelId="column-color-label"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            label="Column Color"
                            disabled={isLoading}
                        >
                            {colorOptions.map((colorOption) => (
                                <MenuItem key={colorOption.value} value={colorOption.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box 
                                            sx={{ 
                                                width: 24, 
                                                height: 24, 
                                                bgcolor: colorOption.value,
                                                borderRadius: 1,
                                                mr: 1
                                            }} 
                                        />
                                        <Typography>{colorOption.name}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Box sx={{ position: 'relative' }}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={isLoading || !name.trim()}
                        >
                            {column ? 'Update' : 'Create'}
                        </Button>
                        {isLoading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        )}
                    </Box>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ColumnFormDialog; 