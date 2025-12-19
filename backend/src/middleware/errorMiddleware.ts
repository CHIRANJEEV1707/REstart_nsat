import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Standardized error response middleware
 * Ensures all errors follow the same format: { success: false, message: string, stack?: string }
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Log the error
    logger.error(`Error: ${err.message}`, {
        path: req.path,
        method: req.method,
        stack: err.stack
    });

    // Determine status code
    let statusCode = 500;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
    } else if (res.statusCode && res.statusCode !== 200) {
        statusCode = res.statusCode;
    }

    // Standardized error response
    const errorResponse: any = {
        success: false,
        message: err.message || 'Internal Server Error',
    };

    // Include stack trace in development
    if (process.env.NODE_ENV !== 'production') {
        errorResponse.stack = err.stack;
    }

    // Send response
    res.status(statusCode).json(errorResponse);
};
