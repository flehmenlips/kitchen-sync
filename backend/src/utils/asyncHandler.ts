import { Request, Response, NextFunction } from 'express';

/**
 * Async handler to wrap async route handlers and catch errors
 * @param fn The async route handler function
 * @returns A route handler with error handling
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 