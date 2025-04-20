import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, Stack } from '@mui/material';

// Renamed interface for the form's internal data structure
interface CategoryFormShape {
    name: string;
    description: string; // TextField value is always string
}

interface CategoryFormProps {
    onSubmit: (data: CategoryFormShape) => void; // Expect raw form shape
    initialData?: Partial<CategoryFormShape>; // Initial data matches form shape
    isSubmitting: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<CategoryFormShape>({
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
                    label="Category Name"
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
export type { CategoryFormShape };
export default CategoryForm; 