import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { GlassCard } from './GlassCard.jsx';

export const Window = ({ 
    id, 
    title, 
    icon, 
    isOpen, 
    isMinimized, 
    isFocused, 
    zIndex, 
    onClose, 
    onMinimize, 
    onFocus,
    children,
    theme = 'emerald',
    defaultSize = { width: 600, height: 400 },
    defaultPosition = { x: 50, y: 50 }
}) => {
    const [isMaximized, setIsMaximized] = useState(() => window.innerWidth < 768);
    const [size, setSize] = useState(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) {
            return { width: window.innerWidth, height: window.innerHeight - 48 };
        }
        return {
            width: Math.min(defaultSize.width, window.innerWidth - 40),
            height: Math.min(defaultSize.height, window.innerHeight - 100)
        };
    });
    const windowRef = useRef(null);
    const dragControls = useDragControls();

    const handleResizeStart = (e) => {
        e.stopPropagation();
        onFocus(id);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handlePointerMove = (eMove) => {
            const newWidth = Math.max(300, startWidth + (eMove.clientX - startX));
            const newHeight = Math.max(200, startHeight + (eMove.clientY - startY));
            setSize({ width: newWidth, height: newHeight });
        };

        const handlePointerUp = () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', handlePointerUp);
        };

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', handlePointerUp);
    };

    // Bring to front on click
    const handlePointerDown = () => {
        onFocus(id);
    };

    if (!isOpen) return null;

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    return (
        <AnimatePresence>
            {!isMinimized && (
                <motion.div
                    ref={windowRef}
                    drag={!isMaximized}
                    dragListener={false}
                    dragControls={dragControls}
                    dragMomentum={false}
                    dragConstraints={{ left: 0, top: 0, right: window.innerWidth - 100, bottom: window.innerHeight - 100 }}
                    initial={{ opacity: 0, scale: 0.95, ...defaultPosition }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        x: isMaximized ? 0 : undefined,
                        y: isMaximized ? 0 : undefined,
                        width: isMaximized ? '100vw' : size.width,
                        height: isMaximized ? 'calc(100vh - 48px)' : size.height, // 48px for taskbar
                        zIndex: zIndex
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ 
                        default: { type: "spring", bounce: 0, duration: 0.3 },
                        width: { type: "tween", duration: 0 },
                        height: { type: "tween", duration: 0 }
                    }}
                    onPointerDown={handlePointerDown}
                    className="absolute shadow-2xl flex flex-col rounded-xl overflow-hidden bg-gray-900/80 backdrop-blur-xl border border-white/10"
                    style={{ position: 'absolute' }}
                >
                    {/* Title Bar (Drag Handle) */}
                    <div 
                        onPointerDown={(e) => dragControls.start(e)}
                        className={`h-10 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-white/5 bg-gray-800/50 ${isFocused ? (theme === 'pink' ? 'bg-pink-900/20' : 'bg-emerald-900/20') : ''}`}
                    >
                        <div className="flex items-center space-x-2 text-gray-300">
                            {icon}
                            <span className="text-sm font-semibold select-none">{title}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1.5" onPointerDown={(e) => e.stopPropagation()}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                {isMaximized ? <Maximize2 className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onClose(id); }}
                                className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Window Content */}
                    <div className="flex-1 overflow-auto bg-gray-900/40 relative">
                        {isFocused && <div className="absolute inset-0 pointer-events-none border border-transparent shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />}
                        {children}
                    </div>

                    {/* Custom Resize Handle */}
                    {!isMaximized && (
                        <div 
                            onPointerDown={handleResizeStart}
                            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1.5 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <svg viewBox="0 0 10 10" width="10" height="10" className="text-gray-400">
                                <path d="M 8 10 L 10 8 M 5 10 L 10 5 M 2 10 L 10 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                            </svg>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
