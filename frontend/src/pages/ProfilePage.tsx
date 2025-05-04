import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    Stack,
    Divider,
    Alert,
    Breadcrumbs,
    Link,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface ProfileFormData {
    name: string;
    email: string;
    company?: string;
    position?: string;
    phone?: string;
    address?: string;
    bio?: string;
}

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<ProfileFormData>({
        name: user?.name || '',
        email: user?.email || '',
        company: '',
        position: '',
        phone: '',
        address: '',
        bio: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleInputChange = (field: keyof ProfileFormData) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            // TODO: Implement API call to update profile
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 2 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/">
                    KitchenSync
                </Link>
                <Typography color="text.primary">Profile Settings</Typography>
            </Breadcrumbs>

            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Profile Settings
                    </Typography>
                    <Button
                        variant={isEditing ? "outlined" : "contained"}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={handleInputChange('name')}
                                disabled={!isEditing}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                disabled={true}
                                required
                            />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Company"
                                value={formData.company}
                                onChange={handleInputChange('company')}
                                disabled={!isEditing}
                            />
                            <TextField
                                fullWidth
                                label="Position"
                                value={formData.position}
                                onChange={handleInputChange('position')}
                                disabled={!isEditing}
                            />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={formData.phone}
                                onChange={handleInputChange('phone')}
                                disabled={!isEditing}
                            />
                            <TextField
                                fullWidth
                                label="Address"
                                value={formData.address}
                                onChange={handleInputChange('address')}
                                disabled={!isEditing}
                            />
                        </Stack>
                        <TextField
                            fullWidth
                            label="Bio"
                            value={formData.bio}
                            onChange={handleInputChange('bio')}
                            disabled={!isEditing}
                            multiline
                            rows={4}
                        />

                        {isEditing && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        )}
                    </Stack>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box>
                    <Typography variant="h6" gutterBottom>
                        Account Information
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Role: {user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase() || 'User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Member since: {new Date(user?.createdAt || '').toLocaleDateString()}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default ProfilePage; 