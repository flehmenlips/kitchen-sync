import { Request, Response } from 'express';
import prisma from '../config/db'; // Using relative path
// Import the type from the generated location
import { UnitType } from '@prisma/client';

// @desc    Get all units for the authenticated user
// @route   GET /api/units
// @access  Private (User must be logged in)
export const getUnits = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        const userId = req.user.id;
        const units = await prisma.unitOfMeasure.findMany({
             where: {
                 userId: userId,
             },
         });
        res.status(200).json(units);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching units' });
    }
};

// @desc    Create a new unit for the authenticated user
// @route   POST /api/units
// @access  Private
export const createUnit = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id; // Get userId from authenticated user

    try {
        const { name, abbreviation, type } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Missing required field: name' });
            return;
        }

        // Validate type if provided
        let unitType: UnitType | undefined = undefined;
        if (type && !(type in UnitType)) {
             res.status(400).json({ message: `Invalid unit type. Must be one of: ${Object.keys(UnitType).join(', ')}` });
             return;
        }
        if (type) {
            unitType = type as UnitType;
        }

        const newUnit = await prisma.unitOfMeasure.create({
            data: {
                name,
                abbreviation,
                type: unitType,
                userId: userId, // Associate with the logged-in user
            },
        });
        res.status(201).json(newUnit);
    } catch (error: any) {
        console.error(error);
        // Handle potential unique constraint violation
        if (error.code === 'P2002') {
            res.status(409).json({ message: `Unit with name '${req.body.name}' or abbreviation '${req.body.abbreviation}' already exists.` });
            return;
        }
        res.status(500).json({ message: 'Error creating unit' });
    }
};

// @desc    Get single unit by ID (owned by the authenticated user)
// @route   GET /api/units/:id
// @access  Private
export const getUnitById = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
        const { id } = req.params;
        const unitId = parseInt(id, 10);
        if (isNaN(unitId)) {
            res.status(400).json({ message: 'Invalid unit ID format' });
            return;
        }

        const unit = await prisma.unitOfMeasure.findUnique({
            where: {
                id: unitId,
                userId: userId, // Ensure the user owns this unit
            },
        });

        if (!unit) {
            res.status(404).json({ message: 'Unit not found' });
            return;
        }
        res.status(200).json(unit);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching unit' });
    }
};

// @desc    Update a unit (owned by the authenticated user)
// @route   PUT /api/units/:id
// @access  Private
export const updateUnit = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
        const { id } = req.params;
        const unitId = parseInt(id, 10);
        if (isNaN(unitId)) {
            res.status(400).json({ message: 'Invalid unit ID format' });
            return;
        }

        const { name, abbreviation, type } = req.body;

        // Validate type if provided
        let unitType: UnitType | undefined | null = undefined; // Allow null to unset
        if (type === null) {
            unitType = null;
        } else if (type && !(type in UnitType)) {
             res.status(400).json({ message: `Invalid unit type. Must be one of: ${Object.keys(UnitType).join(', ')}` });
             return;
        } else if (type) {
            unitType = type as UnitType;
        }

        // First, check if the unit exists and belongs to the user
        const existingUnit = await prisma.unitOfMeasure.findUnique({
            where: {
                id: unitId,
                userId: userId, // Check ownership
            },
        });

        if (!existingUnit) {
            res.status(404).json({ message: 'Unit not found or you do not have permission to update it.' });
            return;
        }

        const updatedUnit = await prisma.unitOfMeasure.update({
            where: {
                id: unitId,
                // No need for userId here again as we checked ownership above
            },
            data: {
                name,
                abbreviation,
                type: unitType, // Will update only if type is not undefined
            },
        });
        res.status(200).json(updatedUnit);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            res.status(409).json({ message: `Unit with name '${req.body.name}' or abbreviation '${req.body.abbreviation}' might already exist.` });
            return;
        }
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Unit not found' });
            return;
        }
        res.status(500).json({ message: 'Error updating unit' });
    }
};

// @desc    Delete a unit (owned by the authenticated user)
// @route   DELETE /api/units/:id
// @access  Private
export const deleteUnit = async (req: Request, res: Response): Promise<void> => {
    // Ensure req.user exists and has an id
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    const userId = req.user.id;

    try {
        const { id } = req.params;
        const unitId = parseInt(id, 10);
        if (isNaN(unitId)) {
            res.status(400).json({ message: 'Invalid unit ID format' });
            return;
        }

        // First, check if the unit exists and belongs to the user
        const existingUnit = await prisma.unitOfMeasure.findUnique({
             where: {
                 id: unitId,
                 userId: userId, // Check ownership
             },
         });

        if (!existingUnit) {
             res.status(404).json({ message: 'Unit not found or you do not have permission to delete it.' });
             return;
         }

        await prisma.unitOfMeasure.delete({
            where: {
                id: unitId,
                 // No need for userId here again as we checked ownership above
            },
        });

        res.status(200).json({ message: 'Unit deleted successfully' });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2025') { // Record not found
            res.status(404).json({ message: 'Unit not found' });
            return;
        }
        if (error.code === 'P2003') { // Foreign key constraint failed (unit is in use)
            res.status(409).json({ message: 'Cannot delete unit because it is currently used in recipes.' });
            return;
        }
        res.status(500).json({ message: 'Error deleting unit' });
    }
}; 