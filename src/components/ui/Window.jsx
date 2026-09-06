import React, { useEffect, useRef, useState } from 'react';
import { Minus, Square, X, Columns2 } from 'lucide-react';
import { getAccent } from '../../utils/themeTokens.js';

const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });
export const Window = ({ id, title, icon, isOpen, isMinimized, isFocused, zIndex, onClose, onMinimize, onFocus, children, theme = 'emerald', defaultSize = { width: 600, height: 400 }, defaultPosition = { x: 50, y: 50 } }) => {
    const [screen, setScreen] = useState(viewport);
    const [mode, setMode] = useState('floating');
    const [bounds, setBounds] = useState({ ...defaultPosition, ...defaultSize });
    const cleanup = useRef(() => {});
    const mobile = screen.width < 768 || screen.height < 500;
    const accent = getAccent(theme);
    useEffect(() => {
        const resize = () => setScreen(viewport());
        window.addEventListener('resize', resize);
        return () => { window.removeEventListener('resize', resize); cleanup.current(); };
    }, []);
    useEffect(() => { if (isMinimized) cleanup.current(); }, [isMinimized]);
    const availableHeight = Math.max(120, screen.height - 80);
    const width = Math.min(bounds.width, screen.width);
    const height = Math.min(bounds.height, availableHeight);
    const rect = {
        width, height,
        x: Math.max(0, Math.min(bounds.x, screen.width - width)),
        y: Math.max(0, Math.min(bounds.y, availableHeight - height)),
    };
    const startGesture = (event, resize = false) => {
        if (mobile || mode !== 'floating' || event.button !== 0) return;
        event.preventDefault();
        onFocus(id);
        cleanup.current();
        const start = { x: event.clientX, y: event.clientY, ...{ rect } };
        const target = event.currentTarget;
        target.setPointerCapture(event.pointerId);
        const move = (e) => {
            const dx = e.clientX - start.x, dy = e.clientY - start.y;
            setBounds(resize ? {
                ...rect,
                width: Math.min(screen.width - rect.x, Math.max(280, rect.width + dx)),
                height: Math.min(availableHeight - rect.y, Math.max(180, rect.height + dy)),
            } : { ...rect, x: Math.max(0, Math.min(screen.width - rect.width, rect.x + dx)), y: Math.max(0, Math.min(availableHeight - rect.height, rect.y + dy)) });
        };
        const stop = (e) => {
            cleanup.current();
            if (!resize && e.type === 'pointerup') {
                if (e.clientY < 12) setMode('maximized');
                else if (e.clientX < 16) setMode('left');
                else if (e.clientX > screen.width - 16) setMode('right');
            }
        };
        cleanup.current = () => {
            target.removeEventListener('pointermove', move);
            target.removeEventListener('pointerup', stop);
            target.removeEventListener('pointercancel', stop);
            if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
        };
        target.addEventListener('pointermove', move);
        target.addEventListener('pointerup', stop);
        target.addEventListener('pointercancel', stop);
    };
    if (!isOpen) return null;
    const full = mobile || mode === 'maximized';
    const snapped = mode === 'left' || mode === 'right';
    const toggleMaximize = () => setMode(mode === 'floating' ? 'maximized' : 'floating');
    return (
        <section aria-label={title} data-os-window={id} onPointerDown={() => onFocus(id)} onFocusCapture={() => { if (!isFocused) onFocus(id); }}
            className={`os-window absolute flex flex-col overflow-hidden border rounded-xl shadow-2xl ${isFocused ? 'border-white/30' : 'border-white/10'} bg-gray-900`}
            style={{ display: isMinimized ? 'none' : undefined, zIndex, left: full ? 0 : snapped ? (mode === 'right' ? '50%' : 0) : rect.x, top: full || snapped ? 0 : rect.y, width: full ? '100%' : snapped ? '50%' : rect.width, height: full || snapped ? 'calc(100dvh - 64px - env(safe-area-inset-bottom, 0px))' : rect.height, borderRadius: full ? 0 : undefined }}>
            <div onPointerDown={startGesture} onDoubleClick={() => { if (!mobile) toggleMaximize(); }} className={`flex shrink-0 h-12 items-center justify-between pl-3 border-b border-white/10 select-none ${isFocused ? accent.windowFocus : 'bg-gray-800'} ${!mobile && mode === 'floating' ? 'cursor-grab' : ''}`} style={{ touchAction: 'none' }}>
                <div className="flex items-center gap-2 min-w-0 text-gray-200"><span className="shrink-0">{icon}</span><span className="text-sm font-semibold truncate">{title}</span></div>
                <div className="flex shrink-0" onPointerDown={e => e.stopPropagation()} onDoubleClick={e => e.stopPropagation()}>
                    <button className="os-window-control" aria-label={`Minimize ${title}`} onClick={() => onMinimize(id)}><Minus size={17} /></button>
                    {!mobile && <><button className="os-window-control" aria-label={`Snap ${title} ${mode === 'left' ? 'right' : 'left'}`} onClick={() => setMode(mode === 'left' ? 'right' : 'left')}><Columns2 size={17} /></button><button className="os-window-control" aria-label={`${mode === 'floating' ? 'Maximize' : 'Restore'} ${title}`} onClick={toggleMaximize}><Square size={15} /></button></>}
                    <button className="os-window-control hover:!bg-red-600" aria-label={`Close ${title}`} onClick={() => onClose(id)}><X size={18} /></button>
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto overscroll-contain relative">{children}</div>
            {!mobile && mode === 'floating' && <div onPointerDown={e => startGesture(e, true)} aria-hidden="true" className="absolute bottom-0 right-0 w-7 h-7 cursor-se-resize touch-none text-gray-400 flex items-center justify-center">◢</div>}
        </section>
    );
};
