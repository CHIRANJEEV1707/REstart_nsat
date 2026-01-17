'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface Violation {
    type: 'tab_switch' | 'fullscreen_exit' | 'camera_disabled' | 'window_blur';
    timestamp: Date;
}

interface ProctoringContextType {
    isFullscreen: boolean;
    cameraEnabled: boolean;
    violations: Violation[];
    totalViolations: number;
    enterFullscreen: () => Promise<void>;
    exitFullscreen: () => void;
    enableCamera: () => Promise<MediaStream | null>;
    disableCamera: () => void;
    addViolation: (type: Violation['type']) => void;
    cameraStream: MediaStream | null;
    proctoringSummary: { tabSwitches: number; fullscreenExits: number; windowBlurs: number };
}

const ProctoringContext = createContext<ProctoringContextType | null>(null);

export function ProctoringProvider({ children, onViolation }: { children: ReactNode; onViolation?: (type: string) => void }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [proctoringSummary, setProctoringSum] = useState({ tabSwitches: 0, fullscreenExits: 0, windowBlurs: 0 });

    const addViolation = useCallback((type: Violation['type']) => {
        const newViolation = { type, timestamp: new Date() };
        setViolations(prev => [...prev, newViolation]);

        setProctoringSum(prev => ({
            tabSwitches: type === 'tab_switch' ? prev.tabSwitches + 1 : prev.tabSwitches,
            fullscreenExits: type === 'fullscreen_exit' ? prev.fullscreenExits + 1 : prev.fullscreenExits,
            windowBlurs: type === 'window_blur' ? prev.windowBlurs + 1 : prev.windowBlurs
        }));

        onViolation?.(type);
    }, [onViolation]);

    const enterFullscreen = useCallback(async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } catch (error) {
            console.error('Failed to enter fullscreen:', error);
        }
    }, []);

    const exitFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        setIsFullscreen(false);
    }, []);

    const enableCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraStream(stream);
            setCameraEnabled(true);
            return stream;
        } catch (error) {
            console.error('Failed to enable camera:', error);
            return null;
        }
    }, []);

    const disableCamera = useCallback(() => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
        setCameraEnabled(false);
    }, [cameraStream]);

    // Monitor fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;
            if (!isNowFullscreen && isFullscreen) {
                addViolation('fullscreen_exit');
            }
            setIsFullscreen(isNowFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isFullscreen, addViolation]);

    // Monitor tab/window visibility
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                addViolation('tab_switch');
            }
        };

        const handleWindowBlur = () => {
            addViolation('window_blur');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [addViolation]);

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    return (
        <ProctoringContext.Provider value={{
            isFullscreen,
            cameraEnabled,
            violations,
            totalViolations: violations.length,
            enterFullscreen,
            exitFullscreen,
            enableCamera,
            disableCamera,
            addViolation,
            cameraStream,
            proctoringSummary
        }}>
            {children}
        </ProctoringContext.Provider>
    );
}

export function useProctoring() {
    const context = useContext(ProctoringContext);
    if (!context) {
        throw new Error('useProctoring must be used within a ProctoringProvider');
    }
    return context;
}
