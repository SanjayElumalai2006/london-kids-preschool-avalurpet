'use client';

import React, { useState } from 'react';
import { Sparkles } from '@/components/Icons';

export default function CompanySideBadge() {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Website Developer Credit"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none transition-all duration-300 print:hidden"
    >
      <div className="flex items-center">
        {/* Main Tab */}
        <div
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={`flex items-center transition-all duration-300 shadow-2xl rounded-l-2xl border-y border-l ${
            expanded
              ? 'bg-slate-900/95 border-amber-500/40 text-white translate-x-0 p-3 pr-4'
              : 'bg-slate-900/90 hover:bg-slate-900 border-slate-700/80 text-slate-200 translate-x-1 hover:translate-x-0 py-2.5 px-2.5'
          } backdrop-blur-md cursor-pointer`}
          onClick={() => setExpanded(!expanded)}
          title="7hills web solution - Web Development Partner"
        >
          {/* Collapsed State: Compact Vertical/Pill tab */}
          {!expanded ? (
            <div className="flex flex-col items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <div className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 py-1 text-slate-300 hover:text-amber-300 transition-colors">
                <span className="text-amber-400 font-extrabold">⚡</span>
                <span>7hills web solution</span>
              </div>
            </div>
          ) : (
            /* Expanded Card on Hover / Click */
            <div className="flex items-start gap-3 max-w-xs animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md shadow-amber-500/30">
                7H
              </div>
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Technology Partner
                  </span>
                </div>
                <h4 className="text-sm font-black text-white tracking-tight leading-tight">
                  7hills web solution
                </h4>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Designed &amp; Developed with modern web architecture, responsive design &amp; high security.
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 text-amber-300 font-semibold">
                    <Sparkles size={11} /> Web &amp; App Solutions
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDismissed(true);
                    }}
                    className="text-slate-500 hover:text-slate-300 ml-2 px-1 py-0.5 rounded hover:bg-slate-800"
                    title="Hide badge for this session"
                  >
                    Hide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
