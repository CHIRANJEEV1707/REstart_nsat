"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoSanitizeMiddleware = exports.helmetConfig = exports.globalLimiter = exports.loginLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
/**
 * Rate Limiter for Login Route
 * Prevents Brute Force Attacks
 * Limit: 5 attempts per 15 minutes
 */
exports.loginLimiter = (0, express_rate_limit_1.default)({
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
exports.globalLimiter = (0, express_rate_limit_1.default)({
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
exports.helmetConfig = (0, helmet_1.default)({
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
 * Custom implementation to avoid reassigning `req.query` which causes issues in Express 5
 */
const mongoSanitizeMiddleware = (req, res, next) => {
    [req.body, req.query, req.params].forEach((data) => {
        if (data) {
            express_mongo_sanitize_1.default.sanitize(data);
        }
    });
    next();
};
exports.mongoSanitizeMiddleware = mongoSanitizeMiddleware;
