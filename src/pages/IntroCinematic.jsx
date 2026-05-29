import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { Code, BrainCircuit, Palette } from '../components/ui/Icons.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';

// Custom Hook for Hacker Decoder Text
const useDecoderText = (text, delay = 0) => {
    const [displayText, setDisplayText] = useState('');
    const [start, setStart] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setStart(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!start) return;
        let iteration = 0;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]{}';
        const interval = setInterval(() => {
            setDisplayText(text.split('').map((letter, index) => {
                if (index < iteration) return text[index];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(''));
            
            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 2; // Speed of decoding
        }, 30);
        
        return () => clearInterval(interval);
    }, [text, start]);

    return displayText;
};

// Interactive Canvas Particle Background
const ParticleNetwork = ({ themeClass }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const numParticles = 80;
        const connectionDistance = 150;
        let mouse = { x: null, y: null, radius: 200 };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.x = null;
            mouse.y = null;
        };

        const handleResize = () => {
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', handleResize);

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

                // Mouse collision / repulsion
                if (mouse.x && mouse.y) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance > 0 && distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.x -= forceDirectionX * force * 5;
                        this.y -= forceDirectionY * force * 5;
                    }
                }
            }
            draw() {
                ctx.fillStyle = themeClass.includes('pink') ? 'rgba(236, 72, 153, 0.5)' : 'rgba(52, 211, 153, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Connect nodes
                for (let j = i; j < particles.length; j++) {
                    let dx = particles[i].x - particles[j].x;
                    let dy = particles[i].y - particles[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = themeClass.includes('pink') 
                            ? `rgba(236, 72, 153, ${1 - distance/connectionDistance})`
                            : `rgba(52, 211, 153, ${1 - distance/connectionDistance})`;
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

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [themeClass]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />;
};

export const IntroCinematic = ({ theme }) => {
    const navigate = useNavigate();
    const [key, setKey] = useState(0);
    const [isExiting, setIsExiting] = useState(false);
    const cardRef = useRef(null);
    const [transform, setTransform] = useState({ x: 0, y: 0 });

    const handleReplay = () => {
        setKey(prev => prev + 1);
        setTransform({ x: 0, y: 0 });
    };

    const handleEnter = () => {
        setIsExiting(true);
        setTimeout(() => navigate('/'), 900); // Wait for warp animation
    };

    const handleMouseMove = (e) => {
        if (!cardRef.current || isExiting) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        if (width === 0 || height === 0) return;
        // Calculate mouse position relative to center of card (-0.5 to 0.5)
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        
        // Tilt the card based on mouse (max 15 degrees)
        setTransform({ x: x * 15, y: y * -15 });
    };

    const handleMouseLeave = () => {
        setTransform({ x: 0, y: 0 });
    };

    const gradientClass = theme === 'pink' ? 'from-pink-500 to-red-500' : 'from-emerald-500 to-teal-500';
    const textGradientClass = theme === 'pink' ? 'text-pink-400' : 'text-emerald-400';

    const decodedTitle1 = useDecoderText("Architecting", 1500);
    const decodedTitle2 = useDecoderText("Innovation", 2000);
    const decodedSubtitle = useDecoderText("Welcome to a digital experience blending software engineering precision with artistic creativity.", 2800);

    return (
        <section key={key} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black perspective-1000">
            <style>{`
                .perspective-1000 { perspective: 1200px; }
                
                .glass-3d {
                    backdrop-filter: blur(25px);
                    box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
                    transition: transform 0.1s ease-out;
                    transform-style: preserve-3d;
                }
                
                .card-content-3d {
                    transform: translateZ(50px);
                }

                @keyframes scanLine {
                    0% { top: -10%; opacity: 0; box-shadow: 0 0 0 transparent; }
                    10% { opacity: 1; box-shadow: 0 0 20px 5px rgba(52, 211, 153, 0.8); }
                    90% { opacity: 1; box-shadow: 0 0 20px 5px rgba(52, 211, 153, 0.8); }
                    100% { top: 110%; opacity: 0; box-shadow: 0 0 0 transparent; }
                }
                .animate-scan {
                    animation: scanLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                @keyframes warpExit {
                    0% { transform: scale(1) translateZ(0); opacity: 1; filter: blur(0px); }
                    20% { transform: scale(0.9) translateZ(-100px); opacity: 1; filter: blur(0px); }
                    100% { transform: scale(4) translateZ(800px); opacity: 0; filter: blur(20px); }
                }
                .animate-warp-exit {
                    animation: warpExit 0.9s cubic-bezier(0.5, 0, 0.1, 1) forwards;
                    pointer-events: none;
                }

                .animate-fade-in { animation: fadeIn 1.5s ease-out forwards; opacity: 0; }
                .delay-3000 { animation-delay: 3000ms; }
                @keyframes fadeIn { to { opacity: 1; } }
            `}</style>
            
            <BackgroundBlobs theme={theme} darkMode={true} />
            <ParticleNetwork themeClass={gradientClass} />
            
            <div 
                className={`z-10 container mx-auto px-4 flex flex-col items-center justify-center h-full w-full ${isExiting ? 'animate-warp-exit' : ''}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div 
                    ref={cardRef}
                    className="w-full max-w-4xl relative glass-3d bg-white/[0.03] border border-white/10 rounded-[3rem] shadow-2xl"
                    style={{
                        transform: `rotateY(${transform.x}deg) rotateX(${transform.y}deg)`
                    }}
                >
                    {/* Glowing Backdrop inside the card bounds */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 blur-3xl rounded-[3rem]`}></div>
                    
                    {/* Biometric Scan Line */}
                    <div className={`absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${theme === 'pink' ? 'via-pink-400' : 'via-emerald-400'} to-transparent animate-scan z-50`} style={{ boxShadow: `0 0 20px 2px ${theme === 'pink' ? '#ec4899' : '#34d399'}` }}></div>

                    <div className="relative p-10 md:p-16 text-center overflow-hidden card-content-3d">
                        
                        <div className="flex justify-center items-center gap-6 mb-10">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner transform hover:scale-110 transition-transform duration-300">
                                <Code size={32} />
                            </div>
                            <div className={`p-5 rounded-2xl bg-gradient-to-r ${gradientClass} text-white shadow-[0_0_40px_rgba(52,211,153,0.4)] scale-110 z-10 animate-pulse`}>
                                <BrainCircuit size={48} />
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner transform hover:scale-110 transition-transform duration-300">
                                <Palette size={32} />
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 min-h-[5rem] md:min-h-[6rem] font-mono">
                            {decodedTitle1} <span className={`bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>{decodedTitle2}</span>
                        </h1>
                        
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed min-h-[4rem] font-mono">
                            {decodedSubtitle}
                        </p>
                        
                        <div className="animate-fade-in delay-3000 flex flex-wrap items-center justify-center gap-4">
                            <RippleButton 
                                onClick={handleEnter} 
                                className="px-8 py-3 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(52,211,153,0.3)] min-w-[180px] hover:scale-105 transition-transform"
                                theme={theme}
                            >
                                Enter Portfolio
                            </RippleButton>
                            
                            <button 
                                onClick={handleReplay}
                                className="px-8 py-3 rounded-full text-lg font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all min-w-[180px] active:scale-95"
                            >
                                Replay Cinematic
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
