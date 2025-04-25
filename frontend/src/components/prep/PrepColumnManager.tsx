import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    TextField,
    Typography,
    Box
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PrepColumn } from '../../types/prep';
import { createPrepColumn, updatePrepColumn, deletePrepColumn } from '../../services/prepColumnService';
import { useSnackbar } from 'notistack';

interface PrepColumnManagerProps {
    columns: PrepColumn[];
    onColumnsChange: () => void;
}

interface ColumnDialogState {
    open: boolean;
    mode: 'add' | 'edit';
    column?: PrepColumn;
}

export const PrepColumnManager: React.FC<PrepColumnManagerProps> = ({ columns, onColumnsChange }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [dialogState, setDialogState] = useState<ColumnDialogState>({
        open: false,
        mode: 'add'
    });
    const [columnName, setColumnName] = useState('');
    const [columnColor, setColumnColor] = useState('#1976d2');

    const handleOpenDialog = (mode: 'add' | 'edit', column?: PrepColumn) => {
        setDialogState({ open: true, mode, column });
        if (mode === 'edit' && column) {
            setColumnName(column.name);
            setColumnColor(column.color);
        } else {
            setColumnName('');
            setColumnColor('#1976d2');
        }
    };

    const handleCloseDialog = () => {
        setDialogState({ open: false, mode: 'add' });
        setColumnName('');
        setColumnColor('#1976d2');
    };

    const handleSubmit = async () => {
        try {
            if (dialogState.mode === 'add') {
                await createPrepColumn({ name: columnName, color: columnColor });
                enqueueSnackbar('Column created successfully', { variant: 'success' });
            } else if (dialogState.mode === 'edit' && dialogState.column) {
                await updatePrepColumn(dialogState.column.id, {
                    name: columnName,
                    color: columnColor
                });
                enqueueSnackbar('Column updated successfully', { variant: 'success' });
            }
            onColumnsChange();
            handleCloseDialog();
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.message || 'Error managing column',
                { variant: 'error' }
            );
        }
    };

    const handleDelete = async (column: PrepColumn) => {
        try {
            await deletePrepColumn(column.id);
            enqueueSnackbar('Column deleted successfully', { variant: 'success' });
            onColumnsChange();
        } catch (error: any) {
            enqueueSnackbar(
                error.response?.data?.message || 'Error deleting column',
                { variant: 'error' }
            );
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Manage Columns</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => handleOpenDialog('add')}
                >
                    Add Column
                </Button>
            </Box>

            <List>
                {columns.map((column) => (
                    <ListItem
                        key={column.id}
                        sx={{
                            borderLeft: `4px solid ${column.color}`,
                            mb: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                        }}
                    >
                        <ListItemText
                            primary={column.name}
                            secondary={`${column.tasks.length} tasks`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                aria-label="edit"
                                onClick={() => handleOpenDialog('edit', column)}
                                sx={{ mr: 1 }}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDelete(column)}
                                disabled={column.tasks.length > 0}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={dialogState.open} onClose={handleCloseDialog}>
                <DialogTitle>
                    {dialogState.mode === 'add' ? 'Add New Column' : 'Edit Column'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Column Name"
                        type="text"
                        fullWidth
                        value={columnName}
                        onChange={(e) => setColumnName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Column Color"
                        type="color"
                        fullWidth
                        value={columnColor}
                        onChange={(e) => setColumnColor(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!columnName.trim()}
                    >
                        {dialogState.mode === 'add' ? 'Add' : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}; 