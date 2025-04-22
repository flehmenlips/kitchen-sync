import { Request, Response } from 'express';
import prisma from '../config/db';

// @desc    Add comment to issue
// @route   POST /api/issues/:issueId/comments
// @access  Private
export const addComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = parseInt(req.params.issueId);
        const { content, isInternal = false } = req.body;

        // Validate required fields
        if (!content) {
            res.status(400).json({ message: 'Please provide comment content' });
            return;
        }

        // Check if issue exists
        const issue = await prisma.issue.findUnique({
            where: { id: issueId }
        });

        if (!issue) {
            res.status(404).json({ message: 'Issue not found' });
            return;
        }

        // Check if user can add internal comments
        if (isInternal && req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
            res.status(403).json({ message: 'Not authorized to add internal comments' });
            return;
        }

        // Create comment
        const comment = await prisma.comment.create({
            data: {
                content,
                isInternal,
                issueId,
                userId: req.user!.id
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};

// @desc    Update comment
// @route   PUT /api/issues/:issueId/comments/:id
// @access  Private
export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const commentId = parseInt(req.params.id);
        const { content, isInternal } = req.body;

        // Check if comment exists
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { issue: true }
        });

        if (!existingComment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        // Check permissions
        if (req.user?.role !== 'SUPERADMIN' && 
            req.user?.role !== 'ADMIN' && 
            existingComment.userId !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to update this comment' });
            return;
        }

        // Check if user can modify internal status
        if (isInternal !== undefined && 
            req.user?.role !== 'SUPERADMIN' && 
            req.user?.role !== 'ADMIN') {
            res.status(403).json({ message: 'Not authorized to modify internal status' });
            return;
        }

        // Update comment
        const updatedComment = await prisma.comment.update({
            where: { id: commentId },
            data: {
                content: content || undefined,
                isInternal: typeof isInternal === 'boolean' ? isInternal : undefined
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true }
                }
            }
        });

        res.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Error updating comment' });
    }
};

// @desc    Delete comment
// @route   DELETE /api/issues/:issueId/comments/:id
// @access  Private
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const commentId = parseInt(req.params.id);

        // Check if comment exists
        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!existingComment) {
            res.status(404).json({ message: 'Comment not found' });
            return;
        }

        // Check permissions
        if (req.user?.role !== 'SUPERADMIN' && 
            req.user?.role !== 'ADMIN' && 
            existingComment.userId !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to delete this comment' });
            return;
        }

        await prisma.comment.delete({
            where: { id: commentId }
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
}; 