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
  onError,
}: TurnstileCaptchaProps) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY;

  // Load Cloudflare Turnstile script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).turnstile) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="turnstile/v0/api.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn('Turnstile script failed to load from Cloudflare CDN (offline or adblocker).');
    };
    document.head.appendChild(script);
  }, []);

  // Render Turnstile widget once script is available
  useEffect(() => {
    if (!scriptLoaded || typeof window === 'undefined') return;
    if (!(window as any).turnstile || !containerRef.current) return;

    let widgetId: string | null = null;
    try {
      // Clear any prior content in container
      containerRef.current.innerHTML = '';
      widgetId = (window as any).turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: 'light',
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
        },
      });
    } catch (e) {
      console.warn('Turnstile render notice:', e);
    }

    return () => {
      if ((window as any).turnstile && widgetId) {
        try {
          (window as any).turnstile.remove(widgetId);
        } catch {}
      }
    };
  }, [scriptLoaded, siteKey, onVerify, onExpire, onError]);

  // Fallback interactive verification for offline local development
  const handleSimulatedVerify = () => {
    setLoading(true);
    setTimeout(() => {
      const devToken = 'cf-test-valid-token';
      setVerified(true);
      setLoading(false);
      onVerify(devToken);
    }, 400);
  };

  return (
    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            verified ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
          }`}
        >
          {verified ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}
        </div>
        <div>
          <p className="font-bold text-slate-800">Security Verification (Turnstile)</p>
          <p className="text-[10px] text-slate-500">
            {verified
              ? 'Security challenge verified.'
              : 'Verifying human submission to protect admissions against spam.'}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        {/* Real Cloudflare Widget Render Mount */}
        <div ref={containerRef} className={verified ? 'hidden' : 'block'} />

        {/* Fallback button if Cloudflare is unreachable in local dev */}
        {!verified && !scriptLoaded && (
          <button
            type="button"
            onClick={handleSimulatedVerify}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-orange-50 border-2 border-orange-300 text-orange-800 font-extrabold text-xs transition-all shadow-2xs hover:scale-103 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Captcha'}
          </button>
        )}

        {verified && (
          <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 flex items-center gap-1">
            <span>✓ Verified</span>
          </span>
        )}
      </div>
    </div>
  );
}
