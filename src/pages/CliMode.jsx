import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { SEO } from '../components/SEO.jsx';
import { useTerminalEngine } from '../os/useTerminalEngine.js';
import { loadFileSystem, saveFileSystem } from '../os/filesystem.js';
import { setPendingLaunch } from '../os/events.js';

const TypewriterText = ({ text, speed = 10 }) => {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayed(text.substring(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(timer);
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);
    return <span className="whitespace-pre-wrap">{displayed}</span>;
};

const MatrixRain = ({ onComplete }) => {
    const canvasRef = React.useRef(null);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                ctx.fillText(characters[Math.floor(Math.random() * characters.length)], i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        const interval = setInterval(draw, 33);
        const fadeTimeout = setTimeout(() => setFade(true), 3500);
        const completeTimeout = setTimeout(() => { clearInterval(interval); onComplete(); }, 4500);
        return () => { clearInterval(interval); clearTimeout(fadeTimeout); clearTimeout(completeTimeout); };
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${fade ? 'opacity-0' : 'opacity-100'}`}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
            <div className="relative z-10 text-green-500 font-mono text-xl md:text-3xl text-center font-bold tracking-widest">
                <p>WAKE UP...</p>
                <p className="mt-4 text-sm md:text-xl text-green-700">INITIALIZING PARJADOS</p>
            </div>
        </div>
    );
};

export const CliMode = ({ theme }) => {
    const navigate = useNavigate();
    const [isBooted, setIsBooted] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [fileSystem, setFileSystemState] = useState(loadFileSystem);

    const setFileSystem = (updater) => {
        setFileSystemState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            saveFileSystem(next);
            return next;
        });
    };

    const openApp = (appId) => setPendingLaunch(appId);

    const {
        history, input, setInput, handleCommand, handleKeyDown, formatPrompt, bottomRef,
    } = useTerminalEngine({
        mode: 'cli',
        fileSystem,
        setFileSystem,
        openApp,
        initialHistory: [
            { type: 'system', text: 'ParjadOS v2.0.1 — type "help" or "gui" to boot desktop.', animated: false },
        ],
        promptHost: 'parjadm.ca',
    });

    const handleExit = (target = -1) => {
        setIsExiting(true);
        setTimeout(() => navigate(target === -1 ? -1 : target), 650);
    };

    if (!isBooted) return <MatrixRain onComplete={() => setIsBooted(true)} />;

    return (
        <section className={`min-h-screen flex items-center justify-center py-24 px-4 bg-black relative ${isExiting ? 'animate-crt-off' : 'animate-fade-in'}`}>
            <SEO titleKey="seo.cliTitle" descriptionKey="seo.cliDesc" />
            <style>{`
                .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes crtTurnOff {
                    0% { transform: scale(1, 1.3); filter: brightness(1); }
                    60% { transform: scale(1, 0.001); filter: brightness(10); }
                    100% { transform: scale(0, 0.0001); filter: brightness(30); }
                }
                .animate-crt-off { animation: crtTurnOff 0.65s cubic-bezier(0.23, 1, 0.32, 1) forwards; pointer-events: none; }
            `}</style>
            <BackgroundBlobs theme="terminal" darkMode customBlobClasses={{ blob1: 'bg-green-500/10', blob2: 'bg-emerald-400/10', blob3: 'bg-lime-500/10' }} />
            <div className="container mx-auto max-w-4xl z-10 flex flex-col h-full">
                <div className="mb-6 flex justify-between items-center">
                    <button type="button" onClick={() => handleExit(-1)} className="text-gray-400 hover:text-white text-sm uppercase tracking-wider font-semibold">← Exit CLI</button>
                    <button type="button" onClick={() => navigate('/os')} className="text-emerald-400 hover:text-emerald-300 text-sm uppercase tracking-wider font-semibold">gui →</button>
                </div>
                <GlassCard className="p-0 border border-green-500/30 bg-black/90 shadow-[0_0_60px_rgba(74,222,128,0.15)] rounded-xl overflow-hidden font-mono flex-1 min-h-[65vh]" theme="terminal">
                    <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="flex-1 text-center text-xs text-gray-400 font-sans tracking-widest uppercase">guest@parjadm-os</div>
                    </div>
                    <div className="p-6 h-[60vh] overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-green-500/50" onClick={() => document.getElementById('cli-input')?.focus()}>
                        <div className="flex-1 space-y-2 text-sm md:text-base">
                            {history.map((entry, idx) => (
                                <div key={idx} className={`${entry.type === 'error' ? 'text-red-400' : entry.type === 'user' ? 'text-white font-bold' : 'text-green-400'}`}>
                                    {entry.animated && entry.type !== 'user' ? <TypewriterText text={entry.text} speed={10} /> : <span className="whitespace-pre-wrap">{entry.text}</span>}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                        <form onSubmit={handleCommand} className="mt-4 flex items-center flex-wrap">
                            <span className="mr-3 font-bold text-emerald-400 whitespace-nowrap">{formatPrompt()}</span>
                            <input id="cli-input" type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="flex-1 bg-transparent border-none outline-none text-white font-mono caret-green-500 min-w-[200px]" autoFocus spellCheck="false" autoComplete="off" />
                        </form>
                    </div>
                </GlassCard>
            </div>
        </section>
    );
};

export default CliMode;
