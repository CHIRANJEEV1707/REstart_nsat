import axios from 'axios';

import Cookies from 'js-cookie';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
    withCredentials: true, // Important for cookies
});

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log('[Axios] 401 Unauthorized detected. Redirecting to login...');

            // Auto-redirect to login on 401
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                Cookies.remove('token');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
