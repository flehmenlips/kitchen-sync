import { Request } from 'express';

// Extended Express Request interface with Multer file
export interface MulterRequest extends Request {
  file?: any; // Using any to avoid type conflicts with Express.Multer
  files?: {
    [fieldname: string]: any[];
  } | any[];
}

// We've removed the conflicting PrismaClient extension 