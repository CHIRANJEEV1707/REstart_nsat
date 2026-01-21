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

        // Inject admin password for password-locked admin routes
        const adminPw = localStorage.getItem('admin_password');
        if (adminPw && config.headers) {
            config.headers['x-admin-password'] = adminPw;
        }
    }
    return config;
});

// Response Interceptor: Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {

            // Avoid infinite loop if the refresh endpoint itself returns 401
            if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                console.log('[Axios] 401 detected. Attempting refresh...');
                // Call refresh endpoint
                // We use axios directly to avoid using this interceptor instance for the refresh call
                await axios.post('/api/auth/refresh', {}, { withCredentials: true });

                console.log('[Axios] Refresh successful. Retrying original request.');
                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                console.log('[Axios] Refresh failed. Logging out.');
                // Fallback to logout logic
                if (typeof window !== 'undefined') {
                    Cookies.remove('token');
                    localStorage.removeItem('token');

                    const protectedPaths = ['/dashboard', '/saved', '/prep', '/settings', '/profile', '/onboarding'];
                    const currentPath = window.location.pathname;

                    const isProtected = protectedPaths.some(path => currentPath.startsWith(path));

                    if (isProtected && !currentPath.includes('/auth/login')) {
                        fetch('/api/auth/logout', { method: 'POST' })
                            .catch(err => console.error("Logout failed during 401 handling", err))
                            .finally(() => {
                                window.location.href = '/auth/login';
                            });
                    }
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
