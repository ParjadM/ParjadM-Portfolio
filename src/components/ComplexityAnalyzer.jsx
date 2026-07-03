import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard.jsx';
import { BrainCircuit } from './ui/Icons.jsx';
import { useTranslation } from 'react-i18next';

export const ComplexityAnalyzer = ({ theme = 'emerald' }) => {
    const { t } = useTranslation();
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchComplexity = async () => {
            try {
                // Fetch the build-time generated JSON file
                const response = await fetch('/complexity.json');
                
                if (!response.ok) {
                    throw new Error('Analysis file not found');
                }
                
                const data = await response.json();
                setAnalysis(data);
            } catch (err) {
                console.error("Failed to load project complexity:", err);
                setError(t('tools.complexity.error'));
            } finally {
                setLoading(false);
            }
        };

        fetchComplexity();
    }, []);

    const handleCopy = () => {
        if (analysis) {
            const time = analysis.timeWithoutConstant || analysis.time || 'N/A';
            const mem = analysis.memoryWithoutConstant || analysis.memory || 'N/A';
            const exactTime = analysis.timeWithConstant ? ` (Exact: ${analysis.timeWithConstant})` : '';
            const exactMem = analysis.memoryWithConstant ? ` (Exact: ${analysis.memoryWithConstant})` : '';
            
            const textToCopy = `Website Time Complexity: ${time}${exactTime}\nWebsite Memory Complexity: ${mem}${exactMem}`;
            navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const gradientClass = theme === 'pink' ? 'from-pink-500 to-red-500' : 'from-emerald-500 to-teal-500';
    const textGradientClass = theme === 'pink' ? 'text-pink-400' : 'text-emerald-400';
    const bgOpacityClass = theme === 'pink' ? 'bg-pink-500/10 border-pink-500/20' : 'bg-emerald-500/10 border-emerald-500/20';

    return (
        <GlassCard className="p-8 relative overflow-hidden" theme={theme}>
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${gradientClass} text-white shadow-lg`}>
                    <BrainCircuit size={24} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-white">{t('tools.complexity.title')}</h3>
                    <p className="text-sm text-gray-400">{t('tools.complexity.subtitle')}</p>
                </div>
            </div>

            <div className={`w-full rounded-xl border p-6 md:p-10 flex flex-col justify-center items-center text-center transition-all duration-500 relative ${bgOpacityClass}`}>
                {loading ? (
                    <div className="flex items-center gap-2 text-gray-400 py-10">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Loading architectural analysis...
                    </div>
                ) : error ? (
                    <div className="text-red-400 font-mono text-sm max-w-full overflow-hidden text-ellipsis px-4 py-2 bg-red-900/20 rounded border border-red-500/30">
                        <span className="font-bold text-red-500 mb-1 block">Error:</span>
                        {error}
                    </div>
                ) : analysis ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-8">
                            <div className="p-6 bg-black/40 rounded-xl border border-white/5 flex flex-col justify-between">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Overall Time Complexity</div>
                                <div className={`text-3xl font-black ${textGradientClass} mb-2`}>{analysis.timeWithoutConstant || analysis.time}</div>
                                <div className="text-sm text-gray-500 font-mono" title="Exact complexity including constants">
                                    Exact: {analysis.timeWithConstant || 'N/A'}
                                </div>
                            </div>
                            <div className="p-6 bg-black/40 rounded-xl border border-white/5 flex flex-col justify-between">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Overall Space Complexity</div>
                                <div className={`text-3xl font-black ${textGradientClass} mb-2`}>{analysis.memoryWithoutConstant || analysis.memory}</div>
                                <div className="text-sm text-gray-500 font-mono" title="Exact complexity including constants">
                                    Exact: {analysis.memoryWithConstant || 'N/A'}
                                </div>
                            </div>
                        </div>
                        <p className="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
                            {analysis.explanation}
                        </p>
                        
                        {/* Copy Button */}
                        <button 
                            onClick={handleCopy}
                            className={`absolute top-4 right-4 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${copied ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}`}
                        >
                            {copied ? (
                                <>Copied!</>
                            ) : (
                                <>Copy</>
                            )}
                        </button>
                    </>
                ) : null}
            </div>
        </GlassCard>
    );
};
