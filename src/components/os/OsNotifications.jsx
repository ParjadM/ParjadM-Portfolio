import React, { useState, useEffect } from 'react';
import { onNotify } from '../../os/events.js';

export const OsNotifications = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => onNotify(({ message, type }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }), []);

  if (!toasts.length) return null;

  return (
    <div className="absolute top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-xl backdrop-blur-xl border animate-fade-in ${
            t.type === 'error'
              ? 'bg-red-900/80 border-red-500/30 text-red-100'
              : 'bg-emerald-900/80 border-emerald-500/30 text-emerald-100'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};
