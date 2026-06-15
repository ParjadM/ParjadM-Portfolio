import React, { useState, useEffect } from 'react';

export const BootSequence = ({ onComplete }) => {
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const bootLog = [
            "WebOS Kernel Version 10.4.2 Booting...",
            "Loading ACPI drivers... OK",
            "Mounting virtual file system (VFS)... OK",
            "Checking memory: 131072M OK",
            "Initializing Neural Engine... OK",
            "Loading GPU drivers... OK",
            "Starting system bus... OK",
            "Starting network manager... OK",
            "Starting user session for Parjad M...",
            "Welcome to WebOS."
        ];

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex < bootLog.length) {
                setLines(prev => [...prev, bootLog[currentIndex]]);
                currentIndex++;
            } else {
                clearInterval(interval);
                setTimeout(onComplete, 800); // Wait a bit before finishing
            }
        }, 150); // Speed of text appearing

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black text-green-500 font-mono text-sm p-6 overflow-hidden z-[9999] flex flex-col justify-start items-start">
            {lines.map((line, i) => (
                <div key={i} className="mb-1">{line}</div>
            ))}
            {lines.length < 10 && (
                <div className="w-2 h-4 bg-green-500 animate-pulse mt-1" />
            )}
        </div>
    );
};
