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
import { PrepColumn } from '../../types/prep';

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
    onSave: (column: { name: string; color: string }) => void;
    column?: PrepColumn;
    isLoading?: boolean;
}

const ColumnFormDialog: React.FC<ColumnFormDialogProps> = ({
    open,
    onClose,
    onSave,
    column,
    isLoading = false
}) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#1976d2'); // Default blue
    const [error, setError] = useState('');

    // Initialize form when column is provided (editing mode)
    useEffect(() => {
        if (column) {
            setName(column.name);
            setColor(column.color || '#1976d2');
        } else {
            setName('');
            setColor('#1976d2');
        }
    }, [column, open]);

    const handleSave = () => {
        if (!name.trim()) {
            setError('Column name is required');
            return;
        }

        onSave({
            name: name.trim(),
            color
        });
    };

    const handleClose = () => {
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {column ? 'Edit Column' : 'Add New Column'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Column Name"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="column-color-select-label">Column Color</InputLabel>
                        <Select
                            labelId="column-color-select-label"
                            id="column-color-select"
                            value={color}
                            label="Column Color"
                            onChange={(e) => setColor(e.target.value)}
                        >
                            {colorOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box 
                                            sx={{ 
                                                width: 24, 
                                                height: 24, 
                                                bgcolor: option.value,
                                                borderRadius: 1,
                                                mr: 1
                                            }} 
                                        />
                                        <Typography>{option.name}</Typography>
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Preview:
                    </Typography>
                    <Box 
                        sx={{ 
                            p: 2, 
                            mb: 2, 
                            borderRadius: 1,
                            boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
                            borderTop: `4px solid ${color}`
                        }}
                    >
                        <Typography variant="body1" fontWeight="bold" sx={{ color: color }}>
                            {name || 'Column Name'}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                    onClick={handleSave}
                    variant="contained"
                    disabled={isLoading}
                    sx={{ 
                        bgcolor: color,
                        '&:hover': {
                            bgcolor: `${color}dd`
                        }
                    }}
                >
                    {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : column ? (
                        'Save Changes'
                    ) : (
                        'Add Column'
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ColumnFormDialog; 