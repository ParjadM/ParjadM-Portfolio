import React, { useState, useEffect } from 'react';
import { adminJson } from '../../utils/adminApi.js';
import { AdminPanelSkeleton } from './components/AdminSkeleton.jsx';
import { getAccent } from '../../utils/themeTokens.js';

function AiUsageChart({ data, theme }) {
  const accentTokens = getAccent(theme);
  const width = 640;
  const height = 220;
  const padding = 32;
  const maxY = Math.max(1, ...data.map((d) => (d.gemini || 0) + (d.free || 0)));
  const barWidth = Math.max(12, (width - padding * 2) / Math.max(data.length, 1) - 8);
  const colorGemini = accentTokens.hex;
  const colorFree = '#64748b';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.2)" />
      {data.map((row, i) => {
        const total = (row.gemini || 0) + (row.free || 0);
        const x = padding + i * ((width - padding * 2) / Math.max(data.length, 1)) + 4;
        const geminiH = ((row.gemini || 0) / maxY) * (height - padding * 2);
        const freeH = ((row.free || 0) / maxY) * (height - padding * 2);
        const baseY = height - padding;
        return (
          <g key={row.label}>
            <rect x={x} y={baseY - geminiH - freeH} width={barWidth} height={freeH} fill={colorFree} rx={2} />
            <rect x={x} y={baseY - geminiH} width={barWidth} height={geminiH} fill={colorGemini} rx={2} />
            <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.5)">
              {row.label}
            </text>
            {total > 0 && (
              <title>{`${row.label}: ${row.gemini} gemini, ${row.free} free`}</title>
            )}
          </g>
        );
      })}
      <circle cx={width - 180} cy={16} r={4} fill={colorGemini} />
      <text x={width - 170} y={20} fontSize="12" fill="white">Gemini</text>
      <circle cx={width - 90} cy={16} r={4} fill={colorFree} />
      <text x={width - 80} y={20} fontSize="12" fill="white">Free</text>
    </svg>
  );
}

export const AdminAICostDashboard = ({ theme }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState(7);

  useEffect(() => {
    setLoading(true);
    adminJson(`/api/admin/ai/stats?range=${range}`)
      .then(setStats)
      .catch(() => setError('Failed to load AI stats'))
      .finally(() => setLoading(false));
  }, [range]);

  const accent = getAccent(theme).text;

  if (loading) return <AdminPanelSkeleton />;
  if (error) return <div className="text-red-300">{error}</div>;
  if (!stats) return null;

  const chartData = stats.series.map((row) => ({
    label: row.date.slice(5),
    gemini: row.gemini,
    free: row.free,
  }));

  return (
    <div className="text-gray-300 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl text-white font-bold">AI Cost Dashboard</h3>
          <p className="text-sm text-gray-400">Model: {stats.model}</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-gray-400 uppercase">Global budget</div>
          <div className={`text-2xl font-bold ${accent}`}>
            {stats.global.count}/{stats.global.limit}
          </div>
          <div className="text-xs text-gray-500">Gemini calls today</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-gray-400 uppercase">Today Gemini</div>
          <div className="text-2xl font-bold text-white">{stats.today.gemini}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-gray-400 uppercase">Today free hits</div>
          <div className="text-2xl font-bold text-white">{stats.today.free}</div>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs text-gray-400 uppercase">Cache hit rate</div>
          <div className={`text-2xl font-bold ${accent}`}>{stats.today.cacheHitRate}%</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-white font-semibold mb-3">Daily AI responses</h4>
          <AiUsageChart data={chartData} theme={theme} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-white font-semibold mb-3">Today by feature</h4>
          {Object.keys(stats.today.byFeature).length === 0 ? (
            <p className="text-sm text-gray-500">No AI activity yet today.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {Object.entries(stats.today.byFeature).map(([feature, data]) => (
                <li key={feature} className="flex justify-between gap-2">
                  <span className="text-gray-300">{feature}</span>
                  <span className="text-gray-400">
                    {data.gemini} gemini · {data.free} free
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-white font-semibold mb-3">Top topics (anonymized)</h4>
          {stats.topTopics.length === 0 ? (
            <p className="text-sm text-gray-500">No topic data yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {stats.topTopics.map((topic) => (
                <li key={`${topic.feature}-${topic.topicSlug}`} className="flex justify-between gap-2">
                  <span className="text-gray-400 truncate" title={topic.topicSlug}>
                    [{topic.feature}] {topic.topicSlug}
                  </span>
                  <span className="text-gray-300 shrink-0">{topic.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
