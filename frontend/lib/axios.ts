import axios from 'axios';

import Cookies from 'js-cookie';

// Use relative path since API routes are now in the same Next.js app
const getApiBaseUrl = (): string => '/api';

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
                const protectedPaths = ['/dashboard', '/admin', '/saved', '/prep', '/settings', '/profile', '/onboarding'];
                const currentPath = window.location.pathname;

                // Only redirect if explicitly on a protected path AND it wasn't the login request itself that failed
                const isProtected = protectedPaths.some(path => currentPath.startsWith(path));
                const isLoginRequest = error.config && error.config.url && (error.config.url.includes('/auth/login') || error.config.url.includes('/auth/signup'));

                if (isProtected && !currentPath.includes('/auth/login') && !isLoginRequest) {
                    window.location.href = '/auth/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
