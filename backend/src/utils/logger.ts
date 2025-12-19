import winston from 'winston';

// Define log format with error stack traces
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(
        (info) => {
            const { timestamp, level, message, stack, ...meta } = info;
            let log = `${timestamp} [${level}]: ${message}`;

            // Add metadata if present
            if (Object.keys(meta).length > 0) {
                log += ` ${JSON.stringify(meta)}`;
            }

            // Add stack trace for errors
            if (stack) {
                log += `\n${stack}`;
            }

            return log;
        }
    )
);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        // Console transport with colors for development
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                logFormat
            ),
        }),
    ],
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error'
    }));
    logger.add(new winston.transports.File({
        filename: 'logs/combined.log'
    }));
}

export default logger;
