/**
 * SchoolLogo — centralized logo component for London Kids Preschool Avalurpet.
 *
 * Usage:
 *   <SchoolLogo size={48} />               — primary logo (light bg)
 *   <SchoolLogo size={48} variant="white"/> — white logo (dark bg)
 *
 * TO REPLACE WITH OFFICIAL IMAGES:
 *   1. Place official logo files in public/logo/ (see src/lib/brand.ts for names).
 *   2. Set PLACEHOLDER_LOGO = false in src/lib/brand.ts.
 *   The placeholder text block will disappear and the <img> will render instead.
 */

import React from 'react';
import {
  PLACEHOLDER_LOGO,
  LOGO_PRIMARY,
  LOGO_WHITE,
  SCHOOL_SHORT,
} from '@/lib/brand';

interface SchoolLogoProps {
  /** Width/height in px — applied as both width and height. Default 48. */
  size?: number;
  /** Optional custom image path, defaults to /logo/logo.png */
  src?: string;
  /** 'primary' = for light backgrounds (default). 'white' = for dark backgrounds. */
  variant?: 'primary' | 'white';
  className?: string;
}

export default function SchoolLogo({
  size = 48,
  src,
  variant = 'primary',
  className = '',
}: SchoolLogoProps) {
  const [error, setError] = React.useState(false);
  const imageSrc = src || (variant === 'white' ? LOGO_WHITE : LOGO_PRIMARY);

  if (PLACEHOLDER_LOGO || error) {
    const isDark = variant === 'white';
    return (
      <div
        className={`shrink-0 flex items-center justify-center rounded-xl font-black text-center leading-tight select-none ${className}`}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.22,
          background: isDark ? 'rgba(255,255,255,0.15)' : '#D72323',
          color: isDark ? '#ffffff' : '#FFD700',
          border: isDark ? '2px solid rgba(255,255,255,0.3)' : '2px solid #FFD700',
        }}
        title={`${SCHOOL_SHORT} Logo`}
        aria-label={`${SCHOOL_SHORT} logo`}
      >
        LK
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={`${SCHOOL_SHORT} logo`}
      width={size}
      height={size}
      onError={() => setError(true)}
      className={`object-contain shrink-0 rounded-xl ${className}`}
    />
  );
}
