import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Box
} from '@mui/material';

interface DeleteConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    content: string;
    isLoading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    content,
    isLoading = false
}) => {
    const handleConfirm = async () => {
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Error during deletion:', error);
            // Error handling can be extended here
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
        >
            <DialogTitle id="delete-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-dialog-description">
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Box sx={{ position: 'relative' }}>
                    <Button 
                        onClick={handleConfirm} 
                        color="error" 
                        variant="contained"
                        disabled={isLoading}
                    >
                        Delete
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
        </Dialog>
    );
};

export default DeleteConfirmationDialog; 