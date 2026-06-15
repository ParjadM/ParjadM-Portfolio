import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import { Window } from '../components/ui/Window.jsx';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { Loader2 } from 'lucide-react';

const Notepad = React.lazy(() => import('../components/os/Notepad.jsx').then(module => ({ default: module.Notepad })));
const BrowserApp = React.lazy(() => import('../components/os/BrowserApp.jsx').then(module => ({ default: module.BrowserApp })));
const CalculatorApp = React.lazy(() => import('../components/os/CalculatorApp.jsx').then(module => ({ default: module.CalculatorApp })));
const WeatherApp = React.lazy(() => import('../components/os/WeatherApp.jsx').then(module => ({ default: module.WeatherApp })));
const SettingsApp = React.lazy(() => import('../components/os/SettingsApp.jsx').then(module => ({ default: module.SettingsApp })));
const MediaPlayerApp = React.lazy(() => import('../components/os/MediaPlayerApp.jsx').then(module => ({ default: module.MediaPlayerApp })));
const SnakeGameApp = React.lazy(() => import('../components/os/SnakeGameApp.jsx').then(module => ({ default: module.SnakeGameApp })));
const CameraApp = React.lazy(() => import('../components/os/CameraApp.jsx').then(module => ({ default: module.CameraApp })));
const AIAssistantApp = React.lazy(() => import('../components/os/AIAssistantApp.jsx').then(module => ({ default: module.AIAssistantApp })));
const FileSystemApp = React.lazy(() => import('../components/os/FileSystemApp.jsx').then(module => ({ default: module.FileSystemApp })));
const YoutubeApp = React.lazy(() => import('../components/os/YoutubeApp.jsx').then(module => ({ default: module.YoutubeApp })));
const TerminalApp = React.lazy(() => import('../components/os/TerminalApp.jsx').then(module => ({ default: module.TerminalApp })));
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
    ShieldCheck,
    FileText,
    Code,
    Search,
    Power,
    LayoutGrid
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
    { id: 'snake', title: 'Snake Game', icon: <Gamepad2 className="w-4 h-4 text-green-500" />, desktopIcon: <Gamepad2 className="w-10 h-10 text-green-500" />, type: 'native', component: SnakeGameApp, defaultSize: { width: 600, height: 650 } },
    { id: 'terminal', title: 'Command Prompt', icon: <Terminal className="w-4 h-4 text-emerald-400" />, desktopIcon: <Terminal className="w-10 h-10 text-emerald-400" />, type: 'native', component: TerminalApp },
    { id: 'notepad', title: 'Notepad', icon: <FileEdit className="w-4 h-4 text-purple-400" />, desktopIcon: <FileEdit className="w-10 h-10 text-purple-400" />, type: 'native', component: Notepad },
    { id: 'news', title: 'Tech Hub', icon: <Newspaper className="w-4 h-4 text-pink-400" />, desktopIcon: <Newspaper className="w-10 h-10 text-pink-400" />, type: 'iframe', url: '/tech-news' },
    { id: 'stats', title: 'Task Manager', icon: <Activity className="w-4 h-4 text-red-400" />, desktopIcon: <Activity className="w-10 h-10 text-red-400" />, type: 'iframe', url: '/stats' },
    { id: 'github', title: 'GitHub', icon: <Code className="w-4 h-4 text-white" />, desktopIcon: <Code className="w-10 h-10 text-white" />, type: 'link', url: 'https://github.com/ParjadM' },
];

