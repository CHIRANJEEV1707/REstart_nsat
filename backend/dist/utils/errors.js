"use strict";
/**
 * Custom error classes for standardized error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerError = exports.ConflictError = exports.NotFoundError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
class ServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
exports.ServerError = ServerError;
