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
    Alert
} from '@mui/material';
import { PrepColumn, CreatePrepColumnInput, UpdatePrepColumnInput } from '../../types/prep';

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
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (open) {
            // Initialize form with column data if in edit mode
            if (column) {
                setName(column.name);
            } else {
                setName('');
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
            await onSave({ name: name.trim() });
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