export const DesktopOS = ({ theme }) => {
    const navigate = useNavigate();
    const [windows, setWindows] = useState([]);
    const [topZIndex, setTopZIndex] = useState(10);
    const [time, setTime] = useState(new Date());
    const [isExiting, setIsExiting] = useState(false);
    const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('os_wallpaper') || 'blobs');
    const [osTheme, setOsTheme] = useState(() => localStorage.getItem('os_theme') || 'emerald');
    const [isClockExpanded, setIsClockExpanded] = useState(false);
    const [isTrayExpanded, setIsTrayExpanded] = useState(false);
    const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
    const [startMenuSearch, setStartMenuSearch] = useState('');
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
    
    // Global OS State
    const [photos, setPhotos] = useState([]);
    const [fileSystem, setFileSystem] = useState(() => {
        const saved = localStorage.getItem('os_file_system');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        return {
            name: 'C:',
            type: 'drive',
            children: [
                {
                    name: 'Users',
                    type: 'folder',
                    children: [
                        {
                            name: 'Guest',
                            type: 'folder',
                            children: [
                                {
                                    name: 'Documents',
                                    type: 'folder',
                                    children: [
                                        { name: 'Welcome.txt', type: 'file', content: 'Welcome to Parjad WebOS! Feel free to explore.' },
                                        { name: 'Secret.txt', type: 'file', content: 'You found the secret file. 42 is the answer.' }
                                    ]
                                },
                                {
                                    name: 'Pictures',
                                    type: 'folder',
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    });

    const [desktopIcons, setDesktopIcons] = useState(() => {
        const saved = localStorage.getItem('os_desktop_icons');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        return [
            { id: 'browser', x: 20, y: 20 },
            { id: 'filesystem', x: 20, y: 120 },
            { id: 'terminal', x: 20, y: 220 },
            { id: 'settings', x: 20, y: 320 }
        ];
    });

    useEffect(() => { localStorage.setItem('os_wallpaper', wallpaper); }, [wallpaper]);
    useEffect(() => { localStorage.setItem('os_theme', osTheme); }, [osTheme]);
    useEffect(() => { localStorage.setItem('os_file_system', JSON.stringify(fileSystem)); }, [fileSystem]);
    useEffect(() => { localStorage.setItem('os_desktop_icons', JSON.stringify(desktopIcons)); }, [desktopIcons]);

    useEffect(() => {
        const saved = localStorage.getItem('os_camera_photos');
        if (saved) {
            try { setPhotos(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    useEffect(() => {
        setFileSystem(prev => {
            const newFs = JSON.parse(JSON.stringify(prev));
            const users = newFs.children.find(c => c.name === 'Users');
            const guest = users?.children.find(c => c.name === 'Guest');
            const pictures = guest?.children.find(c => c.name === 'Pictures');
            if (pictures) {
                pictures.children = photos.map(p => ({
                    name: `Snapshot-${p.id}.jpg`,
                    type: 'image',
                    url: p.url
                }));
            }
            return newFs;
        });
    }, [photos]);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const openApp = (appId) => {
        const app = APPS.find(a => a.id === appId);
        if (app?.type === 'link') {
            window.open(app.url, '_blank');
            return;
        }

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
        if (isStartMenuOpen) setIsStartMenuOpen(false);
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
                            <BackgroundBlobs theme={osTheme} darkMode={true} />
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                        </>
                    ) : wallpaper === 'solid' ? (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
                    ) : (
                        <div className="absolute inset-0">
                            <img src={wallpaper} alt="Wallpaper" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    )}
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

                {/* Draggable Desktop Icons */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    {desktopIcons.map(iconConfig => {
                        const appDef = APPS.find(a => a.id === iconConfig.id);
                        if (!appDef) return null;
                        return (
                            <motion.div
                                key={iconConfig.id}
                                drag
                                dragMomentum={false}
                                onDragEnd={(e, info) => {
                                    setDesktopIcons(prev => prev.map(icon => 
                                        icon.id === iconConfig.id 
                                            ? { ...icon, x: icon.x + info.offset.x, y: icon.y + info.offset.y }
                                            : icon
                                    ));
                                }}
                                initial={{ x: iconConfig.x, y: iconConfig.y }}
                                className="absolute pointer-events-auto flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer w-24"
                                onDoubleClick={(e) => { e.stopPropagation(); openApp(iconConfig.id); }}
                            >
                                <div className="group-hover:scale-110 transition-transform duration-200">
                                    {appDef.desktopIcon}
                                </div>
                                <span className="mt-1 text-xs text-white text-center drop-shadow-md font-medium px-1 bg-black/20 rounded break-words w-full">
                                    {appDef.title}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Windows Window Manager */}
                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
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
                                    defaultSize={appDef.defaultSize}
                                >
                                    {appDef.type === 'iframe' ? (
                                        <iframe 
                                            src={appDef.url} 
                                            className="w-full h-full border-0 bg-gray-900"
                                            title={appDef.title}
                                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                        />
                                    ) : (
                                        <Suspense fallback={<div className="h-full w-full flex flex-col items-center justify-center text-white space-y-4"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /><span>Loading App...</span></div>}>
                                            <appDef.component theme={osTheme} osState={{ wallpaper, setWallpaper, fileSystem, setFileSystem, osTheme, setOsTheme }} />
                                        </Suspense>
                                    )}
                                </Window>
                            </div>
                        );
                    })}
                </div>

                {/* Start Menu Overlay */}
                <AnimatePresence>
                    {isStartMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute bottom-14 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-gray-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-6 z-[60] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Type here to search apps..." 
                                    value={startMenuSearch}
                                    onChange={(e) => setStartMenuSearch(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all"
                                />
                            </div>
                            
                            <div className="flex justify-between items-center mb-4 px-2">
                                <span className="font-semibold text-white">Pinned apps</span>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-6">
                                {APPS.filter(a => a.title.toLowerCase().includes(startMenuSearch.toLowerCase())).map(app => (
                                    <button 
                                        key={app.id}
                                        onClick={() => { openApp(app.id); setIsStartMenuOpen(false); }}
                                        className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="group-hover:scale-110 transition-transform duration-200">
                                            {app.desktopIcon}
                                        </div>
                                        <span className="mt-2 text-xs text-gray-300 text-center truncate w-full">{app.title}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center px-2">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                        P
                                    </div>
                                    <span className="text-sm text-gray-200 font-medium">Guest User</span>
                                </div>
                                <button 
                                    onClick={handleExit}
                                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors group"
                                    title="Shut Down"
                                >
                                    <Power className="w-5 h-5 transition-transform group-hover:scale-110" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Taskbar */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gray-900/80 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-between px-2 sm:px-4">
                    {/* Start Button & Centered Apps */}
                    <div className="flex-1 flex items-center justify-start sm:justify-center space-x-2 overflow-x-auto overflow-y-hidden scrollbar-hide pr-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setIsStartMenuOpen(!isStartMenuOpen); closeContextMenu(); }}
                            className={`w-10 h-10 flex items-center justify-center rounded transition-all group ${isStartMenuOpen ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}`}
                            title="Start"
                        >
                            <LayoutGrid className={`w-5 h-5 text-blue-400 transition-transform group-hover:scale-110`} />
                        </button>
                        
                        <div className="w-px h-6 bg-white/20 mx-2" />

                        {APPS.map((app) => {
                            const win = windows.find(w => w.id === app.id);
                            if (!win) return null;
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
                            onClick={(e) => { e.stopPropagation(); setIsTrayExpanded(!isTrayExpanded); setIsClockExpanded(false); }}
                            className="hidden sm:flex items-center space-x-2 text-gray-400 hover:bg-white/10 px-2 py-1 rounded cursor-pointer transition-colors"
                        >
                            <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${isTrayExpanded ? 'rotate-180' : ''}`} />
                            <Wifi className="w-4 h-4" />
                            <Volume2 className="w-4 h-4" />
                            <Battery className="w-4 h-4" />
                        </div>
                        
                        <div 
                            onClick={(e) => { e.stopPropagation(); setIsClockExpanded(!isClockExpanded); setIsTrayExpanded(false); }}
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
