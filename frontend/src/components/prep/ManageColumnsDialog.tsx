import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { PrepColumn } from '../../types/prep';
import { PrepColumnManager } from './PrepColumnManager';

interface ManageColumnsDialogProps {
    open: boolean;
    onClose: () => void;
    columns: PrepColumn[];
    onColumnsChange: () => void;
}

export const ManageColumnsDialog: React.FC<ManageColumnsDialogProps> = ({
    open,
    onClose,
    columns,
    onColumnsChange
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle sx={{ m: 0, p: 2, pr: 6 }}>
                Manage Prep Board Columns
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <PrepColumnManager
                    columns={columns}
                    onColumnsChange={onColumnsChange}
                />
            </DialogContent>
        </Dialog>
    );
}; 