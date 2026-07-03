import React, { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/auth.jsx';
import { Chart } from '../../components/ui/Chart.jsx';

export const PremiumAnalytics = ({ theme, dbStatus }) => {
  const [range, setRange] = useState(7);
  const [metrics, setMetrics] = useState(null);
  const [series, setSeries] = useState([]);
  const [paths, setPaths] = useState([]);
  
  const [deviceData, setDeviceData] = useState({ browsers: [], os: [] });
  const [heatmapData, setHeatmapData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [clientErrors, setClientErrors] = useState([]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    
    // Core metrics
    fetch('/api/admin/metrics', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(setMetrics).catch(() => {});
      
    // Device data
    fetch('/api/admin/metrics/devices', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : { browsers: [], os: [] })
      .then(setDeviceData).catch(() => {});
      
    // Heatmap data
    fetch('/api/admin/metrics/hourly', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : { heatmap: [] })
      .then(d => setHeatmapData(d.heatmap)).catch(() => {});
      
    // Logs data
    fetch('/api/admin/metrics/logs', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : { logs: [] })
      .then(d => setLogs(d.logs)).catch(() => {});

    // Client-side error reports
    fetch('/api/admin/client-errors', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : { errors: [] })
      .then(d => setClientErrors(Array.isArray(d.errors) ? d.errors : [])).catch(() => {});
  }, []);

  useEffect(() => {
    // Time series & paths
    fetch(`/api/metrics/series?range=${range}`)
      .then(res => res.ok ? res.json() : { series: [] })
      .then(d => setSeries(Array.isArray(d.series) ? d.series : [])).catch(() => {});
      
    fetch(`/api/metrics/paths?range=${range}`)
      .then(res => res.ok ? res.json() : { paths: [] })
      .then(d => setPaths(Array.isArray(d.paths) ? d.paths : [])).catch(() => {});
  }, [range]);

  const maxBrowser = Math.max(1, ...deviceData.browsers.map(b => b.count));
  const maxOs = Math.max(1, ...deviceData.os.map(o => o.count));

  // Process Heatmap Data (24 cols for hours, rows for last 7 days)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();
  
  const heatMapGrid = last7Days.map(date => {
    const hours = Array.from({ length: 24 }).map((_, h) => {
      const entry = heatmapData.find(d => d.date === date && d.hour === h);
      return entry ? entry.pageviews : 0;
    });
    return { date, hours };
  });
  
  const maxHeat = Math.max(1, ...heatmapData.map(d => d.pageviews));

  return (
    <div className="text-gray-300 space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
        <div>
          <div className="text-sm text-gray-400">Database Engine</div>
          <div className="font-semibold text-white capitalize">{dbStatus?.engine || 'unknown'} {dbStatus?.connected ? '(Connected)' : ''}</div>
        </div>
        {metrics && (
          <div className="flex gap-6">
            <div>
              <div className="text-sm text-gray-400">Total Visitors</div>
              <div className="text-2xl font-bold text-white">{metrics.uniqueVisitors}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Impressions</div>
              <div className="text-2xl font-bold text-white">{metrics.pageviews}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Distribution */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <h4 className="text-white font-semibold mb-4">Top Browsers</h4>
          <div className="space-y-3">
            {deviceData.browsers.slice(0, 5).map(b => (
              <div key={b.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{b.name}</span>
                  <span>{b.count}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${(b.count / maxBrowser) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {deviceData.browsers.length === 0 && <div className="text-gray-400 text-sm">No data</div>}
          </div>
        </div>

        {/* OS Distribution */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <h4 className="text-white font-semibold mb-4">Top Operating Systems</h4>
          <div className="space-y-3">
            {deviceData.os.slice(0, 5).map(o => (
              <div key={o.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{o.name}</span>
                  <span>{o.count}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${(o.count / maxOs) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {deviceData.os.length === 0 && <div className="text-gray-400 text-sm">No data</div>}
          </div>
        </div>
      </div>

      {/* Hourly Heatmap */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <h4 className="text-white font-semibold mb-4">Visitor Activity Heatmap (Last 7 Days)</h4>
        <div className="min-w-[600px]">
          <div className="flex mb-2">
            <div className="w-16"></div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="flex-1 text-center text-xs text-gray-500">{h % 2 === 0 ? h : ''}</div>
            ))}
          </div>
          {heatMapGrid.map(row => (
            <div key={row.date} className="flex mb-1 items-center">
              <div className="w-16 text-xs text-gray-400">{row.date.slice(5)}</div>
              {row.hours.map((val, h) => {
                const intensity = val === 0 ? 0.05 : Math.max(0.1, val / maxHeat);
                return (
                  <div key={h} className="flex-1 aspect-square mx-[1px] rounded-sm transition-colors" 
                       style={{ backgroundColor: `rgba(16, 185, 129, ${intensity})` }} 
                       title={`${val} views at ${h}:00`} />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Trend */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-semibold">Traffic Trend</h4>
          <div className="flex gap-2">
            {[7, 30, 90].map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-2 py-1 text-xs rounded ${range === r ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>{r}D</button>
            ))}
          </div>
        </div>
        <Chart theme={theme} data={series} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Paths */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-96">
          <h4 className="text-white font-semibold mb-3">Top Paths ({range} days)</h4>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900/90 backdrop-blur">
                <tr className="text-left text-gray-400">
                  <th className="py-2 pr-4 font-normal">Path</th>
                  <th className="py-2 pr-4 font-normal text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {paths.map((p) => (
                  <tr key={p.path} className="border-t border-white/5">
                    <td className="py-2 pr-4 font-mono truncate max-w-[200px]" title={p.path}>{p.path}</td>
                    <td className="py-2 pr-4 text-right text-gray-200">{p.pageviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Logs */}
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-96">
          <h4 className="text-white font-semibold mb-3">Live Access Logs</h4>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900/90 backdrop-blur">
                <tr className="text-left text-gray-400">
                  <th className="py-2 pr-4 font-normal">Time</th>
                  <th className="py-2 pr-4 font-normal">Path</th>
                  <th className="py-2 font-normal text-right">Device</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l._id} className="border-t border-white/5">
                    <td className="py-2 pr-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 pr-4 font-mono truncate max-w-[150px]" title={l.path}>{l.path}</td>
                    <td className="py-2 text-right text-gray-300 text-xs truncate max-w-[100px]" title={`${l.browser} on ${l.os}`}>
                      {l.browser} / {l.os}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-500">No logs yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Client-side JS errors reported from real visitors' browsers */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-96">
        <h4 className="text-white font-semibold mb-3">
          Client Errors
          {clientErrors.length > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-xs align-middle">
              {clientErrors.length}
            </span>
          )}
        </h4>
        <div className="overflow-y-auto flex-1 space-y-2">
          {clientErrors.length === 0 && (
            <div className="py-4 text-center text-gray-500 text-sm">No errors reported. 🎉</div>
          )}
          {clientErrors.map((e) => (
            <details key={e.id} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
              <summary className="cursor-pointer text-sm text-red-300 truncate">
                <span className="text-xs text-gray-500 mr-2">{new Date(e.createdAt).toLocaleString()}</span>
                {e.message}
              </summary>
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <div className="truncate" title={e.url}>Page: {e.url}</div>
                <div className="truncate" title={e.source}>Source: {e.source || 'n/a'}</div>
                <div className="truncate" title={e.userAgent}>UA: {e.userAgent}</div>
                {e.stack && <pre className="mt-1 p-2 rounded bg-black/40 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">{e.stack}</pre>}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};
