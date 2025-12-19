'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/**
 * Banner component that displays when the user is offline
 * Shows at the top of the screen with a warning message
 */
export function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Set initial online status
        setIsOnline(navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Don't render on server or if online
    if (!mounted || isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center animate-slide-down">
            <div className="flex items-center justify-center gap-2">
                <WifiOff size={18} />
                <span className="font-medium">You are offline. Some features may not work.</span>
            </div>
        </div>
    );
}
