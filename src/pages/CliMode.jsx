import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';

const MatrixRain = ({ onComplete }) => {
    const canvasRef = useRef(null);
    const [fade, setFade] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%""\'#&_(),.;:?!\\|{}<>[]^~'.split('');
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = characters[Math.floor(Math.random() * characters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);
        
        // Start fade out at 3.5s
        const fadeTimeout = setTimeout(() => {
            setFade(true);
        }, 3500);

        // Complete at 4.5s
        const completeTimeout = setTimeout(() => {
            clearInterval(interval);
            onComplete();
        }, 4500);

        return () => {
            clearInterval(interval);
            clearTimeout(fadeTimeout);
            clearTimeout(completeTimeout);
        };
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-1000 ${fade ? 'opacity-0' : 'opacity-100'}`}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60"></canvas>
            <div className="relative z-10 text-green-500 font-mono text-xl md:text-3xl text-center font-bold tracking-widest drop-shadow-[0_0_15px_rgba(0,255,0,0.8)] animate-pulse">
                <p>WAKE UP...</p>
                <p className="mt-4 text-sm md:text-xl text-green-700">INITIALIZING PARJADOS</p>
            </div>
        </div>
    );
};

export const CliMode = ({ theme }) => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([
        { type: 'system', text: 'Initializing ParjadOS v2.0.1...' },
        { type: 'system', text: 'Kernel loaded successfully.' },
        { type: 'system', text: '---------------------------------------------------' },
        { type: 'system', text: 'Welcome to the CLI Mode!' },
        { type: 'system', text: 'Type "help" or "manual" to see a list of available commands to navigate the portfolio.' }
    ]);
    const [input, setInput] = useState('');
    const [isBooted, setIsBooted] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleExit = (target = '/') => {
        setIsExiting(true);
        setTimeout(() => navigate(target), 650);
    };

    const handleCommand = (e) => {
        e.preventDefault();
        const cmd = input.trim().toLowerCase();
        if (!cmd) return;

        const newHistory = [...history, { type: 'user', text: `guest@parjadm.ca:~$ ${cmd}` }];
        
        switch(cmd) {
            case 'help':
            case 'manual':
                newHistory.push({ type: 'system', text: 'Available commands:' });
                newHistory.push({ type: 'system', text: '  about      - Read my background story & education' });
                newHistory.push({ type: 'system', text: '  skills     - List my technical skills & stack' });
                newHistory.push({ type: 'system', text: '  projects   - View my portfolio projects' });
                newHistory.push({ type: 'system', text: '  contact    - Get my contact information' });
                newHistory.push({ type: 'system', text: '  gui        - Switch back to the graphical interface (Home)' });
                newHistory.push({ type: 'system', text: '  clear      - Clear the terminal screen' });
                break;
            case 'about':
                newHistory.push({ type: 'system', text: '> Parjad Minooei | Software Engineer' });
                newHistory.push({ type: 'system', text: '> I am a Software Engineering student at McMaster University based in Scarborough, ON.' });
                newHistory.push({ type: 'system', text: '> My background blends an Advanced Diploma in Computer Programming with a degree in Psychology.' });
                newHistory.push({ type: 'system', text: '> Type "gui" to view the full graphical about page.' });
                break;
            case 'skills':
                newHistory.push({ type: 'system', text: '> Loading skill matrix...' });
                newHistory.push({ type: 'system', text: '> [Frontend] JavaScript, React, HTML/CSS, Tailwind' });
                newHistory.push({ type: 'system', text: '> [Backend] Node.js, Python, SQL, NoSQL (MongoDB)' });
                newHistory.push({ type: 'system', text: '> [Tools & CS] Git, Data Structures, Algorithms (BFS/DFS, Graphs)' });
                break;
            case 'projects':
                newHistory.push({ type: 'system', text: '> Fetching projects from database...' });
                newHistory.push({ type: 'system', text: '> 1. CodeQuest - Interactive algorithm visualizer' });
                newHistory.push({ type: 'system', text: '> 2. Binary 1010 Generator - Math-based puzzle engine' });
                newHistory.push({ type: 'system', text: '> 3. SpaceShooter - Web-based arcade classic' });
                newHistory.push({ type: 'system', text: '> Check the /projects route in GUI mode for live demos.' });
                break;
            case 'contact':
                newHistory.push({ type: 'system', text: '> Establishing connection...' });
                newHistory.push({ type: 'system', text: '> GitHub: https://github.com/ParjadM' });
                newHistory.push({ type: 'system', text: '> LinkedIn: https://www.linkedin.com/in/parjadminooei' });
                newHistory.push({ type: 'system', text: '> Open to new opportunities.' });
                break;
            case 'home':
            case 'gui':
            case 'exit':
                newHistory.push({ type: 'system', text: '> Booting Graphical User Interface...' });
                handleExit('/');
                break;
            case 'clear':
                setHistory([{ type: 'system', text: 'Terminal cleared. Type "help" for commands.' }]);
                setInput('');
                return;
            case 'sudo':
                newHistory.push({ type: 'error', text: '> Permission denied. This incident will be reported.' });
                break;
            default:
                newHistory.push({ type: 'error', text: `> Command not found: ${cmd}. Type "help" for manual.` });
        }

        setHistory(newHistory);
        setInput('');
    };

    // Keep it terminal themed locally, ignoring global theme
    const termTheme = 'terminal';
    
    if (!isBooted) {
        return <MatrixRain onComplete={() => setIsBooted(true)} />;
    }

    return (
        <section className={`min-h-screen flex items-center justify-center py-24 px-4 bg-black relative ${isExiting ? 'animate-crt-off' : 'animate-fade-in'}`}>
            <style>{`
                .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                @keyframes crtTurnOff {
                    0% { transform: scale(1, 1.3) translate3d(0, 0, 0); filter: brightness(1); }
                    60% { transform: scale(1, 0.001) translate3d(0, 0, 0); filter: brightness(10); }
                    100% { animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060); transform: scale(0, 0.0001) translate3d(0, 0, 0); filter: brightness(30); }
                }
                .animate-crt-off {
                    animation: crtTurnOff 0.65s cubic-bezier(0.23, 1, 0.32, 1) forwards;
                    pointer-events: none;
                }
            `}</style>
            
            {/* Terminal specific background blobs */}
            <BackgroundBlobs theme={termTheme} darkMode={true} customBlobClasses={{blob1:"bg-green-500/10", blob2:"bg-emerald-400/10", blob3:"bg-lime-500/10"}} />
            
            <div className="container mx-auto max-w-4xl z-10 flex flex-col h-full">
                <div className="mb-6">
                    <button onClick={() => handleExit(-1)} className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider font-semibold">
                        ← Exit CLI Mode
                    </button>
                </div>

                <GlassCard className="p-0 border border-green-500/30 bg-black/90 shadow-[0_0_60px_rgba(74,222,128,0.15)] rounded-xl overflow-hidden font-mono flex-1 min-h-[65vh]" theme={termTheme}>
                    {/* Terminal Header */}
                    <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 text-center text-xs text-gray-400 font-sans tracking-widest uppercase">
                            guest@parjadm-os:~
                        </div>
                        <div className="w-12"></div> {/* Spacer to center title */}
                    </div>

                    {/* Terminal Body */}
                    <div className="p-6 h-[60vh] overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-transparent cursor-text" onClick={() => document.getElementById('cli-input')?.focus()}>
                        <div className="flex-1 space-y-2 text-sm md:text-base">
                            {history.map((entry, idx) => (
                                <div key={idx} className={`${entry.type === 'error' ? 'text-red-400' : entry.type === 'user' ? 'text-white font-bold' : 'text-green-400'}`}>
                                    {entry.text}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input Line */}
                        <form onSubmit={handleCommand} className="mt-4 flex items-center flex-wrap">
                            <span className="mr-3 font-bold text-emerald-400 whitespace-nowrap">guest@parjadm.ca:~$</span>
                            <input
                                id="cli-input"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-white font-mono caret-green-500 min-w-[200px]"
                                autoFocus
                                spellCheck="false"
                                autoComplete="off"
                            />
                        </form>
                    </div>
                </GlassCard>
            </div>
        </section>
    );
};
