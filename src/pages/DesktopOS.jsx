import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Window } from '../components/ui/Window.jsx';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { Notepad } from '../components/os/Notepad.jsx';
import { BrowserApp } from '../components/os/BrowserApp.jsx';
import { CalculatorApp } from '../components/os/CalculatorApp.jsx';
import { WeatherApp } from '../components/os/WeatherApp.jsx';
import { SettingsApp } from '../components/os/SettingsApp.jsx';
import { MediaPlayerApp } from '../components/os/MediaPlayerApp.jsx';
import { SnakeGameApp } from '../components/os/SnakeGameApp.jsx';
import { CameraApp } from '../components/os/CameraApp.jsx';
import { AIAssistantApp } from '../components/os/AIAssistantApp.jsx';
import { FileSystemApp } from '../components/os/FileSystemApp.jsx';
import { YoutubeApp } from '../components/os/YoutubeApp.jsx';
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
    FileEdit,
    Compass,
    Calculator,
    CloudSun,
    Settings,
    Music,
    Gamepad2,
    Camera,
    Bot,
    Video,
    Bluetooth,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APPS = [
    { id: 'browser', title: 'Web Browser', icon: <Compass className="w-4 h-4 text-blue-500" />, desktopIcon: <Compass className="w-10 h-10 text-blue-500" />, type: 'native', component: BrowserApp },
    { id: 'filesystem', title: 'File Explorer', icon: <Folder className="w-4 h-4 text-yellow-500" />, desktopIcon: <Folder className="w-10 h-10 text-yellow-500" />, type: 'native', component: FileSystemApp },
    { id: 'youtube', title: 'YouTube', icon: <Video className="w-4 h-4 text-red-500" />, desktopIcon: <Video className="w-10 h-10 text-red-500" />, type: 'native', component: YoutubeApp },
    { id: 'assistant', title: 'AI Assistant', icon: <Bot className="w-4 h-4 text-emerald-500" />, desktopIcon: <Bot className="w-10 h-10 text-emerald-500" />, type: 'native', component: AIAssistantApp },
    { id: 'camera', title: 'Camera', icon: <Camera className="w-4 h-4 text-pink-500" />, desktopIcon: <Camera className="w-10 h-10 text-pink-500" />, type: 'native', component: CameraApp },
    { id: 'settings', title: 'Settings', icon: <Settings className="w-4 h-4 text-gray-400" />, desktopIcon: <Settings className="w-10 h-10 text-gray-400" />, type: 'native', component: SettingsApp },
    { id: 'portfolio', title: 'Portfolio Home', icon: <Globe className="w-4 h-4 text-blue-400" />, desktopIcon: <Globe className="w-10 h-10 text-blue-400" />, type: 'iframe', url: '/' },
    { id: 'calculator', title: 'Calculator', icon: <Calculator className="w-4 h-4 text-orange-400" />, desktopIcon: <Calculator className="w-10 h-10 text-orange-400" />, type: 'native', component: CalculatorApp },
    { id: 'weather', title: 'Weather', icon: <CloudSun className="w-4 h-4 text-sky-400" />, desktopIcon: <CloudSun className="w-10 h-10 text-sky-400" />, type: 'native', component: WeatherApp },
    { id: 'music', title: 'Media Player', icon: <Music className="w-4 h-4 text-purple-500" />, desktopIcon: <Music className="w-10 h-10 text-purple-500" />, type: 'native', component: MediaPlayerApp },
    { id: 'snake', title: 'Snake Game', icon: <Gamepad2 className="w-4 h-4 text-green-500" />, desktopIcon: <Gamepad2 className="w-10 h-10 text-green-500" />, type: 'native', component: SnakeGameApp },
    { id: 'terminal', title: 'Command Prompt', icon: <Terminal className="w-4 h-4 text-emerald-400" />, desktopIcon: <Terminal className="w-10 h-10 text-emerald-400" />, type: 'iframe', url: '/cli' },
    { id: 'notepad', title: 'Notepad', icon: <FileEdit className="w-4 h-4 text-purple-400" />, desktopIcon: <FileEdit className="w-10 h-10 text-purple-400" />, type: 'native', component: Notepad },
    { id: 'news', title: 'Tech Hub', icon: <Newspaper className="w-4 h-4 text-pink-400" />, desktopIcon: <Newspaper className="w-10 h-10 text-pink-400" />, type: 'iframe', url: '/tech-news' },
    { id: 'stats', title: 'Task Manager', icon: <Activity className="w-4 h-4 text-red-400" />, desktopIcon: <Activity className="w-10 h-10 text-red-400" />, type: 'iframe', url: '/stats' },
    { id: 'resume', title: 'Resume.pdf', icon: <FileText className="w-4 h-4 text-red-400" />, desktopIcon: <FileText className="w-10 h-10 text-red-400" />, type: 'iframe', url: '/resume.pdf' },
    { id: 'github', title: 'GitHub', icon: <Github className="w-4 h-4 text-white" />, desktopIcon: <Github className="w-10 h-10 text-white" />, type: 'link', url: 'https://github.com/ParjadM' },
];

