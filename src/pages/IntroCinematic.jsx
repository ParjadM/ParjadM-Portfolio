import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { Code, BrainCircuit, Palette } from '../components/ui/Icons.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';
import { SEO } from '../components/SEO.jsx';
import { useReducedMotion } from '../utils/useReducedMotion.js';
import { markIntroSeen } from '../utils/introSeen.js';
import { localizePath } from '../utils/i18nRouting.js';
import { getAccent } from '../utils/themeTokens.js';

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

const ParticleNetwork = ({ accent, reducedMotion, lightMode = false }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (reducedMotion) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let running = true;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();

        const particles = [];
        const numParticles = lightMode ? 18 : 45;
        const connectionDistance = 180;

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
            }
            draw() {
                ctx.fillStyle = accent.canvasFill;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < numParticles; i++) particles.push(new Particle());

        const animate = () => {
            if (!running) return;
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
                        ctx.strokeStyle = `${accent.canvasStroke}${1 - distance / connectionDistance})`;
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

        const onVisibility = () => {
            if (document.hidden) {
                running = false;
                cancelAnimationFrame(animationFrameId);
            } else {
                running = true;
                animate();
            }
        };

        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            running = false;
            window.removeEventListener('resize', resize);
            document.removeEventListener('visibilitychange', onVisibility);
            cancelAnimationFrame(animationFrameId);
        };
    }, [accent, reducedMotion, lightMode]);

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
        <div className="intro-layer intro-layer-boot mb-8 text-left max-w-md mx-auto font-mono text-sm space-y-1.5" aria-live="polite">
            {lines.slice(0, shown).map((line) => (
                <p key={line} className={`${accentClass} text-white/80`}>{line}</p>
            ))}
        </div>
    );
};

