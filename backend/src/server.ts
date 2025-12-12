import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorMiddleware';
import logger from './utils/logger';

// Route files
// Route files
import auth from './routes/auth';
import colleges from './routes/colleges';
import exams from './routes/exams';
import dashboard from './routes/dashboard';
import saved from './routes/saved';
import prep from './routes/prep';
import alerts from './routes/alerts';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app: Express = express();

// Middleware
// Manual CORS Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
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

app.use(express.json());
app.use(cookieParser());

// Mount routers
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

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});
