import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function MobileCollapsible({ title, children, defaultOpen = false, theme = 'emerald' }) {
  const [open, setOpen] = useState(defaultOpen);
  const accent = theme === 'pink' ? 'text-pink-400 border-pink-500/30' : 'text-emerald-400 border-emerald-500/30';

  return (
    <>
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-left transition-colors hover:bg-white/10 ${open ? accent : 'text-white'}`}
          aria-expanded={open}
        >
          <span className="font-semibold">{title}</span>
          <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <div className="mt-3">{children}</div>}
      </div>
      <div className="hidden md:block">{children}</div>
    </>
  );
}
