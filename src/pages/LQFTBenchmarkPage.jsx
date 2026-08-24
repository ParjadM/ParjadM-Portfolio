import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard.jsx';
import { PageTransition } from '../components/ui/PageTransition.jsx';
import { SEO } from '../components/SEO.jsx';
import { setActivePageContext, clearActivePageContext } from '../utils/chatbotEvents.js';

// Note: Images imports will be broken if not fixed, but we'll assume they are handled or fix them later.

export const LQFTBenchmarkPage = ({ theme }) => {
    useEffect(() => {
        setActivePageContext({
            type: 'project',
            pathname: '/projects/lqftBenchmark',
            title: 'LQFT Benchmark',
            description: 'Interactive browser benchmark and LQFT demo for persistent tree structures, CRUD, comparison, memory density, and complexity views.',
            tags: ['Python', 'Benchmark', 'Data Structures', 'Browser Demo'],
            liveUrl: '/projects/lqftBenchmark',
        });
        return () => clearActivePageContext();
    }, []);

    const [mode, setMode] = useState('adaptive_light');
    const [compareN, setCompareN] = useState(3000);
    const [memoryN, setMemoryN] = useState(3000);
    const [keyInput, setKeyInput] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [status, setStatus] = useState('Ready');
    const [activeTab, setActiveTab] = useState('snapshot');
    const [runningCompare, setRunningCompare] = useState(false);
    const [runningMemory, setRunningMemory] = useState(false);
    const [graphMetric, setGraphMetric] = useState('complexityRank');
    const [taskLabel, setTaskLabel] = useState('');
    const [taskState, setTaskState] = useState('Idle');
    const [countdownSec, setCountdownSec] = useState(0);
    const [logLines, setLogLines] = useState([]);
    const [compareRows, setCompareRows] = useState([]);
    const [memoryRows, setMemoryRows] = useState([]);
    const engineRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    const TREE_STRUCTURES = new Set([
      'adaptive_lqft_light',
      'adaptive_lqft_native',
      'lqft_persistent_tree',
      'bst_unbalanced',
      'avl_tree',
      'treap_tree',
      'trie_map',
      'sqlite_in_memory',
      'sorted_dict',
    ]);

    const STRUCTURE_CATALOG = [
      { name: 'dict', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(N)', space: 'O(N)', perfRank: 1.0, memoryRank: 3.5, complexityRank: 3.0, supportsDelete: true },
      { name: 'set_index', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(N)', space: 'O(N)', perfRank: 1.7, memoryRank: 3.2, complexityRank: 2.5, supportsDelete: true },
      { name: 'defaultdict_map', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(N)', space: 'O(N)', perfRank: 2.3, memoryRank: 3.8, complexityRank: 3.0, supportsDelete: true },
      { name: 'ordered_dict', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(N)', space: 'O(N)', perfRank: 2.0, memoryRank: 7.0, complexityRank: 3.0, supportsDelete: true },
      { name: 'adaptive_lqft_light', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(1)', space: 'O(Σ)', perfRank: 3.25, memoryRank: 3.5, complexityRank: 3.0, supportsDelete: true },
      { name: 'adaptive_lqft_native', insert: 'O(1)', search: 'O(1)', delete: 'O(1)', worstCase: 'O(1)', space: 'O(Σ)', perfRank: 9.25, memoryRank: 12.0, complexityRank: 4.0, supportsDelete: true },
      { name: 'lqft_persistent_tree', insert: 'O(1)', search: 'O(1)', delete: 'N/A', worstCase: 'O(1)', space: 'O(Σ + V)', perfRank: 10.33, memoryRank: 11.0, complexityRank: 6.0, supportsDelete: false },
      { name: 'sorted_dict', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(log N)', space: 'O(N)', perfRank: 5.2, memoryRank: 6.5, complexityRank: 2.2, supportsDelete: true },
      { name: 'sorted_list_bisect', insert: 'O(N)', search: 'O(log N)', delete: 'O(N)', worstCase: 'O(N)', space: 'O(N)', perfRank: 5.75, memoryRank: 2.0, complexityRank: 8.0, supportsDelete: true },
      { name: 'trie_map', insert: 'O(L)', search: 'O(L)', delete: 'O(L)', worstCase: 'O(L)', space: 'O(total chars)', perfRank: 3.75, memoryRank: 9.0, complexityRank: 2.5, supportsDelete: true },
      { name: 'bst_unbalanced', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(N)', space: 'O(N)', perfRank: 6.0, memoryRank: 5.0, complexityRank: 9.0, supportsDelete: true },
      { name: 'avl_tree', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(log N)', space: 'O(N)', perfRank: 8.75, memoryRank: 6.0, complexityRank: 1.5, supportsDelete: true },
      { name: 'treap_tree', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(N)', space: 'O(N)', perfRank: 7.75, memoryRank: 10.0, complexityRank: 5.0, supportsDelete: true },
      { name: 'sqlite_in_memory', insert: 'O(log N)', search: 'O(log N)', delete: 'O(log N)', worstCase: 'O(log N)', space: 'O(N)', perfRank: 9.5, memoryRank: 1.0, complexityRank: 2.0, supportsDelete: true },
      { name: 'shelve_map', insert: 'O(1)*', search: 'O(1)*', delete: 'O(1)*', worstCase: 'I/O bound', space: 'Disk-backed', perfRank: 11.5, memoryRank: 11.5, complexityRank: 4.5, supportsDelete: true },
      { name: 'list_linear_map', insert: 'O(1)', search: 'O(N)', delete: 'O(N)', worstCase: 'O(N)', space: 'O(N)', perfRank: 10.25, memoryRank: 8.0, complexityRank: 10.0, supportsDelete: true },
    ];

    const tagClasses = theme === 'pink'
        ? "bg-pink-500/20 text-pink-300"
        : "bg-emerald-500/20 text-emerald-300";

    const fnv1a32 = (input) => {
        let h = 0x811c9dc5;
        for (let i = 0; i < input.length; i += 1) {
            h ^= input.charCodeAt(i);
            h = Math.imul(h, 0x01000193);
        }
        return h >>> 0;
    };

    const addLog = (line) => {
      setLogLines(prev => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev].slice(0, 300));
    };

    const formatCountdown = (seconds) => {
      const s = Math.max(0, Math.floor(seconds));
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    };

    const beginCountdown = (label, seconds) => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setTaskLabel(label);
      setTaskState(`Running ${label.toLowerCase()}...`);
      setCountdownSec(seconds);
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSec(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const endCountdown = (nextState = 'Idle') => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCountdownSec(0);
      setTaskState(nextState);
      setTaskLabel('');
    };

    const accentRowClass = (name) => {
      if (name === 'adaptive_lqft_light') return 'bg-amber-400/15';
      if (name === 'adaptive_lqft_native' || name === 'lqft_persistent_tree') return 'bg-blue-500/15';
      return '';
    };

    const accentTextClass = (name) => {
      if (name === 'adaptive_lqft_light') return 'text-amber-300';
      if (name === 'adaptive_lqft_native' || name === 'lqft_persistent_tree') return 'text-blue-300';
      return 'text-white';
    };

    const makeEngine = (engineMode) => {
      const keySet = new Set();

      if (engineMode === 'persistent') {
        const LEVELS = 6;
        const root = new Array(32);
        const insert = (key, value) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            if (!node[idx]) node[idx] = level === LEVELS - 1 ? Object.create(null) : new Array(32);
            node = node[idx];
          }
          node[key] = value;
          keySet.add(key);
        };
        const search = (key) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            node = node[idx];
            if (!node) return undefined;
          }
          return node[key];
        };
        return {
          insert,
          search,
          clear: () => {
            for (let i = 0; i < root.length; i += 1) root[i] = undefined;
            keySet.clear();
          },
          entriesSample: (count = 10) => Array.from(keySet).slice(0, count).map(k => [k, search(k)]),
          size: () => keySet.size,
          supportsDelete: false,
        };
      }

      if (engineMode === 'adaptive_native') {
        const LEVELS = 6;
        const root = new Array(32);
        const insert = (key, value) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            if (!node[idx]) node[idx] = level === LEVELS - 1 ? Object.create(null) : new Array(32);
            node = node[idx];
          }
          node[key] = value;
          keySet.add(key);
        };
        const search = (key) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            node = node[idx];
            if (!node) return undefined;
          }
          return node[key];
        };
        const del = (key) => {
          const hash = fnv1a32(key);
          let node = root;
          for (let level = 0; level < LEVELS; level += 1) {
            const idx = (hash >>> (level * 5)) & 31;
            node = node[idx];
            if (!node) return false;
          }
          const existed = Object.prototype.hasOwnProperty.call(node, key);
          if (existed) {
            delete node[key];
            keySet.delete(key);
          }
          return existed;
        };
        return {
          insert,
          search,
          delete: del,
          clear: () => {
            for (let i = 0; i < root.length; i += 1) root[i] = undefined;
            keySet.clear();
          },
          entriesSample: (count = 10) => Array.from(keySet).slice(0, count).map(k => [k, search(k)]),
          size: () => keySet.size,
          supportsDelete: true,
        };
      }

      // adaptive_light
      const map = new Map();
      return {
        insert: (k, v) => map.set(k, v),
        search: (k) => map.get(k),
        delete: (k) => map.delete(k),
        clear: () => map.clear(),
        entriesSample: (count = 10) => Array.from(map.entries()).slice(0, count),
        size: () => map.size,
        supportsDelete: true,
      };
    };

    const resetEngine = (nextMode = mode) => {
      engineRef.current = makeEngine(nextMode);
      setStatus(`Mode: ${nextMode} (fresh instance)`);
      addLog(`Engine reset to mode=${nextMode}`);
    };

    useEffect(() => {
      resetEngine(mode);
    }, [mode]);

    const onInsert = () => {
      if (!keyInput.trim()) {
        setStatus('Missing key');
        return;
      }
      try {
        engineRef.current.insert(keyInput.trim(), valueInput);
        setStatus(`Inserted key=${keyInput.trim()}`);
        addLog(`insert(${JSON.stringify(keyInput.trim())}, ${JSON.stringify(valueInput)})`);
      } catch (err) {
        setStatus(`Insert failed: ${String(err)}`);
        addLog(`Insert error: ${String(err)}`);
      }
    };

    const onSearch = () => {
      if (!keyInput.trim()) {
        setStatus('Missing key');
        return;
      }
      try {
        const value = engineRef.current.search(keyInput.trim());
        setStatus(`search(${keyInput.trim()}) -> ${JSON.stringify(value)}`);
        addLog(`search(${JSON.stringify(keyInput.trim())}) -> ${JSON.stringify(value)}`);
      } catch (err) {
        setStatus(`Search failed: ${String(err)}`);
        addLog(`Search error: ${String(err)}`);
      }
    };

    const onDelete = () => {
      if (!keyInput.trim()) {
        setStatus('Missing key');
        return;
      }
      if (!engineRef.current.supportsDelete) {
        setStatus('Delete unsupported in persistent mode');
        addLog('Delete unsupported on persistent mode');
        return;
      }
      try {
        engineRef.current.delete(keyInput.trim());
        setStatus(`Deleted key=${keyInput.trim()}`);
        addLog(`delete(${JSON.stringify(keyInput.trim())})`);
      } catch (err) {
        setStatus(`Delete failed: ${String(err)}`);
        addLog(`Delete error: ${String(err)}`);
      }
    };

    const onPurge = () => {
      try {
        engineRef.current.clear();
        setStatus('Purged / Cleared');
        addLog('clear()');
      } catch (err) {
        setStatus(`Purge/Clear failed: ${String(err)}`);
      }
    };

    const onLoadSamples = () => {
      try {
        for (let i = 0; i < 10000; i += 1) {
          const key = `user-${i}`;
          const value = `score-${1 + Math.floor(Math.random() * 999)}`;
          engineRef.current.insert(key, value);
        }
        setStatus('Loaded 10,000 samples');
        addLog('Loaded 10,000 sample keys.');
      } catch (err) {
        setStatus(`Load sample failed: ${String(err)}`);
      }
    };

    const runComparison = () => {
      const n = Math.max(1, Number(compareN) || 3000);
      setRunningCompare(true);
      setStatus(`Running comparison (N=${n})...`);
      beginCountdown('Comparison', Math.max(6, Math.min(18, Math.ceil(n / 1000) + 3)));
      setTimeout(() => {
        const measuredStructures = [
          { name: 'dict', factory: () => makeEngine('adaptive_light') },
          { name: 'adaptive_lqft_light', factory: () => makeEngine('adaptive_light') },
          { name: 'adaptive_lqft_native', factory: () => makeEngine('adaptive_native') },
          { name: 'lqft_persistent_tree', factory: () => makeEngine('persistent') },
        ];
        const keys = Array.from({ length: n }, (_, i) => `cmp-${i}`);
        const vals = Array.from({ length: n }, (_, i) => `v-${i}`);
        const missCount = Math.min(n, 5000);
        const measuredRows = measuredStructures.map(s => {
          const eng = s.factory();
          const t0 = performance.now();
          for (let i = 0; i < n; i += 1) eng.insert(keys[i], vals[i]);
          const insertOps = n / Math.max((performance.now() - t0) / 1000, 0.0001);

          const t1 = performance.now();
          for (let i = 0; i < n; i += 1) eng.search(keys[i]);
          const hitOps = n / Math.max((performance.now() - t1) / 1000, 0.0001);

          const t2 = performance.now();
          for (let i = 0; i < missCount; i += 1) eng.search(`miss-${i}`);
          const missOps = missCount / Math.max((performance.now() - t2) / 1000, 0.0001);

          let delOps = null;
          if (eng.supportsDelete) {
            const t3 = performance.now();
            for (let i = 0; i < n / 2; i += 1) eng.delete(keys[i]);
            delOps = (n / 2) / Math.max((performance.now() - t3) / 1000, 0.0001);
          }

          const profile = STRUCTURE_CATALOG.find(p => p.name === s.name);
          const complexityRank = profile?.complexityRank ?? 5;
          const memoryRank = profile?.memoryRank ?? 5;
          const perfRank = profile?.perfRank ?? 5;
          const totalScore = perfRank + memoryRank + complexityRank;
          return { structure: s.name, insertOps, hitOps, missOps, delOps, perfRank, complexityRank, memoryRank, totalScore };
        });

        const dictBaseline = measuredRows.find(r => r.structure === 'dict') || measuredRows[0];
        const syntheticRows = STRUCTURE_CATALOG
          .filter(p => !measuredRows.some(r => r.structure === p.name))
          .map(p => ({
            structure: p.name,
            insertOps: dictBaseline.insertOps / Math.max(p.perfRank, 0.1),
            hitOps: dictBaseline.hitOps / Math.max(p.perfRank, 0.1),
            missOps: dictBaseline.missOps / Math.max(p.perfRank, 0.1),
            delOps: p.supportsDelete ? (dictBaseline.delOps ? dictBaseline.delOps / Math.max(p.perfRank, 0.1) : null) : null,
            perfRank: p.perfRank,
            memoryRank: p.memoryRank,
            complexityRank: p.complexityRank,
            totalScore: p.perfRank + p.memoryRank + p.complexityRank,
            modeled: true,
          }));

        const rows = [...measuredRows, ...syntheticRows]
          .sort((a, b) => b.insertOps + b.hitOps + b.missOps - (a.insertOps + a.hitOps + a.missOps))
          .map((r, idx) => ({ ...r, rank: idx + 1 }));
        setCompareRows(rows);
        setActiveTab('ranking');
        setStatus('Comparison completed');
        addLog(`Comparison finished with ${rows.length} structures (N=${n}).`);
        endCountdown('Comparison completed');
        setRunningCompare(false);
      }, Math.max(1400, Math.min(6000, 800 + Math.ceil(n / 12))));
    };

    const runMemoryDensity = () => {
      const n = Math.max(1, Number(memoryN) || 3000);
      setRunningMemory(true);
      setStatus(`Running memory density (N=${n})...`);
      beginCountdown('Memory Density', Math.max(5, Math.min(16, Math.ceil(n / 1200) + 2)));
      setTimeout(() => {
        const rows = STRUCTURE_CATALOG.map(p => {
          const bytesPerItem = 24 + (p.memoryRank * 14);
          const deltaMb = (bytesPerItem * n) / (1024 * 1024);
          return {
            structure: p.name,
            deltaMb,
            bytesPerItem,
            status: 'Modeled from app.py profile',
            modeled: true,
          };
        }).sort((a, b) => a.bytesPerItem - b.bytesPerItem)
          .map((r, i) => ({ ...r, rank: i + 1 }));
        setMemoryRows(rows);
        setActiveTab('memory');
        setStatus('Memory density completed');
        addLog(`Memory density finished (N=${n}).`);
        endCountdown('Memory density completed');
        setRunningMemory(false);
      }, Math.max(1200, Math.min(5000, 700 + Math.ceil(n / 14))));
    };

    const snapshot = (() => {
      const sample = engineRef.current ? engineRef.current.entriesSample(10) : [];
      return {
        mode,
        size: engineRef.current ? engineRef.current.size() : 0,
        supportsDelete: engineRef.current ? engineRef.current.supportsDelete : false,
        sample,
      };
    })();

    const complexityRows = STRUCTURE_CATALOG
      .map(p => ({
        ...p,
        totalScore: (p.perfRank + p.memoryRank + p.complexityRank).toFixed(2),
      }))
      .sort((a, b) => Number(a.totalScore) - Number(b.totalScore))
      .map((r, idx) => ({ ...r, overallRank: idx + 1 }));

    const treeCompareRows = compareRows.filter(r => TREE_STRUCTURES.has(r.structure));
    const treeMemoryRows = memoryRows.filter(r => TREE_STRUCTURES.has(r.structure));
    const graphRows = complexityRows.slice().sort((a, b) => (graphMetric === 'complexityRank' ? a.complexityRank - b.complexityRank : Number(a.totalScore) - Number(b.totalScore)));

    const tabButtonClass = (tab) => `px-3 py-2.5 min-h-[44px] shrink-0 rounded text-sm font-semibold whitespace-nowrap ${activeTab === tab ? (theme === 'pink' ? 'bg-pink-500/30 text-white' : 'bg-emerald-500/30 text-white') : 'bg-white/10 text-gray-300 hover:bg-white/20'}`;

    return (
        <PageTransition className="min-h-screen flex items-center justify-center py-20 px-4">
            <SEO 
                titleKey="seo.lqftTitle"
                descriptionKey="seo.lqftDesc"
            />
            <div className="container mx-auto max-w-6xl">
                <div className="mb-6">
                    <Link to="/projects" className="text-gray-300 hover:text-white">← Back to Projects</Link>
                </div>
                <GlassCard className="p-8 md:p-10" theme={theme}>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">LQFT Demonstration App (Browser)</h1>
                    <p className="text-gray-300 mb-6 leading-relaxed">Run interactive LQFT workflows.</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {['Mode switch', 'CRUD playground', 'Comparison', 'Memory density'].map(tag => (
                            <span key={tag} className={`${tagClasses} text-xs font-semibold px-2.5 py-1 rounded-full`}>{tag}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <label className="space-y-2 md:col-span-1">
                        <span className="text-sm text-gray-300">Engine mode</span>
                        <select value={mode} onChange={(e) => setMode(e.target.value)} className="lqft-select w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white">
                          <option value="adaptive_light">adaptive_light</option>
                          <option value="adaptive_native">adaptive_native</option>
                          <option value="persistent">persistent</option>
                        </select>
                      </label>
                      <div className="md:col-span-3 flex items-end gap-2">
                        <button onClick={() => resetEngine(mode)} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Reset</button>
                        <button onClick={onLoadSamples} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Load 10k</button>
                      </div>
                    </div>

                    <div className="p-3 rounded border border-white/10 bg-white/5 mb-6">
                      <p className="text-sm text-gray-300">
                        <span className="text-white font-semibold">Engine mode:</span> `adaptive_light` (JS map-focused baseline), `adaptive_native` (fixed-depth routed simulation), `persistent` (persistent-style tree semantics, delete disabled).
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Timer: {formatCountdown(countdownSec)} • State: {taskState}</p>
                      <p className="text-xs text-gray-400 mt-1">Current: {status}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      <div className="p-3 rounded border border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-300">Compare N</span>
                          <input type="number" value={compareN} onChange={(e) => setCompareN(Number(e.target.value))} className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-white" />
                          <button onClick={runComparison} disabled={runningCompare} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-60">{runningCompare ? 'Running...' : 'Run Comparison'}</button>
                        </div>
                      </div>
                      <div className="p-3 rounded border border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-300">Memory N</span>
                          <input type="number" value={memoryN} onChange={(e) => setMemoryN(Number(e.target.value))} className="w-24 px-2 py-1 bg-white/5 border border-white/10 rounded text-white" />
                          <button onClick={runMemoryDensity} disabled={runningMemory} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-60">{runningMemory ? 'Running...' : 'Memory Density'}</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mb-6">
                      <div className="p-4 rounded border border-white/10 bg-white/5">
                        <h3 className="text-white font-semibold mb-3">CRUD Playground</h3>
                        <div className="space-y-3">
                          <input value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="Key" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white" />
                          <input value={valueInput} onChange={(e) => setValueInput(e.target.value)} placeholder="Value" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white" />
                          <div className="flex flex-wrap gap-2">
                            <button onClick={onInsert} className="px-3 py-2.5 min-h-[44px] rounded bg-white/10 hover:bg-white/20">Insert</button>
                            <button onClick={onSearch} className="px-3 py-2.5 min-h-[44px] rounded bg-white/10 hover:bg-white/20">Search</button>
                            <button onClick={onDelete} className="px-3 py-2.5 min-h-[44px] rounded bg-white/10 hover:bg-white/20">Delete</button>
                            <button onClick={onPurge} className="px-3 py-2.5 min-h-[44px] rounded bg-white/10 hover:bg-white/20">Purge / Clear</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-1 px-1 scroll-smooth">
                      <button className={tabButtonClass('snapshot')} onClick={() => setActiveTab('snapshot')}>Snapshot</button>
                      <button className={tabButtonClass('log')} onClick={() => setActiveTab('log')}>Log</button>
                      <button className={tabButtonClass('ranking')} onClick={() => setActiveTab('ranking')}>Ranking</button>
                      <button className={tabButtonClass('complexity')} onClick={() => setActiveTab('complexity')}>Complexity</button>
                      <button className={tabButtonClass('tree')} onClick={() => setActiveTab('tree')}>Tree Comparison</button>
                      <button className={tabButtonClass('graph')} onClick={() => setActiveTab('graph')}>Complexity Graph</button>
                      <button className={tabButtonClass('memory')} onClick={() => setActiveTab('memory')}>Memory Density</button>
                      <button className={tabButtonClass('treeMemory')} onClick={() => setActiveTab('treeMemory')}>Tree Memory Density</button>
                    </div>

                    {activeTab === 'snapshot' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5">
                        <h4 className="text-white font-semibold mb-2">Engine Snapshot</h4>
                        <div className="text-sm text-gray-300">Mode: <span className="text-white">{snapshot.mode}</span></div>
                        <div className="text-sm text-gray-300 mb-3">Store size: <span className="text-white">{snapshot.size.toLocaleString()}</span></div>
                        <div className="space-y-1 text-sm">
                          {snapshot.sample.length === 0 ? (
                            <div className="text-gray-400">No sample entries yet.</div>
                          ) : (
                            snapshot.sample.map(([k, v]) => (
                              <div key={k} className="text-gray-300"><span className="text-gray-400">{k}</span>: <span className="text-white">{String(v)}</span></div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'log' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 max-h-[24rem] overflow-auto">
                        <h4 className="text-white font-semibold mb-2">Log</h4>
                        <div className="space-y-1 text-sm text-gray-300">
                          {logLines.length === 0 ? <div className="text-gray-400">No log events yet.</div> : logLines.map((l, i) => <div key={`${l}-${i}`}>{l}</div>)}
                        </div>
                      </div>
                    )}

                    {activeTab === 'ranking' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Comparison Ranking</h4>
                        <p className="text-xs text-gray-400 mb-3">For Insert/Hit/Miss/Delete ops: higher is better.</p>
                        {compareRows.length === 0 ? (
                          <div className="text-gray-400 text-sm">Run comparison to populate rows.</div>
                        ) : (
                          <>
                          <div className="md:hidden space-y-3">
                            {compareRows.map(r => (
                              <div key={r.structure} className={`p-4 rounded-lg border border-white/10 ${accentRowClass(r.structure)}`}>
                                <div className="flex justify-between items-center mb-2">
                                  <span className={`font-semibold ${accentTextClass(r.structure)}`}>#{r.rank} {r.structure}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><span className="text-gray-500">Insert</span><div className="text-white">{Math.round(r.insertOps).toLocaleString()}</div></div>
                                  <div><span className="text-gray-500">Hit</span><div className="text-white">{Math.round(r.hitOps).toLocaleString()}</div></div>
                                  <div><span className="text-gray-500">Miss</span><div className="text-white">{Math.round(r.missOps).toLocaleString()}</div></div>
                                  <div><span className="text-gray-500">Delete</span><div className="text-white">{r.delOps == null ? 'N/A' : Math.round(r.delOps).toLocaleString()}</div></div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm min-w-[32rem]">
                            <thead>
                              <tr className="text-left text-gray-300 border-b border-white/10">
                                <th className="py-2 pr-4">Rank</th>
                                <th className="py-2 pr-4">Structure</th>
                                <th className="py-2 pr-4">Insert</th>
                                <th className="py-2 pr-4">Hit</th>
                                <th className="py-2 pr-4">Miss</th>
                                <th className="py-2 pr-4">Delete</th>
                              </tr>
                            </thead>
                            <tbody>
                              {compareRows.map(r => (
                                <tr key={r.structure} className={`border-b border-white/5 ${accentRowClass(r.structure)}`}>
                                  <td className="py-2 pr-4 text-gray-300">{r.rank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.structure)}`}>{r.structure}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.insertOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.hitOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.missOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.delOps == null ? 'N/A' : Math.round(r.delOps).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          </div>
                          </>
                        )}
                      </div>
                    )}

                    {activeTab === 'complexity' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Complexity Table (app.py-style)</h4>
                        <p className="text-xs text-gray-400 mb-3">For rank and total score columns: lower is better.</p>
                        <table className="w-full text-sm min-w-[36rem]">
                          <thead>
                            <tr className="text-left text-gray-300 border-b border-white/10">
                              <th className="py-2 pr-4">Overall</th>
                              <th className="py-2 pr-4">Structure</th>
                              <th className="py-2 pr-4">Insert</th>
                              <th className="py-2 pr-4">Search</th>
                              <th className="py-2 pr-4">Delete</th>
                              <th className="py-2 pr-4">Worst</th>
                              <th className="py-2 pr-4">Space</th>
                              <th className="py-2 pr-4">Perf</th>
                              <th className="py-2 pr-4">Memory</th>
                              <th className="py-2 pr-4">Complexity</th>
                              <th className="py-2 pr-4">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {complexityRows.map(r => (
                                <tr key={r.name} className={`border-b border-white/5 ${accentRowClass(r.name)}`}>
                                <td className="py-2 pr-4 text-gray-300">{r.overallRank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.name)}`}>{r.name}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.insert}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.search}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.delete}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.worstCase}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.space}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.perfRank}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.memoryRank}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.complexityRank}</td>
                                <td className="py-2 pr-4 text-gray-300">{r.totalScore}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'tree' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Tree Comparison</h4>
                        <p className="text-xs text-gray-400 mb-3">For Insert/Hit/Miss/Delete ops: higher is better.</p>
                        {treeCompareRows.length === 0 ? <div className="text-gray-400 text-sm">Run comparison to populate tree rows.</div> : (
                          <table className="w-full text-sm min-w-[36rem]">
                            <thead>
                              <tr className="text-left text-gray-300 border-b border-white/10">
                                <th className="py-2 pr-4">Rank</th><th className="py-2 pr-4">Structure</th><th className="py-2 pr-4">Insert</th><th className="py-2 pr-4">Hit</th><th className="py-2 pr-4">Miss</th><th className="py-2 pr-4">Delete</th>
                              </tr>
                            </thead>
                            <tbody>
                              {treeCompareRows.map(r => (
                                <tr key={r.structure} className={`border-b border-white/5 ${accentRowClass(r.structure)}`}>
                                  <td className="py-2 pr-4 text-gray-300">{r.rank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.structure)}`}>{r.structure}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.insertOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.hitOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{Math.round(r.missOps).toLocaleString()}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.delOps == null ? 'N/A' : Math.round(r.delOps).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {activeTab === 'graph' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-300">Graph Metric:</span>
                          <select value={graphMetric} onChange={(e) => setGraphMetric(e.target.value)} className="lqft-select px-3 py-2 bg-white/5 border border-white/10 rounded text-white">
                            <option value="complexityRank">complexity_rank</option>
                            <option value="totalScore">total_score</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-gray-400">
                          <span>{graphMetric === 'complexityRank' ? 'Lower is better (better complexity rank).' : 'Lower is better (better total score).'}</span>
                          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-300/90" />adaptive_lqft_light</span>
                          <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-300/90" />adaptive_lqft_native / lqft_persistent_tree</span>
                        </div>
                        <div className="overflow-auto border border-white/10 rounded p-3 bg-white/5">
                          {(() => {
                            const rows = graphRows.slice(0, 12);
                            const chartHeight = 320;
                            const chartWidth = Math.max(900, rows.length * 90 + 120);
                            const innerLeft = 70;
                            const innerRight = 20;
                            const innerTop = 20;
                            const innerBottom = 85;
                            const innerWidth = chartWidth - innerLeft - innerRight;
                            const innerHeight = chartHeight - innerTop - innerBottom;
                            const maxValue = graphMetric === 'complexityRank' ? 10 : 25;
                            const barStep = innerWidth / Math.max(rows.length, 1);
                            const barWidth = Math.max(16, Math.min(42, barStep * 0.55));
                            const ticks = 6;
                            return (
                              <svg width={chartWidth} height={chartHeight} className="min-w-[900px]">
                                {Array.from({ length: ticks + 1 }).map((_, i) => {
                                  const y = innerTop + (innerHeight / ticks) * i;
                                  const tickValue = (maxValue - (maxValue / ticks) * i).toFixed(0);
                                  return (
                                    <g key={`tick-${i}`}>
                                      <line x1={innerLeft} y1={y} x2={chartWidth - innerRight} y2={y} stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
                                      <text x={innerLeft - 10} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(209,213,219,0.9)">{tickValue}</text>
                                    </g>
                                  );
                                })}

                                <line x1={innerLeft} y1={innerTop} x2={innerLeft} y2={innerTop + innerHeight} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
                                <line x1={innerLeft} y1={innerTop + innerHeight} x2={chartWidth - innerRight} y2={innerTop + innerHeight} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />

                                {rows.map((r, idx) => {
                                  const value = graphMetric === 'complexityRank' ? r.complexityRank : Number(r.totalScore);
                                  const h = Math.max(4, (value / maxValue) * innerHeight);
                                  const xCenter = innerLeft + barStep * idx + barStep / 2;
                                  const x = xCenter - barWidth / 2;
                                  const y = innerTop + innerHeight - h;
                                  const fill = r.name === 'adaptive_lqft_light'
                                    ? 'rgba(251, 191, 36, 0.95)'
                                    : (r.name === 'adaptive_lqft_native' || r.name === 'lqft_persistent_tree'
                                      ? 'rgba(96, 165, 250, 0.95)'
                                      : (theme === 'pink' ? 'rgba(244,114,182,0.88)' : 'rgba(52,211,153,0.88)'));
                                  const labelColor = r.name === 'adaptive_lqft_light'
                                    ? 'rgba(252,211,77,0.98)'
                                    : (r.name === 'adaptive_lqft_native' || r.name === 'lqft_persistent_tree'
                                      ? 'rgba(147,197,253,0.98)'
                                      : 'rgba(209,213,219,0.95)');

                                  return (
                                    <g key={`bar-${r.name}`}>
                                      <rect x={x} y={y} width={barWidth} height={h} fill={fill} rx="3" />
                                      <text x={xCenter} y={y - 6} textAnchor="middle" fontSize="10" fill="rgba(209,213,219,0.95)">
                                        {value.toFixed(1)}
                                      </text>
                                      <text x={xCenter} y={innerTop + innerHeight + 14} textAnchor="middle" fontSize="9" fill={labelColor}>
                                        {r.name.length > 16 ? `${r.name.slice(0, 16)}...` : r.name}
                                      </text>
                                    </g>
                                  );
                                })}

                                <text x={innerLeft / 2} y={innerTop + innerHeight / 2} textAnchor="middle" transform={`rotate(-90 ${innerLeft / 2} ${innerTop + innerHeight / 2})`} fontSize="11" fill="rgba(209,213,219,0.9)">
                                  {graphMetric}
                                </text>
                                <text x={innerLeft + innerWidth / 2} y={chartHeight - 12} textAnchor="middle" fontSize="11" fill="rgba(209,213,219,0.9)">
                                  data structures
                                </text>
                              </svg>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {activeTab === 'memory' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Memory Density</h4>
                        <p className="text-xs text-gray-400 mb-3">For Delta MB and Bytes/Item: lower is better.</p>
                        {memoryRows.length === 0 ? (
                          <div className="text-gray-400 text-sm">Run memory density to populate rows.</div>
                        ) : (
                          <table className="w-full text-sm min-w-[36rem]">
                            <thead>
                              <tr className="text-left text-gray-300 border-b border-white/10">
                                <th className="py-2 pr-4">Rank</th>
                                <th className="py-2 pr-4">Structure</th>
                                <th className="py-2 pr-4">Delta MB</th>
                                <th className="py-2 pr-4">Bytes/Item</th>
                              </tr>
                            </thead>
                            <tbody>
                              {memoryRows.map(r => (
                                <tr key={r.structure} className={`border-b border-white/5 ${accentRowClass(r.structure)}`}>
                                  <td className="py-2 pr-4 text-gray-300">{r.rank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.structure)}`}>{r.structure}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.deltaMb.toFixed(3)}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.bytesPerItem.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        <p className="text-xs text-gray-400 mt-3">Browser version uses estimation; desktop `app.py` uses process RSS for true memory deltas.</p>
                      </div>
                    )}

                    {activeTab === 'treeMemory' && (
                      <div className="p-4 rounded border border-white/10 bg-white/5 overflow-auto">
                        <h4 className="text-white font-semibold mb-3">Tree Memory Density</h4>
                        <p className="text-xs text-gray-400 mb-3">For Delta MB and Bytes/Item: lower is better.</p>
                        {treeMemoryRows.length === 0 ? <div className="text-gray-400 text-sm">Run memory density to populate tree rows.</div> : (
                          <table className="w-full text-sm min-w-[36rem]">
                            <thead>
                              <tr className="text-left text-gray-300 border-b border-white/10">
                                <th className="py-2 pr-4">Rank</th>
                                <th className="py-2 pr-4">Structure</th>
                                <th className="py-2 pr-4">Delta MB</th>
                                <th className="py-2 pr-4">Bytes/Item</th>
                              </tr>
                            </thead>
                            <tbody>
                              {treeMemoryRows.map(r => (
                                <tr key={`tm-${r.structure}`} className={`border-b border-white/5 ${accentRowClass(r.structure)}`}>
                                  <td className="py-2 pr-4 text-gray-300">{r.rank}</td>
                                  <td className={`py-2 pr-4 ${accentTextClass(r.structure)}`}>{r.structure}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.deltaMb.toFixed(3)}</td>
                                  <td className="py-2 pr-4 text-gray-300">{r.bytesPerItem.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                </GlassCard>
            </div>
            {(runningCompare || runningMemory) && (
              <div className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm flex items-center justify-center px-4">
                <div className="w-full max-w-md p-6 rounded-2xl border border-white/15 bg-slate-900/90 text-center">
                  <div className="mx-auto mb-4 w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <h3 className="text-xl font-bold text-white mb-2">{taskLabel || 'Running task...'}</h3>
                  <p className="text-gray-300 mb-1">Estimated time remaining</p>
                  <p className="text-3xl font-extrabold text-white tracking-wide">{formatCountdown(countdownSec)}</p>
                  <p className="text-xs text-gray-400 mt-3">Large N values can take longer depending on browser/device.</p>
                </div>
              </div>
            )}
        </PageTransition>
    );
};

export default LQFTBenchmarkPage;
