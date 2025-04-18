import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import {
    Box,
    TextField,
    Button,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Paper,
    Alert,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    SelectChangeEvent,
    Grid
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
    getUnits,
    UnitOfMeasure,
    getIngredients,
    Ingredient,
    getRecipes,
    Recipe,
    createUnit,
    createIngredient
} from '../../services/apiService';
import UnitForm from './UnitForm';
import IngredientForm from './IngredientForm';

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
        unitId: number | null;
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

    // State for the creation modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'unit' | 'ingredient' | null>(null);
    // Store the index of the ingredient row that triggered the modal
    const [modalTargetIndex, setModalTargetIndex] = useState<number | null>(null); 
    const [modalSubmitError, setModalSubmitError] = useState<string | null>(null);
    const [isModalSubmitting, setIsModalSubmitting] = useState<boolean>(false);

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
                unitId: ing.unitId ? parseInt(ing.unitId as string, 10) : null,
                order: index
            })).filter(ing => ing.ingredientId || ing.subRecipeId)
        };
        onSubmit(processedData);
    };

    // --- Modal Logic --- 
    const handleOpenModal = (type: 'unit' | 'ingredient', index: number) => {
        setModalSubmitError(null); // Clear previous errors
        setModalType(type);
        setModalTargetIndex(index); 
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalType(null);
        setModalTargetIndex(null);
        setModalSubmitError(null);
    };

    // Handle successful creation within the modal
    const handleModalCreateSuccess = (newItem: UnitOfMeasure | Ingredient, type: 'unit' | 'ingredient') => {
        if (type === 'unit') {
            // Optimistically add to state or refetch
            setUnits(prev => [...prev, newItem as UnitOfMeasure].sort((a, b) => a.name.localeCompare(b.name)));
            // If a target index exists (meaning it was triggered from an ingredient row unit select)
            if (modalTargetIndex !== null) {
                setValue(`ingredients.${modalTargetIndex}.unitId`, newItem.id, { shouldValidate: true });
            }
            // TODO: Handle setting yieldUnitId if modal was triggered from there?
        } else if (type === 'ingredient') {
            setIngredientsList(prev => [...prev, newItem as Ingredient].sort((a, b) => a.name.localeCompare(b.name)));
            if (modalTargetIndex !== null) {
                // Also ensure the type is set correctly
                setValue(`ingredients.${modalTargetIndex}.type`, 'ingredient');
                setValue(`ingredients.${modalTargetIndex}.subRecipeId`, ''); // Clear sub-recipe id
                setValue(`ingredients.${modalTargetIndex}.ingredientId`, newItem.id, { shouldValidate: true });
            }
        }
        handleCloseModal();
    };
    
    // --- End Modal Logic ---

    return (
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate sx={{ mt: 1 }}>
            <TextField
                {...register("name", { required: "Recipe name is required" })}
                label="Recipe Name"
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name?.message}
                sx={{ mb: 2 }}
            />
            <TextField
                {...register("description")}
                label="Description"
                fullWidth
                multiline
                rows={2}
                sx={{ mb: 2 }}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Controller
                    name="yieldQuantity"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Yield Qty" type="number" fullWidth InputLabelProps={{ shrink: true }} />
                    )}
                />
                <FormControl fullWidth error={!!unitsError || unitsLoading}>
                    <InputLabel id="yield-unit-label">Yield Unit</InputLabel>
                    <Controller
                        name="yieldUnitId"
                        control={control}
                        defaultValue=""
                        render={({ field }) => {
                            console.log(`Yield Unit Field (${field.name}):`, field.value);
                            return (
                                <Select 
                                    labelId="yield-unit-label" 
                                    label="Yield Unit" 
                                    {...field}
                                    value={field.value ?? ''} 
                                    disabled={unitsLoading || !!unitsError}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {units.map(unit => (
                                        <MenuItem key={unit.id} value={unit.id}>{unit.name}</MenuItem>
                                    ))}
                                </Select>
                            );
                        }}
                    />
                </FormControl>
                <Controller
                    name="prepTimeMinutes"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Prep Time (min)" type="number" fullWidth InputLabelProps={{ shrink: true }} />
                    )}
                />
                <Controller
                    name="cookTimeMinutes"
                    control={control}
                    render={({ field }) => (
                        <TextField {...field} label="Cook Time (min)" type="number" fullWidth InputLabelProps={{ shrink: true }} />
                    )}
                />
            </Stack>
            <TextField
                {...register("tags")}
                label="Tags (comma-separated)"
                fullWidth
                sx={{ mb: 2 }}
            />
            <TextField
                {...register("instructions", { required: "Instructions are required" })}
                label="Instructions"
                fullWidth
                required
                multiline
                rows={6}
                error={!!errors.instructions}
                helperText={errors.instructions?.message}
                sx={{ mb: 2 }}
            />

            <Box>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Ingredients</Typography>
                {(unitsError || ingredientsError) && (
                    <Alert severity="warning" sx={{ mb: 1 }}>
                        {unitsError} {ingredientsError}
                    </Alert>
                )}
                {fields.map((item, index) => {
                    const currentType = watchIngredientTypes?.[index]?.type;
                    return (
                        <Paper key={item.id} sx={{ p: 1.5, mb: 1.5, position: 'relative' }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                                <FormControl fullWidth size="small" required sx={{ minWidth: 120, flexBasis: '20%' }}>
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
                                                value={field.value ?? ''}
                                                onChange={(e) => {
                                                    field.onChange(e);
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
                                </FormControl>

                                <Box sx={{ flexBasis: '35%' }}>
                                    {currentType === 'ingredient' && (
                                        <FormControl fullWidth size="small" error={!!ingredientsError || ingredientsLoading || !!errors.ingredients?.[index]?.ingredientId} required>
                                            <InputLabel id={`ingredient-id-label-${index}`}>Ingredient</InputLabel>
                                            <Controller
                                                name={`ingredients.${index}.ingredientId`}
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: currentType === 'ingredient' ? 'Ingredient required' : false }}
                                                render={({ field }) => {
                                                    const handleIngredientChange = (event: SelectChangeEvent<string | number>) => {
                                                        const value = event.target.value;
                                                        if (value === '__CREATE_NEW__') {
                                                            handleOpenModal('ingredient', index);
                                                        } else {
                                                            field.onChange(event);
                                                        }
                                                    };
                                                    return (
                                                        <Select 
                                                            labelId={`ingredient-id-label-${index}`} 
                                                            label="Ingredient" 
                                                            {...field}
                                                            value={field.value ?? ''} 
                                                            onChange={handleIngredientChange}
                                                            disabled={ingredientsLoading || !!ingredientsError}
                                                            error={!!errors.ingredients?.[index]?.ingredientId}
                                                        >
                                                            <MenuItem value=""><em>Select Ingredient</em></MenuItem>
                                                            <Divider />
                                                            {ingredientsList.map(ing => (
                                                                <MenuItem key={ing.id} value={ing.id}>{ing.name}</MenuItem>
                                                            ))}
                                                            <Divider />
                                                            <MenuItem value="__CREATE_NEW__">
                                                                <Typography color="primary">+ Create New Ingredient</Typography>
                                                            </MenuItem>
                                                        </Select>
                                                    );
                                                }}
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
                                                        value={field.value ?? ''}
                                                        disabled={subRecipesLoading || !!subRecipesError}
                                                        error={!!errors.ingredients?.[index]?.subRecipeId}
                                                    >
                                                        <MenuItem value=""><em>Select Sub-Recipe</em></MenuItem>
                                                        {subRecipesList.map(sr => (
                                                            <MenuItem key={sr.id} value={sr.id}>{sr.name}</MenuItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                        </FormControl>
                                    )}
                                    {!currentType && (
                                        <TextField label="Item" size="small" fullWidth disabled value="Select Type first" />
                                    )}
                                </Box>

                                <Controller
                                    name={`ingredients.${index}.quantity`}
                                    control={control}
                                    rules={{ required: 'Qty required', min: { value: 0.01, message: "Qty > 0"} }}
                                    render={({ field, fieldState }) => (
                                        <TextField 
                                            {...field}
                                            label="Qty"
                                            type="number"
                                            required
                                            size="small"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                            inputProps={{ step: "any" }}
                                            sx={{ flexBasis: '15%' }}
                                        />
                                    )}
                                />
                                <FormControl fullWidth size="small" sx={{ flexBasis: '20%' }} error={!!unitsError || unitsLoading}>
                                    <InputLabel id={`ingredient-unit-label-${index}`}>Unit</InputLabel>
                                    <Controller
                                        name={`ingredients.${index}.unitId`}
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => {
                                            const handleUnitChange = (event: SelectChangeEvent<string | number>) => {
                                                const value = event.target.value;
                                                if (value === '__CREATE_NEW__') {
                                                    handleOpenModal('unit', index);
                                                } else {
                                                    field.onChange(event);
                                                }
                                            };
                                            return (
                                                <Select 
                                                    labelId={`ingredient-unit-label-${index}`}
                                                    label="Unit"
                                                    {...field} 
                                                    value={field.value ?? ''} 
                                                    disabled={unitsLoading || !!unitsError}
                                                    onChange={handleUnitChange}
                                                >
                                                    <MenuItem value=""><em>Unit</em></MenuItem>
                                                    <Divider />
                                                    {units.map(unit => (
                                                        <MenuItem key={unit.id} value={unit.id}>{unit.abbreviation || unit.name}</MenuItem>
                                                    ))}
                                                    <Divider />
                                                    <MenuItem value="__CREATE_NEW__">
                                                         <Typography color="primary">+ Create New Unit</Typography>
                                                     </MenuItem>
                                                </Select>
                                            );
                                        }}
                                    />
                                </FormControl>
                                <Box sx={{ flexBasis: '10%', textAlign: 'center', pt: 0.5 }}>
                                    <IconButton 
                                        onClick={() => remove(index)} 
                                        color="error" 
                                        disabled={fields.length <= 1} 
                                        sx={{ mt: 0.5 }}
                                    >
                                        <RemoveCircleOutlineIcon />
                                    </IconButton>
                                </Box>
                            </Stack>
                        </Paper>
                    );
                })}
                <Button
                    type="button"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => append({ type: '', ingredientId: '', subRecipeId: '', quantity: '', unitId: '' })}
                    sx={{ mt: 1 }}
                >
                    Add Ingredient / Sub-Recipe
                </Button>
            </Box>

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Creating...' : 'Create Recipe'}
            </Button>

            {/* Creation Modal */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogTitle>
                    {modalType === 'unit' ? 'Create New Unit' : 'Create New Ingredient'}
                </DialogTitle>
                <DialogContent>
                    {modalSubmitError && <Alert severity="error" sx={{ mb: 2 }}>{modalSubmitError}</Alert>}
                    {modalType === 'unit' && (
                        <UnitForm 
                            isSubmitting={isModalSubmitting}
                            onSubmit={async (data) => {
                                setIsModalSubmitting(true);
                                setModalSubmitError(null);
                                try {
                                    const newUnit = await createUnit(data);
                                    handleModalCreateSuccess(newUnit, 'unit');
                                } catch (err: any) {
                                    const msg = err.response?.data?.message || err.message || 'Failed to create unit';
                                    setModalSubmitError(msg);
                                } finally {
                                    setIsModalSubmitting(false);
                                }
                            }} 
                        />
                    )}
                     {modalType === 'ingredient' && (
                        <IngredientForm 
                            isSubmitting={isModalSubmitting}
                            onSubmit={async (data) => {
                                 setIsModalSubmitting(true);
                                 setModalSubmitError(null);
                                 try {
                                    const newIng = await createIngredient(data);
                                    handleModalCreateSuccess(newIng, 'ingredient');
                                } catch (err: any) {
                                    const msg = err.response?.data?.message || err.message || 'Failed to create ingredient';
                                    setModalSubmitError(msg);
                                } finally {
                                    setIsModalSubmitting(false);
                                }
                            }}
                        />
                    )}
                </DialogContent>
                 {/* Optional: Add Actions with Cancel button to modal */}
            </Dialog>
        </Box>
    );
};

export default RecipeForm; 