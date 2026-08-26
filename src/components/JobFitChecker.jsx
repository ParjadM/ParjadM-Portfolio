import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard.jsx';
import { BrainCircuit } from './ui/Icons.jsx';
import { getAccent } from '../utils/themeTokens.js';

export function JobFitChecker({ theme = 'green' }) {
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const accentTokens = getAccent(theme);
  const accent = accentTokens.text;
  const muted = 'text-white/75';
  const subtle = 'text-white/60';
  const btnClass = accentTokens.gradientBtn;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim() || loading) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/ai/job-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-8" theme={theme}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${btnClass} text-white shadow-lg`}>
          <BrainCircuit size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Job Fit Checker</h3>
          <p className={`text-sm ${muted}`}>For recruiters — paste a job description to see skill overlap</p>
        </div>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste a job description here..."
          rows={6}
          className="w-full bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-white/40 focus:bg-black/25 resize-y"
        />
        <button
          type="submit"
          disabled={loading || jobDescription.trim().length < 40}
          className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 ${btnClass}`}
        >
          {loading ? 'Analyzing...' : 'Check Fit'}
        </button>
        <p className={`text-xs ${subtle}`}>Cached results save API usage · 3 analyses per day</p>
      </form>

      {error && (
        <div className="mt-4 text-red-300 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-5 border-t border-white/10 pt-6">
          <div className="flex items-end gap-3">
            <div className={`text-5xl font-black ${accent}`}>{result.matchScore}%</div>
            <div className={`${muted} text-sm pb-1`}>match score</div>
          </div>
          {result.summary && <p className="text-white/90 leading-relaxed">{result.summary}</p>}

          {result.matchingSkills?.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Matching skills</h4>
              <div className="flex flex-wrap gap-2">
                {result.matchingSkills.map((skill) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {result.relevantProjects?.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Relevant projects</h4>
              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                {result.relevantProjects.map((project) => <li key={project}>{project}</li>)}
              </ul>
            </div>
          )}

          {result.gaps?.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Gaps to discuss</h4>
              <ul className="list-disc list-inside text-white/75 text-sm space-y-1">
                {result.gaps.map((gap) => <li key={gap}>{gap}</li>)}
              </ul>
            </div>
          )}

          {result.talkingPoints?.length > 0 && (
            <div>
              <h4 className="text-white font-semibold mb-2">Suggested talking points</h4>
              <ul className="list-disc list-inside text-white/85 text-sm space-y-1">
                {result.talkingPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
