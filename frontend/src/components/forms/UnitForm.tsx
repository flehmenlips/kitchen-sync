import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, Button, Grid, Select, MenuItem, FormControl, InputLabel, Stack } from '@mui/material';

// Renamed interface for the form's internal data structure
interface UnitFormShape {
    name: string;
    abbreviation: string; // TextField value is always string
    type: string; 
}

// TODO: Ideally get these enum keys from backend or shared types
const UNIT_TYPES = ['WEIGHT', 'VOLUME', 'COUNT', 'OTHER'];

interface UnitFormProps {
    onSubmit: (data: UnitFormShape) => void; // Expect raw form shape
    initialData?: Partial<UnitFormShape>; // Initial data matches form shape
    isSubmitting: boolean;
}

const UnitForm: React.FC<UnitFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        control,
        register,
        formState: { errors },
    } = useForm<UnitFormShape>({
        defaultValues: initialData || {
            name: '',
            abbreviation: '',
            type: '',
        }
    });

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        {...register("name", { required: "Unit name is required" })}
                        label="Unit Name"
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                    <TextField
                        {...register("abbreviation")}
                        label="Abbreviation"
                        fullWidth
                    />
                </Stack>
                <FormControl fullWidth>
                    <InputLabel id="unit-type-label">Type (Optional)</InputLabel>
                    <Controller
                        name="type"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Select labelId="unit-type-label" label="Type (Optional)" {...field} value={field.value ?? ''}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {UNIT_TYPES.map(type => (
                                    <MenuItem key={type} value={type}>{type}</MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                </FormControl>
            </Stack>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Unit')}
            </Button>
        </Box>
    );
};

// Export the shape for parent components to use
export type { UnitFormShape };
export default UnitForm; 