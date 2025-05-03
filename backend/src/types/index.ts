import { Request } from 'express';
import { PrismaClient } from '@prisma/client';

// Extended Express Request interface with Multer file
export interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
}

// Declare module to extend PrismaClient types, allowing access to our custom models
declare module '@prisma/client' {
  interface PrismaClient {
    menu: any;
    menuSection: any;
    menuItem: any;
  }
} 