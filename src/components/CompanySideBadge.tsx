'use client';

import React, { useState } from 'react';
import { Sparkles, Phone, MessageCircle, X } from '@/components/Icons';

export default function CompanySideBadge() {
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="Website Developer Credit - 7hills web solution"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 select-none transition-all duration-300 print:hidden"
    >
      {minimized ? (
        /* Minimized State: Sleek pill in the corner */
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white shadow-2xl border border-amber-500/50 backdrop-blur-md transition-all hover:scale-105 cursor-pointer group"
          title="Click to view 7hills web solution contact details"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-xs font-black text-amber-300 group-hover:text-amber-200">
            7hills web solution
          </span>
          <span className="text-[11px] text-slate-300 font-bold bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Phone size={10} className="text-amber-400" />
            9500118875
          </span>
        </button>
      ) : (
        /* Full Corner Card */
        <div className="relative bg-slate-900/95 text-white shadow-2xl rounded-2xl border border-amber-500/50 backdrop-blur-md p-3.5 sm:p-4 max-w-xs transition-all duration-300 group animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Top Row: Label & Controls */}
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                Web Development Partner
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(true)}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded-md hover:bg-slate-800 transition-colors text-[10px] font-bold"
                title="Minimize to pill"
                aria-label="Minimize"
              >
                —
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-slate-400 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800 transition-colors"
                title="Close"
                aria-label="Close"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Company Name */}
          <div className="pt-2 pb-2.5">
            <h4 className="text-sm font-black text-amber-300 tracking-tight leading-snug flex items-center gap-1.5">
              <Sparkles size={14} className="text-yellow-400 shrink-0" />
              <span>7hills web solution</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
              Website &amp; Application Development Services
            </p>
          </div>

          {/* Contact Row */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href="tel:9500118875"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold text-xs border border-amber-500/30 transition-all hover:scale-[1.02] active:scale-95"
              title="Call 9500118875"
            >
              <Phone size={13} />
              <span>9500118875</span>
            </a>
            <a
              href="https://wa.me/919500118875"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-[1.05] active:scale-95"
              title="WhatsApp 9500118875"
              aria-label="WhatsApp 9500118875"
            >
              <MessageCircle size={14} />
            </a>
          </div>
        </div>
      )}
    </aside>
  );
}
