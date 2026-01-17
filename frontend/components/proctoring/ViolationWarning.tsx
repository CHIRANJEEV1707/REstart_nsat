'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ViolationWarningProps {
    type: 'tab_switch' | 'fullscreen_exit' | 'window_blur';
    count: number;
    onDismiss: () => void;
    onReEnterFullscreen?: () => void;
}

export function ViolationWarning({ type, count, onDismiss, onReEnterFullscreen }: ViolationWarningProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
        const timer = setTimeout(() => {
            setVisible(false);
            onDismiss();
        }, 5000);
        return () => clearTimeout(timer);
    }, [count, onDismiss]);

    if (!visible) return null;

    const getMessage = () => {
        switch (type) {
            case 'tab_switch':
                return 'Tab switch detected! This activity is being recorded.';
            case 'fullscreen_exit':
                return 'You exited fullscreen mode. Please return to fullscreen.';
            case 'window_blur':
                return 'Window focus lost! Please keep the test window active.';
            default:
                return 'Suspicious activity detected.';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-in zoom-in duration-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Warning!</h3>
                        <p className="text-sm text-gray-500">Violation #{count}</p>
                    </div>
                </div>

                <p className="text-gray-700 mb-6">{getMessage()}</p>

                <div className="flex gap-3">
                    {type === 'fullscreen_exit' && onReEnterFullscreen && (
                        <Button
                            onClick={() => {
                                onReEnterFullscreen();
                                setVisible(false);
                                onDismiss();
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Re-enter Fullscreen
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => {
                            setVisible(false);
                            onDismiss();
                        }}
                        className="flex-1"
                    >
                        I Understand
                    </Button>
                </div>
            </div>
        </div>
    );
}
