"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
// Route files
const auth_1 = __importDefault(require("./routes/auth"));
// import colleges from './routes/colleges';
// import exams from './routes/exams';
// import dashboard from './routes/dashboard';
// import saved from './routes/saved';
// import prep from './routes/prep';
// Load env vars
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
// Middleware
// Manual CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    // Intercept OPTIONS method
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Mount routers
app.use('/api/auth', auth_1.default);
// app.use('/api/colleges', colleges);
// app.use('/api/exams', exams);
// app.use('/api/dashboard', dashboard);
// app.use('/api/saved', saved);
// app.use('/api/prep', prep);
// Global Error Handler
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
