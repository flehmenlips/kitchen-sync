import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Box from '@mui/material/Box';
import { PrepTask } from '../../types/prep';

interface PrepCardProps {
    task: PrepTask;
    index: number;
    onDelete: (taskId: string) => void;
    onViewRecipe: (taskId: string) => void;
}

const PrepCard: React.FC<PrepCardProps> = ({ task, index, onDelete, onViewRecipe }) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <Card 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    sx={{ 
                        width: '100%', 
                        mb: 1,
                        backgroundColor: snapshot.isDragging ? '#f0f7ff' : '#fff',
                        boxShadow: snapshot.isDragging 
                            ? '0px 5px 10px rgba(0, 0, 0, 0.1)' 
                            : '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
                        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                        '&:hover': {
                            backgroundColor: snapshot.isDragging ? '#f0f7ff' : '#f5f5f5',
                        }
                    }}
                >
                    <CardContent sx={{ pb: 1, "&:last-child": { pb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                flex: 1,
                                cursor: 'grab',
                                '&:active': {
                                    cursor: 'grabbing',
                                }
                            }} 
                            {...provided.dragHandleProps}
                            >
                                <DragIndicatorIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.2rem' }} />
                                <Box>
                                    <Typography variant="h6" component="div" sx={{ fontSize: '1rem' }}>
                                        {task.title}
                                    </Typography>
                                    {task.description && (
                                        <Typography variant="body2" color="text.secondary">
                                            {task.description}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            <Box>
                                {task.recipeId && (
                                    <IconButton 
                                        size="small" 
                                        onClick={() => onViewRecipe(task.id)}
                                        sx={{ mr: 1 }}
                                    >
                                        <VisibilityIcon />
                                    </IconButton>
                                )}
                                <IconButton 
                                    size="small" 
                                    onClick={() => onDelete(task.id)}
                                    color="error"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Draggable>
    );
};

export default PrepCard; 