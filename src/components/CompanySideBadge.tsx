'use client';

import React, { useState } from 'react';
import { Sparkles, X } from '@/components/Icons';

export default function CompanySideBadge() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Website Developer Credit - 7hills web solution"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none transition-all duration-300 print:hidden"
    >
      <div className="flex items-center group">
        <div className="relative bg-slate-900/95 hover:bg-slate-950 text-white shadow-2xl rounded-l-2xl border-y border-l border-amber-500/60 backdrop-blur-md px-3 sm:px-4 py-2.5 flex items-center gap-2.5 sm:gap-3 transition-all duration-200 hover:pr-5 cursor-pointer">
          {/* Pulsing indicator */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>

          {/* Clean Horizontal Text */}
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
              <Sparkles size={10} className="text-amber-400" />
              <span>Developed by</span>
            </span>
            <span className="text-xs sm:text-sm font-black tracking-wide text-amber-300 group-hover:text-amber-200 whitespace-nowrap">
              7hills web solution
            </span>
          </div>

          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
            }}
            className="text-slate-500 hover:text-slate-300 p-0.5 rounded-full hover:bg-slate-800 transition-colors ml-1"
            title="Dismiss badge"
            aria-label="Dismiss developer credit"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
