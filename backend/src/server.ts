import 'dotenv/config'; // Load env vars before any other imports
import express, { Express, Request, Response, NextFunction } from 'express'; // eslint-disable-line no-unused-vars
// import dotenv from 'dotenv'; // No longer needed as explicit import
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
import { doubleCsrf } from "csrf-csrf"; // New Import
import { globalLimiter, helmetConfig, mongoSanitizeMiddleware } from './middleware/security'; // New Imports
import compression from 'compression';

// Route files
import userRoutes from './routes/user';
import auth from './routes/auth';
import colleges from './routes/colleges';
import exams from './routes/exams';
import dashboard from './routes/dashboard';
import saved from './routes/saved';
import alerts from './routes/alerts';
import recommendationRoutes from './routes/recommendationRoutes';

// Load env vars
// dotenv.config(); // Loaded at top of file

// Validate required environment variables
try {
    validateEnv();
    validateOptionalEnv();
} catch (error: any) {
    logger.error('Environment validation failed: ' + error.message);
    // In serverless, we don't exit(1) as it causes loops. Vercel handles function crashes.
}

const app: Express = express();

// Trust proxy headers (needed behind Codespaces/Vercel proxies)
app.set('trust proxy', 1);

// Standard Middleware
app.use(compression());

// --- SECURITY MIDDLEWARE ---

// 1. Helmet (Security Headers) - Replaces default app.use(helmet(...))
app.use(helmetConfig);

// 2. CORS - strictly validate options
const allowedOrigins = [
    "https://www.letsrestart.in",
    "https://letsrestart.in",
];

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push("http://localhost:3000");
    allowedOrigins.push("http://localhost:5173");
}

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
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'x-csrf-token'],
    exposedHeaders: ['set-cookie'],
};

app.use(corsPackage(corsOptions));
app.options(/.*/, corsPackage(corsOptions)); // Preflight

// 3. Rate Limiting (Global)
app.use(globalLimiter);

// 4. Body Parsing + Cookie Parsing (Required for CSRF)
app.use(express.json());
app.use(cookieParser());

// 5. Data Sanitization (NoSQL Injection)
app.use(mongoSanitizeMiddleware);

// 6. CSRF Protection
// Configure Double Submit Cookie
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
    getSecret: () => process.env.JWT_SECRET || "TopSecretMustChange", // Use JWT_SECRET or specialized CSRF_SECRET
    getSessionIdentifier: (req) => "stateless", // Required by new version, unused in stateless mode
    cookieName: "x-csrf-token",
    cookieOptions: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
    },
    size: 64,
    ignoredMethods: ["GET", "HEAD", "OPTIONS"],
    getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
    skipCsrfProtection: (req) => {
        return ["/api/auth/login", "/api/auth/signup", "/api/auth/forgotpassword", "/api/auth/resetpassword"].includes(req.path);
    },
});

// Expose CSRF Token Endpoint (Frontend calls this to get token)
app.get("/api/csrf-token", (req, res) => {
    const csrfToken = generateCsrfToken(req, res);
    res.json({ csrfToken });
});

// 6. Database Connection Middleware (Safe for Serverless)
const dbConnectionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectDB();
        next();
    } catch (error: any) {
        logger.error(`Database middleware error: ${error.message}`);
        res.status(503).json({
            success: false,
            message: 'Database connection failed, please try again.'
        });
    }
};

app.use(dbConnectionMiddleware);

// --- END SECURITY MIDDLEWARE ---

// Request logging
app.use(requestLogger);

// Note: Removed apiLimiter for 'globalLimiter' above, or we keep specific apiLimiter for /api/ if needed?
// The prompt said "Global limiter for all other routes: Max 300". 'globalLimiter' handles this.
// We can remove the old 'apiLimiter' usage or keep it as legacy if specific routes need it, 
// but strictly following valid Requirements: "Create a global limiter... Max 300".
// I've applied 'globalLimiter' at app level.

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routers
app.use('/api/user', userRoutes);
app.use('/api/auth', auth);
app.use('/api/colleges', colleges);
app.use('/api/exams', exams);
app.use('/api/dashboard', dashboard);
app.use('/api/saved', saved);
app.use('/api/alerts', alerts);
import internationalColleges from './routes/internationalColleges';
app.use('/api/international-colleges', internationalColleges);
import compareRoutes from './routes/compare';
app.use('/api/compare', compareRoutes);
import newgenColleges from './routes/newgenColleges';
app.use('/api/newgen-colleges', newgenColleges);
app.use('/api/recommendations', recommendationRoutes);

import orderRoutes from './routes/orderRoutes';
app.use('/api/orders', orderRoutes);

import bundleRoutes from './routes/bundleRoutes';
app.use('/api/bundles', bundleRoutes);

// NSAT Prep Routes
import mockTestRoutes from './routes/mockTestRoutes';
import pyqRoutes from './routes/pyqRoutes';
import interviewGuideRoutes from './routes/interviewGuideRoutes';
import freePackRoutes from './routes/freePackRoutes';
import nsatAdminRoutes from './routes/admin/nsatAdminRoutes';

app.use('/api/mock-tests', mockTestRoutes);
app.use('/api/pyqs', pyqRoutes);
app.use('/api/interview-guides', interviewGuideRoutes);
app.use('/api/free-pack', freePackRoutes);
app.use('/api/admin/nsat', nsatAdminRoutes);

// Session Booking Routes
import sessionRoutes from './routes/sessionRoutes';
app.use('/api/sessions', sessionRoutes);

// JEE Question Bank Routes
import jeeBankRoutes from './routes/jeeBank';
app.use('/api/jee-bank', jeeBankRoutes);

// Simple health endpoints for debugging
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'backend', env: process.env.NODE_ENV });
});

app.head('/', (req, res) => {
    res.status(200).end();
});

app.head('/api', (req, res) => {
    res.status(200).end();
});

app.get('/api', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', base: '/api' });
});

// Global Error Handler
app.use(errorHandler);

// Import College model to ensure schema registration
import './models/College';

const PORT = process.env.PORT || 5001;

// Initialize server
const startServer = async () => {
    try {
        logger.info(`Server startup sequence initiated. NODE_ENV: ${process.env.NODE_ENV}, PORT: ${PORT}`);

        // Connect to database
        logger.info('Connecting to Database...');
        await connectDB();
        logger.info('Database connection successful.');

        // Start server only if not in Vercel environment (Vercel handles it)
        if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
            logger.info(`Starting Express server on port ${PORT}...`);
            const server = app.listen(PORT, () => {
                logger.info(`✓ Server running on port ${PORT}`);
                logger.info('Press Ctrl+C to stop');
            });

            server.on('error', (error: any) => {
                if (error.code === 'EADDRINUSE') {
                    logger.error(`Port ${PORT} is already in use.`);
                    process.exit(1);
                } else {
                    logger.error(`Server error: ${error.message}`);
                }
            });
        }
    } catch (error: any) {
        logger.error(`CRITICAL: Failed to start server: ${error.message}`);
        logger.error(error.stack);
        if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
            app.listen(PORT, () => {
                logger.warn(`Server running on port ${PORT} (Database connection failed)`);
            });
        }
    }
};

// Vercel needs the app exported
export default app;

if (require.main === module) {
    startServer();
}
