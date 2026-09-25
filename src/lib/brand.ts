/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  BRAND CONFIGURATION — London Kids Preschool Avalurpet
 * ─────────────────────────────────────────────────────────────────────────────
 *  TO REPLACE THE LOGO: drop the official image files into public/logo/ and
 *  update LOGO_PRIMARY / LOGO_WHITE below. All components import from here,
 *  so a single edit will propagate everywhere.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  LOGO FILES NEEDED (place in /public/logo/):
 *    1. public/logo/logo-primary.png  — full-colour logo on white/light bg
 *    2. public/logo/logo-white.png    — white / reversed logo for dark bg
 *    3. public/logo/favicon.png       — square icon for browser tab (32×32+)
 *
 *  Until the official files are placed there, the app uses a branded
 *  placeholder div (PLACEHOLDER_LOGO = true). Flip it to false once files exist.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── TOGGLE: set to false once official logo files are in public/logo/ ────────
export const PLACEHOLDER_LOGO = false;

// ── Logo file paths (relative to /public) ────────────────────────────────────
export const LOGO_PRIMARY = '/logo/logo.png';           // tiger mascot square logo
export const LOGO_SQUARE  = '/logo/logo.png';           // tiger mascot square logo
export const LOGO_WIDE    = '/logo/logo-wide.jpg';      // wide UK Concept banner logo
export const LOGO_WHITE   = '/logo/logo.png';           // fallback logo
export const LOGO_FAVICON = '/logo/favicon.png';        // browser tab favicon

// ── School identity ───────────────────────────────────────────────────────────
export const SCHOOL_NAME      = 'London Kids Preschool Avalurpet';
export const SCHOOL_SHORT     = 'London Kids';
export const SCHOOL_BRAND     = 'LondonKids';           // for class-name prefixes etc.
export const SCHOOL_TAGLINE   = 'Nurturing Little Minds with Love, Play & Wonder';

// ── Contact details ───────────────────────────────────────────────────────────
export const SCHOOL_ADDRESS   = 'Main Road, Near Bus Stand, Avalurpet';
export const SCHOOL_CITY      = 'Avalurpet, Tamil Nadu – 606 702';
export const SCHOOL_PHONE     = '+91 90436 33545';
export const SCHOOL_WHATSAPP  = '919043633545';         // for wa.me link (https://wa.me/919043633545)
export const SCHOOL_EMAIL     = 'londonkidsavalurpet@gmail.com';
export const SCHOOL_TIMINGS   = 'Mon – Sat: 8:30 AM – 1:30 PM';
export const SCHOOL_OFFICE_HR = 'Office: 8:00 AM – 5:00 PM';

// Credentials are never stored statically in code. All accounts use secure verification.

// ── School Leadership ────────────────────────────────────────────────────────
export const PRINCIPAL_NAME         = 'Dr. R. Arumugam';
export const PRINCIPAL_DESIGNATION  = 'Principal & Head of Institution';
export const PRINCIPAL_DEGREE       = 'Ph.D., M.Ed., Early Childhood Education';
export const PRINCIPAL_PHONE        = '+91 94432 18899';
export const PRINCIPAL_EMAIL        = 'principal.londonkids@gmail.com';
export const PRINCIPAL_MESSAGE      = 'At London Kids Preschool Avalurpet, our mission is to provide an inspiring, safe, and nurturing environment where every toddler discovers their unique brilliance through experiential play and compassionate guidance.';

export const DIRECTOR_NAME          = 'Mrs. Lakshmi Priya';
export const DIRECTOR_DESIGNATION   = 'Founder & Managing Director';

// ── Social links ──────────────────────────────────────────────────────────────
export const SOCIAL = {
  facebook:  'https://www.facebook.com/londonkidsavalurpet',
  instagram: 'https://www.instagram.com/londonkidsavalurpet',
  youtube:   'https://www.youtube.com/@londonkidsavalurpet',
};

