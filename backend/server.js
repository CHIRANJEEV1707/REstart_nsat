const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
// Manual CORS Middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    // Intercept OPTIONS method
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// app.use(cors(corsOptions)); // Disabled in favor of manual
// app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Route files
const auth = require('./src/routes/auth');
const colleges = require('./src/routes/colleges');
const exams = require('./src/routes/exams');
const dashboard = require('./src/routes/dashboard');
const saved = require('./src/routes/saved');
const prep = require('./src/routes/prep');

// Mount routers
app.use('/api/auth', auth);
app.use('/api/colleges', colleges);
app.use('/api/exams', exams);
app.use('/api/dashboard', dashboard);
app.use('/api/saved', saved);
app.use('/api/prep', prep);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
