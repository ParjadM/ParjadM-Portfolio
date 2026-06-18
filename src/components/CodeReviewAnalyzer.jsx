import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard.jsx';
import { Code } from './ui/Icons.jsx';
import { ChevronDown } from 'lucide-react';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

export function CodeReviewAnalyzer({ theme = 'emerald' }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const isMobile = useIsMobile();

  const debouncedCode = useDebounce(code, 1500);

  const accent = theme === 'pink' ? 'text-pink-400' : 'text-emerald-400';
  const btnClass = theme === 'pink'
    ? 'bg-gradient-to-r from-pink-500 to-red-500'
    : 'bg-gradient-to-r from-emerald-500 to-teal-500';

  React.useEffect(() => {
    if (!debouncedCode.trim() || debouncedCode.trim().length < 20) {
      setResult(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/ai/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: debouncedCode, language }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Review failed');
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Review failed');
          setResult(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [debouncedCode, language]);

  const pasteSection = (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 min-h-[44px] text-sm text-white focus:outline-none"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <span className="text-xs text-gray-500 self-center">Auto-reviews after 1.5s pause · cached by snippet</span>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="function twoSum(nums, target) { ... }"
        rows={8}
        spellCheck={false}
        className="w-full font-mono text-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/30 resize-y mobile-input"
      />
    </>
  );

  return (
    <GlassCard className="p-6 md:p-8" theme={theme}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${btnClass} text-white shadow-lg`}>
          <Code size={24} />
        </div>
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white">AI Code Review</h3>
          <p className="text-sm text-gray-400">Paste a snippet for bugs, readability, and complexity hints</p>
        </div>
      </div>

      {isMobile ? (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setPasteOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
            aria-expanded={pasteOpen}
          >
            <span>{pasteOpen ? 'Hide code editor' : 'Paste code to review'}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${pasteOpen ? 'rotate-180' : ''}`} />
          </button>
          {pasteOpen && <div className="mt-3">{pasteSection}</div>}
        </div>
      ) : (
        pasteSection
      )}

      {loading && <p className="mt-3 text-sm text-gray-400">Reviewing...</p>}
      {error && (
        <div className="mt-3 text-red-300 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="mt-6 space-y-4 border-t border-white/10 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-black/30 rounded-xl border border-white/5">
              <div className="text-xs text-gray-400 uppercase mb-1">Readability</div>
              <div className={`text-2xl font-bold ${accent}`}>{result.readabilityScore}/10</div>
            </div>
            <div className="p-4 bg-black/30 rounded-xl border border-white/5">
              <div className="text-xs text-gray-400 uppercase mb-1">Time</div>
              <div className={`text-lg font-bold ${accent}`}>{result.timeComplexity || '—'}</div>
            </div>
            <div className="p-4 bg-black/30 rounded-xl border border-white/5">
              <div className="text-xs text-gray-400 uppercase mb-1">Space</div>
              <div className={`text-lg font-bold ${accent}`}>{result.spaceComplexity || '—'}</div>
            </div>
          </div>

          {result.summary && <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>}

          {result.bugs?.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Potential issues</h4>
              <ul className="list-disc list-inside text-amber-200/90 text-sm space-y-1">
                {result.bugs.map((bug) => <li key={bug}>{bug}</li>)}
              </ul>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Suggestions</h4>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                {result.suggestions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
