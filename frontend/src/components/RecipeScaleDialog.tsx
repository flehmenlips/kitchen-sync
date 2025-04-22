import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider
} from '@mui/material';

export interface ScaleOptions {
    type: 'multiply' | 'divide' | 'constraint';
    value: number;
    constraintIngredientId?: number;
    constraintQuantity?: number;
    constraintUnitId?: number;
}

interface RecipeScaleDialogProps {
    open: boolean;
    onClose: () => void;
    onScale: (options: ScaleOptions) => void;
    ingredients: Array<{
        id: number;
        name: string;
        quantity: number;
        unit: { id: number; name: string };
    }>;
}

const PRESET_MULTIPLIERS = [2, 3, 4];
const PRESET_DIVIDERS = [2, 3, 4];

export const RecipeScaleDialog: React.FC<RecipeScaleDialogProps> = ({
    open,
    onClose,
    onScale,
    ingredients
}) => {
    const [scaleType, setScaleType] = useState<'multiply' | 'divide' | 'constraint'>('multiply');
    const [multiplier, setMultiplier] = useState<number>(2);
    const [divider, setDivider] = useState<number>(2);
    const [customValue, setCustomValue] = useState<string>('');
    const [constraintIngredient, setConstraintIngredient] = useState<number | ''>('');
    const [constraintQuantity, setConstraintQuantity] = useState<string>('');

    const handleScale = () => {
        let value: number;
        
        switch (scaleType) {
            case 'multiply':
                value = customValue ? parseFloat(customValue) : multiplier;
                break;
            case 'divide':
                value = customValue ? 1 / parseFloat(customValue) : 1 / divider;
                break;
            case 'constraint':
                if (!constraintIngredient || !constraintQuantity) return;
                const ingredient = ingredients.find(i => i.id === constraintIngredient);
                if (!ingredient) return;
                value = parseFloat(constraintQuantity) / ingredient.quantity;
                break;
            default:
                return;
        }

        onScale({
            type: scaleType,
            value,
            constraintIngredientId: scaleType === 'constraint' ? Number(constraintIngredient) : undefined,
            constraintQuantity: scaleType === 'constraint' ? parseFloat(constraintQuantity) : undefined,
            constraintUnitId: scaleType === 'constraint' && constraintIngredient ? 
                ingredients.find(i => i.id === constraintIngredient)?.unit.id : undefined
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Scale Recipe</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <RadioGroup
                        value={scaleType}
                        onChange={(e) => {
                            setScaleType(e.target.value as 'multiply' | 'divide' | 'constraint');
                            setCustomValue('');
                        }}
                    >
                        <FormControlLabel 
                            value="multiply" 
                            control={<Radio />} 
                            label="Multiply Recipe" 
                        />
                        {scaleType === 'multiply' && (
                            <Box sx={{ pl: 4, mb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    {PRESET_MULTIPLIERS.map(m => (
                                        <Button
                                            key={m}
                                            variant={multiplier === m && !customValue ? "contained" : "outlined"}
                                            onClick={() => {
                                                setMultiplier(m);
                                                setCustomValue('');
                                            }}
                                            size="small"
                                        >
                                            {m}x
                                        </Button>
                                    ))}
                                </Box>
                                <TextField
                                    label="Custom multiplier"
                                    type="number"
                                    value={customValue}
                                    onChange={(e) => setCustomValue(e.target.value)}
                                    size="small"
                                    inputProps={{ min: "0", step: "0.25" }}
                                />
                            </Box>
                        )}

                        <FormControlLabel 
                            value="divide" 
                            control={<Radio />} 
                            label="Divide Recipe" 
                        />
                        {scaleType === 'divide' && (
                            <Box sx={{ pl: 4, mb: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    {PRESET_DIVIDERS.map(d => (
                                        <Button
                                            key={d}
                                            variant={divider === d && !customValue ? "contained" : "outlined"}
                                            onClick={() => {
                                                setDivider(d);
                                                setCustomValue('');
                                            }}
                                            size="small"
                                        >
                                            1/{d}
                                        </Button>
                                    ))}
                                </Box>
                                <TextField
                                    label="Custom divider"
                                    type="number"
                                    value={customValue}
                                    onChange={(e) => setCustomValue(e.target.value)}
                                    size="small"
                                    inputProps={{ min: "0", step: "0.25" }}
                                />
                            </Box>
                        )}

                        <FormControlLabel 
                            value="constraint" 
                            control={<Radio />} 
                            label="Scale Based on Ingredient" 
                        />
                        {scaleType === 'constraint' && (
                            <Box sx={{ pl: 4, mb: 2 }}>
                                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                                    <InputLabel>Base Ingredient</InputLabel>
                                    <Select
                                        value={constraintIngredient}
                                        onChange={(e) => setConstraintIngredient(e.target.value as number)}
                                        label="Base Ingredient"
                                    >
                                        {ingredients.map(ing => (
                                            <MenuItem key={ing.id} value={ing.id}>
                                                {ing.name} ({ing.quantity} {ing.unit.name})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {constraintIngredient && (
                                    <TextField
                                        label="Desired Quantity"
                                        type="number"
                                        value={constraintQuantity}
                                        onChange={(e) => setConstraintQuantity(e.target.value)}
                                        size="small"
                                        fullWidth
                                        InputProps={{
                                            endAdornment: ingredients.find(i => i.id === constraintIngredient)?.unit.name
                                        }}
                                        inputProps={{ min: "0", step: "0.25" }}
                                    />
                                )}
                            </Box>
                        )}
                    </RadioGroup>

                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                        Note: The scaling engine will intelligently round certain ingredients (like eggs) 
                        to maintain practical measurements while preserving the recipe's proportions.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleScale} 
                    variant="contained"
                    disabled={
                        (scaleType === 'constraint' && (!constraintIngredient || !constraintQuantity)) ||
                        (scaleType !== 'constraint' && !customValue && !multiplier && !divider)
                    }
                >
                    Scale Recipe
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 