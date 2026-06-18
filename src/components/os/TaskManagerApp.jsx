import React from 'react';
import { Activity, Cpu, HardDrive } from 'lucide-react';

export const TaskManagerApp = ({ osState }) => {
  const { windows = [], APPS = [] } = osState || {};
  const openWindows = windows.filter(w => !w.isMinimized);

  return (
    <div className="h-full w-full bg-[#1a1a1a] text-gray-200 p-4 font-sans overflow-auto">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-red-400" /> Task Manager
      </h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><Cpu className="w-3 h-3" /> CPU</div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[24%] bg-emerald-500" /></div>
          <span className="text-xs text-gray-500">24%</span>
        </div>
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1"><HardDrive className="w-3 h-3" /> Memory</div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-[41%] bg-blue-500" /></div>
          <span className="text-xs text-gray-500">41%</span>
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-400 mb-2">Processes ({openWindows.length})</h3>
      <div className="space-y-1">
        {openWindows.length === 0 && <p className="text-gray-500 text-sm">No open windows.</p>}
        {openWindows.map(w => {
          const app = APPS.find(a => a.id === w.id);
          return (
            <div key={w.id} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg text-sm">
              <span>{app?.title || w.id}</span>
              <span className="text-xs text-emerald-400">Running</span>
            </div>
          );
        })}
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg text-sm opacity-60">
          <span>ParjadOS Shell</span>
          <span className="text-xs text-gray-400">System</span>
        </div>
      </div>
    </div>
  );
};