export const DesktopOS = ({ theme }) => {
    const navigate = useNavigate();
    const [windows, setWindows] = useState([]);
    const [topZIndex, setTopZIndex] = useState(10);
    const [time, setTime] = useState(new Date());
    const [isExiting, setIsExiting] = useState(false);
    const [wallpaper, setWallpaper] = useState('blobs');
    const [isClockExpanded, setIsClockExpanded] = useState(false);
    const [isTrayExpanded, setIsTrayExpanded] = useState(false);
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
        initial: { scaleY: 0.8, scaleX: 1, opacity: 0.5 },
        exit: { 
            scaleY: [0.8, 0.005, 0.005], 
            scaleX: [1, 1, 0], 
            opacity: [0.8, 1, 0],
            transition: { duration: 0.5, ease: "easeOut", times: [0, 0.4, 1] } 
        }
    };

    return (
        <div 
            className="fixed inset-0 w-full h-full overflow-hidden bg-black text-white font-sans select-none flex items-center justify-center"
            onClick={closeContextMenu}
            onContextMenu={handleContextMenu}
        >
            <div className={`relative w-full h-full bg-gray-900 overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.1)] transition-opacity duration-75 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
                                        <appDef.component theme={theme} osState={{ wallpaper, setWallpaper }} />
                                    )}
                                </Window>
                            </div>
                        );
                    })}
                </div>

                {/* Taskbar */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-900/80 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-between px-2 sm:px-4 overflow-hidden">
                    {/* Start Button & Centered Apps */}
                    <div className="flex-1 flex items-center justify-start sm:justify-center space-x-2 overflow-x-auto overflow-y-hidden scrollbar-hide pr-2">
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
                    <div className="flex-shrink-0 flex items-center space-x-2 sm:space-x-4 pl-2 border-l border-white/10 sm:border-0 ml-auto relative">
                        <div 
                            onClick={() => { setIsTrayExpanded(!isTrayExpanded); setIsClockExpanded(false); }}
                            className="hidden sm:flex items-center space-x-2 text-gray-400 hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors"
                        >
                            <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${isTrayExpanded ? 'rotate-180' : ''}`} />
                            <Wifi className="w-4 h-4" />
                            <Volume2 className="w-4 h-4" />
                            <Battery className="w-4 h-4" />
                        </div>
                        
                        <div 
                            onClick={() => { setIsClockExpanded(!isClockExpanded); setIsTrayExpanded(false); }}
                            className="flex flex-col items-end text-[10px] sm:text-xs text-gray-300 hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors whitespace-nowrap"
                        >
                            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="hidden sm:block">{time.toLocaleDateString()}</span>
                        </div>

                        {/* Tray Popover */}
                        <AnimatePresence>
                            {isTrayExpanded && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-14 right-24 w-48 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl flex flex-col space-y-2 z-50"
                                >
                                    <div className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-white">
                                        <Bluetooth className="w-5 h-5 text-blue-400" />
                                        <span className="text-sm">Bluetooth</span>
                                    </div>
                                    <div className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-white">
                                        <ShieldCheck className="w-5 h-5 text-green-400" />
                                        <span className="text-sm">Security</span>
                                    </div>
                                    <div className="flex items-center space-x-3 p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors text-white">
                                        <Volume2 className="w-5 h-5 text-purple-400" />
                                        <span className="text-sm flex-1">Volume</span>
                                        <span className="text-xs text-gray-400">80%</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Clock Popover */}
                        <AnimatePresence>
                            {isClockExpanded && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-14 right-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col items-center z-50 text-white"
                                >
                                    <div className="text-5xl font-light tracking-tighter mb-2">
                                        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="text-emerald-400 text-sm font-medium mb-6">
                                        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </div>
                                    
                                    {/* Mini Calendar Grid (Visual Only) */}
                                    <div className="w-full grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                                    </div>
                                    <div className="w-full grid grid-cols-7 gap-1 text-center text-sm">
                                        {/* Just some dummy days for the visual effect */}
                                        {Array.from({length: 31}).map((_, i) => (
                                            <div key={i} className={`p-1 rounded-full ${i+1 === time.getDate() ? 'bg-emerald-500 text-white font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'hover:bg-white/10 cursor-pointer'}`}>
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* High-Performance CRT Animation Overlay */}
            {isExiting && (
                <motion.div
                    className="absolute z-[99999] bg-white w-full h-full shadow-[0_0_50px_rgba(255,255,255,0.8)]"
                    initial="initial"
                    animate="exit"
                    variants={crtVariants}
                />
            )}
        </div>
    );
};
