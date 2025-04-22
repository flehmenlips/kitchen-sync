import React from 'react';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Box,
} from '@mui/material';
import { DisplayedIngredient } from '../types/recipe';

interface ConciseRecipeViewProps {
    name: string;
    ingredients: DisplayedIngredient[];
    yieldQuantity: number;
    yieldUnit?: { name: string };
    isScaled?: boolean;
    scaleFactor?: number;
}

export const ConciseRecipeView: React.FC<ConciseRecipeViewProps> = ({
    name,
    ingredients,
    yieldQuantity,
    yieldUnit,
    isScaled,
    scaleFactor,
}) => {
    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            {/* Title and Yield */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'baseline',
                mb: 2,
                borderBottom: '2px solid',
                borderColor: 'divider',
                pb: 1
            }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    {name}
                    {isScaled && ` (${scaleFactor}x)`}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Yield: {yieldQuantity} {yieldUnit?.name || 'servings'}
                </Typography>
            </Box>

            {/* Ingredients List */}
            <List dense disablePadding>
                {ingredients.map((ing, idx) => (
                    <React.Fragment key={ing.id}>
                        {idx > 0 && <Divider />}
                        <ListItem dense disableGutters>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        <Box component="span" sx={{ display: 'inline-block', minWidth: '4rem' }}>
                                            {ing.quantity}
                                        </Box>
                                        <Box component="span" sx={{ display: 'inline-block', minWidth: '4rem' }}>
                                            {ing.unit.abbreviation || ing.unit.name}
                                        </Box>
                                        {ing.ingredient?.name || ''}
                                    </Typography>
                                }
                                secondary={ing.note}
                                secondaryTypographyProps={{ 
                                    variant: 'caption',
                                    sx: { fontStyle: 'italic' }
                                }}
                            />
                        </ListItem>
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}; 