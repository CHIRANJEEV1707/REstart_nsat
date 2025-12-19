import asyncHandler from 'express-async-handler';

/**
 * Async handler wrapper for Express route handlers
 * Automatically catches errors and passes them to error middleware
 * 
 * Usage:
 * export const myController = asyncHandler(async (req, res) => {
 *     // Your async code here
 *     // No need for try-catch
 * });
 */
export { asyncHandler };

/**
 * Alternative: Custom async handler if you prefer not to use the package
 */
export const catchAsync = (fn: Function) => {
    return (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
