import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/apiService';

export interface Issue {
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

export interface CreateIssueData {
    title: string;
    description: string;
    type: Issue['type'];
    status?: Issue['status'];
    priority: Issue['priority'];
    assignedToId?: number;
    labelIds: number[];
    isPublic: boolean;
}

// Get all issues
export const useIssues = () => {
    return useQuery<Issue[]>({
        queryKey: ['issues'],
        queryFn: async () => {
            const { data } = await apiClient.get('/issues');
            return data;
        }
    });
};

// Get single issue
export const useIssue = (id: string) => {
    return useQuery<Issue>({
        queryKey: ['issues', id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/issues/${id}`);
            return data;
        },
        enabled: !!id
    });
};

// Create issue
export const useCreateIssue = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (issueData: CreateIssueData) => {
            const { data } = await apiClient.post('/issues', issueData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
        }
    });
};

// Update issue
export const useUpdateIssue = (id: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (issueData: Partial<CreateIssueData>) => {
            const { data } = await apiClient.put(`/issues/${id}`, issueData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
            queryClient.invalidateQueries({ queryKey: ['issues', id] });
        }
    });
};

// Delete issue
export const useDeleteIssue = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/issues/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues'] });
        }
    });
}; 