import React, { useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Chip,
    Divider,
    Avatar,
    TextField,
    Stack,
    IconButton,
    Menu,
    MenuItem,
    Breadcrumbs,
    Link,
    Select,
    FormControl,
    InputLabel,
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import BugReportIcon from '@mui/icons-material/BugReport';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import BuildIcon from '@mui/icons-material/Build';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import ErrorIcon from '@mui/icons-material/Error';

// Types from IssueListPage
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

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

import { useIssue, useUpdateIssue, useDeleteIssue } from '../hooks/useIssues';
import { useComments, useCreateComment } from '../hooks/useComments';

const IssueDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: issue, isLoading: issueLoading, error: issueError } = useIssue(id!);
    const { data: comments = [], isLoading: commentsLoading } = useComments(id!);
    const { mutate: updateIssue } = useUpdateIssue(id!);
    const { mutate: deleteIssue } = useDeleteIssue();
    const { mutate: createComment } = useCreateComment(id!);
    
    const [newComment, setNewComment] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleStatusChange = (newStatus: Issue['status']) => {
        if (issue) {
            updateIssue({ status: newStatus });
        }
        setStatusAnchorEl(null);
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        createComment(newComment);
        setNewComment('');
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this issue?')) {
            deleteIssue(id!, {
                onSuccess: () => {
                    navigate('/issues');
                }
            });
        }
        handleMenuClose();
    };

    if (issueLoading || commentsLoading) return <Typography>Loading...</Typography>;
    if (issueError) return <Typography color="error">Error loading issue</Typography>;
    if (!issue) return <Typography>Issue not found</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link component={RouterLink} underline="hover" color="inherit" to="/">
                    KitchenSync
                </Link>
                <Link component={RouterLink} underline="hover" color="inherit" to="/issues">
                    Issue Tracker
                </Link>
                <Typography color="text.primary">Issue #{issue.id}</Typography>
            </Breadcrumbs>

            {/* Issue Header */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {issue.title}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip
                                label={issue.type}
                                color={issue.type === 'BUG' ? 'error' : issue.type === 'FEATURE' ? 'primary' : 'success'}
                                size="small"
                            />
                            <Chip
                                label={issue.priority}
                                color={
                                    issue.priority === 'URGENT' ? 'error' :
                                    issue.priority === 'HIGH' ? 'warning' :
                                    issue.priority === 'MEDIUM' ? 'info' : 'success'
                                }
                                size="small"
                            />
                            {issue.labels.map(({ label }) => (
                                <Chip
                                    key={label.id}
                                    label={label.name}
                                    size="small"
                                    sx={{ bgcolor: label.color, color: 'white' }}
                                />
                            ))}
                        </Stack>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            onClick={(e) => setStatusAnchorEl(e.currentTarget)}
                        >
                            Status: {issue.status.replace('_', ' ')}
                        </Button>
                        <IconButton onClick={handleMenuOpen}>
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Menu
                    anchorEl={statusAnchorEl}
                    open={Boolean(statusAnchorEl)}
                    onClose={() => setStatusAnchorEl(null)}
                >
                    {['OPEN', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CLOSED'].map((status) => (
                        <MenuItem
                            key={status}
                            onClick={() => handleStatusChange(status as Issue['status'])}
                            selected={issue.status === status}
                        >
                            {status.replace('_', ' ')}
                        </MenuItem>
                    ))}
                </Menu>

                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem component={RouterLink} to={`/issues/${issue.id}/edit`}>
                        <EditIcon sx={{ mr: 1 }} /> Edit
                    </MenuItem>
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1 }} /> Delete
                    </MenuItem>
                </Menu>

                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
                    {issue.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'text.secondary' }}>
                    <Typography variant="body2">
                        Created by {issue.createdBy.name} on {new Date(issue.createdAt).toLocaleDateString()}
                    </Typography>
                    {issue.assignedTo && (
                        <Typography variant="body2">
                            Assigned to {issue.assignedTo.name}
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Comments Section */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Comments ({comments.length})
                </Typography>

                <Stack spacing={2}>
                    {comments.map((comment) => (
                        <Box key={comment.id}>
                            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                                <Avatar>{comment.user.name[0]}</Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="subtitle2">
                                            {comment.user.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2">
                                        {comment.content}
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider />
                        </Box>
                    ))}
                </Stack>

                {/* New Comment Form */}
                <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 3 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            endIcon={<SendIcon />}
                            disabled={!newComment.trim()}
                        >
                            Comment
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default IssueDetailPage; 