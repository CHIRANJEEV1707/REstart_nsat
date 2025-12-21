"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.devRequestLogger = exports.requestLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Custom morgan token for logging response time
 */
morgan_1.default.token('response-time-ms', (req, res) => {
    const responseTime = res.getHeader('X-Response-Time');
    return responseTime ? `${responseTime}ms` : '-';
});
/**
 * Morgan stream that integrates with Winston logger
 */
const stream = {
    write: (message) => {
        // Remove trailing newline and log as info
        logger_1.default.info(message.trim());
    },
};
/**
 * Request logging middleware using Morgan
 * Logs HTTP requests with method, URL, status, and response time
 */
exports.requestLogger = (0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms', { stream });
/**
 * Detailed request logging for development
 */
exports.devRequestLogger = (0, morgan_1.default)('dev', { stream });
