import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, Stack } from '@mui/material';

// Renamed interface for the form's internal data structure
interface IngredientCategoryFormShape {
    name: string;
    description: string; // TextField value is always string
}

interface IngredientCategoryFormProps {
    onSubmit: (data: IngredientCategoryFormShape) => void; // Expect raw form shape
    initialData?: Partial<IngredientCategoryFormShape>; // Initial data matches form shape
    isSubmitting: boolean;
}

const IngredientCategoryForm: React.FC<IngredientCategoryFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<IngredientCategoryFormShape>({
        defaultValues: {
             name: initialData?.name || '',
             description: initialData?.description || '',
        }
    });

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <TextField
                    {...register("name", { required: "Category name is required" })}
                    label="Ingredient Category Name"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />
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
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Category')}
            </Button>
        </Box>
    );
};

// Export the shape
export type { IngredientCategoryFormShape };
export default IngredientCategoryForm; 