/**
 * Cloudflare Turnstile Server-Side Verification Helper
 * London Kids Preschool Avalurpet
 * 
 * Verifies Turnstile challenge tokens server-side directly against
 * the Cloudflare siteverify endpoint.
 */

const CLOUDFLARE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const DEFAULT_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

export async function verifyTurnstileToken(
  token?: string | null,
  remoteIp?: string
): Promise<{ success: boolean; error?: string; hostname?: string }> {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return { success: false, error: 'Turnstile verification token is missing.' };
  }

  const trimmedToken = token.trim();

  // Controlled test tokens for local automated tests / development (Cloudflare Turnstile testing standard)
  if (process.env.NODE_ENV !== 'production') {
    if (trimmedToken === '1x00000000000000000000AA' || trimmedToken === 'cf-test-valid-token' || trimmedToken === 'mock-pass') {
      return { success: true };
    }
    if (trimmedToken === '2x00000000000000000000AB' || trimmedToken.includes('invalid') || trimmedToken.includes('fail')) {
      return { success: false, error: 'Turnstile challenge verification failed: invalid-input-response' };
    }
  }

  const secretKey =
    process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || DEFAULT_TEST_SECRET_KEY;

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', trimmedToken);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(CLOUDFLARE_SITEVERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      // 5 second timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Cloudflare Turnstile verification server error (HTTP ${response.status}).`,
      };
    }

    const outcome = await response.json();

    if (outcome.success) {
      return {
        success: true,
        hostname: outcome.hostname,
      };
    }

    const errorCodes = outcome['error-codes'] || [];
    return {
      success: false,
      error: `Turnstile challenge verification failed: ${errorCodes.join(', ') || 'invalid-input-response'}`,
    };
  } catch (error: any) {
    console.error('Turnstile verification network error:', error?.message || error);
    return {
      success: false,
      error: 'Security challenge verification service unavailable. Please try again.',
    };
  }
}
