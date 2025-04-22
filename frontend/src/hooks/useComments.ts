import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL } from '../config';

export interface Comment {
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

// Get comments for an issue
export const useComments = (issueId: string) => {
    return useQuery<Comment[]>({
        queryKey: ['issues', issueId, 'comments'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_URL}/api/issues/${issueId}/comments`);
            return data;
        },
        enabled: !!issueId
    });
};

// Create comment
export const useCreateComment = (issueId: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (content: string) => {
            const { data } = await axios.post(`${API_URL}/api/issues/${issueId}/comments`, { content });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'comments'] });
        }
    });
};

// Update comment
export const useUpdateComment = (issueId: string, commentId: number) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (content: string) => {
            const { data } = await axios.put(`${API_URL}/api/issues/${issueId}/comments/${commentId}`, { content });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'comments'] });
        }
    });
};

// Delete comment
export const useDeleteComment = (issueId: string) => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (commentId: number) => {
            await axios.delete(`${API_URL}/api/issues/${issueId}/comments/${commentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['issues', issueId, 'comments'] });
        }
    });
}; 