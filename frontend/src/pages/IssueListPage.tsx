import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Stack,
    Tooltip,
    Breadcrumbs,
    Link,
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BuildIcon from '@mui/icons-material/Build';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ErrorIcon from '@mui/icons-material/Error';

import { useIssues } from '../hooks/useIssues';

// Types
interface Issue {
    id: number;
    title: string;
    description: string;
    type: 'FEATURE' | 'BUG' | 'ENHANCEMENT';
    status: 'OPEN' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    isPublic: boolean;
    createdBy: {
        id: number;
        name: string;
        email: string;
    };
    assignedTo?: {
        id: number;
        name: string;
        email: string;
    };
    labels: {
        label: {
            id: number;
            name: string;
            color: string;
        };
    }[];
    _count: {
        comments: number;
    };
    createdAt: string;
    updatedAt: string;
}

const IssueListPage: React.FC = () => {
    const { data: issues = [], isLoading, error } = useIssues();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        priority: 'all',
        assignedTo: 'all'
    });

    // Handlers
    const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
        setFilterAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setFilterAnchorEl(null);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    // Helper functions
    const getTypeIcon = (type: Issue['type']) => {
        switch (type) {
            case 'BUG':
                return <BugReportIcon color="error" />;
            case 'FEATURE':
                return <LightbulbIcon color="primary" />;
            case 'ENHANCEMENT':
                return <BuildIcon color="success" />;
        }
    };

    const getPriorityIcon = (priority: Issue['priority']) => {
        switch (priority) {
            case 'LOW':
                return <LowPriorityIcon color="success" />;
            case 'MEDIUM':
                return <PriorityHighIcon color="info" />;
            case 'HIGH':
                return <PriorityHighIcon color="warning" />;
            case 'URGENT':
                return <ErrorIcon color="error" />;
        }
    };

    if (isLoading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">Error loading issues</Typography>;

    // Filter and search issues
    const filteredIssues = issues.filter(issue => {
        const matchesSearch = searchTerm === '' ||
            issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = filters.type === 'all' || issue.type === filters.type;
        const matchesStatus = filters.status === 'all' || issue.status === filters.status;
        const matchesPriority = filters.priority === 'all' || issue.priority === filters.priority;
        const matchesAssignee = filters.assignedTo === 'all' || 
            (filters.assignedTo === 'unassigned' && !issue.assignedTo) ||
            (issue.assignedTo?.id.toString() === filters.assignedTo);

        return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesAssignee;
    });

    // Group issues by status for Kanban view
    const issuesByStatus = {
        OPEN: filteredIssues.filter(i => i.status === 'OPEN'),
        IN_PROGRESS: filteredIssues.filter(i => i.status === 'IN_PROGRESS'),
        REVIEW: filteredIssues.filter(i => i.status === 'REVIEW'),
        DONE: filteredIssues.filter(i => i.status === 'DONE'),
        CLOSED: filteredIssues.filter(i => i.status === 'CLOSED')
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 2 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/">
                    KitchenSync
                </Link>
                <Typography color="text.primary">Issue Tracker</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Issue Tracker
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    component={RouterLink}
                    to="/issues/new"
                >
                    New Issue
                </Button>
            </Box>

            {/* Search and Filters */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            placeholder="Search issues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Stack direction="row" spacing={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={filters.type}
                                    label="Type"
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <MenuItem value="all">All Types</MenuItem>
                                    <MenuItem value="FEATURE">Feature</MenuItem>
                                    <MenuItem value="BUG">Bug</MenuItem>
                                    <MenuItem value="ENHANCEMENT">Enhancement</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={filters.priority}
                                    label="Priority"
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                >
                                    <MenuItem value="all">All Priorities</MenuItem>
                                    <MenuItem value="LOW">Low</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="URGENT">Urgent</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* Kanban Board */}
            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                {Object.entries(issuesByStatus).map(([status, statusIssues]) => (
                    <Box
                        key={status}
                        sx={{
                            minWidth: 300,
                            maxWidth: 300,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            p: 2,
                            boxShadow: 1
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {status.replace('_', ' ')} ({statusIssues.length})
                        </Typography>
                        <Stack spacing={2}>
                            {statusIssues.map(issue => (
                                <Card
                                    key={issue.id}
                                    sx={{
                                        '&:hover': {
                                            boxShadow: 3,
                                            cursor: 'pointer'
                                        }
                                    }}
                                    component={RouterLink}
                                    to={`/issues/${issue.id}`}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Tooltip title={issue.type}>
                                                {getTypeIcon(issue.type)}
                                            </Tooltip>
                                            <Typography variant="subtitle1" noWrap>
                                                {issue.title}
                                            </Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                            {issue.labels.map(({ label }) => (
                                                <Chip
                                                    key={label.id}
                                                    label={label.name}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: label.color,
                                                        color: 'white',
                                                        textTransform: 'capitalize'
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Tooltip title={`Priority: ${issue.priority}`}>
                                                {getPriorityIcon(issue.priority)}
                                            </Tooltip>
                                            <Typography variant="caption" color="text.secondary">
                                                #{issue.id} • {issue._count.comments} comments
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    </Box>
                ))}
            </Box>
        </Container>
    );
};

export default IssueListPage; 