import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Box, Paper, Typography } from '@mui/material';
import { PrepColumn as ColumnType } from './types';
import PrepCard from './PrepCard';
import { COLUMN_IDS } from '../../stores/prepBoardStore';

interface PrepColumnProps {
    column: ColumnType;
    provided: any;
    onDelete: (taskId: string) => void;
    onViewRecipe: (taskId: string) => void;
}

const getColumnColor = (columnId: string) => {
    switch (columnId) {
        case COLUMN_IDS.TO_PREP:
            return 'info.main';
        case COLUMN_IDS.PREPPING:
            return 'warning.main';
        case COLUMN_IDS.READY:
            return 'success.main';
        case COLUMN_IDS.COMPLETE:
            return 'text.secondary';
        default:
            return 'primary.main';
    }
};

export const PrepColumn: React.FC<PrepColumnProps> = ({ column, provided, onDelete, onViewRecipe }) => {
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                    borderTop: 3,
                    borderColor: getColumnColor(column.id)
                }}
                elevation={2}
            >
                <Typography variant="h6" sx={{ color: getColumnColor(column.id) }}>
                    {column.title} ({column.tasks.length})
                </Typography>
            </Paper>

            <Paper
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{
                    p: 1,
                    flexGrow: 1,
                    minHeight: '100px',
                    backgroundColor: 'background.default',
                    overflowY: 'auto'
                }}
            >
                {column.tasks.map((task, index) => (
                    <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                    >
                        {(provided, snapshot) => (
                            <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ mb: 1 }}
                            >
                                <PrepCard 
                                    task={task} 
                                    onDelete={onDelete}
                                    onViewRecipe={onViewRecipe}
                                />
                            </Box>
                        )}
                    </Draggable>
                ))}
                {provided.placeholder}
            </Paper>
        </Box>
    );
}; 