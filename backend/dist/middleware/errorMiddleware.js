"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Standardized error response middleware
 * Ensures all errors follow the same format: { success: false, message: string, stack?: string }
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    logger_1.default.error(`Error: ${err.message}`, {
        path: req.path,
        method: req.method,
        stack: err.stack
    });
    // Determine status code
    let statusCode = 500;
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
    }
    else if (res.statusCode && res.statusCode !== 200) {
        statusCode = res.statusCode;
    }
    // Standardized error response
    const errorResponse = {
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
exports.errorHandler = errorHandler;
