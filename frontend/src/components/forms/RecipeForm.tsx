import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Paper
} from '@mui/material';
import { GridTypeMap } from '@mui/material/Grid';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { getUnits, UnitOfMeasure } from '../../services/apiService';

// Assume we fetch these from the API eventually
// TODO: Fetch units and ingredients from API
const MOCK_INGREDIENTS = [
    { id: 1, name: 'Eggs' },
    { id: 2, name: 'Milk' },
    { id: 3, name: 'Butter' },
    { id: 4, name: 'Salt' },
    { id: 5, name: 'Black Pepper' },
    { id: 6, name: 'Bacon' },
    // Add other ingredients created via API
];
// TODO: Add mock recipes for sub-recipe selection

// Interface for raw form data
interface RecipeFormData {
    name: string;
    description: string;
    yieldQuantity: number | string;
    yieldUnitId: number | string;
    prepTimeMinutes: number | string;
    cookTimeMinutes: number | string;
    tags: string;
    instructions: string;
    ingredients: { 
        ingredientId?: number | string;
        subRecipeId?: number | string; 
        quantity: number | string; 
        unitId: number | string; 
    }[];
}

// Interface for the data structure after processing, ready for API
export interface ProcessedRecipeData {
    name: string;
    description: string;
    yieldQuantity: number | null;
    yieldUnitId: number | null;
    prepTimeMinutes: number | null;
    cookTimeMinutes: number | null;
    tags: string[];
    instructions: string;
    ingredients: { 
        ingredientId?: number;
        subRecipeId?: number; 
        quantity: number; 
        unitId: number; 
        order: number; 
    }[];
}

