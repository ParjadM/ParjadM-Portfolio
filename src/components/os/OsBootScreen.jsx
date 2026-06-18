import React, { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

export const OsBootScreen = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  const bootLines = [
    'ParjadOS 2.0 Web Edition',
    'Loading kernel modules...',
    'Mounting C: drive...',
    'Starting graphical shell...',
    'Welcome, Guest.',
  ];

  useEffect(() => {
    const timers = bootLines.map((line, i) =>
      setTimeout(() => setLines(prev => [...prev, line]), i * 450)
    );
    const done = setTimeout(onComplete, bootLines.length * 450 + 600);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center font-mono text-emerald-400">
      <Monitor className="w-16 h-16 mb-8 text-emerald-500 animate-pulse" />
      <div className="space-y-2 text-sm md:text-base min-h-[140px]">
        {lines.map((line) => (
          <p key={line} className="opacity-90">{'> '}{line}</p>
        ))}
      </div>
      <div className="mt-8 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${(lines.length / bootLines.length) * 100}%` }}
        />
      </div>
    </div>
  );
};
