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

// Request Interceptor: Inject JWT if present (fallback for when cookies fail or in dev)
api.interceptors.request.use((config) => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token'); // or 'accessToken' depending on your login logic
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response Interceptor: Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error: any) => {
        if (error.response && error.response.status === 401) {
            console.log('[Axios] 401 Unauthorized detected.');
            // Remove the invalid token cookie
            if (typeof window !== 'undefined') {
                Cookies.remove('token');
                localStorage.removeItem('token');

                // Define protected paths that require login
                const protectedPaths = ['/dashboard', '/admin', '/saved', '/prep'];
                const currentPath = window.location.pathname;

                // Only redirect if explicitly on a protected path
                const isProtected = protectedPaths.some(path => currentPath.startsWith(path));

                if (isProtected && !currentPath.includes('/auth/login')) {
                    window.location.href = '/auth/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
