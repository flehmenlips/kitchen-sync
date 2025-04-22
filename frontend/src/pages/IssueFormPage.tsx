import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Chip,
    Breadcrumbs,
    Link,
    FormHelperText,
    Autocomplete,
} from '@mui/material';

interface Label {
    id: number;
    name: string;
    color: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface IssueFormData {
    title: string;
    description: string;
    type: 'FEATURE' | 'BUG' | 'ENHANCEMENT';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assignedToId?: number;
    labelIds: number[];
    isPublic: boolean;
}

const INITIAL_FORM_DATA: IssueFormData = {
    title: '',
    description: '',
    type: 'FEATURE',
    priority: 'MEDIUM',
    assignedToId: undefined,
    labelIds: [],
    isPublic: true,
};

const IssueFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<IssueFormData>(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState<Partial<Record<keyof IssueFormData, string>>>({});
    const [loading, setLoading] = useState(false);
    const [labels, setLabels] = useState<Label[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // TODO: Replace with actual API calls
        const mockLabels: Label[] = [
            { id: 1, name: 'feature', color: '#0052CC' },
            { id: 2, name: 'bug', color: '#FF0000' },
            { id: 3, name: 'enhancement', color: '#00C853' },
            { id: 4, name: 'documentation', color: '#AB47BC' },
            { id: 5, name: 'security', color: '#FF4500' },
        ];

        const mockUsers: User[] = [
            { id: 1, name: 'George Page', email: 'george@seabreeze.farm' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
            { id: 3, name: 'John Doe', email: 'john@example.com' },
        ];

        setLabels(mockLabels);
        setUsers(mockUsers);

        if (isEditMode) {
            // TODO: Replace with actual API call to fetch issue
            setFormData({
                title: 'Implement Database Backup System',
                description: 'Create an automated backup system with verification and restore capabilities.',
                type: 'FEATURE',
                priority: 'HIGH',
                assignedToId: 2,
                labelIds: [1, 5],
                isPublic: true,
            });
        }
    }, [id, isEditMode]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof IssueFormData, string>> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/issues');
        } catch (error) {
            console.error('Error saving issue:', error);
            // Handle error appropriately
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        field: keyof IssueFormData,
        value: string | number | number[] | boolean | undefined
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear error when field is edited
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/">
                    KitchenSync
                </Link>
                <Link component={RouterLink} underline="hover" color="inherit" to="/issues">
                    Issue Tracker
                </Link>
                <Typography color="text.primary">
                    {isEditMode ? 'Edit Issue' : 'New Issue'}
                </Typography>
            </Breadcrumbs>

            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    {isEditMode ? 'Edit Issue' : 'Create New Issue'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            error={Boolean(errors.title)}
                            helperText={errors.title}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            error={Boolean(errors.description)}
                            helperText={errors.description}
                            required
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={formData.type}
                                    label="Type"
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                >
                                    <MenuItem value="FEATURE">Feature</MenuItem>
                                    <MenuItem value="BUG">Bug</MenuItem>
                                    <MenuItem value="ENHANCEMENT">Enhancement</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={formData.priority}
                                    label="Priority"
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                >
                                    <MenuItem value="LOW">Low</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="URGENT">Urgent</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>

                        <FormControl fullWidth>
                            <Autocomplete
                                value={users.find(user => user.id === formData.assignedToId) || null}
                                onChange={(_, newValue) => handleInputChange('assignedToId', newValue?.id)}
                                options={users}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => (
                                    <TextField {...params} label="Assign To" />
                                )}
                            />
                        </FormControl>

                        <FormControl fullWidth>
                            <Autocomplete
                                multiple
                                value={labels.filter(label => formData.labelIds.includes(label.id))}
                                onChange={(_, newValue) => handleInputChange('labelIds', newValue.map(v => v.id))}
                                options={labels}
                                getOptionLabel={(option) => option.name}
                                renderInput={(params) => (
                                    <TextField {...params} label="Labels" />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option.id}
                                            label={option.name}
                                            sx={{ bgcolor: option.color, color: 'white' }}
                                        />
                                    ))
                                }
                            />
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                component={RouterLink}
                                to="/issues"
                                variant="outlined"
                                color="inherit"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (isEditMode ? 'Update Issue' : 'Create Issue')}
                            </Button>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};

export default IssueFormPage; 