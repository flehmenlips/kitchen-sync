import { Request, Response } from 'express';
import prisma from '../config/db';
import { IssueType, IssueStatus, IssuePriority } from '@prisma/client';

// @desc    Get all issues (with filtering)
// @route   GET /api/issues
// @access  Private
export const getIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            status,
            type,
            priority,
            assignedToId,
            createdById,
            isPublic,
            search
        } = req.query;

        // Build filter object
        const filter: any = {};
        
        // Add filters based on query parameters
        if (status) filter.status = status;
        if (type) filter.type = type;
        if (priority) filter.priority = priority;
        if (assignedToId) filter.assignedToId = parseInt(assignedToId as string);
        if (createdById) filter.createdById = parseInt(createdById as string);
        if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

        // Add search filter if provided
        if (search) {
            filter.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        // Non-admin users can only see public issues or their own
        if (req.user?.role !== 'SUPERADMIN' && req.user?.role !== 'ADMIN') {
            filter.OR = [
                { isPublic: true },
                { createdById: req.user?.id },
                { assignedToId: req.user?.id }
            ];
        }

        const issues = await prisma.issue.findMany({
            where: filter,
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                assignedTo: {
                    select: { id: true, name: true, email: true }
                },
                labels: {
                    include: {
                        label: true
                    }
                },
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json(issues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ message: 'Error fetching issues' });
    }
};

// @desc    Get single issue by ID
// @route   GET /api/issues/:id
// @access  Private
export const getIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
        const issue = await prisma.issue.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                assignedTo: {
                    select: { id: true, name: true, email: true }
                },
                labels: {
                    include: {
                        label: true
                    }
                },
                comments: {
                    where: {
                        OR: [
                            { isInternal: false },
                            { userId: req.user?.id },
                            { user: { role: { in: ['ADMIN', 'SUPERADMIN'] } } }
                        ]
                    },
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, role: true }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!issue) {
            res.status(404).json({ message: 'Issue not found' });
            return;
        }

        // Check access rights
        if (!issue.isPublic && 
            req.user?.role !== 'SUPERADMIN' && 
            req.user?.role !== 'ADMIN' && 
            issue.createdById !== req.user?.id && 
            issue.assignedToId !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to view this issue' });
            return;
        }

        res.json(issue);
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({ message: 'Error fetching issue' });
    }
};

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
export const createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            title,
            description,
            type,
            priority,
            isPublic,
            assignedToId,
            labelIds
        } = req.body;

        // Validate required fields
        if (!title || !description || !type) {
            res.status(400).json({ message: 'Please provide title, description, and type' });
            return;
        }

        // Create issue with labels if provided
        const issue = await prisma.issue.create({
            data: {
                title,
                description,
                type: type as IssueType,
                priority: (priority as IssuePriority) || 'MEDIUM',
                isPublic: isPublic || false,
                createdById: req.user!.id,
                assignedToId: assignedToId ? parseInt(assignedToId) : undefined,
                labels: labelIds ? {
                    create: labelIds.map((labelId: number) => ({
                        label: { connect: { id: labelId } }
                    }))
                } : undefined
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                assignedTo: {
                    select: { id: true, name: true, email: true }
                },
                labels: {
                    include: {
                        label: true
                    }
                }
            }
        });

        res.status(201).json(issue);
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({ message: 'Error creating issue' });
    }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
export const updateIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = parseInt(req.params.id);
        const {
            title,
            description,
            type,
            status,
            priority,
            isPublic,
            assignedToId,
            labelIds
        } = req.body;

        // Check if issue exists and user has rights
        const existingIssue = await prisma.issue.findUnique({
            where: { id: issueId },
            include: { labels: true }
        });

        if (!existingIssue) {
            res.status(404).json({ message: 'Issue not found' });
            return;
        }

        // Check permissions
        if (req.user?.role !== 'SUPERADMIN' && 
            req.user?.role !== 'ADMIN' && 
            existingIssue.createdById !== req.user?.id && 
            existingIssue.assignedToId !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to update this issue' });
            return;
        }

        // Update issue
        const updatedIssue = await prisma.issue.update({
            where: { id: issueId },
            data: {
                title: title || undefined,
                description: description || undefined,
                type: type as IssueType || undefined,
                status: status as IssueStatus || undefined,
                priority: priority as IssuePriority || undefined,
                isPublic: typeof isPublic === 'boolean' ? isPublic : undefined,
                assignedToId: assignedToId ? parseInt(assignedToId) : undefined,
                labels: labelIds ? {
                    deleteMany: {},
                    create: labelIds.map((labelId: number) => ({
                        label: { connect: { id: labelId } }
                    }))
                } : undefined
            },
            include: {
                createdBy: {
                    select: { id: true, name: true, email: true }
                },
                assignedTo: {
                    select: { id: true, name: true, email: true }
                },
                labels: {
                    include: {
                        label: true
                    }
                }
            }
        });

        res.json(updatedIssue);
    } catch (error) {
        console.error('Error updating issue:', error);
        res.status(500).json({ message: 'Error updating issue' });
    }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
export const deleteIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const issueId = parseInt(req.params.id);

        // Check if issue exists and user has rights
        const existingIssue = await prisma.issue.findUnique({
            where: { id: issueId }
        });

        if (!existingIssue) {
            res.status(404).json({ message: 'Issue not found' });
            return;
        }

        // Only creator, admin, or superadmin can delete
        if (req.user?.role !== 'SUPERADMIN' && 
            req.user?.role !== 'ADMIN' && 
            existingIssue.createdById !== req.user?.id) {
            res.status(403).json({ message: 'Not authorized to delete this issue' });
            return;
        }

        await prisma.issue.delete({
            where: { id: issueId }
        });

        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({ message: 'Error deleting issue' });
    }
}; 