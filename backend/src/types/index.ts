import { Request } from 'express';

// Extended Express Request interface with Multer file
export interface MulterRequest extends Request {
  file?: Express.Multer.File;
  files?: {
    [fieldname: string]: Express.Multer.File[];
  } | Express.Multer.File[];
} 