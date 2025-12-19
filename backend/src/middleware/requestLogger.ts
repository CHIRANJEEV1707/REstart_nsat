import morgan from 'morgan';
import logger from '../utils/logger';

/**
 * Custom morgan token for logging response time
 */
morgan.token('response-time-ms', (req, res) => {
    const responseTime = res.getHeader('X-Response-Time');
    return responseTime ? `${responseTime}ms` : '-';
});

/**
 * Morgan stream that integrates with Winston logger
 */
const stream = {
    write: (message: string) => {
        // Remove trailing newline and log as info
        logger.info(message.trim());
    },
};

/**
 * Request logging middleware using Morgan
 * Logs HTTP requests with method, URL, status, and response time
 */
export const requestLogger = morgan(
    ':method :url :status :res[content-length] - :response-time ms',
    { stream }
);

/**
 * Detailed request logging for development
 */
export const devRequestLogger = morgan('dev', { stream });
