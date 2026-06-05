import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { apiCache } from '../utils/useFetchWithCache.js';

// Typewriter component for animations
const TypewriterText = ({ text, onComplete, speed = 10 }) => {
    const [displayed, setDisplayed] = useState('');
    
    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayed(text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return <span className="whitespace-pre-wrap">{displayed}</span>;
};

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
        
        const fadeTimeout = setTimeout(() => {
            setFade(true);
        }, 3500);

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
    
    // Core State
    const [history, setHistory] = useState([
        { type: 'system', text: 'Initializing ParjadOS v2.0.1...', animated: false },
        { type: 'system', text: 'Kernel loaded successfully.', animated: false },
        { type: 'system', text: '---------------------------------------------------', animated: false },
        { type: 'system', text: 'Welcome to the CLI Mode!', animated: false },
        { type: 'system', text: 'Type "help" to see a list of available commands.', animated: false }
    ]);
    const [input, setInput] = useState('');
    const [isBooted, setIsBooted] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    
    // Advanced features State
    const [cmdHistory, setCmdHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [currentDir, setCurrentDir] = useState('~');
    
    const [emailState, setEmailState] = useState({ step: 0, name: '', email: '', message: '' });
    const [aiState, setAiState] = useState({ active: false, messages: [] });
    const [fetchedProjects, setFetchedProjects] = useState([]);

    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleExit = (target = '/') => {
        setIsExiting(true);
        setTimeout(() => navigate(target), 650);
    };

    const pushToHistory = (type, text, animated = false) => {
        setHistory(prev => [...prev, { type, text, animated }]);
    };

    // --- Mock File System ---
    const fileSystem = {
        '~': {
            'about.txt': { type: 'file', content: '> Parjad Minooei | Software Engineer\n> I am a Software Engineering student at McMaster University.\n> My background blends an Advanced Diploma in Computer Programming with a degree in Psychology.' },
            'skills.md': { type: 'file', content: '# Skills\n- [Frontend] JavaScript, React, HTML/CSS, Tailwind\n- [Backend] Node.js, Python, SQL, MongoDB\n- [Tools & CS] Git, Algorithms' },
            'contact.json': { type: 'file', content: '{\n  "github": "https://github.com/ParjadM",\n  "linkedin": "https://linkedin.com/in/parjadminooei"\n}' },
            'projects': { type: 'dir' }
        },
        '~/projects': {
            'list_projects.sh': { type: 'executable', action: 'fetch_projects' }
        }
    };

    const resolvePath = (path) => {
        if (!path) return currentDir;
        if (path === '~') return '~';
        if (path === '..') return currentDir === '~/projects' ? '~' : currentDir;
        if (path.startsWith('~/')) return path;
        return currentDir === '~' ? `~/${path}` : `${currentDir}/${path}`;
    };

    const getAvailableCommands = () => ['help', 'about', 'skills', 'projects', 'contact', 'email', 'ai', 'news', 'gui', 'clear', 'ls', 'cd', 'cat', 'pwd', 'open', 'run'];

    const handleKeyDown = (e) => {
        if (emailState.step > 0 || aiState.active) return; // Disable history/tab in wizards

        // History Navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (cmdHistory.length > 0) {
                const newIdx = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex;
                setHistoryIndex(newIdx);
                setInput(cmdHistory[cmdHistory.length - 1 - newIdx] || '');
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const newIdx = historyIndex - 1;
                setHistoryIndex(newIdx);
                setInput(cmdHistory[cmdHistory.length - 1 - newIdx] || '');
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInput('');
            }
        } 
        // Tab Autocompletion
        else if (e.key === 'Tab') {
            e.preventDefault();
            const parts = input.split(' ');
            const lastPart = parts[parts.length - 1];

            if (parts.length === 1) {
                // Autocomplete commands
                const cmds = getAvailableCommands().filter(c => c.startsWith(lastPart));
                if (cmds.length === 1) setInput(cmds[0]);
            } else if (parts[0] === 'cd' || parts[0] === 'cat') {
                // Autocomplete files/dirs
                const dirContent = fileSystem[currentDir] || {};
                const matches = Object.keys(dirContent).filter(f => f.startsWith(lastPart));
                if (matches.length === 1) {
                    parts[parts.length - 1] = matches[0];
                    setInput(parts.join(' '));
                }
            }
        }
    };

    const fetchProjects = async () => {
        if (fetchedProjects.length > 0) {
            const lines = fetchedProjects.map((p, i) => `> ${i + 1}. ${p.title} - ${p.tags.join(', ')}`);
            lines.push('> Type a project number, name, or "open <number>" to launch it.');
            pushToHistory('system', lines.join('\n'), true);
            return;
        }

        const cached = apiCache.get('/api/projects');
        if (cached && Array.isArray(cached.projects) && cached.projects.length > 0) {
            setFetchedProjects(cached.projects);
            const lines = cached.projects.map((p, i) => `> ${i + 1}. ${p.title} - ${p.tags.join(', ')}`);
            lines.push('> Type a project number, name, or "open <number>" to launch it.');
            pushToHistory('system', lines.join('\n'), true);
            return;
        }

        pushToHistory('system', '> Fetching projects from database...', true);
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            if (data.projects && data.projects.length > 0) {
                apiCache.set('/api/projects', data);
                setFetchedProjects(data.projects);
                const lines = data.projects.map((p, i) => `> ${i + 1}. ${p.title} - ${p.tags.join(', ')}`);
                lines.push('> Type a project number, name, or "open <number>" to launch it.');
                pushToHistory('system', lines.join('\n'), true);
            } else {
                pushToHistory('system', '> No projects found or failed to connect.');
            }
        } catch (err) {
            pushToHistory('error', '> Connection to database failed.');
        }
    };

    const fetchNews = async () => {
        pushToHistory('system', '> Fetching top stories from Hacker News...', true);
        try {
            const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
            const topIds = await topRes.json();
            const top5Ids = topIds.slice(0, 5);
            
            const storyPromises = top5Ids.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()));
            const stories = await Promise.all(storyPromises);
            
            const lines = stories.map((s, i) => `> ${i + 1}. ${s.title}\n  Score: ${s.score} | by ${s.by}\n  Link: ${s.url || `https://news.ycombinator.com/item?id=${s.id}`}`);
            pushToHistory('system', lines.join('\n\n'), true);
        } catch (err) {
            pushToHistory('error', '> Failed to fetch news from Hacker News API.');
        }
    };

    const handleEmailWizard = async (val) => {
        const step = emailState.step;
        pushToHistory('user', `guest@parjadm.ca:${currentDir}$ ${val}`);
        
        if (step === 1) {
            setEmailState({ ...emailState, step: 2, name: val });
            pushToHistory('system', 'Enter your email address:');
        } else if (step === 2) {
            setEmailState({ ...emailState, step: 3, email: val });
            pushToHistory('system', 'Enter your message:');
        } else if (step === 3) {
            pushToHistory('system', 'Sending message...', true);
            setEmailState({ step: 0, name: '', email: '', message: '' }); // reset
            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: emailState.name,
                        email: emailState.email,
                        subject: 'CLI Contact Form',
                        message: val
                    })
                });
                if (res.ok) {
                    pushToHistory('system', '✅ Message sent successfully.', true);
                } else {
                    pushToHistory('error', '❌ Failed to send message.');
                }
            } catch (e) {
                pushToHistory('error', '❌ Network error sending message.');
            }
        }
        setInput('');
    };

    const handleAiWizard = async (val) => {
        pushToHistory('user', `ai> ${val}`);
        
        if (val.toLowerCase() === 'exit' || val.toLowerCase() === 'quit') {
            setAiState({ active: false, messages: [] });
            pushToHistory('system', 'Exited AI Chat Mode.');
            setInput('');
            return;
        }

        pushToHistory('system', '> Thinking...', true);
        
        try {
            const userMsg = { role: 'user', parts: [{ text: val }] };
            const payloadMessages = [...aiState.messages, userMsg].slice(-6);

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: payloadMessages, context: "User is in the CLI Mode." })
            });
            const data = await res.json();
            
            if (res.ok && data.reply) {
                pushToHistory('system', `[Parjad AI]: ${data.reply}`, true);
                setAiState(prev => ({ 
                    active: true, 
                    messages: [...prev.messages, userMsg, { role: 'model', parts: [{ text: data.reply }] }] 
                }));
            } else {
                pushToHistory('error', `[Error]: ${data.error || "Failed to reach AI."}`);
            }
        } catch (e) {
            pushToHistory('error', '[Error]: Network error connecting to AI.');
        }
        setInput('');
    };

    const handleCommand = async (e) => {
        e.preventDefault();
        const rawCmd = input.trim();
        if (!rawCmd) return;

        if (emailState.step > 0) {
            return handleEmailWizard(rawCmd);
        }
        if (aiState.active) {
            return handleAiWizard(rawCmd);
        }

        const cmdParts = rawCmd.split(' ').filter(Boolean);
        const cmd = cmdParts[0].toLowerCase();
        const args = cmdParts.slice(1);

        // Update history states
        pushToHistory('user', `guest@parjadm.ca:${currentDir}$ ${rawCmd}`);
        setCmdHistory(prev => [...prev, rawCmd]);
        setHistoryIndex(-1);

        switch(cmd) {
            case 'help':
            case 'manual':
                pushToHistory('system', 'Available commands:\n  ls         - List files\n  cd         - Change directory\n  cat        - Read file\n  pwd        - Print working directory\n  about      - Read my background story\n  skills     - List technical skills\n  projects   - View my portfolio projects\n  open       - Launch a project (e.g. "open 1" or just "1")\n  email      - Send me an email\n  contact    - Get contact info\n  news       - Fetch top 5 Hacker News stories\n  ai         - Chat with Parjad AI\n  gui        - Boot Graphical Interface\n  clear      - Clear terminal');
                break;
            case 'pwd':
                pushToHistory('system', currentDir);
                break;
            case 'ls':
                const contents = fileSystem[currentDir];
                if (contents) {
                    const files = Object.keys(contents).map(f => contents[f].type === 'dir' ? `${f}/` : f).join('   ');
                    pushToHistory('system', files || '(empty)');
                } else {
                    pushToHistory('error', 'ls: cannot access: No such file or directory');
                }
                break;
            case 'cd':
                const targetDir = resolvePath(args[0]);
                if (targetDir === currentDir) break;
                if (fileSystem[targetDir]) {
                    setCurrentDir(targetDir);
                } else if (fileSystem[currentDir]?.[args[0]]?.type === 'dir') {
                    setCurrentDir(`${currentDir}/${args[0]}`);
                } else {
                    pushToHistory('error', `cd: ${args[0] || ''}: No such file or directory`);
                }
                break;
            case 'cat':
                if (!args[0]) {
                    pushToHistory('error', 'cat: missing file operand');
                    break;
                }
                const file = fileSystem[currentDir]?.[args[0]];
                if (!file) {
                    pushToHistory('error', `cat: ${args[0]}: No such file or directory`);
                } else if (file.type === 'dir') {
                    pushToHistory('error', `cat: ${args[0]}: Is a directory`);
                } else if (file.type === 'executable') {
                    if (file.action === 'fetch_projects') fetchProjects();
                } else {
                    pushToHistory('system', file.content, true); // Use typewriter effect for files
                }
                break;
            case 'open':
            case 'run':
                if (!args[0]) {
                    pushToHistory('error', `${cmd}: missing project identifier`);
                    break;
                }
                if (fetchedProjects.length === 0) {
                    pushToHistory('error', `${cmd}: no projects loaded. Run 'projects' first.`);
                    break;
                }
                const searchParam = args.join(' ').toLowerCase();
                const idx = parseInt(searchParam);
                let targetProject = null;
                if (!isNaN(idx) && idx > 0 && idx <= fetchedProjects.length) {
                    targetProject = fetchedProjects[idx - 1];
                } else {
                    targetProject = fetchedProjects.find(p => p.title.toLowerCase().includes(searchParam));
                }

                if (targetProject) {
                    if (targetProject.liveUrl) {
                        pushToHistory('system', `> Opening ${targetProject.title}...`);
                        let targetUrl = targetProject.liveUrl;
                        if (targetUrl.startsWith('/')) {
                            // Local route
                            setTimeout(() => navigate(targetUrl), 500);
                        } else {
                            setTimeout(() => window.open(targetUrl, '_blank'), 500);
                        }
                    } else if (targetProject.githubUrl) {
                        pushToHistory('system', `> No live URL found. Opening GitHub repo for ${targetProject.title}...`);
                        setTimeout(() => window.open(targetProject.githubUrl, '_blank'), 500);
                    } else {
                        pushToHistory('error', `> Project ${targetProject.title} has no links available.`);
                    }
                } else {
                    pushToHistory('error', `${cmd}: project not found. Use number or title from the 'projects' list.`);
                }
                break;
            // Global Aliases (Legacy Commands)
            case 'about':
                pushToHistory('system', fileSystem['~']['about.txt'].content, true);
                break;
            case 'skills':
                pushToHistory('system', fileSystem['~']['skills.md'].content, true);
                break;
            case 'projects':
                await fetchProjects();
                break;
            case 'contact':
                pushToHistory('system', fileSystem['~']['contact.json'].content, true);
                break;
            case 'email':
                setEmailState({ step: 1, name: '', email: '', message: '' });
                pushToHistory('system', 'Starting Email Wizard...\nEnter your name:');
                break;
            case 'ai':
                setAiState({ active: true, messages: [] });
                pushToHistory('system', 'Starting AI Chat Mode...\nType your questions, or type "exit" to leave.');
                break;
            case 'news':
                await fetchNews();
                break;
            case 'home':
            case 'gui':
            case 'exit':
                pushToHistory('system', '> Booting Graphical User Interface...', true);
                handleExit('/');
                break;
            case 'clear':
                setHistory([{ type: 'system', text: 'Terminal cleared. Type "help" for commands.' }]);
                break;
            case 'sudo':
                pushToHistory('error', '> Permission denied. This incident will be reported.');
                break;
            case 'theme':
                pushToHistory('system', 'Themes are managed by the GUI. Try "gui" to change themes.');
                break;
            default:
                if (rawCmd.startsWith('./')) {
                    const execName = rawCmd.substring(2);
                    if (fileSystem[currentDir]?.[execName]?.type === 'executable') {
                        if (fileSystem[currentDir][execName].action === 'fetch_projects') fetchProjects();
                    } else {
                        pushToHistory('error', `bash: ${rawCmd}: command not found`);
                    }
                } else {
                    // Try to auto-open if it's a project name or number
                    if (fetchedProjects.length > 0) {
                        const searchParam = rawCmd.toLowerCase();
                        const idx = parseInt(searchParam);
                        let targetProject = null;
                        if (!isNaN(idx) && idx > 0 && idx <= fetchedProjects.length && String(idx) === searchParam) {
                            targetProject = fetchedProjects[idx - 1];
                        } else {
                            targetProject = fetchedProjects.find(p => p.title.toLowerCase() === searchParam || p.title.toLowerCase().includes(searchParam));
                        }

                        if (targetProject) {
                            if (targetProject.liveUrl) {
                                pushToHistory('system', `> Opening ${targetProject.title}...`);
                                let targetUrl = targetProject.liveUrl;
                                if (targetUrl.startsWith('/')) {
                                    setTimeout(() => navigate(targetUrl), 500);
                                } else {
                                    setTimeout(() => window.open(targetUrl, '_blank'), 500);
                                }
                            } else if (targetProject.githubUrl) {
                                pushToHistory('system', `> No live URL found. Opening GitHub repo for ${targetProject.title}...`);
                                setTimeout(() => window.open(targetProject.githubUrl, '_blank'), 500);
                            } else {
                                pushToHistory('error', `> Project ${targetProject.title} has no links available.`);
                            }
                            break;
                        }
                    }
                    pushToHistory('error', `> Command not found: ${cmd}. Type "help" for manual.`);
                }
        }
        setInput('');
    };

    const termTheme = 'terminal';
    
    if (!isBooted) {
        return <MatrixRain onComplete={() => setIsBooted(true)} />;
    }

    let promptPrefix = `guest@parjadm.ca:${currentDir}$`;
    if (emailState.step > 0) promptPrefix = `>`;
    else if (aiState.active) promptPrefix = `ai>`;

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
            
            <BackgroundBlobs theme={termTheme} darkMode={true} customBlobClasses={{blob1:"bg-green-500/10", blob2:"bg-emerald-400/10", blob3:"bg-lime-500/10"}} />
            
            <div className="container mx-auto max-w-4xl z-10 flex flex-col h-full">
                <div className="mb-6">
                    <button onClick={() => handleExit(-1)} className="text-gray-400 hover:text-white transition-colors text-sm uppercase tracking-wider font-semibold">
                        ← Exit CLI Mode
                    </button>
                </div>

                <GlassCard className="p-0 border border-green-500/30 bg-black/90 shadow-[0_0_60px_rgba(74,222,128,0.15)] rounded-xl overflow-hidden font-mono flex-1 min-h-[65vh]" theme={termTheme}>
                    {/* Header */}
                    <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1 text-center text-xs text-gray-400 font-sans tracking-widest uppercase">
                            guest@parjadm-os:~
                        </div>
                        <div className="w-12"></div>
                    </div>

                    {/* Body */}
                    <div className="p-6 h-[60vh] overflow-y-auto flex flex-col scrollbar-thin scrollbar-thumb-green-500/50 scrollbar-track-transparent cursor-text" onClick={() => document.getElementById('cli-input')?.focus()}>
                        <div className="flex-1 space-y-2 text-sm md:text-base">
                            {history.map((entry, idx) => (
                                <div key={idx} className={`${entry.type === 'error' ? 'text-red-400' : entry.type === 'user' ? 'text-white font-bold' : 'text-green-400'}`}>
                                    {entry.animated && entry.type !== 'user' ? (
                                        <TypewriterText text={entry.text} speed={10} />
                                    ) : (
                                        <span className="whitespace-pre-wrap">{entry.text}</span>
                                    )}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input Line */}
                        <form onSubmit={handleCommand} className="mt-4 flex items-center flex-wrap">
                            <span className="mr-3 font-bold text-emerald-400 whitespace-nowrap">{promptPrefix}</span>
                            <input
                                id="cli-input"
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
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
