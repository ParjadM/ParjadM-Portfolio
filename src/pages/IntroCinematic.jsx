import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundBlobs } from '../components/ui/BackgroundBlobs.jsx';
import { Code, BrainCircuit, Palette } from '../components/ui/Icons.jsx';
import { RippleButton } from '../components/ui/RippleButton.jsx';

export const IntroCinematic = ({ theme }) => {
    const navigate = useNavigate();
    const [key, setKey] = useState(0);

    const handleReplay = () => {
        setKey(prev => prev + 1);
    };

    const gradientClass = theme === 'pink' ? 'from-pink-500 to-red-500' : 'from-emerald-500 to-teal-500';

    return (
        <section key={key} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black perspective-1000 pt-20">
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .animate-float-3d {
                    animation: float3d 8s ease-in-out infinite;
                }
                @keyframes float3d {
                    0% { transform: translateY(0px) rotateX(5deg) rotateY(-5deg); }
                    50% { transform: translateY(-20px) rotateX(-5deg) rotateY(5deg); }
                    100% { transform: translateY(0px) rotateX(5deg) rotateY(-5deg); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                    transform: translateY(40px);
                }
                .animate-fade-in {
                    animation: fadeIn 1.5s ease-out forwards;
                    opacity: 0;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-500 { animation-delay: 500ms; }
                .delay-700 { animation-delay: 700ms; }
                .delay-1000 { animation-delay: 1000ms; }
                @keyframes fadeInUp {
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    to { opacity: 1; }
                }
                .glass-3d {
                    backdrop-filter: blur(20px);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
                }
            `}</style>
            
            <BackgroundBlobs theme={theme} darkMode={true} />
            
            <div className="z-10 container mx-auto px-4 flex flex-col items-center justify-center h-full pb-10">
                <div className="animate-float-3d w-full max-w-4xl relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-20 blur-3xl rounded-[3rem]`}></div>
                    <div className="relative glass-3d bg-white/5 border border-white/10 rounded-[3rem] p-10 md:p-16 text-center shadow-2xl overflow-hidden">
                        
                        <div className="flex justify-center items-center gap-6 mb-10">
                            <div className="animate-fade-in-up delay-100 p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner">
                                <Code size={32} />
                            </div>
                            <div className={`animate-fade-in-up delay-300 p-5 rounded-2xl bg-gradient-to-r ${gradientClass} text-white shadow-[0_0_40px_rgba(52,211,153,0.4)] scale-110 z-10`}>
                                <BrainCircuit size={48} />
                            </div>
                            <div className="animate-fade-in-up delay-500 p-4 rounded-2xl bg-white/5 border border-white/10 text-white shadow-inner">
                                <Palette size={32} />
                            </div>
                        </div>

                        <h1 className="animate-fade-in-up delay-500 text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
                            Architecting <span className={`bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}>Innovation</span>
                        </h1>
                        
                        <p className="animate-fade-in-up delay-700 text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Welcome to a digital experience blending software engineering precision with artistic creativity. 
                            Explore intelligent systems, modern web architectures, and seamless user interfaces.
                        </p>
                        
                        <div className="animate-fade-in delay-1000 flex flex-wrap items-center justify-center gap-4">
                            <RippleButton 
                                onClick={() => navigate('/')} 
                                className="px-8 py-3 rounded-full text-lg font-bold shadow-lg min-w-[180px] hover:scale-105 transition-transform"
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
