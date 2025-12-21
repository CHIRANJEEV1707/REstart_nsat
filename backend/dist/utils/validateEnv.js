"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptionalEnv = exports.validateEnv = void 0;
const logger_1 = __importDefault(require("./logger"));
/**
 * Validates that all required environment variables are set
 * Throws an error if any required variable is missing
 */
const validateEnv = () => {
    const requiredVars = {
        JWT_SECRET: process.env.JWT_SECRET,
        MONGO_URI: process.env.MONGO_URI, // Changed from MONGODB_URI to match .env file
        NODE_ENV: process.env.NODE_ENV,
    };
    const missingVars = [];
    // Check each required variable
    Object.entries(requiredVars).forEach(([key, value]) => {
        if (!value || value.trim() === '') {
            missingVars.push(key);
        }
    });
    // If any variables are missing, log and throw error
    if (missingVars.length > 0) {
        const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
        logger_1.default.error(errorMessage);
        logger_1.default.error('Please check your .env file and ensure all required variables are set');
        throw new Error(errorMessage);
    }
    // Log success
    logger_1.default.info('✓ All required environment variables are set');
};
exports.validateEnv = validateEnv;
/**
 * Validates optional environment variables and logs warnings if missing
 */
const validateOptionalEnv = () => {
    const optionalVars = {
        FRONTEND_URL: process.env.FRONTEND_URL,
        PORT: process.env.PORT,
    };
    Object.entries(optionalVars).forEach(([key, value]) => {
        if (!value) {
            logger_1.default.warn(`Optional environment variable ${key} is not set, using default`);
        }
    });
};
exports.validateOptionalEnv = validateOptionalEnv;
exports.default = exports.validateEnv;
