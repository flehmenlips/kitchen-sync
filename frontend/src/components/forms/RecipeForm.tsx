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
    Paper,
    Alert
} from '@mui/material';
import { GridTypeMap } from '@mui/material/Grid';
import { DefaultComponentProps } from '@mui/material/OverridableComponent';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
    getUnits,
    UnitOfMeasure,
    getIngredients,
    Ingredient,
    getRecipes,
    Recipe
} from '../../services/apiService';

// Interface for the raw form data
// Export this interface as well
export interface RecipeFormData {
    name: string;
    description: string;
    yieldQuantity: number | string;
    yieldUnitId: number | string;
    prepTimeMinutes: number | string;
    cookTimeMinutes: number | string;
    tags: string;
    instructions: string;
    ingredients: {
        type: 'ingredient' | 'sub-recipe' | '';
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
        watch,
        setValue
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
            ingredients: [{ type: '', ingredientId: '', quantity: '', unitId: '' }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "ingredients"
    });

    // State for fetched units AND ingredients
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [unitsLoading, setUnitsLoading] = useState<boolean>(true);
    const [unitsError, setUnitsError] = useState<string | null>(null);
    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    const [ingredientsLoading, setIngredientsLoading] = useState<boolean>(true);
    const [ingredientsError, setIngredientsError] = useState<string | null>(null);
    const [subRecipesList, setSubRecipesList] = useState<Recipe[]>([]);
    const [subRecipesLoading, setSubRecipesLoading] = useState<boolean>(true);
    const [subRecipesError, setSubRecipesError] = useState<string | null>(null);

    // Fetch units AND ingredients on component mount
    useEffect(() => {
        const loadSelectData = async () => {
            setUnitsLoading(true);
            setIngredientsLoading(true);
            setSubRecipesLoading(true);
            try {
                const [fetchedUnits, fetchedIngredients, fetchedRecipes] = await Promise.all([
                    getUnits(),
                    getIngredients(),
                    getRecipes()
                ]);
                setUnits(fetchedUnits);
                setIngredientsList(fetchedIngredients);
                setSubRecipesList(fetchedRecipes);
                setUnitsError(null);
                setIngredientsError(null);
                setSubRecipesError(null);
            } catch (error) {
                console.error("Failed to load select data:", error);
                setUnitsError("Could not load units.");
                setIngredientsError("Could not load ingredients.");
                setSubRecipesError("Could not load potential sub-recipes.");
            } finally {
                setUnitsLoading(false);
                setIngredientsLoading(false);
                setSubRecipesLoading(false);
            }
        };
        loadSelectData();
    }, []); 

    // Watch the type field for each ingredient to conditionally render selects
    const watchIngredientTypes = watch("ingredients");

