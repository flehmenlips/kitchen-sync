import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, Button, Stack, FormControl, InputLabel, Select, MenuItem, Autocomplete, CircularProgress, Alert, Typography } from '@mui/material';
import { getIngredientCategories, IngredientCategory, createIngredientCategory } from '../../services/apiService';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IngredientCategoryForm from './IngredientCategoryForm';

// Interface for the raw form data
interface IngredientFormShape {
    name: string;
    description: string; // Form fields are strings
    ingredientCategoryId: number | string; // Store ID or empty string
}

interface IngredientFormProps {
    onSubmit: (data: IngredientFormShape) => void; // Expect raw form shape
    initialData?: Partial<IngredientFormShape>;
    isSubmitting: boolean;
}

// Add placeholder for Category
const CREATE_NEW_INGR_CATEGORY_OPTION: IngredientCategory = {
    id: -1, name: "+ Create New Category", description: null, createdAt: '', updatedAt: ''
};

const IngredientForm: React.FC<IngredientFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        register,
        control,
        formState: { errors },
        setValue
    } = useForm<IngredientFormShape>({
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            ingredientCategoryId: initialData?.ingredientCategoryId || '',
        }
    });

    // State for categories
    const [categories, setCategories] = useState<IngredientCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    // State for modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalSubmitError, setModalSubmitError] = useState<string | null>(null);
    const [isModalSubmitting, setIsModalSubmitting] = useState<boolean>(false);

    useEffect(() => {
        const loadCategories = async () => {
             try {
                setCategoriesLoading(true);
                const fetchedCategories = await getIngredientCategories();
                setCategories([CREATE_NEW_INGR_CATEGORY_OPTION, ...fetchedCategories]);
                setCategoriesError(null);
            } catch (error) {
                console.error("Failed to fetch ingredient categories:", error);
                setCategoriesError("Could not load categories.");
            } finally {
                setCategoriesLoading(false);
            }
        };
        loadCategories();
    }, []);

    // --- Modal Handlers --- 
    const handleOpenModal = () => {
        setModalSubmitError(null);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalSubmitError(null);
    };

    const handleModalCreateSuccess = (newCategory: IngredientCategory) => {
        // Update category list state
        setCategories(prev => [CREATE_NEW_INGR_CATEGORY_OPTION, ...prev.filter(c => c.id !== -1), newCategory].sort((a, b) => a.id === -1 ? -1 : (b.id === -1 ? 1: a.name.localeCompare(b.name))));
        // Set the value in the form
        setValue(`ingredientCategoryId`, newCategory.id, { shouldValidate: true });
        handleCloseModal();
    };
    // --- End Modal Handlers ---

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <TextField
                    {...register("name", { required: "Ingredient name is required" })}
                    label="Ingredient Name"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />
                <FormControl fullWidth error={!!categoriesError || categoriesLoading}>
                    <Controller
                        name="ingredientCategoryId"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                options={categories}
                                getOptionLabel={(option) => option.name || ''}
                                value={categories.find(cat => cat.id === field.value) || null}
                                onChange={(event, newValue) => {
                                    if (newValue && newValue.id === CREATE_NEW_INGR_CATEGORY_OPTION.id) {
                                        handleOpenModal();
                                    } else {
                                        field.onChange(newValue ? newValue.id : '');
                                    }
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props} key={option.id}>
                                        {option.id === CREATE_NEW_INGR_CATEGORY_OPTION.id ? 
                                            <Typography color="primary">{option.name}</Typography> : 
                                            option.name
                                        }
                                    </Box>
                                )}
                                loading={categoriesLoading}
                                disabled={categoriesLoading || !!categoriesError}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Category (Optional)" 
                                        error={!!categoriesError} 
                                        helperText={categoriesError}
                                        InputLabelProps={{ 
                                            ...params.InputLabelProps,
                                            shrink: true 
                                        }}
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {categoriesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        )}
                    />
                </FormControl>
                <TextField
                    {...register("description")}
                    label="Description (Optional)"
                    fullWidth
                    multiline
                    rows={3}
                />
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Ingredient')}
            </Button>

            {/* Ingredient Category Creation Modal */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogTitle>Create New Ingredient Category</DialogTitle>
                <DialogContent>
                    {modalSubmitError && <Alert severity="error" sx={{ mb: 2 }}>{modalSubmitError}</Alert>}
                    <IngredientCategoryForm 
                        isSubmitting={isModalSubmitting}
                        onSubmit={async (data) => {
                            setIsModalSubmitting(true);
                            setModalSubmitError(null);
                            try {
                                const newCat = await createIngredientCategory(data);
                                handleModalCreateSuccess(newCat);
                            } catch (err: any) {
                                const msg = err.response?.data?.message || err.message || 'Failed to create category';
                                setModalSubmitError(msg);
                            } finally {
                                setIsModalSubmitting(false);
                            }
                        }} 
                    />
                </DialogContent>
            </Dialog>
        </Box>
    );
};

// Export the shape
export type { IngredientFormShape };
export default IngredientForm; 