const CinematicCard = ({
    theme,
    reducedMotion,
    lightMode = false,
    bootLines,
    copy,
    onNavigate,
    onReplay,
    isExiting,
}) => {
    const { t } = useTranslation();
    const [bootDone, setBootDone] = useState(reducedMotion);
    const [showActions, setShowActions] = useState(reducedMotion);

    const instant = reducedMotion || lightMode;
    const useDepth = !reducedMotion && !lightMode;
    const { displayText: decodedTitle1, done: title1Done } = useDecoderText(copy.title1, instant ? 0 : 1400, instant);
    const { displayText: decodedTitle2, done: title2Done } = useDecoderText(copy.title2, instant ? 0 : 1900, instant);
    const { displayText: decodedSubtitle, done: subtitleDone } = useDecoderText(copy.subtitle, instant ? 0 : 2600, instant);

    const accent = getAccent(theme);
    const gradientClass = accent.gradient;
    const accentClass = accent.text300;
    const glowColor = accent.glow;
    const scanColor = accent.scan;
    const muted = 'text-white/80';
    const subtle = 'text-white/55';

    useEffect(() => {
        if (reducedMotion) return;
        const timer = setTimeout(() => setBootDone(true), 1300);
        return () => clearTimeout(timer);
    }, [reducedMotion]);

    useEffect(() => {
        if (subtitleDone || reducedMotion) setShowActions(true);
    }, [subtitleDone, reducedMotion]);

    const decodeProgress = instant
        ? 100
        : Math.round(((title1Done ? 1 : 0) + (title2Done ? 1 : 0) + (subtitleDone ? 1 : 0)) / 3 * 100);

    const rigClass = [
        'intro-card-rig w-full max-w-4xl mx-auto',
        useDepth && !isExiting ? 'intro-card-motion' : '',
        !useDepth ? 'intro-card-flat' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={`intro-stage z-10 container mx-auto px-4 flex flex-col items-center justify-center min-h-screen w-full ${isExiting ? 'animate-warp-exit' : ''}`}>
            {useDepth && (
                <>
                    <div className="intro-depth-plane intro-depth-plane-2" aria-hidden="true" />
                    <div className="intro-depth-plane intro-depth-plane-1" aria-hidden="true" />
                </>
            )}

            <div className={rigClass}>
                <div className="intro-card glass-3d w-full relative bg-white/[0.03] border border-white/10 rounded-[2.5rem] md:rounded-[3rem]">
                    <div
                        className={`intro-layer intro-layer-back-glow absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 blur-3xl rounded-[2.5rem] md:rounded-[3rem]`}
                        aria-hidden="true"
                    />

                    <div className="intro-specular rounded-[2.5rem] md:rounded-[3rem]" aria-hidden="true" />

                    {!reducedMotion && (
                        <div
                            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-current to-transparent animate-scan z-50"
                            style={{ color: scanColor, boxShadow: `0 0 20px 2px ${scanColor}` }}
                            aria-hidden="true"
                        />
                    )}

                    <div className="intro-card-inner relative p-8 md:p-16 text-center overflow-hidden">
                        <p className={`intro-layer intro-layer-kicker text-xs font-mono uppercase tracking-[0.35em] mb-6 ${accentClass}`}>
                            {copy.kicker}
                        </p>

                        <BootSequence lines={bootLines} visible={!bootDone && !reducedMotion} accentClass={accentClass} />

                        <div className={`intro-icons-row flex justify-center items-center gap-5 md:gap-6 mb-8 md:mb-10 transition-all duration-700 ${bootDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            <div className="intro-layer intro-icon-left p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner intro-icon intro-icon-delay-1">
                                <Code size={28} />
                            </div>
                            <div
                                className={`intro-layer intro-icon-center p-4 md:p-5 rounded-2xl bg-gradient-to-r ${gradientClass} text-white intro-icon intro-icon-delay-2`}
                                style={{ boxShadow: `0 0 40px ${glowColor}` }}
                            >
                                <BrainCircuit size={40} />
                            </div>
                            <div className="intro-layer intro-icon-right p-3 md:p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner intro-icon intro-icon-delay-3">
                                <Palette size={28} />
                            </div>
                        </div>

                        <h1
                            className={`intro-layer intro-layer-title text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 min-h-[3.5rem] md:min-h-[5.5rem] font-mono transition-opacity duration-500 ${bootDone ? 'opacity-100' : 'opacity-0'}`}
                            aria-live="polite"
                        >
                            <span className="block sm:inline">{decodedTitle1}</span>{' '}
                            <span className={`bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>{decodedTitle2}</span>
                        </h1>

                        <p className={`intro-layer intro-layer-subtitle text-base md:text-xl ${muted} max-w-2xl mx-auto mb-6 leading-relaxed min-h-[3.5rem] md:min-h-[4rem] font-mono`}>
                            {bootDone ? decodedSubtitle : '\u00A0'}
                        </p>

                        {!instant && bootDone && (
                            <div className="intro-layer intro-layer-progress max-w-xs mx-auto mb-8">
                                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                        className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-300 ease-out`}
                                        style={{ width: `${decodeProgress}%` }}
                                    />
                                </div>
                                <p className={`text-[10px] font-mono uppercase tracking-widest ${subtle} mt-2`}>
                                    {t('introCinematic.decoding', { percent: decodeProgress })}
                                </p>
                            </div>
                        )}

                        <div className={`intro-layer intro-layer-actions flex flex-wrap items-center justify-center gap-3 md:gap-4 transition-all duration-700 ${showActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                            <RippleButton
                                onClick={() => onNavigate('/projects')}
                                className="px-7 md:px-8 py-3 rounded-full text-base md:text-lg font-bold min-w-[160px] md:min-w-[180px]"
                                style={{ boxShadow: `0 0 20px ${glowColor}` }}
                                theme={theme}
                            >
                                {copy.ctaProjects}
                            </RippleButton>
                            <button
                                type="button"
                                onClick={() => onNavigate('/contact')}
                                className={`px-7 md:px-8 py-3 rounded-full text-base md:text-lg font-semibold ${muted} bg-white/10 border border-white/20 hover:bg-white/15 hover:text-white transition-all min-w-[160px] md:min-w-[180px] active:scale-95`}
                            >
                                {copy.ctaContact}
                            </button>
                            <button
                                type="button"
                                onClick={onReplay}
                                className={`px-7 md:px-8 py-3 rounded-full text-base md:text-lg font-semibold ${muted} bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all min-w-[160px] md:min-w-[180px] active:scale-95`}
                            >
                                {copy.replay}
                            </button>
                        </div>

                        {!reducedMotion && showActions && (
                            <p className={`intro-layer intro-layer-hints mt-6 text-[10px] font-mono uppercase tracking-widest ${subtle}`}>
                                {copy.keyboardHints}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const IntroCinematic = ({ theme }) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const reducedMotion = useReducedMotion();
    const [lightMode] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            if (navigator.connection?.saveData) return true;
        } catch {}
        return window.matchMedia('(max-width: 767px)').matches;
    });
    const [sequenceKey, setSequenceKey] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const [flash, setFlash] = useState(false);

    const locale = i18n.language?.startsWith('fr') ? 'fr' : 'en';

    const bootLines = useMemo(() => {
        const lines = t('introCinematic.bootLines', { returnObjects: true });
        return Array.isArray(lines) ? lines : [];
    }, [t, i18n.language]);

    const copy = useMemo(() => ({
        kicker: t('introCinematic.kicker'),
        title1: t('introCinematic.title1'),
        title2: t('introCinematic.title2'),
        subtitle: t('introCinematic.subtitle'),
        ctaProjects: t('introCinematic.ctaProjects'),
        ctaContact: t('introCinematic.ctaContact'),
        replay: t('introCinematic.replay'),
        keyboardHints: t('introCinematic.keyboardHints'),
    }), [t, i18n.language]);

    const finishIntro = useCallback((path) => {
        markIntroSeen();
        setIsExiting(true);
        setFlash(true);
        const delay = reducedMotion ? 300 : 900;
        setTimeout(() => navigate(localizePath(path, locale)), delay);
    }, [navigate, locale, reducedMotion]);

    const handleSkip = useCallback(() => {
        markIntroSeen();
        navigate(localizePath('/', locale));
    }, [navigate, locale]);

    const handleReplay = useCallback(() => {
        setIsExiting(false);
        setFlash(false);
        setSequenceKey((k) => k + 1);
    }, []);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (isExiting) return;
            if (e.key === 'Enter') finishIntro('/projects');
            if (e.key === 'Escape') handleSkip();
            if (e.key === 'r' || e.key === 'R') handleReplay();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [finishIntro, handleSkip, handleReplay, isExiting]);

    const accent = getAccent(theme);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black perspective-1000 intro-scene">
            <SEO titleKey="seo.introTitle" descriptionKey="seo.introDesc" />

            <style>{`
                .intro-scene { transform-style: preserve-3d; }
                .perspective-1000 { perspective: 1200px; }

                .intro-bg-depth {
                    position: absolute;
                    inset: 0;
                    transform-style: preserve-3d;
                    pointer-events: none;
                }
                .intro-bg-depth-far {
                    transform: translateZ(-420px) scale(1.3);
                    opacity: 0.75;
                }
                .intro-bg-depth-mid {
                    transform: translateZ(-260px) scale(1.15);
                    opacity: 0.85;
                }
                .intro-bg-depth-far canvas,
                .intro-bg-depth-mid canvas {
                    filter: blur(1px);
                }

                .intro-stage {
                    perspective: 1200px;
                    transform-style: preserve-3d;
                    position: relative;
                }

                .intro-card-rig {
                    transform-style: preserve-3d;
                    position: relative;
                    z-index: 2;
                }
                .intro-card-rig.intro-card-motion {
                    animation:
                        introFlyIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards,
                        introFloat 9s ease-in-out 1.2s infinite;
                }
                .intro-card-rig.intro-card-flat {
                    transform: none;
                }

                .intro-card {
                    transform-style: preserve-3d;
                    box-shadow:
                        0 40px 80px -20px rgba(0, 0, 0, 0.85),
                        0 0 0 1px rgba(255, 255, 255, 0.12) inset,
                        inset 0 1px 0 rgba(255, 255, 255, 0.18);
                }
                .intro-card-flat .intro-card {
                    transform: none;
                    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.12);
                }

                .intro-card-inner { transform-style: preserve-3d; }

                .intro-layer { transform-style: preserve-3d; }
                .intro-layer-back-glow { transform: translateZ(-60px); }
                .intro-layer-kicker { transform: translateZ(20px); }
                .intro-layer-boot { transform: translateZ(30px); }
                .intro-icon-left { transform: translateZ(30px) rotateY(14deg); }
                .intro-icon-center { transform: translateZ(90px); }
                .intro-icon-right { transform: translateZ(30px) rotateY(-14deg); }
                .intro-icons-row { transform-style: preserve-3d; }
                .intro-layer-title { transform: translateZ(100px); }
                .intro-layer-subtitle { transform: translateZ(70px); }
                .intro-layer-progress { transform: translateZ(50px); }
                .intro-layer-actions { transform: translateZ(40px); }
                .intro-layer-hints { transform: translateZ(30px); }

                .intro-specular {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background: linear-gradient(
                        135deg,
                        rgba(255, 255, 255, 0.14) 0%,
                        transparent 38%,
                        transparent 62%,
                        rgba(255, 255, 255, 0.05) 100%
                    );
                    transform: translateZ(3px);
                    opacity: 0.75;
                }

                .intro-depth-plane {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: min(92vw, 56rem);
                    height: min(52vh, 28rem);
                    pointer-events: none;
                    border-radius: 3rem;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    background: rgba(255, 255, 255, 0.02);
                    transform-style: preserve-3d;
                    z-index: 1;
                }
                .intro-depth-plane-1 {
                    transform: translate(-50%, -50%) translateZ(-120px) scale(1.05) rotateX(10deg) rotateY(-5deg);
                    filter: blur(1px);
                }
                .intro-depth-plane-2 {
                    transform: translate(-50%, -50%) translateZ(-220px) scale(1.12) rotateX(10deg) rotateY(-5deg);
                    filter: blur(2px);
                    opacity: 0.55;
                }

                .glass-3d {
                    backdrop-filter: blur(25px);
                }

                @keyframes introFlyIn {
                    from {
                        transform: rotateX(18deg) rotateY(-8deg) translateZ(-500px);
                        opacity: 0;
                    }
                    to {
                        transform: rotateX(10deg) rotateY(-5deg) translateZ(0);
                        opacity: 1;
                    }
                }

                @keyframes introFloat {
                    0%, 100% { transform: rotateX(10deg) rotateY(-5deg) translateZ(0); }
                    50% { transform: rotateX(9deg) rotateY(-4deg) translateZ(12px); }
                }

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
                    from { opacity: 0; transform: translateY(12px) translateZ(-24px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) translateZ(0) scale(1); }
                }
                .intro-icon { animation: introIconIn 0.6s ease-out forwards; opacity: 0; transform-style: preserve-3d; }
                .intro-icon-delay-1 { animation-delay: 0.1s; }
                .intro-icon-delay-2 { animation-delay: 0.25s; }
                .intro-icon-delay-3 { animation-delay: 0.4s; }
                .intro-icon-left.intro-icon { animation-name: introIconInLeft; }
                .intro-icon-center.intro-icon { animation-name: introIconInCenter; }
                .intro-icon-right.intro-icon { animation-name: introIconInRight; }
                @keyframes introIconInLeft {
                    from { opacity: 0; transform: translateY(12px) translateZ(-10px) rotateY(14deg) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) translateZ(30px) rotateY(14deg) scale(1); }
                }
                @keyframes introIconInCenter {
                    from { opacity: 0; transform: translateY(12px) translateZ(-30px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) translateZ(90px) scale(1); }
                }
                @keyframes introIconInRight {
                    from { opacity: 0; transform: translateY(12px) translateZ(-10px) rotateY(-14deg) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) translateZ(30px) rotateY(-14deg) scale(1); }
                }

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
                    .animate-scan, .animate-warp-exit, .intro-icon, .intro-flash,
                    .intro-card-motion { animation: none !important; }
                    .intro-card, .intro-card-rig { transform: none !important; }
                    .intro-depth-plane, .intro-bg-depth-far, .intro-bg-depth-mid { transform: none !important; }
                    .intro-layer, .intro-icon-left, .intro-icon-center, .intro-icon-right { transform: none !important; }
                }
            `}</style>

            <div className="intro-bg-depth intro-bg-depth-far">
                <BackgroundBlobs theme={theme} darkMode reducedMotion={reducedMotion || lightMode} staticOnMobile={lightMode} />
            </div>
            <div className="intro-bg-depth intro-bg-depth-mid">
                <ParticleNetwork accent={accent} reducedMotion={reducedMotion} lightMode={lightMode} />
            </div>

            <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
                <div className="absolute inset-x-0 top-0 h-16 md:h-24 bg-gradient-to-b from-black to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-black to-transparent" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
                <div className="absolute inset-0 intro-grain" />
            </div>

            <button
                type="button"
                onClick={handleSkip}
                className="absolute top-safe-or-4 right-4 sm:right-5 z-20 px-5 py-3 min-h-[44px] rounded-full text-sm font-mono uppercase tracking-widest text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors shadow-lg backdrop-blur-sm"
            >
                {t('introCinematic.skip')}
            </button>

            <button
                type="button"
                onClick={handleSkip}
                className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20 px-8 py-3 min-h-[44px] rounded-full text-sm font-semibold text-white/90 bg-black/60 border border-white/20 backdrop-blur-md hover:bg-black/80 transition-colors"
            >
                {t('introCinematic.skipMobile')}
            </button>

            <CinematicCard
                key={sequenceKey}
                theme={theme}
                reducedMotion={reducedMotion}
                lightMode={lightMode}
                bootLines={bootLines}
                copy={copy}
                onNavigate={finishIntro}
                onReplay={handleReplay}
                isExiting={isExiting}
            />

            {flash && (
                <div
                    className={`fixed inset-0 z-50 pointer-events-none intro-flash ${accent.flash}`}
                    aria-hidden="true"
                />
            )}
        </section>
    );
};

export default IntroCinematic;
