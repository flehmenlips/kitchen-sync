declare module 'multer' {
  import { Request, Response, NextFunction } from 'express';
  
  namespace multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    }
    
    interface Options {
      dest?: string;
      storage?: any;
      limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
      };
      fileFilter?(req: Request, file: File, callback: FileFilterCallback): void;
      preservePath?: boolean;
    }
    
    type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;
    
    interface StorageEngine {
      _handleFile(req: Request, file: File, callback: (error?: Error | null, info?: Partial<File>) => void): void;
      _removeFile(req: Request, file: File, callback: (error?: Error | null) => void): void;
    }
    
    interface DiskStorageOptions {
      destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
      filename?: (req: Request, file: File, callback: (error: Error | null, filename: string) => void) => void;
    }
  }
  
  function multer(options?: multer.Options): any;
  
  // Add diskStorage and memoryStorage methods
  namespace multer {
    function diskStorage(options: multer.DiskStorageOptions): multer.StorageEngine;
    function memoryStorage(): multer.StorageEngine;
  }
  
  export = multer;
} 