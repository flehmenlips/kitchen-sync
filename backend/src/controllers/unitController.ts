import { Request, Response } from 'express';
import prisma from '../config/db'; // Using relative path
// Import the type from the generated location
import { UnitType } from '../generated/prisma/client';

// @desc    Get all units
// @route   GET /api/units
// @access  Public (for now)
export const getUnits = async (req: Request, res: Response): Promise<void> => {
    try {
        const units = await prisma.unitOfMeasure.findMany();
        res.status(200).json(units);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching units' });
    }
};

// @desc    Create a new unit
// @route   POST /api/units
// @access  Private/Admin (eventually)
export const createUnit = async (req: Request, res: Response): Promise<void> => {
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

// @desc    Get single unit by ID
// @route   GET /api/units/:id
// @access  Public (for now)
export const getUnitById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const unitId = parseInt(id, 10);
        if (isNaN(unitId)) {
            res.status(400).json({ message: 'Invalid unit ID format' });
            return;
        }

        const unit = await prisma.unitOfMeasure.findUnique({
            where: { id: unitId },
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

// @desc    Update a unit
// @route   PUT /api/units/:id
// @access  Private/Admin (eventually)
export const updateUnit = async (req: Request, res: Response): Promise<void> => {
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

        const updatedUnit = await prisma.unitOfMeasure.update({
            where: { id: unitId },
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

// @desc    Delete a unit
// @route   DELETE /api/units/:id
// @access  Private/Admin (eventually)
export const deleteUnit = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const unitId = parseInt(id, 10);
        if (isNaN(unitId)) {
            res.status(400).json({ message: 'Invalid unit ID format' });
            return;
        }

        await prisma.unitOfMeasure.delete({
            where: { id: unitId },
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