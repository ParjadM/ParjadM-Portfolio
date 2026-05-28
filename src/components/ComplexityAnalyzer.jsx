import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard.jsx';
import { BrainCircuit, Code } from './ui/Icons.jsx';
import { useTranslation } from 'react-i18next';

// Simple debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export const ComplexityAnalyzer = ({ theme = 'emerald' }) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('function sumArray(arr) {\n  let sum = 0;\n  for(let i = 0; i < arr.length; i++) {\n    sum += arr[i];\n  }\n  return sum;\n}');
    const debouncedCode = useDebounce(code, 1000);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const analyzeCode = async () => {
            if (!debouncedCode || !debouncedCode.trim()) {
                setAnalysis(null);
                return;
            }
            
            setLoading(true);
            setError('');
            
            try {
                const response = await fetch('/api/ai/complexity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: debouncedCode })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setAnalysis(data);
                } else {
                    setError(data.error || 'Failed to analyze code.');
                    setAnalysis(null);
                }
            } catch (err) {
                setError('Network error analyzing code.');
                setAnalysis(null);
            } finally {
                setLoading(false);
            }
        };

        analyzeCode();
    }, [debouncedCode]);

    const handleCopy = () => {
        if (analysis) {
            const time = analysis.timeWithoutConstant || analysis.time || 'N/A';
            const mem = analysis.memoryWithoutConstant || analysis.memory || 'N/A';
            const exactTime = analysis.timeWithConstant ? ` (Exact: ${analysis.timeWithConstant})` : '';
            const exactMem = analysis.memoryWithConstant ? ` (Exact: ${analysis.memoryWithConstant})` : '';
            
            const textToCopy = `Time Complexity: ${time}${exactTime}\nMemory Complexity: ${mem}${exactMem}`;
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
                    <h3 className="text-2xl font-bold text-white">AI Complexity Analyzer</h3>
                    <p className="text-sm text-gray-400">Real-time Time and Space Complexity Analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Code Editor Area */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                        <Code size={16} /> Source Code
                    </label>
                    <textarea 
                        className="w-full flex-1 min-h-[250px] p-4 bg-[#0d1117] text-gray-200 border border-white/10 rounded-xl focus:border-white/30 focus:outline-none transition-all font-mono text-sm leading-relaxed resize-y"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Paste your code here..."
                        spellCheck="false"
                    />
                </div>

                {/* Analysis Result Area */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <BrainCircuit size={16} /> Analysis Result
                        </label>
                        {loading && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> Analyzing...
                            </div>
                        )}
                    </div>
                    
                    <div className={`flex-1 rounded-xl border p-6 flex flex-col justify-center items-center text-center transition-all duration-500 relative ${bgOpacityClass}`}>
                        {error ? (
                            <div className="text-red-400 font-mono text-sm max-w-full overflow-hidden text-ellipsis px-4 py-2 bg-red-900/20 rounded border border-red-500/30">
                                <span className="font-bold text-red-500 mb-1 block">Error:</span>
                                {error}
                            </div>
                        ) : analysis ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                                    <div className="p-4 bg-black/40 rounded-lg border border-white/5 flex flex-col justify-between">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Time Complexity</div>
                                        <div className={`text-2xl font-black ${textGradientClass}`}>{analysis.timeWithoutConstant || analysis.time}</div>
                                        <div className="text-xs text-gray-500 mt-2 font-mono" title="Exact complexity including constants">
                                            Exact: {analysis.timeWithConstant || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black/40 rounded-lg border border-white/5 flex flex-col justify-between">
                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Space Complexity</div>
                                        <div className={`text-2xl font-black ${textGradientClass}`}>{analysis.memoryWithoutConstant || analysis.memory}</div>
                                        <div className="text-xs text-gray-500 mt-2 font-mono" title="Exact complexity including constants">
                                            Exact: {analysis.memoryWithConstant || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 max-w-md">
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
                        ) : (
                            <div className="text-gray-500">
                                {loading ? 'Analyzing your code...' : 'Awaiting code input...'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
