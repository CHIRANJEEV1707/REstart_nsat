import { useState, useEffect } from 'react';

/**
 * Custom hook to detect online/offline status
 * 
 * @returns boolean - true if online, false if offline
 * 
 * @example
 * const isOnline = useOnlineStatus();
 * 
 * if (!isOnline) {
 *   return <div>You're offline</div>;
 * }
 */
export const useOnlineStatus = (): boolean => {
    const [isOnline, setIsOnline] = useState<boolean>(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        // Handler for when connection is restored
        const handleOnline = () => {
            setIsOnline(true);
        };

        // Handler for when connection is lost
        const handleOffline = () => {
            setIsOnline(false);
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup listeners on unmount
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};
