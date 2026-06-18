import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { Code, BrainCircuit, Palette } from '../components/ui/Icons.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { SEO } from '../components/SEO.jsx';
import { useReducedMotion } from '../utils/useReducedMotion.js';

const SUBTITLE = 'Welcome to a digital experience blending software engineering precision with artistic creativity.';
const BOOT_LINES = [
    '> initializing parjadm.ca...',
    '> loading modules...',
    '> interface ready.',
];

function useDecoderText(text, delay = 0, instant = false) {
    const [displayText, setDisplayText] = useState(instant ? text : '');
    const [done, setDone] = useState(instant);

    useEffect(() => {
        if (instant) {
            setDisplayText(text);
            setDone(true);
            return;
        }
        setDisplayText('');
        setDone(false);
        let interval;
        const timer = setTimeout(() => {
            let iteration = 0;
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]{}';
            interval = setInterval(() => {
                setDisplayText(text.split('').map((_, index) => {
                    if (index < iteration) return text[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join(''));
                if (iteration >= text.length) {
                    clearInterval(interval);
                    setDone(true);
                }
                iteration += 1 / 3;
            }, 16);
        }, delay);
        return () => {
            clearTimeout(timer);
            if (interval) clearInterval(interval);
        };
    }, [text, delay, instant]);

    return { displayText, done };
}

const ParticleNetwork = ({ isPink, reducedMotion }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (reducedMotion) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();

        const particles = [];
        const numParticles = 45;
        const connectionDistance = 180;
        let mouse = { x: null, y: null, radius: 200 };

        const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const onMouseLeave = () => { mouse.x = null; mouse.y = null; };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 2 - 1;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
                if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
                if (mouse.x != null && mouse.y != null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 0 && distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= (dx / distance) * force * 4;
                        this.y -= (dy / distance) * force * 4;
                    }
                }
            }
            draw() {
                ctx.fillStyle = isPink ? 'rgba(236, 72, 153, 0.45)' : 'rgba(52, 211, 153, 0.45)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < numParticles; i++) particles.push(new Particle());

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = isPink
                            ? `rgba(236, 72, 153, ${1 - distance / connectionDistance})`
                            : `rgba(52, 211, 153, ${1 - distance / connectionDistance})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseleave', onMouseLeave);
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseleave', onMouseLeave);
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isPink, reducedMotion]);

    if (reducedMotion) return null;
    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-35 pointer-events-none" aria-hidden="true" />;
};

const BootSequence = ({ lines, visible, accentClass }) => {
    const [shown, setShown] = useState(0);
    useEffect(() => {
        if (!visible) { setShown(0); return; }
        const timers = lines.map((_, i) => setTimeout(() => setShown(i + 1), i * 420));
        return () => timers.forEach(clearTimeout);
    }, [visible, lines]);

    if (!visible) return null;
    return (
        <div className="mb-8 text-left max-w-md mx-auto font-mono text-sm space-y-1.5">
            {lines.slice(0, shown).map((line) => (
                <p key={line} className={`${accentClass} opacity-80`}>{line}</p>
            ))}
        </div>
    );
};

const CinematicCard = ({ theme, reducedMotion, onEnter, onReplay, isExiting }) => {
    const cardRef = useRef(null);
    const [transform, setTransform] = useState({ x: 0, y: 0 });
    const [bootDone, setBootDone] = useState(reducedMotion);
    const [showActions, setShowActions] = useState(reducedMotion);
    const canTilt = !reducedMotion && typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

    const instant = reducedMotion;
    const { displayText: decodedTitle1, done: title1Done } = useDecoderText('Architecting', instant ? 0 : 1400, instant);
    const { displayText: decodedTitle2, done: title2Done } = useDecoderText('Innovation', instant ? 0 : 1900, instant);
    const { displayText: decodedSubtitle, done: subtitleDone } = useDecoderText(SUBTITLE, instant ? 0 : 2600, instant);

    const isPink = theme === 'pink';
    const gradientClass = isPink ? 'from-pink-500 to-red-500' : 'from-emerald-500 to-teal-500';
    const accentClass = isPink ? 'text-pink-400' : 'text-emerald-400';
    const glowColor = isPink ? 'rgba(236, 72, 153, 0.35)' : 'rgba(52, 211, 153, 0.35)';
    const scanColor = isPink ? '#ec4899' : '#34d399';

    useEffect(() => {
        if (reducedMotion) return;
        const t = setTimeout(() => setBootDone(true), 1300);
        return () => clearTimeout(t);
    }, [reducedMotion]);

    useEffect(() => {
        if (subtitleDone || reducedMotion) setShowActions(true);
    }, [subtitleDone, reducedMotion]);

    const decodeProgress = instant
        ? 100
        : Math.round(((title1Done ? 1 : 0) + (title2Done ? 1 : 0) + (subtitleDone ? 1 : 0)) / 3 * 100);

    const handleMouseMove = (e) => {
        if (!canTilt || !cardRef.current || isExiting) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        if (!width || !height) return;
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setTransform({ x: x * 12, y: y * -12 });
    };

    return (
        <div
            className={`z-10 container mx-auto px-4 flex flex-col items-center justify-center min-h-screen w-full ${isExiting ? 'animate-warp-exit' : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTransform({ x: 0, y: 0 })}
        >
            <div
                ref={cardRef}
                className="w-full max-w-4xl relative glass-3d bg-white/[0.03] border border-white/10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl"
                style={{ transform: canTilt ? `rotateY(${transform.x}deg) rotateX(${transform.y}deg)` : undefined }}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 blur-3xl rounded-[2.5rem] md:rounded-[3rem]`} aria-hidden="true" />

                {!reducedMotion && (
                    <div
                        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent animate-scan z-50"
                        style={{ color: scanColor, boxShadow: `0 0 20px 2px ${scanColor}` }}
                        aria-hidden="true"
                    />
                )}

                <div className="relative p-8 md:p-16 text-center overflow-hidden card-content-3d">
                    <p className={`text-xs font-mono uppercase tracking-[0.35em] mb-6 ${accentClass} opacity-70`}>
                        parjadm.ca
                    </p>

                    <BootSequence lines={BOOT_LINES} visible={!bootDone && !reducedMotion} accentClass={accentClass} />

                    <div className={`flex justify-center items-center gap-5 md:gap-6 mb-8 md:mb-10 transition-all duration-700 ${bootDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner intro-icon intro-icon-delay-1">
                            <Code size={28} />
                        </div>
                        <div className={`p-4 md:p-5 rounded-2xl bg-gradient-to-r ${gradientClass} text-white intro-icon intro-icon-delay-2`} style={{ boxShadow: `0 0 40px ${glowColor}` }}>
                            <BrainCircuit size={40} />
                        </div>
                        <div className="p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner intro-icon intro-icon-delay-3">
                            <Palette size={28} />
                        </div>
                    </div>

                    <h1 className={`text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 min-h-[3.5rem] md:min-h-[5.5rem] font-mono transition-opacity duration-500 ${bootDone ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="block sm:inline">{decodedTitle1}</span>{' '}
                        <span className={`bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>{decodedTitle2}</span>
                    </h1>

                    <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed min-h-[3.5rem] md:min-h-[4rem] font-mono">
                        {bootDone ? decodedSubtitle : '\u00A0'}
                    </p>

                    {!instant && bootDone && (
                        <div className="max-w-xs mx-auto mb-8">
                            <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-300 ease-out`}
                                    style={{ width: `${decodeProgress}%` }}
                                />
                            </div>
                            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mt-2">
                                Decoding {decodeProgress}%
                            </p>
                        </div>
                    )}

                    <div className={`flex flex-wrap items-center justify-center gap-3 md:gap-4 transition-all duration-700 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                        <RippleButton
                            onClick={onEnter}
                            className="px-7 md:px-8 py-3 rounded-full text-base md:text-lg font-bold min-w-[160px] md:min-w-[180px]"
                            style={{ boxShadow: `0 0 20px ${glowColor}` }}
                            theme={theme}
                        >
                            Enter Portfolio
                        </RippleButton>
                        <button
                            type="button"
                            onClick={onReplay}
                            className="px-7 md:px-8 py-3 rounded-full text-base md:text-lg font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all min-w-[160px] md:min-w-[180px] active:scale-95"
                        >
                            Replay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const IntroCinematic = ({ theme }) => {
    const navigate = useNavigate();
    const reducedMotion = useReducedMotion();
    const [sequenceKey, setSequenceKey] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [flash, setFlash] = useState(false);

    const handleEnter = useCallback(() => {
        setIsExiting(true);
        setFlash(true);
        setTimeout(() => navigate('/'), reducedMotion ? 300 : 900);
    }, [navigate, reducedMotion]);

    const handleSkip = useCallback(() => navigate('/'), [navigate]);

    const handleReplay = useCallback(() => {
        setIsExiting(false);
        setFlash(false);
        setSequenceKey(k => k + 1);
    }, []);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Enter' && !isExiting) handleEnter();
            if (e.key === 'Escape') handleSkip();
            if (e.key === 'r' || e.key === 'R') handleReplay();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleEnter, handleSkip, handleReplay, isExiting]);

    const isPink = theme === 'pink';

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black perspective-1000">
            <SEO title="Intro — Parjad Minooei" description="An animated welcome to parjadm.ca." />

            <style>{`
                .perspective-1000 { perspective: 1200px; }
                .glass-3d {
                    backdrop-filter: blur(25px);
                    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
                    transition: transform 0.12s ease-out;
                    transform-style: preserve-3d;
                }
                .card-content-3d { transform: translateZ(50px); }

                @keyframes scanLine {
                    0% { top: -10%; opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { top: 110%; opacity: 0; }
                }
                .animate-scan { animation: scanLine 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }

                @keyframes warpExit {
                    0% { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0); }
                    25% { transform: scale(0.92) translateZ(-80px); opacity: 1; }
                    100% { transform: scale(4) translateZ(600px); opacity: 0; filter: blur(8px); }
                }
                .animate-warp-exit {
                    animation: warpExit 0.9s cubic-bezier(0.5, 0, 0.1, 1) forwards;
                    pointer-events: none;
                    will-change: transform, opacity;
                }

                @keyframes introIconIn {
                    from { opacity: 0; transform: translateY(12px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .intro-icon { animation: introIconIn 0.6s ease-out forwards; opacity: 0; }
                .intro-icon-delay-1 { animation-delay: 0.1s; }
                .intro-icon-delay-2 { animation-delay: 0.25s; }
                .intro-icon-delay-3 { animation-delay: 0.4s; }

                @keyframes flashOut {
                    0% { opacity: 0; }
                    40% { opacity: 0.85; }
                    100% { opacity: 1; }
                }
                .intro-flash {
                    animation: flashOut 0.9s ease-in forwards;
                }

                .intro-grain {
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
                    opacity: 0.04;
                }

                @media (prefers-reduced-motion: reduce) {
                    .animate-scan, .animate-warp-exit, .intro-icon, .intro-flash { animation: none !important; }
                }
            `}</style>

            <BackgroundBlobs theme={theme} darkMode reducedMotion={reducedMotion} />
            <ParticleNetwork isPink={isPink} reducedMotion={reducedMotion} />

            {/* Letterbox + vignette */}
            <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-16 md:h-24 bg-gradient-to-b from-black to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
                <div className="absolute inset-0 intro-grain" />
            </div>

            <button
                type="button"
                onClick={handleSkip}
                className="absolute top-5 right-5 z-20 px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors"
            >
                Skip →
            </button>

            <CinematicCard
                key={sequenceKey}
                theme={theme}
                reducedMotion={reducedMotion}
                onEnter={handleEnter}
                onReplay={handleReplay}
                isExiting={isExiting}
            />

            {flash && (
                <div
                    className={`fixed inset-0 z-50 pointer-events-none intro-flash ${isPink ? 'bg-pink-200' : 'bg-emerald-100'}`}
                    aria-hidden="true"
                />
            )}
        </section>
    );
};
