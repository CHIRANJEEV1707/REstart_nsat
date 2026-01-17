'use client';

import { useEffect, useRef } from 'react';
import { useProctoring } from './ProctoringProvider';
import { Camera, Shield } from 'lucide-react';

export function CameraPreview() {
    const { cameraStream, cameraEnabled } = useProctoring();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && cameraStream) {
            videoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream]);

    if (!cameraEnabled) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-green-500">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-32 h-24 object-cover transform scale-x-[-1]"
                />
                <div className="absolute top-1 left-1 bg-green-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-white">PROCTORED</span>
                </div>
                <div className="absolute bottom-1 left-1 right-1 bg-black/60 px-1 py-0.5 rounded text-[9px] text-white flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    AI Monitoring Active
                </div>
            </div>
        </div>
    );
}
