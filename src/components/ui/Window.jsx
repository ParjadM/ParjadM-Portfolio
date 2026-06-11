import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isMaximized, setIsMaximized] = useState(false);
    const windowRef = useRef(null);

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
                    dragMomentum={false}
                    dragConstraints={{ left: 0, top: 0, right: window.innerWidth - 100, bottom: window.innerHeight - 100 }}
                    initial={{ opacity: 0, scale: 0.95, ...defaultPosition }}
                    animate={{ 
                        opacity: 1, 
                        scale: 1,
                        x: isMaximized ? 0 : undefined,
                        y: isMaximized ? 0 : undefined,
                        width: isMaximized ? '100vw' : defaultSize.width,
                        height: isMaximized ? 'calc(100vh - 48px)' : defaultSize.height, // 48px for taskbar
                        zIndex: zIndex
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    onPointerDown={handlePointerDown}
                    className="absolute shadow-2xl flex flex-col rounded-xl overflow-hidden bg-gray-900/80 backdrop-blur-xl border border-white/10"
                    style={{ position: 'absolute' }}
                >
                    {/* Title Bar (Drag Handle) */}
                    <div 
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
                </motion.div>
            )}
        </AnimatePresence>
    );
};