    const handleFormSubmit = (data: RecipeFormData) => {
        // Process data before calling onSubmit
        const processedData: ProcessedRecipeData = {
            name: data.name,
            description: data.description,
            instructions: data.instructions,
            tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            yieldQuantity: data.yieldQuantity ? parseFloat(data.yieldQuantity as string) : null,
            yieldUnitId: data.yieldUnitId ? parseInt(data.yieldUnitId as string, 10) : null,
            prepTimeMinutes: data.prepTimeMinutes ? parseInt(data.prepTimeMinutes as string, 10) : null,
            cookTimeMinutes: data.cookTimeMinutes ? parseInt(data.cookTimeMinutes as string, 10) : null,
            ingredients: data.ingredients.map((ing, index) => ({
                ingredientId: ing.type === 'ingredient' && ing.ingredientId ? parseInt(ing.ingredientId as string, 10) : undefined,
                subRecipeId: ing.type === 'sub-recipe' && ing.subRecipeId ? parseInt(ing.subRecipeId as string, 10) : undefined,
                quantity: ing.quantity ? parseFloat(ing.quantity as string) : 0, 
                unitId: ing.unitId ? parseInt(ing.unitId as string, 10) : 0, 
                order: index
            })).filter(ing => ing.ingredientId || ing.subRecipeId)
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
                    {/* Display overall loading/error for selects */} 
                    {(unitsError || ingredientsError) && (
                        <Alert severity="warning" sx={{ mb: 1 }}>
                            {unitsError} {ingredientsError}
                        </Alert>
                    )}
                    {fields.map((item, index) => {
                         // Get the current type for this row to conditionally render
                         const currentType = watchIngredientTypes?.[index]?.type;
                         return (
                            <Paper key={item.id} sx={{ p: 1.5, mb: 1.5, position: 'relative' }}>
                                <Grid container spacing={1} alignItems="flex-start"> {/* Use flex-start */} 
                                    {/* Type Selector */} 
                                     <Grid item xs={12} sm={2.5} component={'div' as React.ElementType}>
                                        <FormControl fullWidth size="small" required>
                                            <InputLabel id={`ingredient-item-type-label-${index}`}>Type</InputLabel>
                                            <Controller
                                                name={`ingredients.${index}.type`}
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: 'Type required' }}
                                                render={({ field }) => (
                                                    <Select 
                                                        labelId={`ingredient-item-type-label-${index}`} 
                                                        label="Type" 
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e); // Call original onChange
                                                            // Clear the other ID field when type changes
                                                            if (e.target.value === 'ingredient') {
                                                                setValue(`ingredients.${index}.subRecipeId`, '');
                                                            } else if (e.target.value === 'sub-recipe') {
                                                                setValue(`ingredients.${index}.ingredientId`, '');
                                                            }
                                                        }}
                                                        error={!!errors.ingredients?.[index]?.type}
                                                    >
                                                        <MenuItem value=""><em>Select Type</em></MenuItem>
                                                        <MenuItem value="ingredient">Base Ingredient</MenuItem>
                                                        <MenuItem value="sub-recipe">Sub-Recipe</MenuItem>
                                                    </Select>
                                                )}
                                            />
                                            {/* TODO: Add helper text for validation error */} 
                                        </FormControl>
                                    </Grid>

                                    {/* Conditional Ingredient/Sub-Recipe Select */} 
                                    <Grid item xs={12} sm={4.5} component={'div' as React.ElementType}>
                                        {currentType === 'ingredient' && (
                                            <FormControl fullWidth size="small" error={!!ingredientsError || ingredientsLoading || !!errors.ingredients?.[index]?.ingredientId} required>
                                                <InputLabel id={`ingredient-id-label-${index}`}>Ingredient</InputLabel>
                                                <Controller
                                                    name={`ingredients.${index}.ingredientId`}
                                                    control={control}
                                                    defaultValue=""
                                                    rules={{ required: currentType === 'ingredient' ? 'Ingredient required' : false }}
                                                    render={({ field }) => (
                                                        <Select 
                                                            labelId={`ingredient-id-label-${index}`} 
                                                            label="Ingredient" 
                                                            {...field}
                                                            disabled={ingredientsLoading || !!ingredientsError}
                                                            error={!!errors.ingredients?.[index]?.ingredientId}
                                                        >
                                                            <MenuItem value=""><em>Select Ingredient</em></MenuItem>
                                                            {ingredientsList.map(ing => (
                                                                <MenuItem key={ing.id} value={ing.id}>{ing.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    )}
                                                />
                                            </FormControl>
                                        )}
                                         {currentType === 'sub-recipe' && (
                                            <FormControl fullWidth size="small" error={!!subRecipesError || subRecipesLoading || !!errors.ingredients?.[index]?.subRecipeId} required>
                                                <InputLabel id={`subrecipe-id-label-${index}`}>Sub-Recipe</InputLabel>
                                                <Controller
                                                    name={`ingredients.${index}.subRecipeId`}
                                                    control={control}
                                                    defaultValue=""
                                                    rules={{ required: currentType === 'sub-recipe' ? 'Sub-recipe required' : false }}
                                                    render={({ field }) => (
                                                        <Select 
                                                            labelId={`subrecipe-id-label-${index}`} 
                                                            label="Sub-Recipe" 
                                                            {...field}
                                                            disabled={subRecipesLoading || !!subRecipesError}
                                                            error={!!errors.ingredients?.[index]?.subRecipeId}
                                                        >
                                                            <MenuItem value=""><em>Select Sub-Recipe</em></MenuItem>
                                                            {/* TODO: Filter out the current recipe being edited if applicable */}
                                                            {subRecipesList.map(sr => (
                                                                <MenuItem key={sr.id} value={sr.id}>{sr.name}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    )}
                                                />
                                            </FormControl>
                                        )}
                                         {/* Show placeholder if type not selected */} 
                                         {!currentType && (
                                            <TextField label="Item" size="small" fullWidth disabled value="Select Type first" />
                                         )}
                                    </Grid>

                                    {/* Quantity Input */} 
                                     <Grid item xs={5} sm={2} component={'div' as React.ElementType}>
                                        <Controller
                                            name={`ingredients.${index}.quantity`}
                                            control={control}
                                            rules={{ required: 'Qty required', min: { value: 0.01, message: "Qty > 0"} }}
                                            render={({ field, fieldState }) => (
                                                <TextField 
                                                    {...field}
                                                    label="Qty"
                                                    type="number"
                                                    fullWidth
                                                    required
                                                    size="small"
                                                    error={!!fieldState.error}
                                                    helperText={fieldState.error?.message}
                                                    inputProps={{ step: "any" }} // Allow decimals
                                                />
                                            )}
                                        />
                                    </Grid>
                                     {/* Unit Select */} 
                                     <Grid item xs={5} sm={2} component={'div' as React.ElementType}>
                                        <FormControl fullWidth size="small" error={!!errors.ingredients?.[index]?.unitId || !!unitsError || unitsLoading} required>
                                            <InputLabel id={`ingredient-unit-label-${index}`}>Unit</InputLabel>
                                            <Controller
                                                name={`ingredients.${index}.unitId`}
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: 'Unit required' }}
                                                render={({ field }) => (
                                                    <Select /* ... props ... */ >
                                                         <MenuItem value=""><em>Unit</em></MenuItem>
                                                        {units.map(unit => (
                                                            <MenuItem key={unit.id} value={unit.id}>{unit.abbreviation || unit.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                        </FormControl>
                                    </Grid>
                                    {/* Remove Button */} 
                                    <Grid item xs={2} sm={1} component={'div' as React.ElementType} sx={{ textAlign: 'center' }}>
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
                        );
                    })}
                    <Button
                        type="button"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => append({ type: '', ingredientId: '', subRecipeId: '', quantity: '', unitId: '' })} // Add type and subRecipeId to default append
                        sx={{ mt: 1 }}
                    >
                        Add Ingredient / Sub-Recipe
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