interface RecipeFormProps {
    onSubmit: (data: ProcessedRecipeData) => void;
    initialData?: Partial<RecipeFormData>; 
    isSubmitting: boolean;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        control,
        register,
        formState: { errors },
        watch
    } = useForm<RecipeFormData>({
        defaultValues: initialData || {
            name: '',
            description: '',
            yieldQuantity: '',
            yieldUnitId: '',
            prepTimeMinutes: '',
            cookTimeMinutes: '',
            tags: '',
            instructions: '',
            ingredients: [{ ingredientId: '', quantity: '', unitId: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "ingredients"
    });

    // State for fetched units
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [unitsLoading, setUnitsLoading] = useState<boolean>(true);
    const [unitsError, setUnitsError] = useState<string | null>(null);

    // Fetch units on component mount
    useEffect(() => {
        const loadUnits = async () => {
            try {
                setUnitsLoading(true);
                const fetchedUnits = await getUnits();
                setUnits(fetchedUnits);
                setUnitsError(null);
            } catch (error) {
                console.error("Failed to fetch units:", error);
                setUnitsError("Could not load units for selection.");
            } finally {
                setUnitsLoading(false);
            }
        };
        loadUnits();
    }, []); // Empty dependency array ensures this runs only once

    const handleFormSubmit = (data: RecipeFormData) => {
        // Process data before calling onSubmit
        const processedData: ProcessedRecipeData = { // Explicitly type processedData
            name: data.name,
            description: data.description,
            instructions: data.instructions,
            tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            yieldQuantity: data.yieldQuantity ? parseFloat(data.yieldQuantity as string) : null,
            yieldUnitId: data.yieldUnitId ? parseInt(data.yieldUnitId as string, 10) : null,
            prepTimeMinutes: data.prepTimeMinutes ? parseInt(data.prepTimeMinutes as string, 10) : null,
            cookTimeMinutes: data.cookTimeMinutes ? parseInt(data.cookTimeMinutes as string, 10) : null,
            ingredients: data.ingredients.map((ing, index) => ({
                ingredientId: ing.ingredientId ? parseInt(ing.ingredientId as string, 10) : undefined,
                subRecipeId: ing.subRecipeId ? parseInt(ing.subRecipeId as string, 10) : undefined,
                quantity: ing.quantity ? parseFloat(ing.quantity as string) : 0, 
                unitId: ing.unitId ? parseInt(ing.unitId as string, 10) : 0, 
                order: index // Add order here
            }))
        };
        onSubmit(processedData);
    };

    // Helper type for Grid item props
    type GridItemProps = DefaultComponentProps<GridTypeMap<{ item?: boolean }, 'div'>>;

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                {/* Basic Recipe Info */}
                <Grid item xs={12} component={'div' as React.ElementType}>
                    <TextField
                        {...register("name", { required: "Recipe name is required" })}
                        label="Recipe Name"
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                </Grid>
                <Grid item xs={12} component={'div' as React.ElementType}>
                    <TextField
                        {...register("description")}
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                    />
                </Grid>
                <Grid item xs={6} sm={3} component={'div' as React.ElementType}>
                    <Controller
                        name="yieldQuantity"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Yield Qty"
                                type="number"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={6} sm={3} component={'div' as React.ElementType}>
                    <FormControl fullWidth error={!!unitsError || unitsLoading}>
                        <InputLabel id="yield-unit-label">Yield Unit</InputLabel>
                        <Controller
                            name="yieldUnitId"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <Select 
                                    labelId="yield-unit-label" 
                                    label="Yield Unit" 
                                    {...field}
                                    disabled={unitsLoading || !!unitsError}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {units.map(unit => (
                                        <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6} sm={3} component={'div' as React.ElementType}>
                    <Controller
                        name="prepTimeMinutes"
                        control={control}
                        render={({ field }) => (
                             <TextField
                                {...field}
                                label="Prep Time (min)"
                                type="number"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={6} sm={3} component={'div' as React.ElementType}>
                    <Controller
                        name="cookTimeMinutes"
                        control={control}
                        render={({ field }) => (
                             <TextField
                                {...field}
                                label="Cook Time (min)"
                                type="number"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} component={'div' as React.ElementType}>
                    <TextField
                        {...register("tags")}
                        label="Tags (comma-separated)"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} component={'div' as React.ElementType}>
                    <TextField
                        {...register("instructions", { required: "Instructions are required" })}
                        label="Instructions"
                        fullWidth
                        required
                        multiline
                        rows={6}
                        error={!!errors.instructions}
                        helperText={errors.instructions?.message}
                    />
                </Grid>

                {/* Dynamic Ingredients Section */}
                <Grid item xs={12} component={'div' as React.ElementType}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Ingredients</Typography>
                    {fields.map((item, index) => (
                         <Paper key={item.id} sx={{ p: 1.5, mb: 1.5, position: 'relative' }}>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item xs={12} sm={4} component={'div' as React.ElementType}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id={`ingredient-type-label-${index}`}>Item</InputLabel>
                                        <Controller
                                            name={`ingredients.${index}.ingredientId`}
                                            control={control}
                                            defaultValue=""
                                            render={({ field }) => (
                                                <Select labelId={`ingredient-type-label-${index}`} label="Item" {...field}>
                                                     <MenuItem value=""><em>Select Ingredient</em></MenuItem>
                                                     {MOCK_INGREDIENTS.map(ing => (
                                                        <MenuItem key={ing.id} value={ing.id}>{ing.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </FormControl>
                                </Grid>
                                 <Grid item xs={5} sm={3} component={'div' as React.ElementType}>
                                    <Controller
                                        name={`ingredients.${index}.quantity`}
                                        control={control}
                                        rules={{ required: 'Qty required' }}
                                        render={({ field, fieldState }) => (
                                            <TextField 
                                                {...field}
                                                label="Qty"
                                                type="number"
                                                fullWidth
                                                required
                                                size="small"
                                                error={!!fieldState.error}
                                            />
                                        )}
                                    />
                                </Grid>
                                 <Grid item xs={5} sm={3} component={'div' as React.ElementType}>
                                    <FormControl fullWidth size="small" error={!!errors.ingredients?.[index]?.unitId || !!unitsError || unitsLoading}>
                                        <InputLabel id={`ingredient-unit-label-${index}`}>Unit</InputLabel>
                                        <Controller
                                            name={`ingredients.${index}.unitId`}
                                            control={control}
                                            defaultValue=""
                                            rules={{ required: 'Unit required' }}
                                            render={({ field }) => (
                                                <Select 
                                                    labelId={`ingredient-unit-label-${index}`} 
                                                    label="Unit" 
                                                    {...field}
                                                    disabled={unitsLoading || !!unitsError}
                                                >
                                                    <MenuItem value=""><em>Unit</em></MenuItem>
                                                    {units.map(unit => (
                                                        <MenuItem key={unit.id} value={unit.id}>{unit.abbreviation || unit.name}</MenuItem>
                                                    ))}
                                                </Select>
                                            )}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2} sm={1} component={'div' as React.ElementType}>
                                    <IconButton 
                                        onClick={() => remove(index)} 
                                        color="error" 
                                        disabled={fields.length <= 1}
                                        sx={{ mt: 0.5 }}
                                    >
                                        <RemoveCircleOutlineIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                    <Button
                        type="button"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => append({ ingredientId: '', quantity: '', unitId: '' })}
                        sx={{ mt: 1 }}
                    >
                        Add Ingredient
                    </Button>
                </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Recipe'}
            </Button>
        </Box>
    );
};

export default RecipeForm; 