import axios from 'axios';

import Cookies from 'js-cookie';

// Validate and get API base URL
const getApiBaseUrl = (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // In production, fail fast if env var is missing
    if (!apiUrl && process.env.NODE_ENV === 'production') {
        throw new Error(
            'NEXT_PUBLIC_API_URL is not defined. Please set this environment variable in production.'
        );
    }

    // In development, use localhost with a warning
    if (!apiUrl) {
        console.warn(
            '⚠️  NEXT_PUBLIC_API_URL is not set. Using default: http://localhost:5001/api\n' +
            'To remove this warning, add NEXT_PUBLIC_API_URL to your .env.local file.'
        );
        return 'http://localhost:5001/api';
    }

    return apiUrl;
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true, // Important for cookies
});

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('[Axios] 401 Unauthorized detected.');
            // Remove the invalid token cookie
            if (typeof window !== 'undefined') {
                Cookies.remove('token');
            }
            // Let the component handle the error and show appropriate UI
            // The dashboard page has error handling that shows a login button
        }
        return Promise.reject(error);
    }
);

export default api;
