import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { getAccent } from '../../utils/themeTokens.js';

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
    // Small screens (including landscape phones with limited height) get full-screen windows
    const [isMaximized, setIsMaximized] = useState(() => window.innerWidth < 768 || window.innerHeight < 500);
    const [size, setSize] = useState(() => {
        const isMobile = window.innerWidth < 768 || window.innerHeight < 500;
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
    // Position set by edge snapping (drag to left/right edge = half screen, top = maximize)
    const [snapPos, setSnapPos] = useState(null);

    const handleDragStart = () => setSnapPos(null);

    const handleDragEnd = (e, info) => {
        const px = info.point.x;
        const py = info.point.y;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        if (py <= 8) {
            setIsMaximized(true);
            return;
        }
        const half = { width: Math.floor(vw / 2), height: vh - 48 };
        if (px <= 12) {
            setSize(half);
            setSnapPos({ x: 0, y: 0 });
        } else if (px >= vw - 12) {
            setSize(half);
            setSnapPos({ x: vw - half.width, y: 0 });
        }
    };

    const handleResize = (e, direction) => {
        e.stopPropagation();
        onFocus(id);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = size.width;
        const startHeight = size.height;

        const handlePointerMove = (eMove) => {
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            if (direction === 'right' || direction === 'both') {
                newWidth = Math.max(300, startWidth + (eMove.clientX - startX));
            }
            if (direction === 'bottom' || direction === 'both') {
                newHeight = Math.max(200, startHeight + (eMove.clientY - startY));
            }
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

    const accent = getAccent(theme);

    if (!isOpen) return null;

    const toggleMaximize = () => {
        setIsMaximized((prev) => {
            if (prev) setSnapPos(null);
            return !prev;
        });
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
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    initial={{ opacity: 0, scale: 0.95, ...defaultPosition }}
                    animate={{ 
                        opacity: isFocused ? 1 : 0.88, 
                        scale: 1,
                        x: isMaximized ? 0 : (snapPos ? snapPos.x : undefined),
                        y: isMaximized ? 0 : (snapPos ? snapPos.y : undefined),
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
                        className={`h-10 flex items-center justify-between px-3 cursor-grab active:cursor-grabbing border-b border-white/5 bg-gray-800/50 ${isFocused ? accent.windowFocus : ''}`}
                    >
                        <div className="flex items-center space-x-2 text-gray-300">
                            {icon}
                            <span className="text-sm font-semibold select-none">{title}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1.5" onPointerDown={(e) => e.stopPropagation()}>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onMinimize(id); }}
                                className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                aria-label="Minimize"
                            >
                                <Minus className="w-4 h-4 md:w-3.5 md:h-3.5" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
                                className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                aria-label={isMaximized ? 'Restore' : 'Maximize'}
                            >
                                {isMaximized ? <Maximize2 className="w-4 h-4 md:w-3.5 md:h-3.5" /> : <Square className="w-4 h-4 md:w-3.5 md:h-3.5" />}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onClose(id); }}
                                className="w-9 h-9 md:w-7 md:h-7 flex items-center justify-center rounded hover:bg-red-500 text-gray-400 hover:text-white transition-colors"
                                aria-label="Close"
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

                    {/* Edge Resize Handles */}
                    {!isMaximized && (
                        <>
                            {/* Right Edge */}
                            <div 
                                onPointerDown={(e) => handleResize(e, 'right')}
                                className="absolute top-0 right-0 w-2 h-full cursor-e-resize z-50 hover:bg-white/10 transition-colors"
                            />
                            {/* Bottom Edge */}
                            <div 
                                onPointerDown={(e) => handleResize(e, 'bottom')}
                                className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize z-50 hover:bg-white/10 transition-colors"
                            />
                            {/* Custom Bottom-Right Corner Resize Handle */}
                            <div 
                                onPointerDown={(e) => handleResize(e, 'both')}
                                className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-50 flex items-end justify-end p-1.5 opacity-50 hover:opacity-100 transition-opacity bg-transparent"
                            >
                                <svg viewBox="0 0 10 10" width="10" height="10" className="text-gray-400">
                                    <path d="M 8 10 L 10 8 M 5 10 L 10 5 M 2 10 L 10 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                                </svg>
                            </div>
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};
