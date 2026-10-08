# Comprehensive Production Security Hardening & Functionality Audit

**Target Website**: [London Kids Preschool Avalurpet](https://london-kids-preschool-avalurpet.vercel.app/)  
**Audit Date**: October 2026  
**Auditor**: Antigravity Security & Web Systems Engineering  
**Application Stack**: Next.js 16.3.4 (App Router & Turbopack), React 19.2.8, MongoDB 9 / Atlas, TypeScript 5, Tailwind CSS 4, Cloudflare Turnstile, Bcrypt.js  
**Compliance Standard**: OWASP Top 10 (2021/2025 Guidance), CWE Top 25, NIST SP 800-63B (Digital Identity Guidelines)  

---

## 1. Executive Summary

A comprehensive production-grade security audit and architectural hardening was conducted on the London Kids Preschool Avalurpet web application. The core objectives were achieved:
1. **Zero UI / UX Regression**: Every existing feature, animation, button, program enquiry, gallery filter, modal, responsive layout, WhatsApp integration, and portal navigation remains 100% intact with zero visual changes.
2. **Defensive Security-by-Default**: Every state-changing API route, authentication flow, session token, database query, and user input has been systematically audited and hardened against common web attack vectors (CWE/OWASP).
3. **No Unsubstantiated Claims**: In accordance with defensive engineering best practices, this audit adheres to industry-standard defensive architecture and defense-in-depth principles without claiming the system is "100% unhackable".

---

## 2. Vulnerability Assessment & Remediations Matrix

| ID | Vulnerability | Severity | Location | Threat & Impact | Remediated Status | Verification Test |
|---|---|---|---|---|---|---|
| **SEC-01** | Direct Owner Portal Passwordless Bypass | **CRITICAL** | `src/app/login/page.tsx`, `src/app/portal/principal/page.tsx` | Allowed instant access to the sensitive Owner Portal without credentials via an active session banner and dashboard shortcuts. | **FIXED** | Verified login forces full credential check; shortcut buttons and unauthenticated paths removed. |
| **SEC-02** | Insecure Password Hash Storage in Browser LocalStorage | **HIGH** | `src/lib/store.ts` | Bcrypt password hashes were mirrored into client-side `localStorage`, allowing offline dictionary cracking if an extension or script accessed browser storage. | **FIXED** | Purged `passwordHash`, `resetPasswordCode`, and reset tokens from `getStore()` and `saveStore()`. Hashes remain exclusively in MongoDB. |
| **SEC-03** | In-Memory Only Rate Limiting (Serverless Bypass) | **HIGH** | `src/lib/rateLimit.ts` | In-memory sliding window was ineffective on ephemeral Vercel/serverless lambda instances, enabling brute-force attacks across separate containers. | **FIXED** | Implemented distributed MongoDB-backed rate limiting (`RateLimitModel`) with automated compound TTL index and in-memory fallback. |
| **SEC-04** | Cross-Site Request Forgery (CSRF) & Cross-Origin API Access | **HIGH** | `src/app/api/*` (login, logout, enquiry, turnstile, parent/verify-email, db/sync) | Lack of strict Origin/Referer verification on state-changing endpoints allowed potential cross-site invocation. | **FIXED** | Added `isAllowedOrigin()` checking `Origin` and `Referer` against trusted domain allowlist across all state-changing endpoints. |
| **SEC-05** | Weak Session Lifetime & Missing Server-Side Revocation | **HIGH** | `src/lib/session.ts`, `src/app/api/auth/logout/route.ts` | Sessions lasted 7 days uniformly without idle timeouts for administrative roles, and logout did not maintain a server-side revocation list. | **FIXED** | Added role-aware session lifetimes (24h absolute, 2h idle timeout for Owner/Admin/Principal; 7d for Parents), unique JTI, constant-time verification, and server token revocation (`SessionRevocationModel`). |
| **SEC-06** | NoSQL Operator Injection & Mass Assignment in Batch Sync | **HIGH** | `src/app/api/db/sync/route.ts` | `upsertMany` used unsanitized object keys and uncast IDs, enabling MongoDB operator injection (`$`, `.`) and potential unauthorized account overwrite. | **FIXED** | Implemented `sanitizeForMongo()` recursively stripping `$` and `.` keys, strictly cast IDs to strings, and restricted non-OWNER users from modifying OWNER accounts. |
| **SEC-07** | Client-Side Only Turnstile Verification & Unchecked Turnstile API | **MEDIUM** | `src/app/api/turnstile/route.ts`, `src/app/api/enquiry/route.ts` | Missing origin verification, missing token length boundaries, and risk of brute-forcing verification challenges. | **FIXED** | Enforced origin verification, 20-per-10m rate limiting, strict token type/length validation, and verified Cloudflare server-side token validation. |
| **SEC-08** | Stored XSS Risk via SVG Upload & Unvalidated Image URLs | **MEDIUM** | `src/lib/imageUpload.ts`, `src/components/PhotoUploadDropzone.tsx` | SVG files could contain embedded `<script>` or event handlers; custom URL input lacked protocol validation. | **FIXED** | Explicitly disallowed SVG format (restricted to raster JPEG, PNG, WebP), enforced 5MB size limit, and validated custom URLs against `https?://` and safe base64 prefixes. |
| **SEC-09** | Parameter Injection in WhatsApp Message Generator | **MEDIUM** | `src/lib/whatsapp.ts` | Unsanitized newline or control characters in user input could alter WhatsApp URL parameters or craft misleading messages. | **FIXED** | Added `cleanWhatsAppField()` to strip newlines, control characters, and angle brackets, and enforce strict length bounds before URL encoding. |
| **SEC-10** | Missing Security Headers (CSP, HSTS, COOP, Cache-Control) | **MEDIUM** | `next.config.ts` | Absence of strict Content-Security-Policy, HSTS, and private cache-control on authenticated API endpoints. | **FIXED** | Configured production CSP (Cloudflare Turnstile, Google Maps, Unsplash), HSTS (1 year + preload), COOP (`same-origin-allow-popups`), and `no-store` on `/api/:path*`. |
| **SEC-11** | Transitive Dependency Vulnerabilities | **LOW** | `package.json` | Outdated transitive dependencies reported by `npm audit` (`brace-expansion`, `sharp`, `source-map-js`). | **FIXED** | Resolved with `npm audit fix`; verified clean dependency tree with zero vulnerabilities. |

---

## 3. Deep-Dive Security Architectural Hardening

### 3.1 Authentication & Credential Security
- **Bcrypt Hashing**: Upgraded default salt rounds to **12** (`BCRYPT_ROUNDS = 12`) in `src/lib/security.ts`.
- **Automatic Password Re-Hashing**: When legacy plain/unhashed credentials authenticate through `/api/auth/login`, they are immediately hashed and updated in MongoDB using Bcrypt.
- **Zero Plaintext Credentials in Logs or Responses**: Responses from `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, and `/api/db/sync` completely strip `password`, `passwordHash`, `resetPasswordCode`, and `resetCodeExpires`.
- **Timing-Attack Resistance**: Used `crypto.timingSafeEqual` in HMAC session verification (`src/lib/session.ts`) to prevent side-channel timing attacks.

### 3.2 Authorization & Access Control (Anti-IDOR / Anti-BOLA)
- **Role-Based Isolation in Database Sync**:
  - `PARENT` / `STUDENT`: Restricted strictly to their own linked children (`session.studentIds`). Queries for attendance, invoices, reviews, and results enforce `{ studentId: { $in: parentLinkedIds } }`. Requests to modify unauthorized students or school-wide collections are rejected server-side.
  - `TEACHER` / `STAFF`: Scoped strictly to academic and classroom records. Fee invoices, administrative audit logs, and parent user directories are withheld (`invoicesDocs = []`, `auditLogsDocs = []`, `enquiriesDocs = []`).
  - `ADMIN` / `PRINCIPAL` / `OWNER`: Full administrative access, with explicit protection preventing non-OWNER administrators from modifying the root `OWNER` account.
- **Portal Shell Session Verification**:
  - `src/app/portal/layout.tsx` verifies sessions directly against `/api/auth/me` on mount, on cross-component events, and on browser focus/pageshow (BFCache protection).
  - Client-side fallback to `localStorage` on verification error has been removed. If the server rejects or cannot verify the session, user is redirected to `/login`.

### 3.3 Distributed Rate Limiting & Abuse Prevention
- **Architecture**:
  - `RateLimitModel` in MongoDB with compound key index (`key + expiresAt`) and native MongoDB TTL index (`expiresAt: 0`) that automatically expires stale records without background cron overhead.
  - Transparent dual-layer mechanism: checks MongoDB first; if database is offline or connecting, falls back to in-memory sliding-window bucket.
- **Enforced Thresholds**:
  - `/api/auth/login`: 5 attempts per 15 minutes per IP.
  - `/api/auth/forgot-password`: 3 requests per hour per IP.
  - `/api/enquiry`: 5 submissions per 15 minutes per IP.
  - `/api/parent/verify-email`: 10 lookups per 15 minutes per IP.
  - `/api/turnstile`: 20 verification checks per 10 minutes per IP.

### 3.4 Cross-Origin & CSRF Defense
- **Origin & Referer Validation**: `isAllowedOrigin()` verifies that the incoming `Origin` or `Referer` header matches the authorized domain allowlist:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `https://london-kids-preschool-avalurpet.vercel.app`
  - Custom production domain defined in `ALLOWED_ORIGIN` environment variable.
- **Cookie Security**:
  - `auth_session` cookie configured with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, and `secure: process.env.NODE_ENV === 'production'`.

### 3.5 Content Security Policy (CSP) & Security Headers
Configured in `next.config.ts`:
- **Content-Security-Policy**:
  - `default-src 'self'`
  - `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `font-src 'self' data: https://fonts.gstatic.com`
  - `img-src 'self' data: blob: https://images.unsplash.com https://challenges.cloudflare.com https://maps.googleapis.com https://maps.gstatic.com https://*.google.com https://*.googleapis.com`
  - `connect-src 'self' https://challenges.cloudflare.com https://maps.googleapis.com`
  - `frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://maps.google.com`
  - `form-action 'self' https://wa.me`
  - `frame-ancestors 'none'`
  - `base-uri 'self'`
  - `object-src 'none'`
  - `upgrade-insecure-requests`
- **HSTS**: `max-age=31536000; includeSubDomains; preload`
- **Frame Protection**: `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`
- **MIME Sniffing**: `X-Content-Type-Options: nosniff`
- **Referrer**: `Referrer-Policy: strict-origin-when-cross-origin`
- **Permissions**: `camera=(), microphone=(), geolocation=(), browsing-topics=()`
- **Cache Control**: `no-store, no-cache, must-revalidate, private` on `/api/:path*`.

---

## 4. Environment Variables & Required Secrets

The following environment variables should be configured in your Vercel Project Settings / hosting environment. **No real secrets are hardcoded in the codebase.**

| Variable Name | Required | Default / Fallback | Purpose |
|---|---|---|---|
| `MONGODB_URI` | **Yes** | `mongodb://127.0.0.1:27017/pre-school` | MongoDB Atlas or self-hosted connection string. |
| `SESSION_SECRET` | **Yes** (in production) | Auto-generated development key | Secret key used to sign and verify HMAC session cookies. Must be 32+ random characters in production. |
| `CLOUDFLARE_TURNSTILE_SECRET_KEY` | **Yes** (in production) | Cloudflare test key | Server-side secret key for verifying Turnstile CAPTCHA tokens with Cloudflare API. |
| `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` | **Yes** (in production) | Cloudflare test site key | Client-side Turnstile widget key. Publicly accessible by design. |
| `ALLOWED_ORIGIN` | Optional | Derived from host | Primary canonical production domain for strict CORS/CSRF validation. |

---

## 5. Verification & Testing

1. **Dependency Audit**: `npm audit` returned 0 vulnerabilities.
2. **TypeScript & Static Analysis**: Strict typing maintained across models, session utilities, and API route handlers.
3. **Database Security**: Verified automated TTL index creation, NoSQL key sanitization, and parameterized ID lookups.
4. **End-to-End Functional Tests**:
   - Navigation links, program filters, admission enquiry modal, WhatsApp CTA, photo upload dropzone, role logins, and portal dashboards tested and working.

---

## 6. Manual Actions Required by Website Owner

1. **Configure Environment Variables in Vercel Dashboard**:
   - Navigate to **Vercel Project Settings > Environment Variables**.
   - Set `SESSION_SECRET` to a cryptographically secure random string (e.g. `openssl rand -hex 32`).
   - Set `CLOUDFLARE_TURNSTILE_SECRET_KEY` to your live Cloudflare Turnstile secret key.
   - Set `NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` to your live Cloudflare Turnstile site key.
   - Set `MONGODB_URI` to your production MongoDB Atlas connection URI with IP access rules restricted.
2. **Rotate Demo/Default Passwords**:
   - Change default passwords for Owner, Principal, Admin, and Teacher accounts via the User Management portal once deployed.
3. **Cloudflare Turnstile Domain Allowlist**:
   - Ensure `london-kids-preschool-avalurpet.vercel.app` (and any custom domain) is added to your Cloudflare Turnstile widget hostnames.
