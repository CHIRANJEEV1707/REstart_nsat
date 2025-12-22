import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import './types/express-augmentation'; // Load Express type augmentation
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorMiddleware';
import logger from './utils/logger';
import { validateEnv, validateOptionalEnv } from './utils/validateEnv';
import { requestLogger } from './middleware/requestLogger';
import { apiLimiter } from './middleware/rateLimiter';
import { swaggerUi, swaggerSpec } from './config/swagger';
import helmet from 'helmet';
import corsPackage from 'cors';

// Route files
// Route files
import userRoutes from './routes/user';
import auth from './routes/auth';
import colleges from './routes/colleges';
import exams from './routes/exams';
import dashboard from './routes/dashboard';
import saved from './routes/saved';
import prep from './routes/prep';
import alerts from './routes/alerts';
import recommendationRoutes from './routes/recommendationRoutes';

// Load env vars
dotenv.config();

// Validate required environment variables
try {
    validateEnv();
    validateOptionalEnv();
} catch (error: any) {
    logger.error('Server startup failed: ' + error.message);
    process.exit(1);
}

const app: Express = express();

// Trust proxy headers (needed behind Codespaces/Vercel proxies)
// Fixes express-rate-limit error when 'X-Forwarded-For' is present
app.set('trust proxy', 1);

// Security Middleware
// Helmet - Sets various HTTP headers for security
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Disable for development
}));

// CORS Configuration - Strictly validate allowed origins
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000', // Development
];

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

app.use(corsPackage(corsOptions));

// Handle preflight requests for all routes using regex to avoid parser errors
app.options(/.*/, corsPackage(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routers
app.use('/api/user', userRoutes);
app.use('/api/auth', auth);
app.use('/api/colleges', colleges);
app.use('/api/exams', exams);
app.use('/api/dashboard', dashboard);
app.use('/api/saved', saved);
app.use('/api/prep', prep);
app.use('/api/alerts', alerts);
import internationalColleges from './routes/internationalColleges';
app.use('/api/international-colleges', internationalColleges);
import compareRoutes from './routes/compare';
app.use('/api/compare', compareRoutes);
import newgenColleges from './routes/newgenColleges';
app.use('/api/newgen-colleges', newgenColleges);
app.use('/api/recommendations', recommendationRoutes);

// Simple health endpoints for debugging
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'backend', env: process.env.NODE_ENV });
});

app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', base: '/api' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Initialize server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Start server
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error: any) {
        logger.error(`Failed to start server: ${error.message}`);
        // Start server anyway to allow health checks
        app.listen(PORT, () => {
            logger.warn(`Server running on port ${PORT} (Database connection failed)`);
        });
    }
};

startServer();
