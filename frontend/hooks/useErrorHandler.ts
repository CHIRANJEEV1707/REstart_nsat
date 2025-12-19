import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface ErrorHandlerOptions {
    showToast?: boolean;
    customMessage?: string;
    logToConsole?: boolean;
}

/**
 * Custom hook for standardized error handling across the application
 * 
 * @example
 * const { handleError } = useErrorHandler();
 * 
 * try {
 *   await api.get('/data');
 * } catch (error) {
 *   handleError(error, { customMessage: 'Failed to load data' });
 * }
 */
export const useErrorHandler = () => {
    const handleError = useCallback((
        error: unknown,
        options: ErrorHandlerOptions = {}
    ) => {
        const {
            showToast = true,
            customMessage,
            logToConsole = process.env.NODE_ENV === 'development'
        } = options;

        // Extract error message
        const message = customMessage || extractErrorMessage(error);

        // Show toast notification
        if (showToast) {
            toast.error(message);
        }

        // Log to console in development
        if (logToConsole) {
            console.error('Error caught by useErrorHandler:', error);
        }

        // Future: Add error reporting service here
        // reportErrorToService(error, message);
    }, []);

    return { handleError };
};

/**
 * Extract a user-friendly error message from various error types
 */
function extractErrorMessage(error: unknown): string {
    // String error
    if (typeof error === 'string') {
        return error;
    }

    // Object error
    if (error && typeof error === 'object') {
        // Axios error response
        if ('response' in error && error.response) {
            const response = error.response as any;
            return response.data?.message || response.statusText || 'Request failed';
        }

        // Standard Error object
        if ('message' in error) {
            return (error as Error).message;
        }
    }

    // Fallback for unknown error types
    return 'An unexpected error occurred';
}
