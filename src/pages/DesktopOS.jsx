import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from '../components/ui/Window.jsx';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { Notepad } from '../components/os/Notepad.jsx';
import { 
    Terminal, 
    Globe, 
    Newspaper, 
    Folder, 
    Activity, 
    Monitor,
    ChevronUp,
    Wifi,
    Battery,
    Volume2,
    FileEdit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APPS = [
    { id: 'browser', title: 'Portfolio Edge', icon: <Globe className="w-4 h-4 text-blue-400" />, desktopIcon: <Globe className="w-10 h-10 text-blue-400" />, type: 'iframe', url: '/' },
    { id: 'terminal', title: 'Command Prompt', icon: <Terminal className="w-4 h-4 text-emerald-400" />, desktopIcon: <Terminal className="w-10 h-10 text-emerald-400" />, type: 'iframe', url: '/cli' },
    { id: 'notepad', title: 'Notepad', icon: <FileEdit className="w-4 h-4 text-purple-400" />, desktopIcon: <FileEdit className="w-10 h-10 text-purple-400" />, type: 'native', component: Notepad },
    { id: 'news', title: 'Tech Hub', icon: <Newspaper className="w-4 h-4 text-pink-400" />, desktopIcon: <Newspaper className="w-10 h-10 text-pink-400" />, type: 'iframe', url: '/tech-news' },
    { id: 'projects', title: 'File Explorer', icon: <Folder className="w-4 h-4 text-yellow-400" />, desktopIcon: <Folder className="w-10 h-10 text-yellow-400" />, type: 'iframe', url: '/projects' },
    { id: 'stats', title: 'Task Manager', icon: <Activity className="w-4 h-4 text-red-400" />, desktopIcon: <Activity className="w-10 h-10 text-red-400" />, type: 'iframe', url: '/stats' },
];

export const DesktopOS = ({ theme }) => {
    const navigate = useNavigate();
    const [windows, setWindows] = useState([]);
    const [topZIndex, setTopZIndex] = useState(10);
    const [time, setTime] = useState(new Date());
    const [isExiting, setIsExiting] = useState(false);
    const [wallpaper, setWallpaper] = useState('blobs');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const openApp = (appId) => {
        const existing = windows.find(w => w.id === appId);
        if (existing) {
            setWindows(windows.map(w => w.id === appId ? { ...w, isMinimized: false, zIndex: topZIndex + 1 } : w));
            setTopZIndex(topZIndex + 1);
        } else {
            setWindows([...windows, { id: appId, isOpen: true, isMinimized: false, zIndex: topZIndex + 1 }]);
            setTopZIndex(topZIndex + 1);
        }
    };

    const closeApp = (appId) => {
        setWindows(windows.filter(w => w.id !== appId));
    };

    const minimizeApp = (appId) => {
        setWindows(windows.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
    };

    const focusApp = (appId) => {
        setWindows(windows.map(w => w.id === appId ? { ...w, zIndex: topZIndex + 1 } : w));
        setTopZIndex(topZIndex + 1);
    };

    const toggleAppFromTaskbar = (appId) => {
        const existing = windows.find(w => w.id === appId);
        if (existing) {
            if (existing.isMinimized) {
                focusApp(appId);
                setWindows(prev => prev.map(w => w.id === appId ? { ...w, isMinimized: false } : w));
            } else if (existing.zIndex < topZIndex) {
                focusApp(appId);
            } else {
                minimizeApp(appId);
            }
        } else {
            openApp(appId);
        }
    };

    const handleExit = () => {
        setIsExiting(true);
        setTimeout(() => {
            navigate('/');
        }, 600); // Matches CRT animation duration
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY
        });
    };

    const closeContextMenu = () => {
        if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
    };

    const toggleWallpaper = () => {
        setWallpaper(prev => prev === 'blobs' ? 'solid' : 'blobs');
        closeContextMenu();
    };

    const crtVariants = {
        initial: { scaleY: 1, scaleX: 1, opacity: 1 },
        exit: { 
            scaleY: [1, 0.01, 0.01], 
            scaleX: [1, 1, 0], 
            opacity: [1, 1, 0],
            transition: { duration: 0.6, times: [0, 0.4, 1] } 
        }
    };

    return (
        <motion.div 
            className="fixed inset-0 w-full h-full overflow-hidden bg-black text-white font-sans select-none flex items-center justify-center"
            initial="initial"
            animate={isExiting ? "exit" : "initial"}
            variants={crtVariants}
            onClick={closeContextMenu}
            onContextMenu={handleContextMenu}
        >
            <div className="relative w-full h-full bg-gray-900 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)]">
                {/* Wallpaper */}
                <div className="absolute inset-0 z-0 transition-colors duration-1000">
                    {wallpaper === 'blobs' ? (
                        <>
                            <BackgroundBlobs theme={theme} darkMode={true} />
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
                    )}
                </div>

                {/* Desktop Icons */}
                <div className="absolute inset-0 z-10 p-6 flex flex-col items-start gap-6 content-start flex-wrap">
                    {APPS.map((app) => (
                        <div 
                            key={app.id}
                            onDoubleClick={(e) => { e.stopPropagation(); openApp(app.id); }}
                            className="flex flex-col items-center justify-center w-24 p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                        >
                            <div className="drop-shadow-lg group-hover:scale-110 transition-transform duration-200">
                                {app.desktopIcon}
                            </div>
                            <span className="mt-2 text-xs font-medium text-center drop-shadow-md bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm">
                                {app.title}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Custom Context Menu */}
                <AnimatePresence>
                    {contextMenu.visible && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute z-[9999] w-48 py-1 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                                onClick={toggleWallpaper}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Change Wallpaper
                            </button>
                            <button 
                                onClick={() => {
                                    setWindows([]);
                                    closeContextMenu();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                Refresh Desktop
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Windows Window Manager */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    {windows.map(win => {
                        const appDef = APPS.find(a => a.id === win.id);
                        if (!appDef) return null;
                        const isFocused = win.zIndex === Math.max(...windows.map(w => w.zIndex));
                        
                        return (
                            <div key={win.id} className="pointer-events-auto">
                                <Window
                                    id={win.id}
                                    title={appDef.title}
                                    icon={appDef.icon}
                                    isOpen={win.isOpen}
                                    isMinimized={win.isMinimized}
                                    isFocused={isFocused}
                                    zIndex={win.zIndex}
                                    onClose={closeApp}
                                    onMinimize={minimizeApp}
                                    onFocus={focusApp}
                                    theme={theme}
                                >
                                    {appDef.type === 'iframe' ? (
                                        <iframe 
                                            src={appDef.url} 
                                            className="w-full h-full border-0 bg-gray-900"
                                            title={appDef.title}
                                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        />
                                    ) : (
                                        <appDef.component theme={theme} />
                                    )}
                                </Window>
                            </div>
                        );
                    })}
                </div>

                {/* Taskbar */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-900/80 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-between px-4">
                    {/* Start Button & Centered Apps */}
                    <div className="flex-1 flex items-center justify-center space-x-2">
                        <button 
                            onClick={handleExit}
                            className="w-10 h-10 flex items-center justify-center rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors group"
                            title="Turn Off OS"
                        >
                            <Monitor className={`w-5 h-5 transition-transform group-hover:scale-110`} />
                        </button>
                        
                        <div className="w-px h-6 bg-white/20 mx-2" />

                        {APPS.map((app) => {
                            const win = windows.find(w => w.id === app.id);
                            const isOpen = !!win;
                            const isFocused = isOpen && win.zIndex === Math.max(...windows.map(w => w.zIndex)) && !win.isMinimized;
                            
                            return (
                                <button
                                    key={app.id}
                                    onClick={(e) => { e.stopPropagation(); toggleAppFromTaskbar(app.id); }}
                                    className={`relative w-10 h-10 flex items-center justify-center rounded transition-all duration-200 
                                        ${isFocused ? 'bg-white/15 shadow-inner' : 'hover:bg-white/10'}
                                    `}
                                >
                                    {app.icon}
                                    {isOpen && (
                                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-1 rounded-t-full transition-all duration-200
                                            ${isFocused ? (theme === 'pink' ? 'bg-pink-400' : 'bg-emerald-400') : 'bg-gray-400 w-1.5'}
                                        `} />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* System Tray */}
                    <div className="flex-shrink-0 flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-gray-400 hover:bg-white/10 px-2 py-1 rounded cursor-default transition-colors">
                            <ChevronUp className="w-4 h-4" />
                            <Wifi className="w-4 h-4" />
                            <Volume2 className="w-4 h-4" />
                            <Battery className="w-4 h-4" />
                        </div>
                        
                        <div className="flex flex-col items-end text-xs text-gray-300 hover:bg-white/10 px-2 py-1 rounded cursor-default transition-colors">
                            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>{time.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
