import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch, adminJson } from '../../utils/adminApi.js';
import { useAdmin } from './AdminContext.jsx';
import { Chart } from '../../components/ui/Chart.jsx';
import { AdminPanelSkeleton } from './components/AdminSkeleton.jsx';

export const PremiumAnalytics = ({ theme, dbStatus }) => {
  const { showToast } = useAdmin();
  const [range, setRange] = useState(7);
  const [metrics, setMetrics] = useState(null);
  const [series, setSeries] = useState([]);
  const [paths, setPaths] = useState([]);
  const [deviceData, setDeviceData] = useState({ browsers: [], os: [] });
  const [heatmapData, setHeatmapData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [clientErrors, setClientErrors] = useState([]);
  const [errorFilter, setErrorFilter] = useState('open');
  const [webVitals, setWebVitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadErrors = useCallback(async (filter) => {
    const resolved = filter === 'open' ? 'false' : filter === 'resolved' ? 'true' : 'all';
    try {
      const d = await adminJson(`/api/admin/client-errors?resolved=${resolved}`);
      setClientErrors(Array.isArray(d.errors) ? d.errors : []);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminJson('/api/admin/metrics').then(setMetrics).catch(() => {}),
      adminJson('/api/admin/metrics/devices').then(setDeviceData).catch(() => {}),
      adminJson('/api/admin/metrics/hourly').then((d) => setHeatmapData(d.heatmap || [])).catch(() => {}),
      adminJson('/api/admin/metrics/logs').then((d) => setLogs(d.logs || [])).catch(() => {}),
      adminJson('/api/admin/metrics/vitals').then((d) => setWebVitals(Array.isArray(d.vitals) ? d.vitals : [])).catch(() => {}),
      loadErrors('open'),
    ]).finally(() => setLoading(false));
  }, [loadErrors]);

  useEffect(() => { loadErrors(errorFilter); }, [errorFilter, loadErrors]);

  useEffect(() => {
    fetch(`/api/metrics/series?range=${range}`)
      .then((res) => res.ok ? res.json() : { series: [] })
      .then((d) => setSeries(Array.isArray(d.series) ? d.series : [])).catch(() => {});
    fetch(`/api/metrics/paths?range=${range}`)
      .then((res) => res.ok ? res.json() : { paths: [] })
      .then((d) => setPaths(Array.isArray(d.paths) ? d.paths : [])).catch(() => {});
  }, [range]);

  const resolveError = async (id) => {
    try {
      await adminJson(`/api/admin/client-errors/${id}/resolve`, { method: 'POST' });
      showToast('Error marked resolved');
      loadErrors(errorFilter);
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const resolveAll = async () => {
    try {
      await adminJson('/api/admin/client-errors/resolve-all', { method: 'POST' });
      showToast('All errors resolved');
      loadErrors(errorFilter);
    } catch (e) {
      showToast(e.message || 'Failed', 'error');
    }
  };

  const exportCsv = async () => {
    try {
      const res = await adminFetch(`/api/admin/metrics/export?range=${range}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${range}d.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('CSV exported');
    } catch (e) {
      showToast(e.message || 'Export failed', 'error');
    }
  };

  const maxBrowser = Math.max(1, ...deviceData.browsers.map((b) => b.count));
  const maxOs = Math.max(1, ...deviceData.os.map((o) => o.count));

  const today = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  }).reverse();

  const heatMapGrid = last7Days.map((date) => {
    const hours = Array.from({ length: 24 }).map((_, h) => {
      const entry = heatmapData.find((d) => d.date === date && d.hour === h);
      return entry ? entry.pageviews : 0;
    });
    return { date, hours };
  });

  const maxHeat = Math.max(1, ...heatmapData.map((d) => d.pageviews));

  if (loading && !metrics) return <AdminPanelSkeleton />;

  return (
    <div className="text-gray-300 space-y-6 max-w-7xl">
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white/5 border border-white/10 p-4 rounded-xl">
        <div>
          <div className="text-sm text-gray-400">Database</div>
          <div className="font-semibold text-white capitalize">{dbStatus?.engine || 'unknown'} {dbStatus?.connected ? '(Connected)' : ''}</div>
        </div>
        {metrics && (
          <div className="flex gap-6">
            <div>
              <div className="text-sm text-gray-400">Unique visitors</div>
              <div className="text-2xl font-bold text-white">{metrics.uniqueVisitors}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Pageviews</div>
              <div className="text-2xl font-bold text-white">{metrics.pageviews}</div>
            </div>
          </div>
        )}
        <button type="button" onClick={exportCsv} className="px-3 py-2 rounded-lg bg-white/10 text-sm hover:bg-white/20">Export CSV</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <h4 className="text-white font-semibold mb-4">Top browsers</h4>
          <div className="space-y-3">
            {deviceData.browsers.slice(0, 5).map((b) => (
              <div key={b.name}>
                <div className="flex justify-between text-sm mb-1"><span>{b.name}</span><span>{b.count}</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${(b.count / maxBrowser) * 100}%` }} />
                </div>
              </div>
            ))}
            {deviceData.browsers.length === 0 && <div className="text-gray-400 text-sm">No data</div>}
          </div>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
          <h4 className="text-white font-semibold mb-4">Top operating systems</h4>
          <div className="space-y-3">
            {deviceData.os.slice(0, 5).map((o) => (
              <div key={o.name}>
                <div className="flex justify-between text-sm mb-1"><span>{o.name}</span><span>{o.count}</span></div>
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${(o.count / maxOs) * 100}%` }} />
                </div>
              </div>
            ))}
            {deviceData.os.length === 0 && <div className="text-gray-400 text-sm">No data</div>}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <h4 className="text-white font-semibold mb-4">Visitor heatmap (7 days)</h4>
        <div className="min-w-[600px]">
          <div className="flex mb-2">
            <div className="w-16" />
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="flex-1 text-center text-xs text-gray-500">{h % 2 === 0 ? h : ''}</div>
            ))}
          </div>
          {heatMapGrid.map((row) => (
            <div key={row.date} className="flex mb-1 items-center">
              <div className="w-16 text-xs text-gray-400">{row.date.slice(5)}</div>
              {row.hours.map((val, h) => {
                const intensity = val === 0 ? 0.05 : Math.max(0.1, val / maxHeat);
                return (
                  <div key={h} className="flex-1 aspect-square mx-[1px] rounded-sm" style={{ backgroundColor: `rgba(16, 185, 129, ${intensity})` }} title={`${val} views at ${h}:00`} />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-semibold">Traffic trend</h4>
          <div className="flex gap-2">
            {[7, 30, 90].map((r) => (
              <button key={r} type="button" onClick={() => setRange(r)} className={`px-2 py-1 text-xs rounded ${range === r ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>{r}D</button>
            ))}
          </div>
        </div>
        <Chart theme={theme} data={series} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-96">
          <h4 className="text-white font-semibold mb-3">Top paths ({range}d)</h4>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900/90 backdrop-blur">
                <tr className="text-left text-gray-400">
                  <th className="py-2 pr-4 font-normal">Path</th>
                  <th className="py-2 font-normal text-right">Views</th>
                </tr>
              </thead>
              <tbody>
                {paths.map((p) => (
                  <tr key={p.path} className="border-t border-white/5">
                    <td className="py-2 pr-4 font-mono truncate max-w-[200px]" title={p.path}>{p.path}</td>
                    <td className="py-2 text-right text-gray-200">{p.pageviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-96">
          <h4 className="text-white font-semibold mb-3">Live access logs</h4>
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
                    <td className="py-2 pr-4 text-xs text-gray-500 whitespace-nowrap">{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2 pr-4 font-mono truncate max-w-[150px]" title={l.path}>{l.path}</td>
                    <td className="py-2 text-right text-gray-300 text-xs truncate max-w-[100px]" title={`${l.browser} on ${l.os}`}>{l.browser} / {l.os}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-500">No logs yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
        <h4 className="text-white font-semibold mb-4">Core Web Vitals (p75, 7d)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {webVitals.map((v) => (
            <div key={v.name} className="text-center p-3 rounded-lg bg-black/20">
              <div className="text-xs text-gray-400 mb-1">{v.name}</div>
              <div className="text-lg font-bold text-white">{v.name === 'CLS' ? v.p75.toFixed(3) : `${Math.round(v.p75)}ms`}</div>
              <div className="text-[10px] text-gray-500">{v.samples} samples</div>
            </div>
          ))}
          {webVitals.length === 0 && <div className="col-span-full text-gray-500 text-sm">No vitals data yet</div>}
        </div>
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col max-h-[28rem]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h4 className="text-white font-semibold">Client errors</h4>
          <div className="flex gap-2">
            {['open', 'resolved', 'all'].map((f) => (
              <button key={f} type="button" onClick={() => setErrorFilter(f)} className={`px-2 py-1 text-xs rounded capitalize ${errorFilter === f ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400'}`}>{f}</button>
            ))}
            {errorFilter === 'open' && clientErrors.length > 0 && (
              <button type="button" onClick={resolveAll} className="px-2 py-1 text-xs rounded bg-emerald-600/50">Resolve all</button>
            )}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 space-y-2">
          {clientErrors.length === 0 && <div className="py-4 text-center text-gray-500 text-sm">No errors in this view.</div>}
          {clientErrors.map((e) => (
            <details key={e.id} className={`rounded-lg border px-3 py-2 ${e.resolved ? 'bg-white/5 border-white/10 opacity-70' : 'bg-white/5 border-red-500/20'}`}>
              <summary className="cursor-pointer text-sm text-red-300 truncate flex items-center gap-2">
                <span className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</span>
                {e.message}
                {e.resolved && <span className="text-xs text-emerald-400">resolved</span>}
              </summary>
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <div className="truncate" title={e.url}>Page: {e.url}</div>
                {e.stack && <pre className="mt-1 p-2 rounded bg-black/40 overflow-x-auto whitespace-pre-wrap max-h-32">{e.stack}</pre>}
                {!e.resolved && (
                  <button type="button" onClick={() => resolveError(e.id)} className="mt-2 px-2 py-1 rounded bg-emerald-600/50 text-white text-xs">Mark resolved</button>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};
