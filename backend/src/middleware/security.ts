import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Rate Limiter for Login Route
 * Prevents Brute Force Attacks
 * Limit: 5 attempts per 15 minutes
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 create account requests per `window`
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Global Rate Limiter
 * Prevent General DoS / Scraping
 * Limit: 300 requests per 15 minutes
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Helmet Security Headers Configuration
 * - Hides 'X-Powered-By'
 * - Sets 'X-Frame-Options' to DENY (prevent clickjacking)
 * - Sets 'X-Content-Type-Options' to nosniff
 * - Enforces strict HSTS
 */
export const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], // Ensure no inline scripts unless necessary
            styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline often needed for styles
            imgSrc: ["'self'", "data:", "https:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    hidePoweredBy: true,
    frameguard: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
    }
});

/**
 * Mongo Sanitize Middleware
 * Prevents NoSQL Injection by removing keys containing '$' or '.'
 */
import { Request, Response, NextFunction } from 'express';

/**
 * Mongo Sanitize Middleware
 * Prevents NoSQL Injection by removing keys containing '$' or '.'
 * Custom implementation to avoid reassigning `req.query` which causes issues in Express 5
 */
export const mongoSanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    [req.body, req.query, req.params].forEach((data) => {
        if (data) {
            mongoSanitize.sanitize(data);
        }
    });
    next();
};
