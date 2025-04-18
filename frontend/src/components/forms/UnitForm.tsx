import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Box, TextField, Button, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// Interface for the form data
interface UnitFormData {
    name: string;
    abbreviation: string;
    type: string; // Corresponds to UnitType enum keys (WEIGHT, VOLUME, COUNT, OTHER)
}

// TODO: Ideally get these enum keys from backend or shared types
const UNIT_TYPES = ['WEIGHT', 'VOLUME', 'COUNT', 'OTHER'];

interface UnitFormProps {
    onSubmit: (data: UnitFormData) => void;
    initialData?: Partial<UnitFormData>;
    isSubmitting: boolean;
}

const UnitForm: React.FC<UnitFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
    const {
        handleSubmit,
        control,
        register,
        formState: { errors },
    } = useForm<UnitFormData>({
        defaultValues: initialData || {
            name: '',
            abbreviation: '',
            type: '',
        }
    });

    // No complex processing needed before onSubmit for this simple form

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        {...register("name", { required: "Unit name is required" })}
                        label="Unit Name"
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name?.message}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        {...register("abbreviation")}
                        label="Abbreviation"
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                     <FormControl fullWidth>
                        <InputLabel id="unit-type-label">Type (Optional)</InputLabel>
                        <Controller
                            name="type"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <Select labelId="unit-type-label" label="Type (Optional)" {...field}>
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {UNIT_TYPES.map(type => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                </Grid>
            </Grid>

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

export default UnitForm; 