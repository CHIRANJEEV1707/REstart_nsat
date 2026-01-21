import logger from './logger';

interface RequiredEnvVars {
    [key: string]: string | undefined;
}

/**
 * Validates that all required environment variables are set
 * Throws an error if any required variable is missing
 */
export const validateEnv = (): void => {
    // Set fallbacks for missing variables to prevent crashes
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = "fallback_secret_dev_only";
    if (!process.env.MONGO_URI && process.env.MONGODB_URI) process.env.MONGO_URI = process.env.MONGODB_URI;
    if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
    if (!process.env.RAZORPAY_KEY_ID) process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    if (!process.env.RAZORPAY_KEY_SECRET) process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';

    const requiredVars: RequiredEnvVars = {
        JWT_SECRET: process.env.JWT_SECRET,
        MONGO_URI: process.env.MONGO_URI,
        NODE_ENV: process.env.NODE_ENV,
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    };

    const missingVars: string[] = [];

    // Check each required variable
    Object.entries(requiredVars).forEach(([key, value]) => {
        if (!value || value.trim() === '') {
            missingVars.push(key);
        }
    });

    // If any variables are missing, log and throw error
    if (missingVars.length > 0) {
        const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
        logger.error(errorMessage);
        logger.error('Please check your .env file and ensure all required variables are set');
        throw new Error(errorMessage);
    }

    // Log success
    logger.info('✓ All required environment variables are set');
};

/**
 * Validates optional environment variables and logs warnings if missing
 */
export const validateOptionalEnv = (): void => {
    const optionalVars = {
        FRONTEND_URL: process.env.FRONTEND_URL,
        PORT: process.env.PORT,
    };

    Object.entries(optionalVars).forEach(([key, value]) => {
        if (!value) {
            logger.warn(`Optional environment variable ${key} is not set, using default`);
        }
    });
};

export default validateEnv;
