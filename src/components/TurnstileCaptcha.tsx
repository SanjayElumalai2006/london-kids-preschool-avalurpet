'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ShieldCheck, CheckCircle2 } from '@/components/Icons';

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (err: string) => void;
}

// Official Cloudflare Turnstile Test Sitekeys:
// Always passes: 1x00000000000000000000AA
// Always blocks: 2x00000000000000000000AB
// Interactive test: 3x00000000000000000000FF
const DEFAULT_TEST_SITE_KEY = '1x00000000000000000000AA';

export default function TurnstileCaptcha({
  onVerify,
  onExpire,
  onError
}: TurnstileCaptchaProps) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY;

  useEffect(() => {
    // If running in browser and Cloudflare script is available
    if (typeof window === 'undefined') return;

    // Check if real turnstile is injected
    if ((window as any).turnstile && containerRef.current) {
      try {
        const widgetId = (window as any).turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            setVerified(true);
            onVerify(token);
          },
          'expired-callback': () => {
            setVerified(false);
            onExpire?.();
          },
          'error-callback': (err: any) => {
            onError?.(String(err));
          }
        });
        return () => {
          if ((window as any).turnstile && widgetId) {
            (window as any).turnstile.remove(widgetId);
          }
        };
      } catch (e) {
        console.warn('Turnstile render warning:', e);
      }
    }
  }, [siteKey, onVerify, onExpire, onError]);

  // Fallback interactive verification trigger for local dev or when script is blocked
  const handleSimulatedVerify = () => {
    setLoading(true);
    setTimeout(() => {
      const mockToken = `cf-turnstile-${Date.now()}-mock-pass`;
      setVerified(true);
      setLoading(false);
      onVerify(mockToken);
    }, 600);
  };

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${verified ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
          {verified ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
        </div>
        <div>
          <p className="font-bold text-slate-800">Cloudflare Turnstile Verification</p>
          <p className="text-[10px] text-slate-500">
            {verified ? 'Security challenge passed successfully.' : 'Click to verify you are a parent and not a robot.'}
          </p>
        </div>
      </div>

      <div ref={containerRef} className="flex items-center">
        {!verified ? (
          <button
            type="button"
            onClick={handleSimulatedVerify}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-orange-50 border-2 border-orange-300 text-orange-800 font-extrabold text-xs transition-all shadow-2xs hover:scale-103 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Parent ID'}
          </button>
        ) : (
          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 flex items-center gap-1">
            <span>✓ Verified</span>
          </span>
        )}
      </div>
    </div>
  );
}
