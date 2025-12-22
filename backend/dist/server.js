"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
require("./types/express-augmentation"); // Load Express type augmentation
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const logger_1 = __importDefault(require("./utils/logger"));
const validateEnv_1 = require("./utils/validateEnv");
const requestLogger_1 = require("./middleware/requestLogger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const swagger_1 = require("./config/swagger");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
// Route files
// Route files
const user_1 = __importDefault(require("./routes/user"));
const auth_1 = __importDefault(require("./routes/auth"));
const colleges_1 = __importDefault(require("./routes/colleges"));
const exams_1 = __importDefault(require("./routes/exams"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const saved_1 = __importDefault(require("./routes/saved"));
const prep_1 = __importDefault(require("./routes/prep"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const recommendationRoutes_1 = __importDefault(require("./routes/recommendationRoutes"));
// Load env vars
dotenv_1.default.config();
// Validate required environment variables
try {
    (0, validateEnv_1.validateEnv)();
    (0, validateEnv_1.validateOptionalEnv)();
}
catch (error) {
    logger_1.default.error('Server startup failed: ' + error.message);
    process.exit(1);
}
const app = (0, express_1.default)();
// Security Middleware
// Helmet - Sets various HTTP headers for security
app.use((0, helmet_1.default)({
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
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            logger_1.default.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};
app.use((0, cors_1.default)(corsOptions));
// Handle preflight requests for all routes using regex to avoid parser errors
app.options(/.*/, (0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Request logging
app.use(requestLogger_1.requestLogger);
// Apply rate limiting to all routes
app.use('/api/', rateLimiter_1.apiLimiter);
// Swagger API Documentation
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.swaggerSpec));
// Mount routers
app.use('/api/user', user_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/colleges', colleges_1.default);
app.use('/api/exams', exams_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/saved', saved_1.default);
app.use('/api/prep', prep_1.default);
app.use('/api/alerts', alerts_1.default);
const internationalColleges_1 = __importDefault(require("./routes/internationalColleges"));
app.use('/api/international-colleges', internationalColleges_1.default);
const compare_1 = __importDefault(require("./routes/compare"));
app.use('/api/compare', compare_1.default);
const newgenColleges_1 = __importDefault(require("./routes/newgenColleges"));
app.use('/api/newgen-colleges', newgenColleges_1.default);
app.use('/api/recommendations', recommendationRoutes_1.default);
// Global Error Handler
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5001;
// Initialize server
const startServer = async () => {
    try {
        // Connect to database
        await (0, db_1.default)();
        // Start server
        app.listen(PORT, () => {
            logger_1.default.info(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to start server: ${error.message}`);
        // Start server anyway to allow health checks
        app.listen(PORT, () => {
            logger_1.default.warn(`Server running on port ${PORT} (Database connection failed)`);
        });
    }
};
startServer();
